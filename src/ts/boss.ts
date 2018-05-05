import {AbstractMesh, Axis, MeshAssetTask, PhysicsImpostor, Scene, Space, Vector3} from 'babylonjs'

export class Boss {
  constructor(public mesh: AbstractMesh, public health: number) {
  }
}

export function createBoss(t: MeshAssetTask, s: Scene): Boss {
  const m = t.loadedMeshes[0]
  m.renderingGroupId = 2
  m.checkCollisions = true
  // m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, s)
  m.receiveShadows = true
  m.position = new Vector3(0, 45, 0)
  // m.scaling = new Vector3(2, 2, 2)
  m.rotate(Axis.X, -Math.PI / 2, Space.LOCAL)
  m.rotate(Axis.Y, -Math.PI, Space.LOCAL)
  return new Boss(m, 100)
}
