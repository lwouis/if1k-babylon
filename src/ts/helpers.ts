import {ActionManager, AssetsManager, ExecuteCodeAction, MeshAssetTask, TextFileAssetTask, TextureAssetTask} from 'babylonjs'
import * as path from 'path'

export const ASSETS = 'assets/'

export const addMeshTask: AssetTaskFactory<MeshAssetTask> = file =>
  (assetManager, name) => assetManager.addMeshTask(name, '', ASSETS, file)

export const addTextureTask: AssetTaskFactory<TextureAssetTask> = file =>
  (assetManager, name) => assetManager.addTextureTask(name, path.join(ASSETS, file))

export const addTextFileTask: AssetTaskFactory<TextFileAssetTask> = file =>
  (assetManager, name) => assetManager.addTextFileTask(name, path.join(ASSETS, file))

export type KeyName = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | ' '

export function keyEvent$(a: ActionManager, trigger: number, f: (e: KeyName) => any): void {
  a.registerAction(new ExecuteCodeAction(trigger, evt => f(evt.sourceEvent.key)))
}

type AssetTaskFactory<T> = (file: string) => (a: AssetsManager, name: string) => T
