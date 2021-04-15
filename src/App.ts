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
  LineLoop,
  CircleGeometry,
  Spherical,
  BufferGeometry,
  AdditiveBlending,
  PlaneGeometry,
  Matrix4,
  BoxGeometry,
  AnimationMixer,
  Object3D,
  PointsMaterial,
  Color,
  FrontSide,
  BufferAttribute,
  Points,
  Vector3
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'

import earthBg from '@/assets/earth.jpg'
import dotImg from '@/assets/dot.png'
import lightray from '@/assets/lightray.jpg'
import lightrayYellow from '@/assets/lightray-yellow.jpg'
import universeBg from '@/assets/universe.jpg'
import { countries } from '@/assets/countries'
import CityGeometry from '@/Geometry/City'

const hexagonColor = [0xffffff, 0xffff00]
const HEXAGON_RADIUS = 3
const CITY_MARGIN = 2
const BLINT_SPEED = 0.01
const EARTH_COLOR = 0x1b2640
const EARTH_PARTICLE_COLOR = 0x0260cc

export default class App {
  private scene: Scene
  private stats: Stats
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private mixer: AnimationMixer
  private earthParticles: Object3D

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
    const earthGeometry = new SphereGeometry(100, 20, 20)
    // 材质
    const textureLoader = new TextureLoader()
    const meshBasic = new MeshBasicMaterial({
      color: EARTH_COLOR
      // side: DoubleSide,
    })
    const mesh = new Mesh(earthGeometry, meshBasic)
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

    // 国家
    for (let i = 0, length = countries.length; i < length; i++) {
      const position = createPosition(countries[i].position)
      const index = Math.floor(Math.random() * 2)
      // this.createHexagon(position, index) // 地标
      // this.createCone(position, index) // 光锥
    }
    this.createCone(createPosition(countries[0].position), 1) // 光锥
    const earthImg = document.createElement('img')
    earthImg.src = earthBg
    earthImg.onload = () => {
      const earthCanvas = document.createElement('canvas')
      const earthCtx = earthCanvas.getContext('2d')
      earthCanvas.width = earthImg.width
      earthCanvas.height = earthImg.height
      earthCtx.drawImage(earthImg, 0, 0, earthImg.width, earthImg.height)
      const earthImgData = earthCtx.getImageData(0, 0, earthImg.width, earthImg.height)
      this.createEarthParticles({ earthImgData, width: earthImg.width, height: earthImg.height })
    }

    // 经纬度点
    // this.mixer = new CityGeometry(121.48, 31.22, 30, this.scene).mixerEl()

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
    // const box = this.scene.getObjectByName('earth')
    // box.rotation.x += 0.01
    // box.rotation.y += 0.01
    // box.rotation.z += 0.01
    // this.mixer.update(0.1)

    // 球面粒子闪烁
    const objects = this.earthParticles.children
    objects.forEach(obj => {
      // @ts-ignore
      const material = obj.material
      material.t_ += material.speed_
      material.opacity = (Math.sin(material.t_) * material.delta_ + material.min_) * material.opacity_coef_
      material.needsUpdate = true
    })

    this.renderer.render(this.scene, this.camera)

