import {
  Mesh,
  Scene,
  DoubleSide,
  WebGLRenderer,
  TextureLoader,
  SphereGeometry,
  SpotLight,
  SpotLightHelper,
  MeshLambertMaterial,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  AxesHelper,
  PerspectiveCamera,
  HemisphereLight,
  BoxGeometry,
  AnimationMixer,
  Vector3
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'

import earthBg from '@/assets/worldmap.jpg'
import universeBg from '@/assets/universe.jpg'
import CityGeometry from '@/Geometry/City'

export default class App {
  private scene: Scene
  private stats: Stats
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private mixer: AnimationMixer

  constructor () {
    // 帧率显示
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    // 舞台、相机
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500)
    // 相机位置，右手坐标系，x,y,z
    this.camera.position.set(200, 200, 30)
    this.camera.lookAt(new Vector3(0, 0, 0))
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0xffffff, 1)
    document.body.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => this.handleWindowResize())

    // 轨迹，鼠标控制
    new OrbitControls(this.camera, this.renderer.domElement)

    // 地球
    const earthGeometry = new SphereGeometry(100, 500, 500)
    // 材质
    const textureLoader = new TextureLoader()
    const meshBasic = new MeshPhysicalMaterial({
      // color: 0xffffbb,
      map: textureLoader.load(earthBg),
      emissiveMap: textureLoader.load(earthBg),
      side: DoubleSide,
      // wireframe: true,
      emissive: 0xffffff,
      clearcoat: 0.5
    })
    const mesh = new Mesh(earthGeometry, meshBasic)
    mesh.name = 'earth'
    this.scene.add(mesh)

    // 宇宙
    const skyGeometry = new BoxGeometry(800, 800, 800)
    const meshBasicSky = new MeshBasicMaterial({ map: textureLoader.load(universeBg), side: DoubleSide })
    const meshSky = new Mesh(skyGeometry, meshBasicSky)
    this.scene.add(meshSky)

    // 光源
    const spotLight = new SpotLight(0xffffff, 0.5)
    const spotLight2 = new SpotLight(0xffffff, 0.5)
    spotLight.position.set(-50, 0, -30)
    spotLight2.position.set(50, 0, 20)
    spotLight.target = mesh
    spotLight2.target = mesh
    // this.scene.add(spotLight)
    // this.scene.add(spotLight2)

    // const light = new HemisphereLight(0xffffbb, 0xffffbb, 1)
    // this.scene.add(light)

    // 经纬度点
    this.mixer = new CityGeometry(121.48, 31.22, 30, this.scene).mixerEl()

    // 辅助线
    const axesHelper = new AxesHelper(300)
    this.scene.add(axesHelper)
    const spotLightHelper = new SpotLightHelper(spotLight) // 光源辅助线
    const spotLightHelper2 = new SpotLightHelper(spotLight2) // 光源辅助线
    this.scene.add(spotLightHelper)
    this.scene.add(spotLightHelper2)

    this.render()
  }

  private render () {
    this.stats.begin()

    window.requestAnimationFrame(() => this.render())
    // const box = this.scene.getObjectByName('box')
    // box.rotation.x += 0.01
    // box.rotation.y += 0.01
    // box.rotation.z += 0.01
    this.mixer.update(0.1)
    this.renderer.render(this.scene, this.camera)

    this.stats.end()
  }

  private handleWindowResize () {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
