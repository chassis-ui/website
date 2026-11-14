import { describe, expect, test } from 'vitest'
import Cards from '../../src/components/sections/Cards.astro'
import Doors from '../../src/components/sections/Doors.astro'
import Facts from '../../src/components/sections/Facts.astro'
import Hero from '../../src/components/sections/Hero.astro'
import Rows from '../../src/components/sections/Rows.astro'
import Section from '../../src/components/sections/Section.astro'
import Steps from '../../src/components/sections/Steps.astro'
import { render } from '../helpers/render'

describe('<Section>', () => {
  test('names the section by its title, whose lines break from lg', async () => {
    const html = await render(Section, {
      props: {
        id: 'what',
        eyebrow: 'What you get',
        title: ['One line.', 'Another.'],
        lead: 'A lead.'
      },
      slots: { default: '<p>Content</p>' }
    })

    expect(html).toContain('<section class="cxd-section" id="what" aria-labelledby="what-title">')
    expect(html).toMatch(
      /<h2 class="cxd-section-title" id="what-title">\s*<span>One line.<\/span> <span>Another.<\/span>\s*<\/h2>/
    )
    expect(html).toContain(
      '<p class="font-label-lg fg-highlight text-uppercase m-0">What you get</p>'
    )
    expect(html).toContain('A lead.')
    expect(html).toContain('<p>Content</p>')
  })

  test('takes markup of the page for the title and the lead', async () => {
    const html = await render(Section, {
      props: { id: 'idea', eyebrow: 'The idea' },
      slots: {
        title:
          '<span>Change it <em>once</em>.</span> <span>It changes <mark>everywhere</mark>.</span>',
        lead: 'Decide in <strong>layers</strong>.',
        default: '<p>Content</p>'
      }
    })

    expect(html).toContain('<section class="cxd-section" id="idea" aria-labelledby="idea-title">')
    expect(html).toMatch(
      /<h2 class="cxd-section-title" id="idea-title">\s*<span>Change it <em>once<\/em>.<\/span> <span>It changes <mark>everywhere<\/mark>.<\/span>\s*<\/h2>/
    )
    expect(html).toMatch(
      /<p class="cxd-section-lead m-0">\s*Decide in <strong>layers<\/strong>.\s*<\/p>/
    )
  })

  test('takes a label in place of a title', async () => {
    const html = await render(Section, { props: { id: 'more', label: 'More' } })

    expect(html).toContain('<section class="cxd-section" id="more" aria-label="More">')
    expect(html).not.toContain('<h2')
  })
})

describe('<Hero>', () => {
  const props = { title: 'Defined once.', lead: 'A lead.' }

  test('renders only the parts it is given', async () => {
    const html = await render(Hero, { props })

    expect(html).toContain(
      '<section class="cxd-hero context alternate cxd-hero-end" id="hero" aria-labelledby="hero-title">'
    )
    expect(html).not.toContain('cxd-command')
    expect(html).not.toContain('cxd-hero-meta')
    expect(html).not.toContain('cxd-hero-illustration')
  })

  test('keeps the short bottom padding when something follows the row', async () => {
    const html = await render(Hero, { props, slots: { default: '<ul class="cxd-rail"></ul>' } })

    expect(html).toContain('<section class="cxd-hero context alternate" id="hero"')
  })

  test('puts the title text in one part of the claim', async () => {
    const html = await render(Hero, { props })

    expect(html).toMatch(
      /<h1 class="font-hero fg-main m-0 cxd-hero-title" id="hero-title" style="--cxd-enter: 0">\s*<span class="d-block">Defined once.<\/span>\s*<\/h1>/
    )
  })

  test('numbers the parts in the order in which they enter, two for the claim', async () => {
    const html = await render(Hero, {
      props: { ...props, kicker: 'CHASSIS', command: 'pnpm add chassis' },
      slots: { actions: '<a href="/docs/">Docs</a>', meta: 'V1', illustration: '<svg></svg>' }
    })

    expect([...html.matchAll(/--cxd-enter: (\d)/g)].map((match) => match[1])).toEqual([
      '0',
      '1',
      '3',
      '4',
      '5',
      '6'
    ])
    expect(html).toContain('<code class="cxd-command-text">pnpm add chassis</code>')
    expect(html).toContain('data-clipboard-text="pnpm add chassis"')
    expect(html).toContain(
      '<div class="col-span-full lg:col-span-6 cxd-hero-illustration"><svg></svg></div>'
    )
  })
})

