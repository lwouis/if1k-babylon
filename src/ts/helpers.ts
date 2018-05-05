import {ActionManager, AssetsManager, ExecuteCodeAction, MeshAssetTask, TextFileAssetTask, TextureAssetTask} from 'babylonjs'
import * as path from 'path'

export const ASSETS = 'assets/'

export function addMeshAsync(a: AssetsManager, taskName: string, meshesNames: any, sceneFilename: string): Promise<MeshAssetTask> {
  return new Promise((ok, ko) => {
    const m = a.addMeshTask(taskName, meshesNames, ASSETS, sceneFilename)
    m.onSuccess = t => ok(t)
    m.onError = t => ko(t.errorObject.exception)
  })
}

export function addTextureAsync(a: AssetsManager, taskName: string, imageFilename: string): Promise<TextureAssetTask> {
  return new Promise((ok, ko) => {
    const m = a.addTextureTask(taskName, path.join(ASSETS, imageFilename))
    m.onSuccess = t => ok(t)
    m.onError = t => ko(t.errorObject.exception)
  })
}

export function addTextFileAsync(a: AssetsManager, taskName: string, imageFilename: string): Promise<TextFileAssetTask> {
  return new Promise((ok, ko) => {
    const m = a.addTextFileTask(taskName, path.join(ASSETS, imageFilename))
    m.onSuccess = t => ok(t)
    m.onError = t => ko(t.errorObject.exception)
  })
}

export type KeyName = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | ' '

export function keyEvent$(a: ActionManager, trigger: number, f: (e: KeyName) => any): void {
  a.registerAction(new ExecuteCodeAction(trigger, evt => f(evt.sourceEvent.key)))
}
