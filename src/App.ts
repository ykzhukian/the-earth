import {
  Scene,
  WebGLRenderer,
  SpotLight,
  PerspectiveCamera,
  AmbientLight,
  Group,
  Clock,
  Vector3,
  Vector2
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

import Stats from 'stats.js'
import * as TWEEN from '@tweenjs/tween.js'

import { countries } from '@/assets/countries'

import City from '@/Geometry/City'
import Link from '@/Geometry/Link'
import Earth from '@/Geometry/Earth'
import Universe from '@/Geometry/Universe'

import flow from '@/assets/hero-glow.svg'

export default class App {
  private scene: Scene
  private stats: Stats
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private earthAnimation: Function
  private composer: EffectComposer
  private controls: OrbitControls
  private group: Group

  constructor () {
    // 帧率显示
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)
    document.getElementById('flow').style.backgroundImage = `url(${flow})`

    // 舞台、相机
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500)
    // 相机位置，右手坐标系，x,y,z
    this.camera.position.set(-150, 100, -200)
    this.camera.lookAt(new Vector3(0, 0, 0))
    this.renderer = new WebGLRenderer({ antialias: false }) // 抗锯齿
    this.renderer.autoClear = false
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.toneMappingExposure = Math.pow(1, 4.0)
    document.body.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => this.handleWindowResize())

    // 地球
    const theEarth = new Earth(100)
    const earth = theEarth.getMesh()
    const earthGlow = theEarth.getGlowMesh()
    const earthParticles = theEarth.getParticleMesh()
    this.earthAnimation = theEarth.getAnimation()

    // Set up an effect composer
    this.composer = new EffectComposer(this.renderer)
    this.composer.setSize(window.innerWidth, window.innerHeight)

    const renderScene = new RenderPass(this.scene, this.camera)
    const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.7, -1, 0.9) // strength, radius, threshold
    this.composer.addPass(renderScene)
    this.composer.addPass(bloomPass)

    // Tells composer that second pass gets rendered to screen
    bloomPass.renderToScreen = true

    // 宇宙
    // const universe = new Universe().getMesh()
    // this.scene.add(universe)

    // 光源
    const spotLight = new SpotLight(0x404040, 1.45)
    spotLight.target = earth
    this.scene.add(spotLight)

    // const light = new AmbientLight(0xffffff, 0.4) // soft white light
    // this.scene.add(light)

    // 上海
    const shanghai = new City(countries[0].position)
    // 越南
    const yuenan = new City(countries[5].position)
    // 连线
    const link = new Link(yuenan, shanghai)
    // setTimeout(() => this.scene.remove(link.getMesh()), 5000)

    setTimeout(() => {
      // 赞比亚
      const zanbiya = new City(countries[4].position)
      this.scene.add(zanbiya.getMesh())
      // 连线
      const link2 = new Link(zanbiya, shanghai)
      this.scene.add(link2.getMesh())

      // setTimeout(() => this.scene.remove(link2.getMesh()), 5000)
    }, 2000)

    // 经纬度点
    // this.mixer = new CityGeometry(121.48, 31.22, 30, this.scene).mixerEl()

    // 轨迹，鼠标控制
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableZoom = false
    this.controls.minDistance = 320
    this.controls.maxDistance = 320
    this.controls.maxPolarAngle = 1.5
    this.controls.minPolarAngle = 1
    // this.controls.minAzimuthAngle = 3.5
    // this.controls.maxAzimuthAngle = 4
    this.controls.enablePan = false
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.rotateSpeed = 0.5
    this.controls.addEventListener('change', () => {
      spotLight.position.copy(this.camera.position)
      earthGlow.lookAt(new Vector3(this.camera.position.x - 20, this.camera.position.y - 20, this.camera.position.z))
    })

    this.group = new Group()
    this.group.add(earth)
    this.group.add(earthParticles)
    this.group.add(shanghai.getMesh())
    this.group.add(yuenan.getMesh())
    this.group.add(link.getMesh())

    // layers
    this.camera.layers.enable(1)
    earthGlow.layers.set(1)
    this.group.layers.set(0)

    // this.scene.add(shanghai.getMesh())
    // this.scene.add(yuenan.getMesh())
    // this.scene.add(link.getMesh())
    // this.scene.add(earth)
    // this.scene.add(earthParticles)
    this.scene.add(this.group)
    this.scene.add(earthGlow)

    this.render()
  }

  private render () {
    this.stats.begin()

    window.requestAnimationFrame(() => this.render())
    this.earthAnimation()
    this.controls.update()
    this.group.rotation.y += 0.001

    this.renderer.clear()

    this.camera.layers.set(1)
    this.composer.render()

    this.renderer.clearDepth()

    this.camera.layers.set(0)
    this.renderer.render(this.scene, this.camera)

    TWEEN.update()

    this.stats.end()
  }

  private handleWindowResize () {
    const width = window.innerWidth
    const height = window.innerHeight
    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
