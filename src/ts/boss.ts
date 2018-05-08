import {AbstractMesh, Animation, AnimationEvent, Axis, Scene, Texture, UniversalCamera, Vector3} from 'babylonjs'
import {Bullet, cloneBullet, createBullet, trackBullets} from './bullet'
import {List, Range} from 'immutable'
import {Ship} from './ship'
import {Framerate} from './main'

export class Boss {
  public maxHealth: number

  constructor(
    public mesh: AbstractMesh,
    public health: number,
    public speed: number,
    public currentPhase: number,
    public bullets: List<Bullet>) {
    this.maxHealth = health
  }
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
  return new Boss(mesh, 100, 60, -1, List<Bullet>())
}

export function loopBoss(boss: Boss, ship: Ship, texture: Texture, camera: UniversalCamera, framerate: Framerate, scene: Scene): void {
  const bullet = createBullet(texture, scene)
  const phases = List([phase0, phase1, phase2])
  const animation = movement(framerate, boss, scene)
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    if (phase(boss) !== boss.currentPhase) {
      boss.currentPhase = phase(boss)
      animation.getEvents().forEach(e => animation.removeEvents(e.frame))
      phases.get(boss.currentPhase)(boss, bullet, framerate, scene).forEach(e => animation.addEvent(e))
    }
    boss.bullets = trackBullets(boss.bullets, camera, scene, ship)
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

function movement(framerate: Framerate, boss: Boss, scene: Scene): Animation {
  const animation = new Animation('bossPhase1', 'position.x', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
  animation.setKeys([{frame: 0, value: 0}, {frame: boss.speed * 4, value: 80}, {frame: boss.speed * 12, value: -80}, {frame: boss.speed * 16, value: 0}])
  boss.mesh.animations = [animation]
  scene.beginAnimation(boss.mesh, 0, framerate * 16, true)
  return animation
}

function phase0(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate).map(n => {
    return new AnimationEvent(n, () => {
      const clone = cloneBullet(boss.bullets.size, bullet, framerate, -200, boss.mesh.position.add(new Vector3(0, -6, 0)), scene)
      return boss.bullets = boss.bullets.push(clone)
    })
  }).toList()
}

function phase1(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate / 2).map(n => {
    return new AnimationEvent(n, () => {
      const clone = cloneBullet(boss.bullets.size, bullet, framerate, -200, boss.mesh.position.add(new Vector3(0, -6, 0)), scene)
      return boss.bullets = boss.bullets.push(clone)
    })
  }).toList()
}

function phase2(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene): List<AnimationEvent> {
  return Range(0, framerate * 16, framerate / 4).map(n => {
    return new AnimationEvent(n, () => {
      const clone = cloneBullet(boss.bullets.size, bullet, framerate, -200, boss.mesh.position.add(new Vector3(0, -6, 0)), scene)
      return boss.bullets = boss.bullets.push(clone)
    })
  }).toList()
}
