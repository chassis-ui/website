import { describe, expect, test } from 'vitest'
import DocsSidebar from '../../src/components/DocsSidebar.astro'
import Callout from '../../src/components/shortcodes/Callout.astro'
import Example from '../../src/components/shortcodes/Example.astro'
import { codeText, render } from '../helpers/render'

describe('<Callout>', () => {
  test('renders its slot as an info callout by default', async () => {
    const html = await render(Callout, { slots: { default: 'Mind the gap.' } })

    expect(html).toContain('class="cxd-callout cxd-callout-info context info"')
    expect(html).toContain('Mind the gap.')
  })

  test('uses the type and the class', async () => {
    const html = await render(Callout, {
      props: { type: 'warning', class: 'mt-lg' },
      slots: { default: 'Careful.' }
    })

    expect(html).toContain('class="cxd-callout cxd-callout-warning context warning mt-lg"')
  })

  test('renders a named entry of the callouts collection instead of the slot', async () => {
    const html = await render(Callout, { props: { name: 'note' }, slots: { default: 'Ignored.' } })

    expect(html).toContain('A <strong>named</strong> callout.')
    expect(html).not.toContain('Ignored.')
  })

  test('fails for a name that is not in the collection', async () => {
    await expect(render(Callout, { props: { name: 'missing' } })).rejects.toThrow(
      "Could not find callout with name 'missing'"
    )
  })
})

describe('<Example>', () => {
  test('renders the preview and the highlighted markup', async () => {
    const html = await render(Example, { props: { code: '<button class="button">Go</button>' } })

    expect(html).toContain(
      '<div class="cxd-example m-0 border-0 context"><button class="button">Go</button></div>'
    )
    expect(html).toContain('class="cxd-snippet-toolbar"')
    expect(html).toContain('>HTML</small>')
  })

  test('expands icons in the preview, and shortens their markup in the code', async () => {
    const html = await render(Example, { props: { code: '<Icon name="check" />' } })

    const [preview] = html.split('cxd-snippet-toolbar')

    expect(preview).toContain('<use href="/static/icons/chassis-icons.svg#check"></use>')
    expect(codeText(html)).toBe(
      '<svg class="icon" aria-hidden="true"><use href="#check"></use></svg>'
    )
  })

  test('replaces placeholders in the preview, and shows them as images in the code', async () => {
    const html = await render(Example, {
      props: { code: '<Placeholder width="100" height="50" class="card-img" />' }
    })
    const [preview, code] = html.split('cxd-snippet-toolbar')

    expect(preview).toContain('<svg')
    expect(preview).toContain('cxd-placeholder-image card-img')
    expect(codeText(code)).toBe('<img src="..." class="card-img" alt="...">')
  })

  test('shows customMarkup in the code instead of the preview markup', async () => {
    const html = await render(Example, {
      props: { code: '<b>Preview</b>', customMarkup: '<i>Source</i>' }
    })
    const [preview, code] = html.split('cxd-snippet-toolbar')

    expect(preview).toContain('<b>Preview</b>')
    expect(codeText(code)).toBe('<i>Source</i>')
  })

  test('hides the code with showMarkup false, and shows the mode button instead', async () => {
    const html = await render(Example, { props: { code: '<b>x</b>', showMarkup: false } })

    expect(html).not.toContain('cxd-snippet-toolbar')
    expect(html).toContain('class="cxd-mode"')
  })

  test('hides the preview with showPreview false', async () => {
    const html = await render(Example, { props: { code: '<b>x</b>', showPreview: false } })

    expect(html).not.toContain('class="cxd-example ')
    expect(html).not.toContain('class="button-mode"')
  })
})

describe('<DocsSidebar>', () => {
  async function renderSidebar(slug?: string) {
    return render(DocsSidebar, { params: slug ? { slug } : {} })
  }

  test('links each page of the sidebar under the docs path', async () => {
    const html = await renderSidebar()

    expect(html).toContain('href="/fixture/docs/getting-started/introduction"')
    expect(html).toContain('href="/fixture/docs/getting-started/install"')
  })

  test('marks the current page and its group', async () => {
    const html = await renderSidebar('getting-started/install')

    expect(html).toMatch(
      /href="\/fixture\/docs\/getting-started\/install" class="cxd-links-link active" aria-current="page"/
    )
    expect(html).toContain('class="cxd-links-group active"')
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  })

  test('renders the label of a sub-group', async () => {
    expect(await renderSidebar()).toContain('<li class="cxd-links-subgroup">Guides</li>')
  })

  test('colours the icon of a group with iconColor', async () => {
    expect(await renderSidebar()).toContain('style="color: var(--cx-primary);"')
  })

  test('links a group without pages to its own page', async () => {
    expect(await renderSidebar()).toContain('href="/fixture/docs/changelog/"')
  })
})
