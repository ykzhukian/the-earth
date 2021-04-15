import * as THREE from 'three'

import earthBg from '@/assets/earth.jpg'
import dotImg from '@/assets/dot.png'

const EARTH_COLOR = 0x0689c9
const EARTH_PARTICLE_COLOR = 0x0260cc
const BLINT_SPEED = 0.01

export default class Earth {
  private earth: THREE.Mesh
  private earthParticles: THREE.Object3D
  private earthImg: HTMLImageElement
  private earthImgData: ImageData

  constructor (radius: number) {
    // 地球本体
    const earthGeometry = new THREE.SphereGeometry(radius, 100, 100)
    // 材质
    const meshBasic = new THREE.MeshLambertMaterial({ color: EARTH_COLOR })
    this.earth = new THREE.Mesh(earthGeometry, meshBasic)

    this.earthParticles = new THREE.Object3D()
    // 地球表面的点点
    this.earthImg = document.createElement('img')
    this.earthImg.src = earthBg
    this.earthImg.onload = () => {
      const earthCanvas = document.createElement('canvas')
      const earthCtx = earthCanvas.getContext('2d')
      earthCanvas.width = this.earthImg.width
      earthCanvas.height = this.earthImg.height
      earthCtx.drawImage(this.earthImg, 0, 0, this.earthImg.width, this.earthImg.height)
      this.earthImgData = earthCtx.getImageData(0, 0, this.earthImg.width, this.earthImg.height)
      this.createEarthParticles()
    }
  }

  private createEarthParticles () {
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
      const mat = new THREE.PointsMaterial()
      mat.size = 2.5
      mat.color = new THREE.Color(EARTH_PARTICLE_COLOR)
      mat.map = new THREE.TextureLoader().load(dotImg)
      mat.depthWrite = false
      mat.transparent = true
      mat.opacity = 0.1
      mat.side = THREE.FrontSide
      mat.blending = THREE.AdditiveBlending
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
    const spherical = new THREE.Spherical()
    spherical.radius = 100
    const step = 250
    for (let i = 0; i < step; i++) {
      const vec = new THREE.Vector3()
      const radians = step * (1 - Math.sin(i / step * Math.PI)) / step + 0.5 // 每个纬线圈内的角度均分
      for (let j = 0; j < step; j += radians) {
        const c = j / step // 底图上的横向百分比
        const f = i / step // 底图上的纵向百分比
        const index = Math.floor(2 * Math.random())
        const pos = positions[index]
        const size = sizes[index]
        if (isLandByUV(c, f, { earthImgData: this.earthImgData, width: this.earthImg.width, height: this.earthImg.height })) { // 根据横纵百分比判断在底图中的像素值
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
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      const size = sizes[i]
      const bufferGeom = new THREE.BufferGeometry()
      const typedArr1 = new Float32Array(pos.positions.length)
      const typedArr2 = new Float32Array(size.sizes.length)
      for (let j = 0; j < pos.positions.length; j++) {
        typedArr1[j] = pos.positions[j]
      }
      for (let j = 0; j < size.sizes.length; j++) {
        typedArr2[j] = size.sizes[j]
      }
      bufferGeom.setAttribute('position', new THREE.BufferAttribute(typedArr1, 3))
      bufferGeom.setAttribute('size', new THREE.BufferAttribute(typedArr2, 1))
      bufferGeom.computeBoundingSphere()
      const particle = new THREE.Points(bufferGeom, materials[i])
      this.earthParticles.add(particle)
    }
    console.log('this.earthParticles', this.earthParticles)
  }

  getAnimation () {
    return () => {
      if (!this.earthParticles) return
      // 球面粒子闪烁
      const objects = this.earthParticles.children
      objects.forEach(obj => {
        // @ts-ignore
        const material = obj.material
        material.t_ += material.speed_
        material.opacity = (Math.sin(material.t_) * material.delta_ + material.min_) * material.opacity_coef_
        material.needsUpdate = true
      })
    }
  }

  getMesh () {
    return this.earth
  }

  getParticleMesh () {
    return this.earthParticles
  }
}

function isLandByUV (c: number, f: number, { earthImgData, width, height }: any) {
  if (!earthImgData) { // 底图数据
    console.error('data error!')
  }
  const n = parseInt(`${width * c}`) // 根据横纵百分比计算图象坐标系中的坐标
  const o = parseInt(`${height * f}`) // 根据横纵百分比计算图象坐标系中的坐标
  return earthImgData.data[4 * (o * earthImgData.width + n)] === 0 // 查找底图中对应像素点的rgba值并判断
}
