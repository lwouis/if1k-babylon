import {ActionManager, AssetsManager, Axis, Color4, Engine, HemisphericLight, Scene, Space, Texture, UniversalCamera, Vector3, ParticleSystem, AbstractMesh, MeshAssetTask} from 'babylonjs'
import {AdvancedDynamicTexture, Control, InputText} from 'babylonjs-gui'
import {addMeshAsync, keyEvent, KeyName} from './helpers'
import {Stack} from 'immutable'

let keysDownX: Stack<KeyName>
let keysDownY: Stack<KeyName>

function controls(am: ActionManager): void {
  keysDownX = Stack<KeyName>()
  keysDownY = Stack<KeyName>()
  keyEvent(am, ActionManager.OnKeyDownTrigger, k => {
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      keysDownX = keysDownX.push(k)
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      keysDownY = keysDownY.push(k)
    }
  })
  keyEvent(am, ActionManager.OnKeyUpTrigger, k => {
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      keysDownX = keysDownX.filterNot(e => e === k).toStack()
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      keysDownY = keysDownY.filterNot(e => e === k).toStack()
    }
  })
}

function ship(t: MeshAssetTask, s: Scene): void {
  const sp = t.loadedMeshes[0]
  sp.receiveShadows = true
  sp.position = new Vector3(0, -60, 200)
  sp.rotate(Axis.X, Math.PI / 2, Space.LOCAL)
  // this.shadowGenerator.getShadowMap().renderList.push(self.sp);
  createPropulsionAnimation(s, sp)
  // this.bulletTrigger = new BulletTrigger(self.scene, self.sp);
  // afterLoadedCallback();
  s.registerBeforeRender(() => {
    if (!s.isReady()) return
    if (keysDownX.peek() === 'ArrowLeft') {
      sp.translate(Axis.X, 2, Space.LOCAL)
    } else if (keysDownX.peek() === 'ArrowRight') {
      sp.translate(Axis.X, -2, Space.LOCAL)
    }
    if (keysDownY.peek() === 'ArrowUp') {
      sp.translate(Axis.Y, 2, Space.LOCAL)
    } else if (keysDownY.peek() === 'ArrowDown') {
      sp.translate(Axis.Y, -2, Space.LOCAL)
    }
  })
}

function boss(t: MeshAssetTask, s: Scene): void {
  const sp = t.loadedMeshes[0]
  sp.receiveShadows = true
  sp.position = new Vector3(0, 45, 200)
  sp.scaling = new Vector3(2, 2, 2)
  sp.rotate(Axis.X, -Math.PI / 2, Space.LOCAL)
  sp.rotate(Axis.Y, -Math.PI, Space.LOCAL)
}

function createPropulsionAnimation(s: Scene, m: AbstractMesh): void {
  const particles = new ParticleSystem('shipPropulsion', 400, s)
  particles.renderingGroupId = 2
  particles.particleTexture = new Texture('/assets/star.png', s)
  particles.emitter = m
  particles.minEmitBox = new Vector3(0, -15, 3)
  particles.maxEmitBox = new Vector3(0, -15, 3)
  particles.direction1 = new Vector3(-.3, -1, -1)
  particles.direction2 = new Vector3(-.3, -1, -1)
  particles.gravity = new Vector3(0, -.05, 0)
  particles.color1 = new Color4(1, 0.5, 0.8, 1)
  particles.color2 = new Color4(1, 0.5, 1, 1)
  particles.colorDead = new Color4(1, 0, 1, 0)
  particles.minSize = 3
  particles.maxSize = 4
  particles.minLifeTime = 0.01
  particles.maxLifeTime = 0.04
  particles.emitRate = 400
  particles.minEmitPower = 2
  particles.maxEmitPower = 2
  particles.start()
}

export function MyScene(engine: Engine): Scene {
  const s = new Scene(engine)
  const c = new UniversalCamera('camera', new Vector3(0, 0, 0), s)
  const l = new HemisphericLight('light', new Vector3(1, 0, 0), s)
  const a = new AssetsManager(s)
  const am = new ActionManager(s)
  s.actionManager = am
  controls(am)
  addMeshAsync(a, 't1', '', 'assets/', 'spaceShip.babylon').then(t => ship(t, s))
  addMeshAsync(a, 't2', '', 'assets/', 'spaceShip.babylon').then(t => boss(t, s))
  a.load()
  return s
}
