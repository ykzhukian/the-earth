import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000)
camera.position.set(0, 0, 10)
camera.layers.enable(1)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.autoClear = false
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x101000)
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

const light = new THREE.DirectionalLight(0xffffff, 0.75)
light.position.setScalar(100)
scene.add(light)
scene.add(new THREE.AmbientLight(0xffffff, 0.25))

const obj = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 4), new THREE.MeshLambertMaterial({ color: 'aqua', wireframe: false }))
// obj.layers.set(0)
obj.position.z = 0.25
scene.add(obj)

const objBack = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1), new THREE.MeshBasicMaterial({ color: 'red', wireframe: false }))
objBack.position.z = -2.25
objBack.layers.set(1)
scene.add(objBack)

/** COMPOSER */
const renderScene = new RenderPass(scene, camera)

// const effectFXAA = new ShaderPass(THREE.FXAAShader)
// effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = 0.21
bloomPass.strength = 1.2
bloomPass.radius = 0.55
bloomPass.renderToScreen = true

const composer = new EffectComposer(renderer)
composer.setSize(window.innerWidth, window.innerHeight)

composer.addPass(renderScene)
// composer.addPass(effectFXAA)
composer.addPass(bloomPass)

renderer.gammaInput = true
renderer.gammaOutput = true
renderer.toneMappingExposure = Math.pow(0.9, 4.0)

render()
function render () {
  requestAnimationFrame(render)

  renderer.clear()

  camera.layers.set(1)
  composer.render()

  renderer.clearDepth()
  camera.layers.set(0)
  renderer.render(scene, camera)
}