    this.stats.end()
  }

  private createHexagon (position: Vector3, index: number) {
    const color = hexagonColor[index]
    // const hexagonLine = new CircleGeometry(HEXAGON_RADIUS, 6)
    const hexagonPlane = new CircleGeometry(HEXAGON_RADIUS - CITY_MARGIN, 6)
    // const vertices = hexagonLine.attributes.vertices
    // const circleLineGeom = new BufferGeometry()
    // circleLineGeom.setAttribute('vertices', vertices)
    // const materialLine = new MeshBasicMaterial({
    //   color: color,
    //   side: DoubleSide
    // })
    const materialPlane = new MeshBasicMaterial({
      color: color,
      side: DoubleSide,
      opacity: 0.5
    })
    // const circleLine = new LineLoop(circleLineGeom, materialLine)
    const circlePlane = new Mesh(hexagonPlane, materialPlane)
    // circleLine.position.copy(position)
    circlePlane.position.copy(position)
    circlePlane.lookAt(new Vector3(0, 0, 0))
    // circleLine.lookAt(new Vector3(0, 0, 0))

    const hexagon = new Object3D()
    // hexagon.add(circleLine)
    hexagon.add(circlePlane)
    this.scene.add(hexagon)
  }

  private createCone (position: Vector3, index: number) {
    const coneImg = [lightray, lightrayYellow]
    const material = new MeshBasicMaterial({
      map: new TextureLoader().load(coneImg[index]),
      transparent: true,
      depthTest: false,
      side: DoubleSide,
      blending: AdditiveBlending
    })
    const height = Math.random() * 50
    const geometry = new PlaneGeometry(HEXAGON_RADIUS * 1.5, height)
    const matrix1 = new Matrix4()
    const plane1 = new Mesh(geometry, material)
    matrix1.makeRotationX(Math.PI / 2)
    matrix1.setPosition(new Vector3(0, 0, height / -2))
    geometry.applyMatrix4(matrix1)
    const plane2 = plane1.clone()
    plane2.rotation.z = Math.PI / 2
    plane1.add(plane2)
    plane1.position.copy(position)
    plane1.lookAt(0, 0, 0)
    this.scene.add(plane1)
  }

  private createEarthParticles (earthData: { earthImgData: any, width: number, height: number }) {
    const positions: any = []
    const materials = []
    const sizes: any = []
    for (let i = 0; i < 2; i++) {
      positions[i] = {
        positions: []
      }
      sizes[i] = {
        sizes: []
      }
      const mat = new PointsMaterial()
      mat.size = 4
      mat.color = new Color(EARTH_PARTICLE_COLOR)
      mat.map = new TextureLoader().load(dotImg)
      mat.depthWrite = false
      mat.transparent = true
      mat.opacity = 0.1
      mat.side = FrontSide
      mat.blending = AdditiveBlending
      const n = i / 2
      // @ts-ignore
      mat.t_ = n * Math.PI * 2
      // @ts-ignore
      mat.speed_ = BLINT_SPEED
      // @ts-ignore
      mat.min_ = 0.2 * Math.random() + 0.5
      // @ts-ignore
      mat.delta_ = 0.1 * Math.random() + 0.1
      // @ts-ignore
      mat.opacity_coef_ = 0.9
      materials.push(mat)
    }
    const spherical = new Spherical()
    spherical.radius = 100
    const step = 250
    for (let i = 0; i < step; i++) {
      const vec = new Vector3()
      const radians = step * (1 - Math.sin(i / step * Math.PI)) / step + 0.5 // 每个纬线圈内的角度均分
      for (let j = 0; j < step; j += radians) {
        const c = j / step // 底图上的横向百分比
        const f = i / step // 底图上的纵向百分比
        const index = Math.floor(2 * Math.random())
        const pos = positions[index]
        const size = sizes[index]
        if (isLandByUV(c, f, earthData)) { // 根据横纵百分比判断在底图中的像素值
          spherical.theta = c * Math.PI * 2 - Math.PI / 2 // 横纵百分比转换为theta和phi夹角
          spherical.phi = f * Math.PI // 横纵百分比转换为theta和phi夹角
          vec.setFromSpherical(spherical) // 夹角转换为世界坐标
          pos.positions.push(vec.x)
          pos.positions.push(vec.y)
          pos.positions.push(vec.z)
          if (j % 3 === 0) {
            size.sizes.push(6.0)
          }
        }
      }
    }
    this.earthParticles = new Object3D()
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      const size = sizes[i]
      const bufferGeom = new BufferGeometry()
      const typedArr1 = new Float32Array(pos.positions.length)
      const typedArr2 = new Float32Array(size.sizes.length)
      for (let j = 0; j < pos.positions.length; j++) {
        typedArr1[j] = pos.positions[j]
      }
      for (let j = 0; j < size.sizes.length; j++) {
        typedArr2[j] = size.sizes[j]
      }
      bufferGeom.setAttribute('position', new BufferAttribute(typedArr1, 3))
      bufferGeom.setAttribute('size', new BufferAttribute(typedArr2, 1))
      bufferGeom.computeBoundingSphere()
      const particle = new Points(bufferGeom, materials[i])
      this.earthParticles.add(particle)
    }
    this.scene.add(this.earthParticles)
  }

  private handleWindowResize () {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}

function createPosition (lnglat: number[]) {
  const spherical = new Spherical()
  spherical.radius = 100
  const lng = lnglat[0]
  const lat = lnglat[1]
  // const phi = (180 - lng) * (Math.PI / 180)
  // const theta = (90 + lat) * (Math.PI / 180)
  const theta = (lng + 90) * (Math.PI / 180)
  const phi = (90 - lat) * (Math.PI / 180)
  spherical.phi = phi
  spherical.theta = theta
  const position = new Vector3()
  position.setFromSpherical(spherical)
  return position
}

function isLandByUV (c: number, f: number, { earthImgData, width, height }: any) {
  if (!earthImgData) { // 底图数据
    console.error('data error!')
  }
  const n = parseInt(`${width * c}`) // 根据横纵百分比计算图象坐标系中的坐标
  const o = parseInt(`${height * f}`) // 根据横纵百分比计算图象坐标系中的坐标
  return earthImgData.data[4 * (o * earthImgData.width + n)] === 0 // 查找底图中对应像素点的rgba值并判断
}
