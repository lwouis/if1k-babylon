import * as GUI from 'babylonjs-gui'
import {Scene} from 'babylonjs'
import {Ship} from './ship'
import {Boss, phase} from './boss'
import {NativeHeight, NativeWidth} from './main'
import {List} from 'immutable'

function createText(horizontalAlignment: number): GUI.TextBlock {
  const textBlock = new GUI.TextBlock()
  textBlock.color = 'white'
  textBlock.fontSize = 24
  textBlock.paddingTop = 24
  textBlock.paddingLeft = 24
  textBlock.paddingRight = 24
  textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
  textBlock.textHorizontalAlignment = horizontalAlignment
  return textBlock
}

export function createUi(boss: Boss, ship: Ship, scene: Scene, nativeWidth: NativeWidth, nativeHeight: NativeHeight): void {
  const leftText = createText(GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
  const rightText = createText(GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT)
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
  advancedTexture.idealWidth = nativeWidth
  advancedTexture.idealHeight = nativeHeight
  List([leftText, rightText]).forEach(a => advancedTexture.addControl(a))

  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    leftText.text = `boss: ${boss.health} (phase ${phase(boss)})`
    rightText.text = `ship: ${ship.health}`
  })
}
