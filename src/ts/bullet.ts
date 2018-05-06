import {AbstractMesh, Color4, Mesh, ParticleSystem, Scene, TextureAssetTask, Vector3} from 'babylonjs'
import {List} from 'immutable'

export class Bullet {
  constructor(public mesh: Mesh, public particles: ParticleSystem) {
  }
}

export class Bullets {
  constructor(public current: List<Bullet>) {
  }
}

export function createBullet(t: TextureAssetTask, s: Scene): Bullet {
  const m = Mesh.CreateSphere('originalShot', 1, 4, s)
  m.renderingGroupId = 2
  m.isVisible = true
  // m.checkCollisions = true
  // m.showBoundingBox = true
  return new Bullet(m, createBulletParticles(t, m, s))
}

export function cloneBullet(bullets: Bullets, bullet: Bullet, ship: AbstractMesh): Bullet {
  const count = bullets.current.size + 1
  const bulletMesh = bullet.mesh.clone('shot' + count)
  const newB = new Bullet(bulletMesh, bullet.particles.clone('bulletTail' + count, bulletMesh))
  newB.mesh.position.set(ship.position.x, ship.position.y + 6, -2)
  newB.particles.start()
  return newB
}

export function removeBullet(b: Bullet, s: Scene): void {
  b.particles.stop()
  s._toBeDisposed.push(b.particles)
  s._toBeDisposed.push(b.mesh)
}

function createBulletParticles(t: TextureAssetTask, m: AbstractMesh, s: Scene): ParticleSystem {
  const p = new ParticleSystem('originalShotParticules', 400, s)
  p.emitter = m
  p.particleTexture = t.texture
  p.minEmitBox = Vector3.Zero()
  p.maxEmitBox = Vector3.Zero()
  p.direction1 = Vector3.Zero()
  p.direction2 = Vector3.Zero()
  p.gravity = Vector3.Zero()
  p.color1 = new Color4(0.8, 0.5, 0, 1.0)
  p.color2 = new Color4(1, 0.5, 0, 1.0)
  p.colorDead = new Color4(1, 0, 0, 0.0)
  p.minSize = 2
  p.maxSize = 6
  p.minLifeTime = 0.04
  p.maxLifeTime = 0.1
  p.emitRate = 500
  p.blendMode = ParticleSystem.BLENDMODE_ONEONE
  p.minAngularSpeed = 0
  p.maxAngularSpeed = Math.PI
  return p
}
