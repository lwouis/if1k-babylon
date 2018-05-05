import {AssetsManager, Engine, HemisphericLight, MeshAssetTask, Scene, TextFileAssetTask, TextureAssetTask, UniversalCamera, Vector3} from 'babylonjs'
import {List} from 'immutable'
import {addMeshAsync, addTextFileAsync, addTextureAsync} from './helpers'
import {loopKeysDown} from './controls'
import {createBoss} from './boss'
import {createShip, loopShip} from './ship'
import {Bullet, Bullets, createBullet, loopBullets} from './bullet'

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

export function createScene(e: Engine): Scene {
  const scene = _createScene(e)
  const camera = createCamera(scene)
  const assetsManager = new AssetsManager(scene)
  loadAssets(assetsManager).then(setupScene(scene, camera))
  assetsManager.load()
  return scene
}

function setupScene(scene: Scene, camera: UniversalCamera):
  (a: [MeshAssetTask, MeshAssetTask, TextureAssetTask, TextureAssetTask, TextFileAssetTask, TextFileAssetTask]) => void {
  return assetTasks => {
    const keysDown = loopKeysDown(scene)
    const boss = createBoss(assetTasks[1], scene)
    const ship = createShip(assetTasks[0], assetTasks[2], scene)
    loopShip(ship, keysDown, scene)
    const bullet = createBullet(assetTasks[3], ship, boss.mesh, scene)
    const bullets = new Bullets(List<Bullet>())
    loopBullets(keysDown, bullet, ship, boss, bullets, camera, scene)
    const light = createLight(scene)
    // const [bgM, bgS] = createBackground(scene)
    // loopBackground(bgM, bgS, camera, scene)
  }
}

function loadAssets<T>(a: AssetsManager): Promise<[MeshAssetTask, MeshAssetTask, TextureAssetTask, TextureAssetTask, TextFileAssetTask, TextFileAssetTask]> {
  return Promise.all([
    addMeshAsync(a, 'ship', '', 'spaceShip.babylon'),
    addMeshAsync(a, 'boss', '', 'spaceShip.babylon'),
    addTextureAsync(a, 'shipPropulsion', 'star.png'),
    addTextureAsync(a, 'bullet', 'flare.png'),
    addTextFileAsync(a, 'starfieldVertexShader', 'starfield.vertex.fx'),
    addTextFileAsync(a, 'starfieldFragmentShader', 'starfield.fragment.fx'),
  ])
}

function createLight(scene: BABYLON.Scene): HemisphericLight {
  return new HemisphericLight('light', new Vector3(1, 0, 0), scene)
}

function createCamera(scene: BABYLON.Scene): UniversalCamera {
  return new UniversalCamera('camera', new Vector3(0, 0, -200), scene)
}
