process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const environments = require('./environment')

module.exports = environments.map(e => e.toWebpackConfig())
