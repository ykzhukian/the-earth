import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const container = document.body

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(20, 2.5, -3.5)
scene.add(camera)

new OrbitControls(camera, renderer.domElement)

const renderScene = new RenderPass(scene, camera)

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = 0
bloomPass.strength = 1.5
bloomPass.radius = 0

const composer = new EffectComposer(renderer)
composer.addPass(renderScene)
composer.addPass(bloomPass)

const box = new THREE.CylinderGeometry(5, 5, 5)
const mail = new THREE.MeshBasicMaterial()
const mesh = new THREE.Mesh(box, mail)
scene.add(mesh)
animate()
function animate () {
  requestAnimationFrame(animate)
  composer.render()
}
