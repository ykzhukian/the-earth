import { SphereGeometry, MeshBasicMaterial, Mesh, Object3D } from 'three'

export default class Earth {
  earth: typeof Mesh.prototype & typeof Object3D.prototype

  constructor () {
    /**
     * SphereGeometry:
     * radius — 球体半径，默认为1。
     * widthSegments — 水平分段数（沿着经线分段），最小值为3，默认值为8。
     * heightSegments — 垂直分段数（沿着纬线分段），最小值为2，默认值为6。
     * phiStart — 指定水平（经线）起始角度，默认值为0。。
     * phiLength — 指定水平（经线）扫描角度的大小，默认值为 Math.PI * 2。
     * thetaStart — 指定垂直（纬线）起始角度，默认值为0。
     * thetaLength — 指定垂直（纬线）扫描角度大小，默认值为 Math.PI。
     */
    const earth = new SphereGeometry(2)
    const material = new MeshBasicMaterial({ color: 0xCFE2F3 })
    this.earth = new Mesh(earth, material)

    console.log('this.earth', this.earth)
  }

  animate () {
  }

  render () {
    return this.earth
  }
}
