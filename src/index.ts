import { Detector } from './lib/Detector'
// import DAT from './lib/globe'
// import population from '@/assets/population909500.json'
import App from './App'

if (!Detector.webgl) {
  Detector.addGetWebGLMessage()
} else {
  // const container = document.getElementById('the-earth')
  // const globe = new DAT.Globe(container)

  // // @ts-ignore
  // const data = population
  // for (let i = 0; i < data.length; i++) {
  //   globe.addData(data[i][1], { format: 'magnitude', name: data[i][0], animated: true })
  // }
  // // globe.createPoints()
  // // settime(globe, 0)()
  // globe.animate()

  // threejs new
  new App()
}
