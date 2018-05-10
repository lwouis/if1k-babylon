import 'pepjs'
import {Engine} from 'babylonjs'
import {ASSETS} from './helpers'

const nativeWidth = 1366
const nativeHeight = 768
const framerate = 60

export type Framerate = number
export type NativeWidth = number
export type NativeHeight = number

window.addEventListener('DOMContentLoaded', () => {
  const canvas = createCanvas()
  const engine = createEngine(canvas)
  loadThenHotReload(() => renderLoop(engine))
})

function renderLoop(engine: Engine): void {
  engine.stopRenderLoop()
  const {createScene} = require('./scene')
  const scene = createScene(engine, framerate, nativeWidth, nativeHeight)
  engine.runRenderLoop(() => scene.render())
  window.addEventListener('resize', () => setSize(engine))
}

function setSize(engine: Engine): void {
  engine.setSize(
    Math.min(window.innerWidth, window.innerHeight * (nativeWidth / nativeHeight)),
    Math.min(window.innerHeight, window.innerWidth * (nativeHeight / nativeWidth)))
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
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  return canvas
}

function createEngine(canvas: HTMLCanvasElement): Engine {
  const engine = new Engine(canvas, true, {deterministicLockstep: true, lockstepMaxSteps: 4})
  engine.enableOfflineSupport = false
  Engine.ShadersRepository = ASSETS
  setSize(engine)
  return engine
}
