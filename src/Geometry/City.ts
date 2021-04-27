import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

const CITY_COLOR = 0x24e5ff

export default class City {
  private position: THREE.Vector3
  private cityGroup: THREE.Group

  constructor ([lng, lat]: number[]) {
    this.cityGroup = new THREE.Group()

    const position = this.createPosition([lng, lat])
    this.position = position
    this.createBox(position)
  }

  private createBox (position: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 10)
    const material = new THREE.MeshBasicMaterial({
      color: CITY_COLOR,
      side: THREE.DoubleSide,
      opacity: 0.5,
      transparent: true
    })
    const box = new THREE.Mesh(geometry, material)
    box.position.copy(position)
    box.lookAt(new THREE.Vector3(0, 0, 0))
    this.cityGroup.add(box)
    // 顶部
    const geometryTop = new THREE.BoxGeometry(0.6, 0.6, 0.6)
    const materialTop = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      opacity: 0.5,
      transparent: true
    })
    const boxTop = new THREE.Mesh(geometryTop, materialTop)
    boxTop.lookAt(new THREE.Vector3(0, 0, 0))

    // 底部升起
    const boxDepth = { value: 0.95 }
    const tweenRise = new TWEEN.Tween(boxDepth).to({ value: 1 }, 3000)
    tweenRise.onUpdate(function () {
      box.position.set(position.x * boxDepth.value, position.y * boxDepth.value, position.z * boxDepth.value)
    })
    tweenRise.start()

    // 顶部上下浮动
    const scale = { value: 1.06 }
    const tween = new TWEEN.Tween(scale).to({ value: 1.07 }, 2000)
    const tweenBack = new TWEEN.Tween(scale).to({ value: 1.06 }, 2000)
    tween.onUpdate(function () {
      boxTop.position.set(position.x * scale.value, position.y * scale.value, position.z * scale.value)
    })
    tweenBack.onUpdate(function () {
      boxTop.position.set(position.x * scale.value, position.y * scale.value, position.z * scale.value)
    })
    tween.chain(tweenBack)
    tweenBack.chain(tween)
    tween.delay(3000).start()
    this.cityGroup.add(boxTop)

    // 旗子
  }

  private createPosition (lnglat: number[]) {
    const spherical = new THREE.Spherical()
    spherical.radius = 100
    const lng = lnglat[0]
    const lat = lnglat[1]
    const theta = (lng + 90) * (Math.PI / 180)
    const phi = (90 - lat) * (Math.PI / 180)
    spherical.phi = phi
    spherical.theta = theta
    const position = new THREE.Vector3()
    position.setFromSpherical(spherical)
    return position
  }

  getMesh () {
    return this.cityGroup
  }

  getPosition () {
    return this.position
  }

  destroy () {
    this.cityGroup.clear()
  }
}
