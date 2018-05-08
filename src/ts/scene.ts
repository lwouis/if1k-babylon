import {AssetsManager, Engine, HemisphericLight, MeshAssetTask, Scene, TextFileAssetTask, TextureAssetTask, UniversalCamera, Vector3} from 'babylonjs'
import {addMeshAsync, addTextFileAsync, addTextureAsync} from './helpers'
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
  const assetsManager = new AssetsManager(scene)
  loadAssets(assetsManager).then(setupScene(scene, camera, framerate))
  assetsManager.load()
  return scene
}

function setupScene(scene: Scene, camera: UniversalCamera, framerate: Framerate):
  (a: [MeshAssetTask, MeshAssetTask, TextureAssetTask, TextureAssetTask, TextFileAssetTask, TextFileAssetTask]) => void {
  return assetTasks => {
    createLight(scene)
    const keysDown = loopKeysDown(scene)
    const boss = createBoss(assetTasks[1].loadedMeshes[0])
    const ship = createShip(assetTasks[0].loadedMeshes[0], assetTasks[2].texture, scene)
    loopShip(keysDown, assetTasks[3].texture, ship, boss, camera, framerate, scene)
    loopBoss(boss, ship, assetTasks[3].texture, camera, framerate, scene)
    createUi(boss, ship, scene)
    // const [bgM, bgS] = createBackground(scene)
    // loopBackground(bgM, bgS, camera, scene)
  }
}

function loadAssets(assetsManager: AssetsManager): Promise<[MeshAssetTask, MeshAssetTask, TextureAssetTask, TextureAssetTask, TextFileAssetTask, TextFileAssetTask]> {
  return Promise.all([
    addMeshAsync(assetsManager, 'ship', '', 'spaceShip.babylon'),
    addMeshAsync(assetsManager, 'boss', '', 'spaceShip.babylon'),
    addTextureAsync(assetsManager, 'shipPropulsion', 'star.png'),
    addTextureAsync(assetsManager, 'bullet', 'flare.png'),
    addTextFileAsync(assetsManager, 'starfieldVertexShader', 'starfield.vertex.fx'),
    addTextFileAsync(assetsManager, 'starfieldFragmentShader', 'starfield.fragment.fx'),
  ])
}

function _createScene(engine: Engine): Scene {
  const scene = new Scene(engine)
  if (!document.querySelector('.insp-wrapper')) {
    scene.debugLayer.show()
  }
  scene.collisionsEnabled = true
  // scene.workerCollisions = true
  // scene.enablePhysics()
  return scene
}

function createLight(scene: Scene): HemisphericLight {
  return new HemisphericLight('light', new Vector3(1, 0, 0), scene)
}

function createCamera(scene: Scene): UniversalCamera {
  return new UniversalCamera('camera', new Vector3(0, 0, -200), scene)
}
