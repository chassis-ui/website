import { describe, expect, test } from 'vitest'
import Code from '../../src/components/shortcodes/Code.astro'
import JsDocs from '../../src/components/shortcodes/JsDocs.astro'
import ScssDocs from '../../src/components/shortcodes/ScssDocs.astro'
import ScssDocsSimple from '../../src/components/shortcodes/ScssDocsSimple.astro'
import { codeText, render } from '../helpers/render'

// The fixture's `config.yml` sets `sourceDir: source`, `sourcePath` and `currentVersion: 1.2.3`.
const sourceUrl =
  'https://github.com/chassis-ui/website/blob/v1.2.3/packages/docs/test/fixture/source'

describe('<Code>', () => {
  test('highlights the code prop and labels the language', async () => {
    const html = await render(Code, { props: { code: '<p>Hi</p>', lang: 'html' } })

    expect(codeText(html)).toBe('<p>Hi</p>')
    expect(html).toContain('>HTML</small>')
    expect(html).toContain('class="button-clipboard"')
  })

  test('joins an array of lines', async () => {
    const html = await render(Code, { props: { code: ['a', 'b'], lang: 'txt' } })

    expect(codeText(html)).toBe('a\nb')
  })

  test('reads filePath from the source directory', async () => {
    const html = await render(Code, { props: { filePath: 'js/plain.js', lang: 'js' } })

    expect(codeText(html)).toContain('const answer = 42')
  })

  test('shows only the part of the file that fileMatch matches', async () => {
    const html = await render(Code, {
      props: { filePath: 'js/plain.js', fileMatch: 'const answer = \\d+', lang: 'js' }
    })

    expect(codeText(html)).toBe('const answer = 42')
  })

  test('fails when fileMatch matches nothing', async () => {
    await expect(
      render(Code, { props: { filePath: 'js/plain.js', fileMatch: 'nothing', lang: 'js' } })
    ).rejects.toThrow("does not contain a match for the regex 'nothing'")
  })

  test('links the file prop to the source file at the tag of the current version', async () => {
    const html = await render(Code, { props: { code: 'a', lang: 'js', file: 'js/sample.js' } })

    expect(html).toContain(`href="${sourceUrl}/js/sample.js"`)
    expect(html).toContain('>js/sample.js</a>')
  })

  test('shows the preview buttons inside an example', async () => {
    const html = await render(Code, {
      props: { code: 'a', lang: 'html', nestedInExample: true, hasPreview: true }
    })

    expect(html).toContain('class="button-mode"')
    expect(html).toContain('class="button-edit"')
    expect(html).not.toContain('cxd-code-snippet')
  })

  test('hides the toolbar with noToolbar', async () => {
    const html = await render(Code, { props: { code: 'a', lang: 'js', noToolbar: true } })

    expect(html).not.toContain('cxd-snippet-toolbar')
  })
})

describe('<JsDocs>', () => {
  test('shows the named part of the file, without its indentation', async () => {
    const html = await render(JsDocs, { props: { name: 'sample-fn', file: 'js/sample.js' } })

    expect(codeText(html)).toBe('export function sample() {\n  return 42\n}')
    expect(html).toContain(`href="${sourceUrl}/js/sample.js"`)
  })

  test('fails for a name that is not in the file', async () => {
    await expect(render(JsDocs, { props: { name: 'nope', file: 'js/sample.js' } })).rejects.toThrow(
      "at 'js/sample.js'"
    )
  })

  test('fails without a file', async () => {
    await expect(render(JsDocs, { props: { name: 'sample-fn' } })).rejects.toThrow(
      "Missing required parameter(s) for the '<JsDocs />' component"
    )
  })
})

describe.each([
  ['<ScssDocs>', ScssDocs],
  ['<ScssDocsSimple>', ScssDocsSimple]
])('%s', (_name, component) => {
  test('shows the named part of the file, without !default', async () => {
    const html = await render(component, { props: { name: 'spacers', file: 'scss/_sample.scss' } })
    const text = codeText(html)

    expect(text).toContain('$spacer: 1rem;')
    expect(text).not.toContain('!default')
    expect(html).toContain(`href="${sourceUrl}/scss/_sample.scss"`)
  })

  test('stops at the end of the named part when another name starts with it', async () => {
    const html = await render(component, { props: { name: 'spacers', file: 'scss/_sample.scss' } })

    expect(codeText(html)).not.toContain('$spacer-large')
  })

  test('fails for a name that is not in the file', async () => {
    await expect(
      render(component, { props: { name: 'nope', file: 'scss/_sample.scss' } })
    ).rejects.toThrow("at 'scss/_sample.scss'")
  })
})

describe('<ScssDocs compile>', () => {
  test('shows the CSS that the snippet compiles to, with prefixed custom properties', async () => {
    const html = await render(ScssDocs, {
      props: { name: 'mixin-output', file: 'scss/_sample.scss', compile: true }
    })
    const text = codeText(html)

    expect(text).toContain('color: red;')
    expect(text).toContain('--cx-gap: 1rem;')
    expect(text).toContain('.child {')
    expect(text).not.toContain('__cxd_docs_sentinel__')
  })
})
