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

    if (originalHref === '#check-solid') {
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

    if (useEl) {
      useEl.setAttribute('href', '#check-solid')
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
