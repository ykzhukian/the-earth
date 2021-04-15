import * as THREE from 'three'

export default class Universe {
  private universeMesh: THREE.Mesh

  constructor () {
    const skyGeometry = new THREE.SphereGeometry(500, 100, 100)
    const meshBasicSky = new THREE.MeshLambertMaterial({ color: 0x011a26, side: THREE.DoubleSide })
    this.universeMesh = new THREE.Mesh(skyGeometry, meshBasicSky)
  }

  getMesh () {
    return this.universeMesh
  }
}
