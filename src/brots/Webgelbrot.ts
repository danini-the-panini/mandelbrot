import delay from "../utils/delay";
import Mandelbrot, { Point, RunMode } from "./Mandelbrot";

import vertexShaderSource from "../shaders/basic.vert?raw"
import fragmentShaderSource from "../shaders/mandelbrot.frag?raw"
import animationFrame from "../utils/animationFrame";
import { ZOOM } from "../utils/constants";

export default class Webgelbrot extends Mandelbrot {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  vao: WebGLVertexArrayObject
  centerLocation: WebGLUniformLocation
  rectangleLocation: WebGLUniformLocation
  iterationsLocation: WebGLUniformLocation
  timerEXT: { TIME_ELAPSED_EXT: number }

  mode = RunMode.render

  async initialize(): Promise<void> {
    this.gl = this.canvas.getContext('webgl2')
    if (!this.gl) throw new Error('no webgl2')

    this.timerEXT = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') || this.gl.getExtension('EXT_disjoint_timer_query')

    let vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
    let fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)
    this.program = this.createProgram(vertexShader, fragmentShader)
    let positionAttributeLocation = this.gl.getAttribLocation(this.program, "position")

    this.centerLocation = this.gl.getUniformLocation(this.program, 'center')!
    this.rectangleLocation = this.gl.getUniformLocation(this.program, 'rectangle')!
    this.iterationsLocation = this.gl.getUniformLocation(this.program, 'iterations')!

    let positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)

    let positions = [
      -1, -1,
      -1,  1,
       1, -1,
       1,  1,
    ]
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)

    this.vao = this.gl.createVertexArray()!
    this.gl.bindVertexArray(this.vao)
    this.gl.enableVertexAttribArray(positionAttributeLocation)

    let size = 2             // 2 components per iteration
    let type = this.gl.FLOAT // the data is 32bit floats
    let normalize = false    // don't normalize the data
    let stride = 0           // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0           // start at the beginning of the buffer
    this.gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
  }

  async beforePerform(iterations: number, center: Point, rectangle: Point): Promise<void> {
    this.gl.viewport(0, 0, this.width, this.height)
    await animationFrame()

    this.gl.useProgram(this.program)

    this.gl.uniform2f(this.centerLocation, center.x, -center.y)
    this.gl.uniform2f(this.rectangleLocation, rectangle.x, rectangle.y)
    this.gl.uniform1i(this.iterationsLocation, iterations)

    this.gl.bindVertexArray(this.vao)
  }

  async perform(_iterations: number, _center: Point, _rectangle: Point): Promise<void> {
    let primitiveType = this.gl.TRIANGLE_STRIP
    let offset = 0
    let count = 4
    this.gl.drawArrays(primitiveType, offset, count)
  }

  async withTiming(fn: () => Promise<void>): Promise<number | null> {
    if (!this.timerEXT) {
      await fn()
      return null
    }

    let query: WebGLQuery
    if (this.timerEXT) {
      query = this.gl.createQuery()
      this.gl.beginQuery(this.timerEXT.TIME_ELAPSED_EXT, query)
    }

    await fn()

    if (this.timerEXT) {
      this.gl.endQuery(this.timerEXT.TIME_ELAPSED_EXT);

      const elapsedNanos = await this.queryResult(query)
      return elapsedNanos / 1000000000
    }
  }

  private createShader(type: GLenum, source: string): WebGLShader {
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

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram {
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

  private async queryResult(query: WebGLQuery) {
    let available = false
    while (!available) {
      await delay(1)
      available = this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE)
    }
    return this.gl.getQueryParameter(query, this.gl.QUERY_RESULT)
  }

}
