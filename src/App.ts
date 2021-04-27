import {
  Scene,
  WebGLRenderer,
  SpotLight,
  PerspectiveCamera,
  AmbientLight,
  Group,
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

import flow from '@/assets/hero-glow.png'

import './index.less'

export default class App {
  private containerWidth: number
  private containerHeight: number

  private scene: Scene
  private stats: Stats
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private composer: EffectComposer
  private controls: OrbitControls
  private earthGroup: Group // 和地球一起旋转的内容

  private shanghai: City
  private cities: { city: City, link: Link }[]

  constructor (parentDom: HTMLElement, size: number) {
    // 长宽
    this.containerWidth = size * 1.2
    this.containerHeight = size

    // 帧率显示
    this.stats = new Stats()
    this.stats.showPanel(0)
    parentDom.appendChild(this.stats.dom)

    // wrapper
    const container = document.createElement('DIV')
    container.classList.add('the-earth-wrapper')
    container.style.width = `${this.containerWidth}px`
    container.style.height = `${this.containerHeight}px`
    const mask = document.createElement('DIV')
    mask.classList.add('the-earth-wrapper-mask')
    mask.style.backgroundImage = `url(${flow})`
    container.appendChild(mask)
    parentDom.appendChild(container)

    // 舞台、相机
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 1500)
    // 相机位置，右手坐标系，x,y,z
    this.camera.position.set(-150, 100, -200)
    this.camera.lookAt(new Vector3(0, 0, 0))
    this.renderer = new WebGLRenderer({ antialias: false }) // 抗锯齿
    this.renderer.autoClear = false
    this.renderer.setSize(this.containerWidth, this.containerHeight)
    this.renderer.toneMappingExposure = Math.pow(1, 4.0)
    container.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => this.handleWindowResize())

    // 地球
    const theEarth = new Earth(100)
    const earth = theEarth.getMesh()
    const earthGlow = theEarth.getGlowMesh()
    const earthParticles = theEarth.getParticleMesh()

    // Set up an effect composer
    this.composer = new EffectComposer(this.renderer)
    this.composer.setSize(this.containerWidth, this.containerHeight)

    const renderScene = new RenderPass(this.scene, this.camera)
    const bloomPass = new UnrealBloomPass(new Vector2(this.containerWidth, this.containerHeight), 1.5, -0.8, 0.5) // strength, radius, threshold
    this.composer.addPass(renderScene)
    this.composer.addPass(bloomPass)

    // Tells composer that second pass gets rendered to screen
    bloomPass.renderToScreen = true

    // 光源
    const spotLight = new SpotLight(0x404040, 2.5)
    spotLight.target = earth
    this.scene.add(spotLight)

    const light = new AmbientLight(0xffffff, 0.25) // soft white light
    this.scene.add(light)

    // 上海
    this.shanghai = new City(countries[0].position)

    // setTimeout(() => this.earthGroup.remove(link.getMesh()), 5000)

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
      earthGlow.lookAt(new Vector3(this.camera.position.x - 25, this.camera.position.y - 50, this.camera.position.z + 20))
    })

    this.earthGroup = new Group()
    this.earthGroup.add(earth)
    this.earthGroup.add(earthParticles)
    this.earthGroup.add(this.shanghai.getMesh())

    // layers
    this.camera.layers.enable(1)
    earthGlow.layers.set(1)
    // this.earthGroup.layers.set(0)

    this.scene.add(this.earthGroup)
    this.scene.add(earthGlow)

    this.cities = []
    // window.setInterval(() => this.createActivity(), 4000)

    this.render()
  }

  private render () {
    this.stats.begin()

    window.requestAnimationFrame(() => this.render())
    this.controls.update()
    this.earthGroup.rotation.y += 0.0003

    this.renderer.clear()

    this.camera.layers.set(1)
    this.composer.render()

    this.renderer.clearDepth()

    this.camera.layers.set(0)
    this.renderer.render(this.scene, this.camera)

    TWEEN.update()

    this.stats.end()
  }

  private createActivity () {
    const length = countries.length
    const index = Math.floor(Math.random() * length)

    const fromCity = new City(countries[index].position)
    const link = new Link(fromCity, this.shanghai)
    this.earthGroup.add(fromCity.getMesh())
    this.earthGroup.add(link.getMesh())

    this.cities.push({ city: fromCity, link })
    if (this.cities.length > 5) {
      const drop = this.cities.shift()
      this.earthGroup.remove(drop.city.getMesh())
      this.earthGroup.remove(drop.link.getMesh())
      drop.city.destroy()
      drop.link.destroy()
    }
  }

  private handleWindowResize () {
    const width = this.containerWidth
    const height = this.containerHeight
    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
