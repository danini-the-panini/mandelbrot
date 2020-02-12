const { environment } = require('@rails/webpacker')
const Base = require('@rails/webpacker/package/environments/base')
const ConfigObject = require('@rails/webpacker/package/config_types/config_object')
const typescript = require('./loaders/typescript')
const glsl = require('./loaders/glsl')
const wasm = require('./loaders/wasm')

environment.loaders.prepend('typescript', typescript)
environment.loaders.prepend('glsl', glsl)
environment.loaders.prepend('wasm', wasm)

function cloneEnv(orig) {
  let env = new Base()
  env.loaders = orig.loaders
  env.plugins = orig.plugins
  env.config = orig.config
  env.entry = orig.entry
  env.resolvedModules = orig.resolvedModules
  return env
}

let appEnv = cloneEnv(environment)
let workerEnv = cloneEnv(environment)

appEnv.entry = new ConfigObject(environment.entry)
for (let key in appEnv.entry) {
  if (key.endsWith('_worker')) appEnv.entry.delete(key)
}

workerEnv.entry = new ConfigObject(environment.entry)
for (let key in workerEnv.entry) {
  if (!key.endsWith('_worker')) workerEnv.entry.delete(key)
}
workerEnv.config = new ConfigObject(environment.config)
workerEnv.config.set('target', 'webworker')

module.exports = [appEnv, workerEnv]
