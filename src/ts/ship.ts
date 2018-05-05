import {AbstractMesh, Axis, Color4, MeshAssetTask, ParticleSystem, PhysicsImpostor, Scene, Space, TextureAssetTask, Vector3} from 'babylonjs'
import {KeysDown} from './controls'

export function createShip(mt: MeshAssetTask, t: TextureAssetTask, s: Scene): AbstractMesh {
  const m = mt.loadedMeshes[0]
  m.renderingGroupId = 2
  m.receiveShadows = true
  // m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, s)
  m.onCollide = () => console.log('hey')
  m.checkCollisions = true
  m.position = new Vector3(0, -60, 0)
  m.rotate(Axis.X, Math.PI / 2, Space.LOCAL)
  createPropulsionAnimation(s, t, m)
  return m
}

export function loopShip(ship: AbstractMesh, keysDown: KeysDown, s: Scene): void {
  const speed = 2
  s.registerBeforeRender(() => {
    if (!s.isReady()) return
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
  })
}

function createPropulsionAnimation(s: Scene, t: TextureAssetTask, m: AbstractMesh): void {
  const particles = new ParticleSystem('shipPropulsion', 400, s)
  particles.renderingGroupId = 2
  particles.particleTexture = t.texture
  particles.emitter = m
  particles.minEmitBox = new Vector3(0, -15, 3)
  particles.maxEmitBox = new Vector3(0, -15, 3)
  particles.direction1 = new Vector3(-.3, -1, -1)
  particles.direction2 = new Vector3(-.3, -1, -1)
  particles.gravity = new Vector3(0, -.05, 0)
  particles.color1 = new Color4(1, 0.5, 0.8, 1)
  particles.color2 = new Color4(1, 0.5, 1, 1)
  particles.colorDead = new Color4(1, 0, 1, 0)
  particles.minSize = 3
  particles.maxSize = 4
  particles.minLifeTime = 0.01
  particles.maxLifeTime = 0.04
  particles.emitRate = 400
  particles.minEmitPower = 2
  particles.maxEmitPower = 2
  particles.start()
}
