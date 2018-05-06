import {AbstractMesh, Axis, MeshAssetTask, ParticleSystem, Scene, Space, TextureAssetTask, UniversalCamera, Vector3} from 'babylonjs'
import {KeysDown} from './controls'
import {List} from 'immutable'
import {Boss, DestroyableObject} from './boss'
import {Bullet, Bullets, cloneBullet, createBullet, removeBullet} from './bullet'

export class Ship extends DestroyableObject {
}

export function createShip(mt: MeshAssetTask, t: TextureAssetTask, s: Scene): Ship {
  const m = mt.loadedMeshes[0]
  m.renderingGroupId = 2
  m.receiveShadows = true
  // m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, s)
  // m.showBoundingBox = true
  // m.checkCollisions = true
  m.position.set(0, -60, 0)
  m.rotate(Axis.X, Math.PI / 2, Space.LOCAL)
  createPropulsionAnimation(s, t, m)
  return new Ship(m, 5)
}

export function loopShip(keysDown: KeysDown, t: TextureAssetTask, ship: AbstractMesh, boss: Boss, camera: UniversalCamera, scene: Scene): void {
  const speed = 2
  const bullet = createBullet(t, scene)
  const bullets = new Bullets(List<Bullet>())
  scene.registerBeforeRender(() => {
    if (!scene.isReady()) return
    movement(keysDown, ship, speed)
    shooting(keysDown, bullet, ship, bullets)
    trackBullets(bullets, camera, scene, boss)
  })
}

function movement(keysDown: KeysDown, ship: AbstractMesh, speed: number): void {
  if (keysDown.leftRight.peek() === 'ArrowLeft') {
    ship.moveWithCollisions(new Vector3(-speed, 0, 0))
  } else if (keysDown.leftRight.peek() === 'ArrowRight') {
    ship.moveWithCollisions(new Vector3(speed, 0, 0))
  }
  if (keysDown.upDown.peek() === 'ArrowUp') {
    ship.moveWithCollisions(new Vector3(0, speed, 0))
  } else if (keysDown.upDown.peek() === 'ArrowDown') {
    ship.moveWithCollisions(new Vector3(0, -speed, 0))
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

function shooting(keysDown: KeysDown, bullet: Bullet, ship: AbstractMesh, bullets: Bullets): void {
  if (keysDown.space) {
    bullets.current = bullets.current.push(cloneBullet(bullets, bullet, ship))
  }}

function createPropulsionAnimation(s: Scene, t: TextureAssetTask, m: AbstractMesh): void {
  const particles = new ParticleSystem('shipPropulsion', 400, s)
  particles.renderingGroupId = 2
  particles.particleTexture = t.texture
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
