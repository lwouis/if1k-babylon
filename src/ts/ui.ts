import * as GUI from 'babylonjs-gui'
import {Scene} from 'babylonjs'
import {Ship} from './ship'
import {Boss, phase} from './boss'
import {NativeHeight, NativeWidth} from './main'

class BossHealthBar {
  constructor(
    public xMin: number,
    public xMax: number,
    public bar: GUI.Line,
    public separator1: GUI.Line,
    public separator2: GUI.Line) {
  }
}

export function createUi(boss: Boss, ship: Ship, scene: Scene, nativeWidth: NativeWidth, nativeHeight: NativeHeight): void {
  const bossHealth = createText(textBlock => textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
  const shipHealth = createText(textBlock => textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT)
  const bossHealthBar = createBossHealthBar(nativeWidth)
  fullScreenUi(nativeWidth, nativeHeight, [bossHealth, bossHealthBar.bar, bossHealthBar.separator1, bossHealthBar.separator2, shipHealth])

  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    bossHealth.text = `boss: ${boss.health} (phase ${phase(boss)})`
    shipHealth.text = `ship: ${ship.health}`
    bossHealthBar.bar.x2 = Math.max(bossHealthBar.xMin, bossHealthBar.xMax * boss.health / boss.maxHealth)
  })
}

function createText(f: (t: GUI.TextBlock) => void): GUI.TextBlock {
  const textBlock = new GUI.TextBlock()
  textBlock.color = 'white'
  textBlock.fontSize = 24
  textBlock.paddingTop = 24
  textBlock.paddingLeft = 24
  textBlock.paddingRight = 24
  textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
  f(textBlock)
  return textBlock
}

function createBar(color: string): GUI.Line {
  const line = new BABYLON.GUI.Line()
  line.lineWidth = 20
  line.y1 = 38
  line.y2 = 38
  line.color = color
  return line
}

function createBarSeparator(min: number, width: number, fraction: number): GUI.Line {
  const separator = createBar('black')
  separator.x1 = min + width * fraction
  separator.x2 = min + width * fraction + 1
  return separator
}

function createBossHealthBar(nativeWidth: NativeWidth): BossHealthBar {
  const width = nativeWidth / 2
  const min = nativeWidth / 4
  const max = min + width
  const separator1 = createBarSeparator(min, width, 1 / 3)
  const separator2 = createBarSeparator(min, width, 2 / 3)
  const bar = createBar('white')
  bar.x1 = min
  return new BossHealthBar(min, max, bar, separator1, separator2)
}

function fullScreenUi(nativeWidth: NativeWidth, nativeHeight: NativeHeight, controls: GUI.Control[]): GUI.AdvancedDynamicTexture {
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
  advancedTexture.idealWidth = nativeWidth
  advancedTexture.idealHeight = nativeHeight
  controls.forEach(a => advancedTexture.addControl(a))
  return advancedTexture
}
