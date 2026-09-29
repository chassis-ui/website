import { experimental_AstroContainer as AstroContainer } from 'astro/container'

type Container = Awaited<ReturnType<typeof AstroContainer.create>>
type RenderOptions = Parameters<Container['renderToString']>[1]

let container: Container | undefined

/** Renders a component in the fixture site. */
export async function render(component: unknown, options: RenderOptions = {}): Promise<string> {
  container ??= await AstroContainer.create()

  return container.renderToString(component as Parameters<Container['renderToString']>[0], options)
}

/** The text of the first highlighted code block in `html`, without the markup. */
export function codeText(html: string): string {
  const code = html.match(/<code>([\s\S]*?)<\/code>/)?.[1] ?? ''

  return code
    .replace(/<[^>]+>/g, '')
    .replaceAll('&#x3C;', '<')
    .replaceAll('&#x3E;', '>')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
}
