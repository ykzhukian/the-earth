import {
  Mesh,
  MathUtils,
  Vector3,
  CircleGeometry,
  Ray,
  LineGeometry,
  Line,
  BufferGeometry,
  ArcCurve,
  QuadraticBezierCurve3,
  LineBasicMaterial,
  CubicBezierCurve3,
  SphereGeometry,
  MeshLambertMaterial,
  MeshBasicMaterial,
  Scene,
  KeyframeTrack,
  AnimationClip,
  AnimationMixer,
  Spherical,
  Group,
  DoubleSide
} from 'three'

export default class City {
  private cityPosition: Vector3
  private cityMesh: Mesh
  private city2Mesh: Mesh
  private scene: Scene
  private mixer: AnimationMixer
  private group: Group
  private groupBall: Group

  constructor (lng: number, lat: number, raduis: number, scene: Scene) {
    // 经纬度转坐标
    // const { x, y, z } = getPosition(lng, lat, raduis)
    const pos1 = new Vector3(100.123123, 1, -10.123123)
    const pos2 = new Vector3(88.123123, 1, 22)
    this.scene = scene
    this.group = new Group()
    this.groupBall = new Group()

    // 圆点
    const geometry = new CircleGeometry(1, 32)
    const material = new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide })
    this.cityMesh = new Mesh(geometry, material)
    this.cityMesh.position.set(pos1.x, pos1.y, pos1.z)
    this.city2Mesh = new Mesh(geometry, material)
    this.city2Mesh.position.set(pos1.x, pos1.y, pos1.z)
    this.city2Mesh.position.set(pos2.x, pos2.y, pos2.z)
    this.scene.add(this.cityMesh)
    this.scene.add(this.city2Mesh)

    const spherical = new Spherical()
    spherical.setFromCartesianCoords(pos1.x, pos1.y, pos1.z)
    this.cityMesh.rotateX(spherical.phi - Math.PI / 2)
    this.cityMesh.rotateY(spherical.theta)

    const spherical2 = new Spherical()
    spherical2.setFromCartesianCoords(pos2.x, pos2.y, pos2.z)
    this.city2Mesh.rotateX(spherical2.phi - Math.PI / 2)
    this.city2Mesh.rotateY(spherical2.theta)

    // 圆弧
    // const arc = new ArcCurve(0, 0, 2, 0, 2 * Math.PI, false)
    // const points = arc.getPoints(40)
    // const geometryLine = new BufferGeometry().setFromPoints(points)
    // const LineMateri = new LineBasicMaterial({ color: 0x20b2aa })
    // const line = new Line(geometryLine, LineMateri)
    // line.position.set(x, y, z)
    // line.rotateX(spherical.phi + Math.PI / 2)
    // line.rotateY(spherical.theta)
    // this.scene.add(line)

    // @ts-ignore
    this.drawLine()
    // this.drawSportPoint()
  }

  drawLine = (longitude: number, latitude: number, longitude2: number, latitude2: number) => {
    const geometry = new BufferGeometry() // 声明一个几何体对象Geometry
    const v0 = new Vector3(100.123123, 1, -10.123123)
    const v3 = new Vector3(88.123123, 1, 22)
    const p0 = new Vector3(0, 0, 0) // 法线向量
    const rayLine = new Ray(p0, getVCenter(v0.clone(), v3.clone())) // 顶点坐标
    const vtop = rayLine.at(2, new Vector3()) // 位置

    const curve = new QuadraticBezierCurve3(v0, vtop, v3) // 三维二次贝赛尔曲线
    const curvePoints = curve.getPoints(100)
    geometry.setFromPoints(curvePoints)
    const material = new LineBasicMaterial({ color: 0xff7e41 })
    const line = new Line(geometry, material)
    this.scene.add(line)
    this.sport(curvePoints)
  }

  drawSportPoint (position: Vector3, name: string) {
    const box = new SphereGeometry(0.5, 10, 10)
    const material = new MeshLambertMaterial({ color: 0x00bfff }) // 材质对象
    const mesh = new Mesh(box, material)
    mesh.name = name
    mesh.position.set(position.x, position.y, position.z)
    return mesh
  }

  sport (curvePoints: Vector3[]) {
    const Ball = this.drawSportPoint(curvePoints[0], 'ball')
    this.scene.add(Ball)
    const arr = Array.from(Array(101), (v, k) => k) // 生成一个时间序列
    const times = new Float32Array(arr)
    const posArr: any[] = []
    curvePoints.forEach(elem => {
      posArr.push(elem.x, elem.y, elem.z)
    }) // 创建一个和时间序列相对应的位置坐标系列
    const values = new Float32Array(posArr) // 创建一个帧动画的关键帧数据，曲线上的位置序列对应一个时间序列
    const posTrack = new KeyframeTrack('Ball.position', times, values)
    const duration = 101
    const clip = new AnimationClip('default', duration, [posTrack])
    this.mixer = new AnimationMixer(Ball)
    const AnimationAction = this.mixer.clipAction(clip)
    AnimationAction.timeScale = 2
    AnimationAction.play()
  }

  mixerEl () {
    return this.mixer
  }
}

// 经纬度转坐标
function getPosition (longitude: number, latitude: number, radius = this.radius) { // 经度，纬度转换为坐标
  const lg = MathUtils.degToRad(longitude)
  const lt = MathUtils.degToRad(latitude) // 获取x，y，z坐标
  const temp = radius * Math.cos(lt)
  const x = temp * Math.sin(lg)
  const y = radius * Math.sin(lt)
  const z = temp * Math.cos(lg)
  return new Vector3(x, y, z)
}

function getVCenter (v1: Vector3, v2: Vector3) {
  const v = v1.add(v2)
  return v.divideScalar(2)
}