describe('the claim of <Hero>', () => {
  test('takes markup of the page for the claim and the lead', async () => {
    const html = await render(Hero, {
      slots: {
        title:
          '<span class="d-block">Defined <em>once</em>.</span> <span><mark>Built</mark> everywhere.</span>',
        lead: 'A <strong>lead</strong>.'
      }
    })

    expect(html).toMatch(
      /<h1 class="font-hero fg-main m-0 cxd-hero-title" id="hero-title" style="--cxd-enter: 0">\s*<span class="d-block">Defined <em>once<\/em>.<\/span> <span><mark>Built<\/mark> everywhere.<\/span>\s*<\/h1>/
    )
    expect(html).toMatch(/style="--cxd-enter: 2">\s*A <strong>lead<\/strong>.\s*<\/p>/)
  })
})

describe('the illustration of <Hero>', () => {
  const props = { title: 'Defined once.', lead: 'A lead.' }

  test('inlines the SVG of the static files, named by its label', async () => {
    const html = await render(Hero, {
      props: {
        ...props,
        illustration: 'images/illustrations/hero-home.svg',
        illustrationLabel: 'One "app" on three devices'
      }
    })

    expect(html).toContain(
      '<svg role="img" aria-label="One &quot;app&quot; on three devices" viewBox="0 0 4 2"><g class="cxd-hero-part">'
    )
    expect(html).not.toContain('<?xml')
  })

  test('hides the drawing from assistive technology without a label', async () => {
    const html = await render(Hero, {
      props: { ...props, illustration: 'images/illustrations/hero-home.svg' }
    })

    expect(html).toContain('<svg aria-hidden="true" focusable="false" viewBox="0 0 4 2">')
  })

  test('fails without the file', async () => {
    await expect(
      render(Hero, { props: { ...props, illustration: 'images/illustrations/missing.svg' } })
    ).rejects.toThrow(/missing\.svg/)
  })

  test('takes a drawing of the site in its slot instead', async () => {
    const html = await render(Hero, {
      props: { ...props, illustration: 'images/illustrations/hero-home.svg' },
      slots: { illustration: '<img src="/own.png" alt="">' }
    })

    expect(html).toContain('cxd-hero-illustration"><img src="/own.png" alt="">')
    expect(html).not.toContain('cxd-hero-part')
  })
})

describe('the contents of a section', () => {
  test('<Rows> lists the points of each row', async () => {
    const html = await render(Rows, {
      props: { rows: [{ label: 'BRANDS', title: 'A claim.', points: ['One.', 'Two.'] }] }
    })

    expect(html).toContain('<h3 class="font-title-lg m-0">A claim.</h3>')
    expect(html.match(/<li /g)).toHaveLength(2)
  })

  test('<Steps> draws a rail per stage and widens a wide station', async () => {
    const html = await render(Steps, {
      props: {
        stages: [
          { name: 'DECIDE', stations: [{ label: 'BASE', title: 'A default.', body: 'Body.' }] },
          { name: 'COLLECT', stations: [{ label: 'SOURCE', body: 'Body.', wide: true }] }
        ]
      }
    })

    expect(html.match(/class="cxd-rail cxd-steps-rail d-grid md:grid-cols-3"/g)).toHaveLength(2)
    expect(html.match(/cxd-steps-wide/g)).toHaveLength(1)
    expect(html.match(/font-title fg-main/g)).toHaveLength(1)
  })

  test('<Cards> links each card and takes its icon from the sprite of the packages', async () => {
    const html = await render(Cards, {
      props: {
        cards: [{ name: 'Chassis CSS', icon: 'cx-brackets-curly', href: '/css/', body: 'Body.' }]
      }
    })

    expect(html).toContain('<a class="stretched-link" href="/css/">Chassis CSS</a>')
    expect(html).toMatch(/<use href="\/static\/icons\/cx-sprite\.svg[^"#]*#cx-brackets-curly">/)
    expect(html).toMatch(/text-uppercase[^"]*"[^>]*>\s*Explore/)
  })

  test('<Doors> links each door to its page', async () => {
    const html = await render(Doors, {
      props: {
        groups: [
          { label: 'Guides', doors: [{ name: 'Quick Start', href: '/docs/start/', body: 'Body.' }] }
        ]
      }
    })

    expect(html).toContain(
      '<h3 class="font-label-sm primary-fg-main text-uppercase m-0">Guides</h3>'
    )
    expect(html).toMatch(/<a class="cxd-door [^"]*" href="\/docs\/start\/">\s*Quick Start/)
  })

  test('<Facts> is a section of its own with a list of terms', async () => {
    const html = await render(Facts, {
      props: {
        label: 'Built on',
        facts: [{ name: 'DTCG Format', detail: 'The W3C token standard' }]
      }
    })

    expect(html).toContain('<section class="cxd-facts py-3xl" aria-label="Built on">')
    expect(html).toContain('<dt class="font-h5 m-0">DTCG Format</dt>')
  })
})
