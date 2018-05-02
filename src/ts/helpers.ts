import {ActionManager, AssetsManager, ExecuteCodeAction, MeshAssetTask} from 'babylonjs'

export function addMeshAsync(a: AssetsManager, taskName: string, meshesNames: any, rootUrl: string, sceneFilename: string): Promise<MeshAssetTask> {
  return new Promise((ok, ko) => {
    const m = a.addMeshTask(taskName, meshesNames, rootUrl, sceneFilename)
    m.onSuccess = t => ok(t)
    m.onError = t => ko(t.errorObject.exception)
  })
}

export type KeyName = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'

export function keyEvent(a: ActionManager, trigger: number, f: (k: KeyName) => any): void {
  a.registerAction(new ExecuteCodeAction(trigger, evt => {
    f(evt.sourceEvent.key)
  }))
}
