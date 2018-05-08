import {AssetsManager, Engine, HemisphericLight, Scene, UniversalCamera, Vector3} from 'babylonjs'
import {addMeshTask, addTextFileTask, addTextureTask} from './helpers'
import {loopKeysDown} from './controls'
import {createBoss, loopBoss} from './boss'
import {createShip, loopShip} from './ship'
import {createUi} from './ui'
import {Framerate} from './main'

export function createScene(engine: Engine, framerate: Framerate): Scene {
  const scene = _createScene(engine)
  const camera = createCamera(scene)
  // camera.position.set(-200, 0, 0)
  // camera.setTarget(Vector3.Zero())
  loadAssetsAndSetupScene(scene, camera, framerate)
  return scene
}

function loadAssetsAndSetupScene(scene: Scene, camera: UniversalCamera, framerate: Framerate): void {
  const assetsManager = new AssetsManager(scene)
  const assets = createAssetTasks(assetsManager)
  assetsManager.onFinish = () => setupScene(scene, camera, framerate, assets)
  assetsManager.onTaskError = e => console.error(e.errorObject.message)
  assetsManager.load()
}

function setupScene(scene: Scene, camera: UniversalCamera, framerate: Framerate, assets: Assets): void {
  createLight(scene)
  const keysDown = loopKeysDown(scene)
  const boss = createBoss(assets.boss.loadedMeshes[0])
  const ship = createShip(assets.ship.loadedMeshes[0], assets.shipPropulsion.texture, scene)
  loopShip(keysDown, assets.bullet.texture, ship, boss, camera, framerate, scene)
  loopBoss(boss, ship, assets.bullet.texture, camera, framerate, scene)
  createUi(boss, ship, scene)
  // const [bgM, bgS] = createBackground(scene)
  // loopBackground(bgM, bgS, camera, scene)
}

class Assets {
  constructor(
    public ship: any,
    public boss: any,
    public shipPropulsion: any,
    public bullet: any,
    public starfieldVertexShader: any,
    public starfieldFragmentShader: any,
  ) {
  }
}

function createAssetTasks(assetsManager: AssetsManager): Assets {
  const assets = new Assets(
    addMeshTask('spaceShip.babylon'),
    addMeshTask('spaceShip.babylon'),
    addTextureTask('star.png'),
    addTextureTask('flare.png'),
    addTextFileTask('starfield.vertex.fx'),
    addTextFileTask('starfield.fragment.fx'),
  )
  Object.keys(assets).forEach(k => assets[k] = assets[k](assetsManager, name))
  return assets
}

function _createScene(engine: Engine): Scene {
  const scene = new Scene(engine)
  if (!document.querySelector('.insp-wrapper')) {
    scene.debugLayer.show()
  }
  return scene
}

function createLight(scene: Scene): HemisphericLight {
  return new HemisphericLight('light', new Vector3(1, 0, 0), scene)
}

function createCamera(scene: Scene): UniversalCamera {
  return new UniversalCamera('camera', new Vector3(0, 0, -200), scene)
}
