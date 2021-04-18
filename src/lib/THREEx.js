import * as THREE from 'three'

const THREEx = {}

/**
 * from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
 * @return {[type]} [description]
 */
THREEx.createAtmosphereMaterial = function () {
  const vertexShader = [
    'varying vec3 vVertexWorldPosition;',
    'varying vec3 vVertexNormal;',

    'varying vec4 vFragColor;',

    'void main(){',
    ' vVertexNormal = normalize(normalMatrix * normal);',

    ' vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',

    ' // set gl_Position',
    ' gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'

  ].join('\n')
  const fragmentShader = [
    'uniform vec3 glowColor;',
    'uniform float coeficient;',
    'uniform float power;',

    'varying vec3 vVertexNormal;',
    'varying vec3 vVertexWorldPosition;',

    'varying vec4 vFragColor;',

    'void main(){',
    ' vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
    ' vec3 viewCameraToVertex = (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
    ' viewCameraToVertex = normalize(viewCameraToVertex);',
    ' float intensity = pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
    ' gl_FragColor = vec4(glowColor, intensity);',
    '}'
  ].join('\n')

  // create custom material from the shader code above
  //   that is within specially labeled script tags
  const material = new THREE.ShaderMaterial({
    uniforms: {
      coeficient: {
        type: 'f',
        value: 1.0
      },
      power: {
        type: 'f',
        value: 2
      },
      glowColor: {
        type: 'c',
        value: new THREE.Color('pink')
      }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // blending : THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })
  return material
}

/**
 * dilate a geometry inplace
 * @param  {THREE.Geometry} geometry geometry to dilate
 * @param  {Number} length   percent to dilate, use negative value to erode
 */
THREEx.dilateGeometry = function (geometry, length) {
  // gather vertexNormals from geometry.faces
  const vertexNormals = new Array(geometry.vertices.length)
  geometry.faces.forEach(function (face) {
    if (face instanceof THREE.Face4) {
      vertexNormals[face.a] = face.vertexNormals[0]
      vertexNormals[face.b] = face.vertexNormals[1]
      vertexNormals[face.c] = face.vertexNormals[2]
      vertexNormals[face.d] = face.vertexNormals[3]
    } else if (face instanceof THREE.Face3) {
      vertexNormals[face.a] = face.vertexNormals[0]
      vertexNormals[face.b] = face.vertexNormals[1]
      vertexNormals[face.c] = face.vertexNormals[2]
    } else console.assert(false)
  })
  // modify the vertices according to vertextNormal
  geometry.vertices.forEach(function (vertex, idx) {
    const vertexNormal = vertexNormals[idx]
    vertex.x += vertexNormal.x * length
    vertex.y += vertexNormal.y * length
    vertex.z += vertexNormal.z * length
  })
}

THREEx.GeometricGlowMesh = function (mesh) {
  const object3d = new THREE.Object3D()

  console.log('mesh', mesh)

  // const geometry = mesh.clone()
  // // THREEx.dilateGeometry(geometry, 0.01)
  // const material = THREEx.createAtmosphereMaterial()
  // material.uniforms.glowColor.value = new THREE.Color('cyan')
  // material.uniforms.coeficient.value = 1.1
  // material.uniforms.power.value = 1.4
  // const insideMesh = new THREE.Mesh(geometry, material)
  // object3d.add(insideMesh)

  const geometry2 = mesh.clone()
  console.log('geometry2', geometry2)
  // THREEx.dilateGeometry(geometry2, 0.1)
  const material2 = THREEx.createAtmosphereMaterial()
  material2.uniforms.glowColor.value = new THREE.Color('white')
  material2.uniforms.coeficient.value = 1.1
  material2.uniforms.power.value = 1.5
  material2.side = THREE.BackSide
  const outsideMesh = new THREE.Mesh(geometry2, material2)
  object3d.add(outsideMesh)

  // expose a few variable
  this.object3d = object3d
  // this.insideMesh = insideMesh
  this.outsideMesh = outsideMesh
}

export default THREEx
