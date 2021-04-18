import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

const CITY_COLOR = 0x44edfc

export default class City {
  private city: THREE.Object3D
  private position: THREE.Vector3

  constructor ([lng, lat]: number[]) {
    this.createHexagon(this.createPosition([lng, lat]))
  }

  private createHexagon (position: THREE.Vector3) {
    this.position = position
    const hexagonPlane = new THREE.CircleGeometry(0.7, 6)
    const materialPlane = new THREE.MeshBasicMaterial({
      color: CITY_COLOR,
      side: THREE.DoubleSide,
      opacity: 0.8,
      transparent: true
    })
    const circlePlane = new THREE.Mesh(hexagonPlane, materialPlane)
    circlePlane.position.copy(position)
    circlePlane.lookAt(new THREE.Vector3(0, 0, 0))

    const hexagon = new THREE.Object3D()
    hexagon.add(circlePlane)
    const scale = { x: 1, y: 1, z: 1 }
    // hexagon.scale.set(scale.x, scale.y, scale.z)
    const tween = new TWEEN.Tween(scale).to({ x: 1.5, y: 1.5, z: 1.5 }, 2000)
    const tweenBack = new TWEEN.Tween(scale).to({ x: 1, y: 1, z: 1 }, 2000)
    tween.onUpdate(function () {
      circlePlane.scale.set(scale.x, scale.y, scale.z)
    })
    tweenBack.onUpdate(function () {
      circlePlane.scale.set(scale.x, scale.y, scale.z)
    })
    tween.chain(tweenBack)
    tweenBack.chain(tween)
    tween.start()
    this.city = hexagon
  }

  private createPosition (lnglat: number[]) {
    const spherical = new THREE.Spherical()
    spherical.radius = 100
    const lng = lnglat[0]
    const lat = lnglat[1]
    // const phi = (180 - lng) * (Math.PI / 180)
    // const theta = (90 + lat) * (Math.PI / 180)
    const theta = (lng + 90) * (Math.PI / 180)
    const phi = (90 - lat) * (Math.PI / 180)
    spherical.phi = phi
    spherical.theta = theta
    const position = new THREE.Vector3()
    position.setFromSpherical(spherical)
    return position
  }

  getMesh () {
    return this.city
  }

  getPosition () {
    return this.position
  }
}
