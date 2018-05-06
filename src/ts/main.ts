import 'pepjs'
import {Engine} from 'babylonjs'
import {ASSETS} from './helpers'

window.addEventListener('DOMContentLoaded', () => {
  const c = createCanvas()
  const e = createEngine(c)
  window.addEventListener('resize', () => e.resize())
  loadThenHotReload(() => renderLoop(e))
})

export type Framerate = number

function renderLoop(engine: Engine): void {
  engine.stopRenderLoop()
  const {createScene} = require('./scene')
  const s = createScene(engine, 60)
  engine.runRenderLoop(() => s.render())
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

function createEngine(canvas: HTMLCanvasElement): Engine {
  const engine = new Engine(canvas, true, {deterministicLockstep: true, lockstepMaxSteps: 4})
  engine.enableOfflineSupport = false
  Engine.ShadersRepository = ASSETS
  return engine
}
