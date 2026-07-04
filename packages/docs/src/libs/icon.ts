import * as htmlparser2 from 'htmlparser2'

const iconRegex = /<Icon\s+([^>]+)\/>/g

interface IconOptions {
  name: string
  class?: string
  size: number
  font: boolean
  sprite: string
  title?: string
}

/**
 * Replaces `<Icon />` elements described using the `<Icon />` Astro component in HTML markup with the
 * expected HTML content.
 *
 * This is needed because the `<Example />` shortcode renders its `code` prop as raw HTML via `set:html`
 * rather than as MDX, so nested Astro components (like `<Icon />`, similar to `<Placeholder />`) are never
 * actually invoked — they need to be expanded to their rendered markup ahead of time.
 * @see src/components/shortcodes/Icon.astro
 */
export function replaceIconsInHtml(html: string) {
  return html.replace(iconRegex, (match) => {
    const document = htmlparser2.parseDocument(match, { xmlMode: true })
    const iconElement = document.firstChild

    if (
      document.children.length > 1 ||
      !iconElement ||
      iconElement.type !== htmlparser2.ElementType.Tag ||
      iconElement.name !== 'Icon'
    ) {
      throw new Error('Invalid icon element.')
    }

    return renderIconToString(getOptionsWithDefaults(iconElement.attribs))
  })
}

function getOptionsWithDefaults(attribs: Record<string, string>): IconOptions {
  if (!attribs.name) {
    throw new Error('Icon element is missing the required "name" attribute.')
  }

  return {
    name: attribs.name,
    class: attribs.class,
    size: attribs.size ? Number(attribs.size.replace(/[{}]/g, '')) : 24,
    font: attribs.font !== undefined && attribs.font !== '{false}',
    sprite: attribs.sprite || '/static/icons/chassis-icons.svg',
    title: attribs.title
  }
}

function renderIconToString({ name, class: className, size, font, sprite, title }: IconOptions) {
  const classes = ['icon', font ? `cx-${name}` : undefined, className].filter(Boolean).join(' ')
  const ariaHidden = title ? '' : ' aria-hidden="true"'

  if (font) {
    const ariaLabel = title ? ` aria-label="${escapeHtml(title)}"` : ''
    return `<span class="${classes}"${ariaHidden}${ariaLabel}></span>`
  }

  const titleTag = title ? `<title>${escapeHtml(title)}</title>` : ''
  return `<svg class="${classes}" width="${size}" height="${size}"${ariaHidden}>${titleTag}<use href="${sprite}#${name}"></use></svg>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
