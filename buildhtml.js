import { readFile, writeFile } from 'fs/promises'

import posthtml from 'posthtml'
import expressions from 'posthtml-expressions'
import include from 'posthtml-include'
import extend from 'posthtml-extend'

import brots from './brots.js'

const root = './templates';

async function render(input, output, locals) {
  const { html } = await posthtml([
    expressions({ locals }),
    include({ posthtmlExpressionsOptions: { locals }, root }),
    extend({ expressions: { locals }, root })
  ]).process(input)
  await writeFile(output, html)
}

async function renderPath(path, ...args) {
  const input = await readFile(path, 'utf8')
  await render(input, ...args)
}

(async () => {
  await renderPath('templates/home.html', 'index.html', { brots, title: 'Home' })

  const mandel = await readFile('templates/mandel.html', 'utf8')
  await Promise.all(Object.entries(brots).map(async ([identifier, title]) => {
    await render(mandel, `pages/${identifier}.html`, { brots, identifier, title })
  }))
})()



