import {AbstractMesh, Animation, Color4, Mesh, ParticleSystem, Scene, Texture, Vector3} from 'babylonjs'
import {List} from 'immutable'
import {Framerate} from './main'

export class Bullet {
  constructor(public mesh: Mesh, public particles: ParticleSystem) {
  }
}

export class Bullets {
  constructor(public current: List<Bullet>) {
  }
}

function simpleAnimation(mesh: Mesh, framerate: Framerate, distance: number): Animation {
  const animation = new Animation('simpleAnimation', 'position.y', framerate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
  animation.setKeys([{frame: 0, value: mesh.position.y}, {frame: framerate * 4 , value: mesh.position.y + distance}])
  return animation
}

export function createBullet(texture: Texture, scene: Scene): Bullet {
  const m = Mesh.CreateSphere('originalShot', 1, 4, scene)
  m.isVisible = true
  return new Bullet(m, createBulletParticles(texture, m, scene))
}

export function cloneBullet(bullets: Bullets, bullet: Bullet, mesh: AbstractMesh, framerate: Framerate, distance: number, offset: number, scene: Scene): Bullet {
  const count = bullets.current.size + 1
  const clonedMesh = bullet.mesh.clone('shot' + count)
  clonedMesh.position.set(mesh.position.x, mesh.position.y + offset, -2)
  const clonedBullet = new Bullet(clonedMesh, bullet.particles.clone('bulletTail' + count, clonedMesh))
  clonedBullet.particles.start()
  clonedMesh.animations = [simpleAnimation(clonedMesh, framerate, distance)]
  scene.beginAnimation(clonedMesh, 0, framerate * 16, false)
  return clonedBullet
}

export function removeBullet(b: Bullet, s: Scene): void {
  b.particles.stop()
  s._toBeDisposed.push(b.particles)
  s._toBeDisposed.push(b.mesh)
}

function createBulletParticles(texture: Texture, mesh: AbstractMesh, scene: Scene): ParticleSystem {
  const p = new ParticleSystem('originalShotParticules', 400, scene)
  p.emitter = mesh
  p.particleTexture = texture
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
