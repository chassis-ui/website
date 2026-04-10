import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

// function initSwipers() {
//   document.querySelectorAll('.feature-slider').forEach((el) => {
//     new Swiper(el, {
//       slidesPerView: 'auto',
//       spaceBetween: 24,
//       observer: true,
//       watchOverflow: true,
//       navigation: {
//         nextEl: el.querySelector('.swiper-button-next'),
//         prevEl: el.querySelector('.swiper-button-prev')
//       },
//       pagination: {
//         el: el.querySelector('.swiper-pagination'),
//         clickable: true
//       }
//     })
//   })
// }
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', initSwipers)
// } else {
//   initSwipers()
// }

document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.feature-slider')
  if (!sliders.length) return
  const list = []
  sliders.forEach((element) => {
    const [slider, prevEl, nextEl] = [
      element.querySelector('.swiper'),
      element.querySelector('.swiper-button-prev'),
      element.querySelector('.swiper-button-next')
    ]
    list.push(
      new Swiper(slider, {
        slidesPerView: 'auto',
        spaceBetween: 20,
        speed: 600,
        initialSlide: 0,
        navigation: { nextEl, prevEl, disabledClass: 'invisible' },
        breakpoints: {
          768: { spaceBetween: 40 }
        }
      })
    )
  })
})
