const { environment } = require('@rails/webpacker')
const typescript = require('./loaders/typescript')
const glsl = require('./loaders/glsl')

environment.loaders.prepend('typescript', typescript)
environment.loaders.prepend('glsl', glsl)
module.exports = environment
