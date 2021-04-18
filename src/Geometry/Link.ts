import {
  Ray,
  Line,
  Vector3,
  BufferGeometry,
  QuadraticBezierCurve3,
  LineBasicMaterial,
  Spherical,
  Mesh
} from 'three'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import * as TWEEN from '@tweenjs/tween.js'
import City from './City'

const LINK_COLOR = 0x44edfc

export default class Link {
  private city1: City
  private city2: City
  private link: Mesh

  constructor (city1: City, city2: City) {
    // 经纬度转坐标
    // this.group = new Group()
    // this.groupBall = new Group()

    this.city1 = city1
    this.city2 = city2

    // 圆点

    // @ts-ignore
    this.drawLine()
    // this.drawSportPoint()
  }

  drawLine = () => {
    const geometry = new BufferGeometry() // 声明一个几何体对象Geometry
    const v0 = this.city1.getPosition()
    const v3 = this.city2.getPosition()
    const p0 = new Vector3(0, 0, 0) // 法线向量
    const rayLine = new Ray(p0, getVCenter(v0.clone(), v3.clone())) // 顶点坐标
    const vtop = rayLine.at(1.3, new Vector3()) // 位置

    const curve = new QuadraticBezierCurve3(v0, vtop, v3) // 三维二次贝赛尔曲线
    const curvePoints = curve.getPoints(100)
    geometry.setFromPoints(curvePoints)
    const material = new MeshLineMaterial({
      color: LINK_COLOR,
      opacity: 0.6,
      transparent: true
    })
    const line = new MeshLine()
    line.setPoints(curvePoints, (p: number) => 1 - p / 2)
    const mesh = new Mesh(line, material)
    // this.sport(curvePoints)
    this.link = mesh
  }

  // drawSportPoint (position: Vector3, name: string) {
  //   const box = new SphereGeometry(0.5, 10, 10)
  //   const material = new MeshLambertMaterial({ color: 0x00bfff }) // 材质对象
  //   const mesh = new Mesh(box, material)
  //   mesh.name = name
  //   mesh.position.set(position.x, position.y, position.z)
  //   return mesh
  // }

  // sport (curvePoints: Vector3[]) {
  //   const Ball = this.drawSportPoint(curvePoints[0], 'ball')
  //   this.scene.add(Ball)
  //   const arr = Array.from(Array(101), (v, k) => k) // 生成一个时间序列
  //   const times = new Float32Array(arr)
  //   const posArr: any[] = []
  //   curvePoints.forEach(elem => {
  //     posArr.push(elem.x, elem.y, elem.z)
  //   }) // 创建一个和时间序列相对应的位置坐标系列
  //   const values = new Float32Array(posArr) // 创建一个帧动画的关键帧数据，曲线上的位置序列对应一个时间序列
  //   const posTrack = new KeyframeTrack('Ball.position', times, values)
  //   const duration = 101
  //   const clip = new AnimationClip('default', duration, [posTrack])
  //   this.mixer = new AnimationMixer(Ball)
  //   const AnimationAction = this.mixer.clipAction(clip)
  //   AnimationAction.timeScale = 2
  //   AnimationAction.play()
  // }

  // mixerEl () {
  //   return this.mixer
  // }

  getMesh () {
    return this.link
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

function getVCenter (v1: Vector3, v2: Vector3) {
  const v = v1.add(v2)
  return v.divideScalar(2)
}
