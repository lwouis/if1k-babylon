import {AbstractMesh, Axis, ParticleSystem, Scene, Space, Texture, UniversalCamera, Vector3} from 'babylonjs'
import {KeysDown} from './controls'
import {List} from 'immutable'
import {Boss, DestroyableObject} from './boss'
import {Bullet, Bullets, cloneBullet, createBullet, removeBullet} from './bullet'
import {Framerate} from './main'

export class Ship extends DestroyableObject {
  public maxFiringDelay: number

  constructor(mesh: AbstractMesh, health: number, speed: number, public firingDelay: number) {
    super(mesh, health, speed)
    this.maxFiringDelay = firingDelay
  }
}

export function createShip(mesh: AbstractMesh, texture: Texture, scene: Scene): Ship {
  mesh.receiveShadows = true
  // mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene)
  // mesh.showBoundingBox = true
  // mesh.checkCollisions = true
  mesh.position.set(0, -60, 0)
  mesh.rotate(Axis.X, Math.PI / 2, Space.LOCAL)
  createPropulsionAnimation(scene, texture, mesh)
  return new Ship(mesh, 5, 1.5, 15)
}

export function loopShip(keysDown: KeysDown, texture: Texture, ship: Ship, boss: Boss, camera: UniversalCamera, framerate: Framerate, scene: Scene): void {
  const bullet = createBullet(texture, scene)
  const bullets = new Bullets(List<Bullet>())
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    movement(keysDown, ship)
    shooting(keysDown, bullet, ship, bullets, framerate, scene)
    trackBullets(bullets, camera, scene, boss)
  })
}

function movement(keysDown: KeysDown, ship: Ship): void {
  if (keysDown.leftRight.peek() === 'ArrowLeft') {
    ship.mesh.moveWithCollisions(new Vector3(-ship.speed, 0, 0))
  } else if (keysDown.leftRight.peek() === 'ArrowRight') {
    ship.mesh.moveWithCollisions(new Vector3(ship.speed, 0, 0))
  }
  if (keysDown.upDown.peek() === 'ArrowUp') {
    ship.mesh.moveWithCollisions(new Vector3(0, ship.speed, 0))
  } else if (keysDown.upDown.peek() === 'ArrowDown') {
    ship.mesh.moveWithCollisions(new Vector3(0, -ship.speed, 0))
  }
}

function trackBullets(bullets: Bullets, c: UniversalCamera, s: Scene, boss: Boss): void {
  bullets.current = bullets.current.reduce((acc, b) => {
    if (!c.isInFrustum(b.mesh)) {
      removeBullet(b, s)
      return acc
    } else if (b.mesh.intersectsMesh(boss.mesh, false)) {
      boss.health = boss.health - 1
      removeBullet(b, s)
      return acc
    } else {
      b.mesh.position.y += 1
      return acc.push(b)
    }
  }, List<Bullet>())
}

function shooting(keysDown: KeysDown, bullet: Bullet, ship: Ship, bullets: Bullets, framerate: Framerate, scene: Scene): void {
  if (keysDown.space) {
    ship.firingDelay--
    if (ship.firingDelay <= 0) {
      bullets.current = bullets.current.push(cloneBullet(bullets, bullet, ship.mesh, framerate, 350, 6, scene))
      ship.firingDelay = ship.maxFiringDelay
    }
  }
}

function createPropulsionAnimation(s: Scene, t: Texture, m: AbstractMesh): void {
  const particles = new ParticleSystem('shipPropulsion', 400, s)
  particles.particleTexture = t
  particles.emitter = m
  particles.minEmitBox.set(0, -15, 3)
  particles.maxEmitBox.set(0, -15, 3)
  particles.direction1.set(-.3, -1, -1)
  particles.direction2.set(-.3, -1, -1)
  particles.gravity.set(0, -.05, 0)
  particles.color1.set(1, 0.5, 0.8, 1)
  particles.color2.set(1, 0.5, 1, 1)
  particles.colorDead.set(1, 0, 1, 0)
  particles.minSize = 3
  particles.maxSize = 4
  particles.minLifeTime = 0.01
  particles.maxLifeTime = 0.04
  particles.emitRate = 400
  particles.minEmitPower = 2
  particles.maxEmitPower = 2
  particles.start()
}
