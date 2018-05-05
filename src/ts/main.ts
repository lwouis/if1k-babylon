import 'pepjs'
import {Engine} from 'babylonjs'
import {ASSETS} from './helpers'

window.addEventListener('DOMContentLoaded', () => {
  const c = createCanvas()
  const e = createEngine(c)
  window.addEventListener('resize', () => e.resize())
  loadThenHotReload(() => renderLoop(e))
})

function renderLoop(e: Engine): void {
  e.stopRenderLoop()
  const {createScene} = require('./scene')
  const s = createScene(e)
  e.runRenderLoop(() => s.render())
}

/** webpack hot-reload for better DX */
function loadThenHotReload(f: () => void): void {
  f()
  if (module.hot) {
    module.hot.accept('./scene', () => {
      f()
    })
  }
}

function createCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  document.body.appendChild(c)
  return c
}

function createEngine(c: HTMLCanvasElement): Engine {
  const e = new Engine(c, true, {deterministicLockstep: true, lockstepMaxSteps: 4})
  e.enableOfflineSupport = false
  Engine.ShadersRepository = ASSETS
  return e
}
