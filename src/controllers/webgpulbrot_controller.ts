/// <reference types="@webgpu/types" />

import CanvasController from "./canvas_controller"

import shaderSource from "../shaders/mandelbrot.wgsl?raw"
import animationFrame from "../utils/animationFrame"

export default class extends CanvasController {
  adapter: GPUAdapter
  device: GPUDevice
  gctx: GPUCanvasContext
  presentationFormat: GPUTextureFormat
  pipeline: GPURenderPipeline
  canTime = false
  uniformBufferSize: number
  uniformBuffer: GPUBuffer
  bindGroup: GPUBindGroup

  async connect() {
    if (!('gpu' in navigator)) this.prelog('*** error: no webgpu ***')

    this.adapter = await navigator.gpu.requestAdapter()
    if (!this.adapter) this.prelog('*** error: no gpu adapter ***')
    this.device = await this.adapter.requestDevice()
    if (!this.device) this.prelog('*** error: no gpu device ***')

    this.canTime = typeof this.device.queue.onSubmittedWorkDone === 'function'

    this.gctx = this.canvasTarget.getContext('webgpu')

    this.updateCanvasSize()
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

    this.gctx.configure({
      device: this.device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    })

    this.uniformBufferSize = Math.ceil((
      + 1 * Float32Array.BYTES_PER_ELEMENT // width: f32
      + 1 * Float32Array.BYTES_PER_ELEMENT // height: f32
      + 1 * Float32Array.BYTES_PER_ELEMENT // zoom: f32
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

  clearCanvas() {}

  async beforePerform(): Promise<void> {
    const arrayBuffer = new ArrayBuffer(this.uniformBufferSize);
    new Float32Array(arrayBuffer, 0).set([
      this.width,
      this.height,
      150
    ]);
    new Uint32Array(arrayBuffer, (1 + 1 + 1) * Float32Array.BYTES_PER_ELEMENT).set([570]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, arrayBuffer);
  }

  async perform() {
    const commandEncoder = this.device.createCommandEncoder({})

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: this.gctx.getCurrentTexture().createView(),
          clearValue: { r: 1.0, g: 0.0, b: 1.0, a: 1.0 },
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
      this.prelog('** warning: no webgpu timer **')
      await fn()
      return null
    }

    return super.withTiming(fn)
  }
}
