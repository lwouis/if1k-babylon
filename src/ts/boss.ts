import {AbstractMesh, Animation, AnimationEvent, Axis, MeshAssetTask, Scene, TextureAssetTask, UniversalCamera} from 'babylonjs'
import {Bullet, Bullets, cloneBullet, createBullet, removeBullet} from './bullet'
import {List, Range} from 'immutable'
import {Ship} from './ship'

export class DestroyableObject {
  public maxHealth: number

  constructor(public mesh: AbstractMesh, public health: number) {
    this.maxHealth = health
  }
}

export class Boss extends DestroyableObject {
  public phase(): number {
    if (this.health > this.maxHealth * 2 / 3) {
      return 0
    } else if (this.health > this.maxHealth / 3) {
      return 1
    } else {
      return 2
    }
  }
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

export function loopBoss(boss: Boss, ship: Ship, textureTask: TextureAssetTask, camera: UniversalCamera, scene: Scene): void {
  let currentPhase = -1
  const framerate = 60
  const bullet = createBullet(textureTask, scene)
  const bullets = new Bullets(List<Bullet>())
  const phases = List([phase0, phase1, phase2])
  const animation = new Animation('bossPhase1', 'position.x', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
  animation.setKeys([{frame: 0, value: 0}, {frame: framerate * 4, value: 80}, {frame: framerate * 12, value: -80}, {frame: framerate * 16, value: 0}])
  boss.mesh.animations = [animation]
  scene.beginAnimation(boss.mesh, 0, framerate * 16, true)
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    if (boss.phase() !== currentPhase) {
      currentPhase = boss.phase()
      animation.getEvents().forEach(e => animation.removeEvents(e.frame))
      phases.get(currentPhase)(boss.mesh, bullet, bullets, framerate).forEach(e => animation.addEvent(e))
    }
    trackBullets(bullets, camera, scene, ship)
  })
}

function phase0(boss: AbstractMesh, bullet: Bullet, bullets: Bullets, framerate: number): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate).map(n =>
    new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss)))).toList()
}

function phase1(boss: AbstractMesh, bullet: Bullet, bullets: Bullets, framerate: number): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate / 2).map(n =>
    new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss)))).toList()
}

function phase2(boss: AbstractMesh, bullet: Bullet, bullets: Bullets, framerate: number): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate / 4).map(n =>
    new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss)))).toList()
}

function trackBullets(bullets: Bullets, camera: UniversalCamera, scene: Scene, ship: Ship): void {
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
}
