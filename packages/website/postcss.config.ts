import postcssPrefixCustomProperties from 'postcss-prefix-custom-properties'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    postcssPrefixCustomProperties({
      prefix: 'cx-',
      ignore: [/^--cx-/, /^--cxd-/, /^--pf-/, /^--shell-/, /^--shiki-/]
    }),
    autoprefixer()
  ]
}
