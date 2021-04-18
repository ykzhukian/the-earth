import {
  Scene,
  WebGLRenderer,
  SpotLight,
  PerspectiveCamera,
  AnimationMixer,
  Vector3,
  Vector2,
  Color
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

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
  private mixer: AnimationMixer
  private earthAnimation: Function
  private composer: EffectComposer
  private controls: OrbitControls
  private spotLight: SpotLight

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
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0xffffff, 1)
    document.body.appendChild(this.renderer.domElement)
    window.addEventListener('resize', () => this.handleWindowResize())

    // 轨迹，鼠标控制
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableZoom = false
    this.controls.minDistance = 320
    this.controls.maxDistance = 320
    this.controls.maxPolarAngle = 1.5
    this.controls.minPolarAngle = 1
    this.controls.enablePan = false
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.rotateSpeed = 0.5
    this.controls.addEventListener('change', () => {
      const lightPos = this.spotLight.position.copy(this.camera.position)
      // lightPos.x = lightPos.y + 50
    })

    // 地球
    const theEarth = new Earth(100)
    const earth = theEarth.getMesh()
    const earthParticles = theEarth.getParticleMesh()
    this.scene.add(earth)
    this.scene.add(earthParticles)
    this.earthAnimation = theEarth.getAnimation()

    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
    const outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera)
    outlinePass.edgeStrength = 5
    outlinePass.edgeGlow = 0.7
    outlinePass.edgeThickness = 2
    outlinePass.visibleEdgeColor = new Color(0xffffff)
    outlinePass.hiddenEdgeColor = new Color(0x190a05)
    outlinePass.pulsePeriod = 0.7
    this.composer.addPass(outlinePass)

    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    this.composer.addPass(effectFXAA)

    outlinePass.selectedObjects = [earth]

    // 宇宙
    const universe = new Universe().getMesh()
    this.scene.add(universe)

    // 光源
    this.spotLight = new SpotLight(0xffffff, 0.9)
    this.spotLight.target = earth
    this.scene.add(this.spotLight)

    // 上海
    const shanghai = new City(countries[0].position)
    // 越南
    const yuenan = new City(countries[5].position)
    this.scene.add(shanghai.getMesh())
    this.scene.add(yuenan.getMesh())
    // 连线
    const link = new Link(shanghai, yuenan)
    this.scene.add(link.getMesh())

    // 经纬度点
    // this.mixer = new CityGeometry(121.48, 31.22, 30, this.scene).mixerEl()

    this.render()
  }

  private render () {
    this.stats.begin()

    window.requestAnimationFrame(() => this.render())
    this.earthAnimation()
    this.controls.update()
    this.composer.render()
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
