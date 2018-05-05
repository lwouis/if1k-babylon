import {AbstractMesh, Color4, Mesh, ParticleSystem, Scene, TextureAssetTask, UniversalCamera, Vector3} from 'babylonjs'
import {List} from 'immutable'
import {KeysDown} from './controls'
import {Boss} from './boss'

export class Bullet {
  constructor(public mesh: Mesh, public particles: ParticleSystem) {
  }
}

export class Bullets {
  constructor(public current: List<Bullet>) {
  }
}

export function createBullet(t: TextureAssetTask, ship: AbstractMesh, boss: AbstractMesh, s: Scene): Bullet {
  const m = Mesh.CreateSphere('originalShot', 1, 9, s)
  m.renderingGroupId = 2
  m.isVisible = false
  return new Bullet(m, createBulletParticles(s, t, m))
}

function cloneBullet(bullets: Bullets, bullet: Bullet, ship: BABYLON.AbstractMesh): Bullet {
  const count = bullets.current.size + 1
  const bulletMesh = bullet.mesh.clone('shot' + count)
  const newB = new Bullet(bulletMesh, bullet.particles.clone('bulletTail' + count, bulletMesh))
  newB.mesh.position = new Vector3(ship.position.x, ship.position.y + 6, ship.position.z)
  newB.particles.start()
  return newB
}

export function loopBullets(keysDown: KeysDown, bullet: Bullet, ship: AbstractMesh, boss: Boss, bullets: Bullets, c: UniversalCamera, s: Scene): void {
  s.registerBeforeRender(() => {
    if (keysDown.space) {
      bullets.current = bullets.current.push(cloneBullet(bullets, bullet, ship))
    }
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
  })
}

function removeBullet(b: Bullet, s: Scene): void {
  b.particles.stop()
  s._toBeDisposed.push(b.particles)
  s._toBeDisposed.push(b.mesh)
}

function createBulletParticles(s: Scene, t: TextureAssetTask, m: AbstractMesh): ParticleSystem {
  const p = new ParticleSystem('originalShot', 400, s)
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
