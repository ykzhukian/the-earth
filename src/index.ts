import { Detector } from './lib/Detector'
import DAT from './lib/globe'
import population from '@/assets/population909500.json'

if (!Detector.webgl) {
  Detector.addGetWebGLMessage()
} else {
  // const years = ['1990', '1995', '2000']
  const container = document.getElementById('the-earth')
  const globe = new DAT.Globe(container)

  // console.log(globe)
  // const tweens = []

  // const settime = function (globe, t) {
  //   return function () {
  //     new TWEEN.Tween(globe).to({ time: t / years.length }, 500).easing(TWEEN.Easing.Cubic.EaseOut).start()
  //     const y = document.getElementById('year' + years[t])
  //     if (y.getAttribute('class') === 'year active') {
  //       return
  //     }
  //     const yy = document.getElementsByClassName('year')
  //     for (let i = 0; i < yy.length; i++) {
  //       yy[i].setAttribute('class', 'year')
  //     }
  //     y.setAttribute('class', 'year active')
  //   }
  // }

  // for (let i = 0; i < years.length; i++) {
  //   const y = document.getElementById('year' + years[i])
  //   y.addEventListener('mouseover', settime(globe, i), false)
  // }

  // TWEEN.start()

  console.log('scuse me')

  // @ts-ignore
  const data = population
  for (let i = 0; i < data.length; i++) {
    globe.addData(data[i][1], { format: 'magnitude', name: data[i][0], animated: true })
  }
  // globe.createPoints()
  // settime(globe, 0)()
  globe.animate()
  document.body.style.backgroundImage = 'none' // remove loading
}
