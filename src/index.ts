import { Detector } from './lib/Detector'
import App from './App'

// import './Geometry/earth-impact'

if (!Detector.webgl) {
  Detector.addGetWebGLMessage()
} else {
  new App()
}
