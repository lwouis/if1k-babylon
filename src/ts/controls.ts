import {keyEvent$, KeyName} from './helpers'
import {Stack} from 'immutable'
import {ActionManager, Scene} from 'babylonjs'

export class KeysDown {
  constructor(public leftRight: Stack<KeyName>, public upDown: Stack<KeyName>, public space: boolean) {
  }
}

export function loopKeysDown(s: Scene): KeysDown {
  const k = new KeysDown(Stack<KeyName>(), Stack<KeyName>(), false)
  const am = new ActionManager(s)
  s.actionManager = am
  keyEvent$(am, ActionManager.OnKeyDownTrigger, e => {
    if (e === 'ArrowLeft' || e === 'ArrowRight') {
      k.leftRight = k.leftRight.push(e)
    } else if (e === 'ArrowUp' || e === 'ArrowDown') {
      k.upDown = k.upDown.push(e)
    } else if (e === ' ') {
      k.space = true
    }
  })
  keyEvent$(am, ActionManager.OnKeyUpTrigger, e => {
    if (e === 'ArrowLeft' || e === 'ArrowRight') {
      k.leftRight = k.leftRight.filterNot(e2 => e === e2).toStack()
    } else if (e === 'ArrowUp' || e === 'ArrowDown') {
      k.upDown = k.upDown.filterNot(e2 => e === e2).toStack()
    } else if (e === ' ') {
      k.space = false
    }
  })
  return k
}
