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
  const waitInCenterAnimation = waitInCenter(framerate, boss)
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    if (phase(boss) !== boss.currentPhase) {
      boss.currentPhase = phase(boss)
      const phaseAnimation = phases.get(boss.currentPhase)(boss, bullet, framerate, scene)
      scene.stopAnimation(boss.mesh, 'bossMoveAround')
      scene.beginDirectAnimation(boss.mesh, [waitInCenterAnimation], 0, framerate * 16, false, 1, () =>
        scene.beginDirectAnimation(boss.mesh, [phaseAnimation], 0, framerate * 16, true))
    }
    boss.bullets = trackBullets(boss.bullets, camera, scene, ship)
  })
}

export function phase(boss: Boss): number {
  if (boss.health > 99) {//boss.maxHealth * 2 / 3) {
    return 0
  } else if (boss.health > 95) {//boss.maxHealth / 3) {
    return 1
  } else {
    return 2
  }
}

function waitInCenter(framerate: Framerate, boss: Boss): Animation {
  const animation = new Animation('bossWaitInCenter', 'position.x', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE, true)
  animation.blendingSpeed = 0.01
  animation.setKeys([{frame: 0, value: boss.mesh.position.x}, {frame: framerate * 3, value: 0}])
  return animation
}

function phaseMovement(framerate: Framerate, boss: Boss): Animation {
  const animation = new Animation('bossMoveAround', 'position.x', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE, true)
  animation.blendingSpeed = 0.01
  animation.setKeys([{frame: 0, value: 0}, {frame: boss.speed * 4, value: 80}, {frame: boss.speed * 12, value: -80}, {frame: boss.speed * 16, value: 0}])
  return animation
}

function phaseBullets(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene, animation: Animation, fireRate: number, positions: Vector3[]): void {
  Range(0, framerate * 16 + fireRate, fireRate).map(n => {
    return new AnimationEvent(n, () => {
      const b = positions.map(a => cloneBullet(boss.bullets.size, bullet, framerate, -200, boss.mesh.position.add(a), scene))
      return boss.bullets = boss.bullets.concat(b).toList()
    })
  }).forEach(e => animation.addEvent(e))
}

function phase0(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene): Animation {
  const animation = phaseMovement(framerate, boss)
  phaseBullets(boss, bullet, framerate, scene, animation, framerate, [new Vector3(0, -6, 0)])
  return animation
}

function phase1(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene): Animation {
  const animation = phaseMovement(framerate, boss)
  phaseBullets(boss, bullet, framerate, scene, animation, framerate, [
    new Vector3(-3, -6, 0),
    new Vector3(3, -6, 0),
  ])
  return animation
}

function phase2(boss: Boss, bullet: Bullet, framerate: Framerate, scene: Scene): Animation {
  const animation = phaseMovement(framerate, boss)
  phaseBullets(boss, bullet, framerate, scene, animation, framerate, [
    new Vector3(-6, -6, 0),
    new Vector3(0, -6, 0),
    new Vector3(6, -6, 0),
  ])
  return animation
}
