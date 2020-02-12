const { environment } = require('@rails/webpacker')
const typescript = require('./loaders/typescript')
const glsl = require('./loaders/glsl')
const wasm = require('./loaders/wasm')

environment.loaders.prepend('typescript', typescript)
environment.loaders.prepend('glsl', glsl)
environment.loaders.prepend('wasm', wasm)
module.exports = environment
