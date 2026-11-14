import ClipboardJS from 'clipboard'
import { Tooltip } from '@chassis-ui/css'

const btnTitle = 'Copy'

export function initCopyButtons(
  selector: string,
  textFn: (_element: Element) => string
): ClipboardJS {
  document.querySelectorAll(selector).forEach((btn) => {
    Tooltip.getOrCreateInstance(btn, { title: btnTitle })
  })

  const clipboard = new ClipboardJS(selector, { text: textFn })

  clipboard.on('success', (event) => {
    const useEl = event.trigger.querySelector('.icon use')
    const tooltipBtn = Tooltip.getInstance(event.trigger)
    const originalHref = useEl?.getAttribute('href')

    // The icon is a symbol of a sprite file, or of the page itself: only the name changes.
    const checkHref = originalHref?.replace(/#.*$/, '#check-solid')

    if (originalHref === checkHref) {
      return
    }

    tooltipBtn?.setContent({ '.tooltip-inner': 'Copied!' })

    event.trigger.addEventListener(
      'hidden.cx.tooltip',
      () => {
        tooltipBtn?.setContent({ '.tooltip-inner': btnTitle })
      },
      { once: true }
    )

    event.clearSelection()

    if (useEl && checkHref) {
      useEl.setAttribute('href', checkHref)
    }

    setTimeout(() => {
      if (useEl && originalHref) {
        useEl.setAttribute('href', originalHref)
      }
    }, 2000)
  })

  clipboard.on('error', (event) => {
    const modifierKey = /mac/i.test(navigator.userAgent) ? '\u2318' : 'Ctrl-'
    const fallbackMsg = `Press ${modifierKey}C to copy`
    const tooltipBtn = Tooltip.getInstance(event.trigger)

    tooltipBtn?.setContent({ '.tooltip-inner': fallbackMsg })

    event.trigger.addEventListener(
      'hidden.cx.tooltip',
      () => {
        tooltipBtn?.setContent({ '.tooltip-inner': btnTitle })
      },
      { once: true }
    )
  })

  return clipboard
}
