import * as GUI from 'babylonjs-gui'
import {Scene} from 'babylonjs'
import {Ship} from './ship'
import {Boss, phase} from './boss'

export function createUi(boss: Boss, ship: Ship, scene: Scene): void {
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
  const text1 = new GUI.TextBlock()
  text1.color = 'white'
  text1.fontSize = 24
  text1.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
  advancedTexture.addControl(text1)

  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    text1.text = `boss: ${boss.health} (phase ${phase(boss)})                                                          ship: ${ship.health}`
  })
}
