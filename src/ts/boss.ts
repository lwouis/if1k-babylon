import {AbstractMesh, Animation, AnimationEvent, Axis, Scene, Texture, UniversalCamera} from 'babylonjs'
import {Bullet, Bullets, cloneBullet, createBullet, removeBullet} from './bullet'
import {List, Range} from 'immutable'
import {Ship} from './ship'
import {Framerate} from './main'

export class DestroyableObject {
  public maxHealth: number

  constructor(public mesh: AbstractMesh, public health: number, public speed: number) {
    this.maxHealth = health
  }
}

export class Boss extends DestroyableObject {
}

export function createBoss(mesh: AbstractMesh): Boss {
  // mesh.checkCollisions = true
  // mesh.showBoundingBox = true
  // mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, s)
  mesh.receiveShadows = true
  // mesh.scaling.set(2, 2, 2)
  mesh.rotate(Axis.X, -Math.PI / 2)
  mesh.rotate(Axis.Y, -Math.PI)
  mesh.position.set(0, 45, 0)
  return new Boss(mesh, 100, 60)
}

export function loopBoss(boss: Boss, ship: Ship, texture: Texture, camera: UniversalCamera, framerate: Framerate, scene: Scene): void {
  let currentPhase = -1
  const bullet = createBullet(texture, scene)
  const bullets = new Bullets(List<Bullet>())
  const phases = List([phase0, phase1, phase2])
  const animation = new Animation('bossPhase1', 'position.x', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
  animation.setKeys([{frame: 0, value: 0}, {frame: boss.speed * 4, value: 80}, {frame: boss.speed * 12, value: -80}, {frame: boss.speed * 16, value: 0}])
  boss.mesh.animations = [animation]
  scene.beginAnimation(boss.mesh, 0, framerate * 16, true)
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    if (phase(boss) !== currentPhase) {
      currentPhase = phase(boss)
      animation.getEvents().forEach(e => animation.removeEvents(e.frame))
      phases.get(currentPhase)(boss.mesh, bullet, bullets, framerate, scene).forEach(e => animation.addEvent(e))
    }
    trackBullets(bullets, camera, scene, ship)
  })
}

export function phase(boss: Boss): number {
  if (boss.health > boss.maxHealth * 2 / 3) {
    return 0
  } else if (boss.health > boss.maxHealth / 3) {
    return 1
  } else {
    return 2
  }
}

function phase0(boss: AbstractMesh, bullet: Bullet, bullets: Bullets, framerate: Framerate, scene: Scene): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate).map(n =>
    new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss, framerate, -200, -10, scene)))).toList()
}

function phase1(boss: AbstractMesh, bullet: Bullet, bullets: Bullets, framerate: Framerate, scene: Scene): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate / 2).map(n =>
    new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss, framerate, -200, -10, scene)))).toList()
}

function phase2(boss: AbstractMesh, bullet: Bullet, bullets: Bullets, framerate: Framerate, scene: Scene): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate / 4).map(n =>
    new AnimationEvent(n, () => bullets.current = bullets.current.push(cloneBullet(bullets, bullet, boss, framerate, -200, -10, scene)))).toList()
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
      return acc.push(b)
    }
  }, List<Bullet>())
}
