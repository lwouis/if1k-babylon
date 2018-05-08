import {AbstractMesh, Animation, Color4, Mesh, ParticleSystem, Scene, Texture, UniversalCamera, Vector3} from 'babylonjs'
import {List} from 'immutable'
import {Framerate} from './main'
import {Boss} from './boss'
import {Ship} from './ship'

export class Bullet {
  constructor(public mesh: Mesh, public particles: ParticleSystem) {
  }
}

function simpleAnimation(mesh: Mesh, framerate: Framerate, distance: number): Animation {
  const animation = new Animation('simpleAnimation', 'position.y', framerate, Animation.ANIMATIONTYPE_FLOAT)
  animation.setKeys([{frame: 0, value: mesh.position.y}, {frame: framerate * 4, value: mesh.position.y + distance}])
  return animation
}

export function createBullet(texture: Texture, scene: Scene): Bullet {
  const m = Mesh.CreateSphere('originalShot', 1, 4, scene)
  m.isVisible = true
  return new Bullet(m, createBulletParticles(texture, m, scene))
}

export function cloneBullet(bulletCount: number, bullet: Bullet, framerate: Framerate, distance: number, position: Vector3, scene: Scene): Bullet {
  const count = bulletCount + 1
  const clonedMesh = bullet.mesh.clone('shot' + count)
  clonedMesh.position = position.add(new Vector3(0, 0, -2)) // without this -2, the bullets are too low to intersect other objects
  const clonedParticules = bullet.particles.clone('bulletTail' + count, clonedMesh)
  const clonedBullet = new Bullet(clonedMesh, clonedParticules)
  clonedBullet.particles.start()
  clonedMesh.animations = [simpleAnimation(clonedMesh, framerate, distance)]
  scene.beginAnimation(clonedMesh, 0, framerate * 16, false)
  return clonedBullet
}

export function trackBullets(bullets: List<Bullet>, c: UniversalCamera, s: Scene, target: Boss | Ship): List<Bullet> {
  return bullets.reduce((acc, b) => {
    if (!c.isInFrustum(b.mesh)) {
      removeBullet(b, s)
      return acc
    } else if (b.mesh.intersectsMesh(target.mesh, false)) {
      target.health = target.health - 1
      removeBullet(b, s)
      return acc
    } else {
      return acc.push(b)
    }
  }, List<Bullet>())
}

function removeBullet(b: Bullet, s: Scene): void {
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
