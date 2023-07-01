import CanvasController from "./canvas_controller"
import delay from "../utils/delay"

import vertexShaderSource from "../shaders/basic1.vert?raw"
import fragmentShaderSource from "../shaders/mandelbrot1.frag?raw"

export default class extends CanvasController {
  gl!: WebGLRenderingContext
  program!: WebGLProgram
  vao!: WebGLVertexArrayObject
  widthLocation!: WebGLUniformLocation
  heightLocation!: WebGLUniformLocation
  buffer!: WebGLBuffer

  connect() {
    this.gl = this.canvasTarget.getContext('webgl')!
    let vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
    let fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)
    this.program = this.createProgram(vertexShader, fragmentShader)
    let positionAttributeLocation = this.gl.getAttribLocation(this.program, "position")

    this.widthLocation = this.gl.getUniformLocation(this.program, 'width')!
    this.heightLocation = this.gl.getUniformLocation(this.program, 'height')!

    this.buffer = this.gl.createBuffer()!
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)

    let positions = [
      -1, -1,
      -1,  1,
       1, -1,
       1,  1,
    ]
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)

    this.gl.enableVertexAttribArray(positionAttributeLocation)

    let size = 2             // 2 components per iteration
    let type = this.gl.FLOAT // the data is 32bit floats
    let normalize = false    // don't normalize the data
    let stride = 0           // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0           // start at the beginning of the buffer
    this.gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
  }

  disconnect() {
    super.disconnect()
  }

  clearCanvas() {
    this.gl.clearColor(1, 1, 1, 0)
  }

  async perform() {
    this.gl.viewport(0, 0, this.width, this.height)
    await delay(1)

    this.gl.useProgram(this.program)

    this.gl.uniform1i(this.widthLocation, this.width)
    this.gl.uniform1i(this.heightLocation, this.height)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)

    let primitiveType = this.gl.TRIANGLE_STRIP
    let offset = 0
    let count = 4
    this.gl.drawArrays(primitiveType, offset, count)
  }

  createShader(type: GLenum, source: string): WebGLShader {
    let shader = this.gl.createShader(type)
    if (!shader) throw new Error("unable to allocate shader")

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)
    if (success) return shader

    let errorString = this.gl.getShaderInfoLog(shader) || '';
    this.gl.deleteShader(shader)
    throw new Error(errorString)
  }

  createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram {
    let program = this.gl.createProgram()
    if (!program) throw new Error("unable to allocate shader")
    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)
    let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)
    if (success) return program

    let errorString = this.gl.getProgramInfoLog(program) || '';
    this.gl.deleteProgram(program)
    throw new Error(errorString)
  }
}
