import 'pepjs'
import {Engine} from 'babylonjs'
import {AdvancedDynamicTexture, Control, InputText} from 'babylonjs-gui'

function renderLoop(e: Engine): void {
  e.stopRenderLoop()
  const {MyScene} = require('./my-scene')
  const s = MyScene(e)
  e.runRenderLoop(() => s.render())
}

function loadWithHotReload(f: () => void): void {
  f()
  if (module.hot) {
    module.hot.accept('./my-scene', () => {
      f()
    })
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('canvas')
  document.body.appendChild(c)
  const e = new Engine(c, true)
  e.enableOfflineSupport = false
  window.addEventListener('resize', () => e.resize())
  loadWithHotReload(() => renderLoop(e))
})
