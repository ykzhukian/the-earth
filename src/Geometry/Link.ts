import {
  Ray,
  Mesh,
  Vector3,
  CubicBezierCurve3,
  QuadraticBezierCurve3
} from 'three'
import { MeshLine, MeshLineMaterial } from 'three.meshline'
import * as TWEEN from '@tweenjs/tween.js'
import City from './City'

const LINK_COLOR = 0xb3f6fc

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
    const v0 = this.city1.getPosition()
    const v3 = this.city2.getPosition()

    let curve
    const angle = v0.angleTo(v3)
    if (angle > 1) {
      const { v1, v2 } = getBezierPoint(v0, v3)
      curve = new CubicBezierCurve3(v0, v1, v2, v3) // 三维三次贝赛尔曲线
    } else {
      const p0 = new Vector3(0, 0, 0) // 法线向量
      const rayLine = new Ray(p0, getVCenter(v0.clone(), v3.clone())) // 顶点坐标
      const vtop = rayLine.at(1.3, new Vector3()) // 位置
      curve = new QuadraticBezierCurve3(v0, vtop, v3) // 三维二次贝赛尔曲线
    }

    const curvePoints = curve.getPoints(100)
    const material = new MeshLineMaterial({
      color: LINK_COLOR,
      opacity: 0.5,
      transparent: true
    })
    const lineLength = { value: 0 }
    const line = new MeshLine()
    const drawLineTween = new TWEEN.Tween(lineLength).to({ value: 100 }, 3000)
    drawLineTween.onUpdate(function () {
      line.setPoints(curvePoints.slice(0, lineLength.value + 1), (p: number) => 0.2 + p / 2)
    })
    const eraseLineTween = new TWEEN.Tween(lineLength).to({ value: 0 }, 3000)
    eraseLineTween.onUpdate(function () {
      line.setPoints(curvePoints.slice(curvePoints.length - lineLength.value, curvePoints.length), (p: number) => 0.2 + p / 2)
    })

    drawLineTween.chain(eraseLineTween)
    drawLineTween.start()

    const mesh = new Mesh(line, material)
    this.link = mesh
  }

  getMesh () {
    return this.link
  }
}

function getBezierPoint (v0: Vector3, v3: Vector3) {
  const angle = (v0.angleTo(v3) * 180) / Math.PI // 0 ~ Math.PI       // 计算向量夹角
  console.log('angle', v0.angleTo(v3))
  const aLen = angle
  const p0 = new Vector3(0, 0, 0) // 法线向量
  const rayLine = new Ray(p0, getVCenter(v0.clone(), v3.clone())) // 顶点坐标
  const vtop = new Vector3(0, 0, 0) // 法线向量
  rayLine.at(100, vtop) // 位置
  // 控制点坐标
  const v1 = getLenVcetor(v0.clone(), vtop, aLen)
  const v2 = getLenVcetor(v3.clone(), vtop, aLen)
  return {
    v1: v1,
    v2: v2
  }
}

function getVCenter (v1: Vector3, v2: Vector3) {
  const v = v1.add(v2)
  return v.divideScalar(2)
}

function getLenVcetor (v1: Vector3, v2: Vector3, len: number) {
  const v1v2Len = v1.distanceTo(v2)
  return v1.lerp(v2, len / v1v2Len)
}
