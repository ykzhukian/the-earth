export const Detector = {

  canvas: !!window.CanvasRenderingContext2D,
  webgl: (function () { try { return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl') } catch (e) { return false } })(),
  workers: !!window.Worker,
  fileapi: window.File && window.FileReader && window.FileList && window.Blob,

  getWebGLErrorMessage: function () {
    const domElement = document.createElement('div')

    domElement.style.fontFamily = 'monospace'
    domElement.style.fontSize = '13px'
    domElement.style.textAlign = 'center'
    domElement.style.background = '#eee'
    domElement.style.color = '#000'
    domElement.style.padding = '1em'
    domElement.style.width = '475px'
    domElement.style.margin = '5em auto 0'

    if (!this.webgl) {
      domElement.innerHTML = window.WebGLRenderingContext
        ? [
          '抱歉，你的环境不支持WebGL'
        ].join('\n')
        : [
          '抱歉，你的浏览器不支持WebGL'
        ].join('\n')
    }

    return domElement
  },

  addGetWebGLMessage: function (parameters) {
    parameters = parameters || {}

    const parent = parameters.parent !== undefined ? parameters.parent : document.body
    const id = parameters.id !== undefined ? parameters.id : 'oldie'

    const domElement = Detector.getWebGLErrorMessage()
    domElement.id = id

    parent.appendChild(domElement)
  }

}
