import {AssetsManager, Engine, HemisphericLight, MeshAssetTask, Scene, TextFileAssetTask, TextureAssetTask, UniversalCamera, Vector3} from 'babylonjs'
import {addMeshAsync, addTextFileAsync, addTextureAsync} from './helpers'
import {loopKeysDown} from './controls'
import {createBoss, loopBoss} from './boss'
import {createShip, loopShip} from './ship'
import {createUi} from './ui'

export function createScene(e: Engine): Scene {
  const scene = _createScene(e)
  const camera = createCamera(scene)
  // camera.position.set(-200, 0, 0)
  // camera.setTarget(Vector3.Zero())
  const assetsManager = new AssetsManager(scene)
  loadAssets(assetsManager).then(setupScene(scene, camera))
  assetsManager.load()
  return scene
}

function setupScene(scene: Scene, camera: UniversalCamera):
  (a: [MeshAssetTask, MeshAssetTask, TextureAssetTask, TextureAssetTask, TextFileAssetTask, TextFileAssetTask]) => void {
  return assetTasks => {
    createLight(scene)
    const keysDown = loopKeysDown(scene)
    const boss = createBoss(assetTasks[1])
    const ship = createShip(assetTasks[0], assetTasks[2], scene)
    loopShip(keysDown, assetTasks[3], ship.mesh, boss, camera, scene)
    loopBoss(boss.mesh, ship, assetTasks[3], camera, scene)
    createUi(boss, ship, scene)
    // const [bgM, bgS] = createBackground(scene)
    // loopBackground(bgM, bgS, camera, scene)
  }
}

function loadAssets(a: AssetsManager): Promise<[MeshAssetTask, MeshAssetTask, TextureAssetTask, TextureAssetTask, TextFileAssetTask, TextFileAssetTask]> {
  return Promise.all([
    addMeshAsync(a, 'ship', '', 'spaceShip.babylon'),
    addMeshAsync(a, 'boss', '', 'spaceShip.babylon'),
    addTextureAsync(a, 'shipPropulsion', 'star.png'),
    addTextureAsync(a, 'bullet', 'flare.png'),
    addTextFileAsync(a, 'starfieldVertexShader', 'starfield.vertex.fx'),
    addTextFileAsync(a, 'starfieldFragmentShader', 'starfield.fragment.fx'),
  ])
}

function _createScene(e: Engine): Scene {
  const scene = new Scene(e)
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
