import {keyEvent$, KeyName} from './helpers'
import {Stack} from 'immutable'
import {ActionManager, Scene} from 'babylonjs'

export class KeysDown {
  constructor(public leftRight: Stack<KeyName>, public upDown: Stack<KeyName>, public space: boolean) {
  }
}

export const xAxisKeys: KeyName[] = ['ArrowLeft', 'ArrowRight']
export const yAxisKeys: KeyName[] = ['ArrowDown', 'ArrowUp']

export function loopKeysDown(s: Scene): KeysDown {
  const k = new KeysDown(Stack<KeyName>(), Stack<KeyName>(), false)
  const am = new ActionManager(s)
  s.actionManager = am
  keyEvent$(am, ActionManager.OnKeyDownTrigger, e => updateKeysDown(e, k,
    k.leftRight.push(e),
    k.upDown.push(e),
    true))
  keyEvent$(am, ActionManager.OnKeyUpTrigger, e => updateKeysDown(e, k,
    k.leftRight.filterNot(e2 => e === e2).toStack(),
    k.upDown.filterNot(e2 => e === e2).toStack(),
    false))
  return k
}

function updateKeysDown(e: KeyName, k: KeysDown, leftRight: Stack<KeyName>, upDown: Stack<KeyName>, space: boolean): void {
  if (xAxisKeys.includes(e)) {
    k.leftRight = leftRight
  } else if (yAxisKeys.includes(e)) {
    k.upDown = upDown
  } else if (e === ' ') {
    k.space = space
  }
}