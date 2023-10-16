/// <reference types="@webgpu/types" />

import Mandelbrot, { Point, RunMode } from "./Mandelbrot";

import shaderSource from "../shaders/mandelbrot.wgsl?raw"
import { ZOOM } from "../utils/constants";

export default class Webgpulbrot extends Mandelbrot {
  adapter: GPUAdapter
  device: GPUDevice
  context: GPUCanvasContext
  presentationFormat: GPUTextureFormat
  pipeline: GPURenderPipeline
  canTime = false
  uniformBufferSize: number
  uniformBuffer: GPUBuffer
  bindGroup: GPUBindGroup

  mode = RunMode.render

  async initialize(): Promise<void> {
    this.adapter = await navigator.gpu.requestAdapter()
    if (!this.adapter) throw new Error('no gpu adapter')
    this.device = await this.adapter.requestDevice()
    if (!this.device) throw new Error('no gpu device')

    this.canTime = typeof this.device.queue.onSubmittedWorkDone === 'function'

    this.context = this.canvas.getContext('webgpu')

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

    this.context.configure({
      device: this.device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    })

    this.uniformBufferSize = Math.ceil((
      + 2 * Float32Array.BYTES_PER_ELEMENT // center: vec2<f32>
      + 2 * Float32Array.BYTES_PER_ELEMENT // rectangle: vec2<f32>
      + 1 * Uint32Array.BYTES_PER_ELEMENT  // iterations: u32
    ) / 8) * 8
    
    this.uniformBuffer = this.device.createBuffer({
      size: this.uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const shaderModule = this.device.createShaderModule({ code: shaderSource })

    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertex_main'
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragment_main',
        targets: [{ format: presentationFormat }]
      },
      primitive: { topology: 'triangle-list' }
    })

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer }
        }
      ]
    })
  }

  async isSupported(): Promise<boolean> {
    return 'gpu' in navigator
  }

  async beforePerform(iterations: number, center: Point, rectangle: Point): Promise<void> {
    const arrayBuffer = new ArrayBuffer(this.uniformBufferSize);
    new Float32Array(arrayBuffer, 0).set([
      center.x, -center.y,
      rectangle.x, rectangle.y
    ]);
    new Uint32Array(arrayBuffer, (2 + 2) * Float32Array.BYTES_PER_ELEMENT).set([iterations]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, arrayBuffer);
  }

  async perform(_iterations: number, _center: Point, _rectangle: Point): Promise<void> {
    const commandEncoder = this.device.createCommandEncoder({})

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 1.0, g: 0.0, b: 1.0, a: 0.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor)
    renderPass.setPipeline(this.pipeline)
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.draw(6, 1, 0, 0)
    renderPass.end()

    this.device.queue.submit([commandEncoder.finish()])

    if (this.canTime) await this.device.queue.onSubmittedWorkDone()
  }

  async withTiming(fn: () => Promise<void>): Promise<number> {
    if (!this.canTime) {
      await fn()
      return null
    }

    return super.withTiming(fn)
  }
}
