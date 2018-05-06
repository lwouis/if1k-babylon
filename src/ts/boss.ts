import {AbstractMesh, Animation, AnimationEvent, Axis, MeshAssetTask, Scene, TextureAssetTask, UniversalCamera} from 'babylonjs'
import {Bullet, Bullets, cloneBullet, createBullet, removeBullet} from './bullet'
import {List, Range} from 'immutable'
import {Ship} from './ship'

export class DestroyableObject {
  constructor(public mesh: AbstractMesh, public health: number) {
  }
}

export class Boss extends DestroyableObject {
}

export function createBoss(t: MeshAssetTask): Boss {
  const m = t.loadedMeshes[0]
  m.renderingGroupId = 2
  // m.checkCollisions = true
  // m.showBoundingBox = true
  // m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, s)
  m.receiveShadows = true
  // m.scaling.set(2, 2, 2)
  m.rotate(Axis.X, -Math.PI / 2)
  m.rotate(Axis.Y, -Math.PI)
  m.position.set(0, 45, 0)
  return new Boss(m, 100)
}

export function loopBoss(boss: AbstractMesh, ship: Ship, textureTask: TextureAssetTask, camera: UniversalCamera, scene: Scene): void {
  const bullets = moveAndShoot(textureTask, scene, boss)
  trackBullets(bullets, camera, scene, ship)
}

function moveAndShoot(textureTask: TextureAssetTask, scene: Scene, boss: AbstractMesh): Bullets {
  const framerate = 60
  const bullet = createBullet(textureTask, scene)
  const bullets = new Bullets(List<Bullet>())
  const animation = new Animation('bossPhase1', 'position.x', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
  animation.setKeys([{frame: 0, value: 0}, {frame: framerate * 4, value: 80}, {frame: framerate * 12, value: -80}, {frame: framerate * 16, value: 0}])
  boss.animations = [animation]
  Range(0, framerate * 16, framerate / 2).forEach(n =>
    animation.addEvent(new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss)))))
  scene.beginAnimation(boss, 0, framerate * 16, true)
  return bullets
}

function trackBullets(bullets: Bullets, camera: UniversalCamera, scene: Scene, ship: Ship): void {
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    bullets.current = bullets.current.reduce((acc, b) => {
      if (!camera.isInFrustum(b.mesh)) {
        removeBullet(b, scene)
        return acc
      } else if (b.mesh.intersectsMesh(ship.mesh, false)) {
        ship.health = ship.health - 1
        removeBullet(b, scene)
        return acc
      } else {
        b.mesh.position.y -= 1
        return acc.push(b)
      }
    }, List<Bullet>())
  })
}
