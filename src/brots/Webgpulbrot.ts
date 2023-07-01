/// <reference types="@webgpu/types" />

import Mandelbrot, { RunMode } from "./Mandelbrot";

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

  async isSupported(): Promise<boolean> {
    return 'gpu' in navigator
  }

  async beforePerform(iterations: number): Promise<void> {
    const arrayBuffer = new ArrayBuffer(this.uniformBufferSize);
    new Float32Array(arrayBuffer, 0).set([
      this.width,
      this.height,
      ZOOM
    ]);
    new Uint32Array(arrayBuffer, (1 + 1 + 1) * Float32Array.BYTES_PER_ELEMENT).set([iterations]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, arrayBuffer);
  }

  async perform(_iterations: number): Promise<void> {
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
