process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environments = require('./environment')

module.exports = environments.map(e => e.toWebpackConfig())
