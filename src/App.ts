import {
  Mesh,
  Scene,
  DoubleSide,
  WebGLRenderer,
  TextureLoader,
  SphereGeometry,
  MeshBasicMaterial,
  PerspectiveCamera
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'

import earthBg from '@/assets/world.jpg'
import universeBg from '@/assets/universe.jpg'

export default class App {
  private scene: Scene
  private stats: Stats
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer

  constructor () {
    // 帧率显示
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    // 舞台、相机
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200)
    // 相机位置，右手坐标系，x,y,z
    this.camera.position.set(0, 0, 100)
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0xffffff, 1)
    document.body.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => this.handleWindowResize())

    // 轨迹，鼠标控制
    new OrbitControls(this.camera, this.renderer.domElement)

    // earth
    const earthGeometry = new SphereGeometry(16, 40, 40)
    // 材质
    const textureLoader = new TextureLoader()
    const meshBasic = new MeshBasicMaterial({ map: textureLoader.load(earthBg), side: DoubleSide })
    const mesh = new Mesh(earthGeometry, meshBasic)
    mesh.name = 'box'
    this.scene.add(mesh)

    // 宇宙
    const skyGeometry = new SphereGeometry(100, 100, 100)
    const meshBasicSky = new MeshBasicMaterial({ map: textureLoader.load(universeBg), side: DoubleSide })
    const meshSky = new Mesh(skyGeometry, meshBasicSky)
    this.scene.add(meshSky)

    this.render()
  }

  private render () {
    this.stats.begin()

    window.requestAnimationFrame(() => this.render())
    // const box = this.scene.getObjectByName('box')
    // box.rotation.x += 0.01
    // box.rotation.y += 0.01
    // box.rotation.z += 0.01
    this.renderer.render(this.scene, this.camera)

    this.stats.end()
  }

  private handleWindowResize () {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
