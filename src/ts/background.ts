import {Mesh, Scene, ShaderMaterial, UniversalCamera, Vector3} from 'babylonjs'

class ShaderState {
  constructor(
    public time: number,
    public alpha: number,
    public pointLongitude: number, // from 0 to 0.06
    public bgSpeed: number,
    public shown: boolean) {
  }
}

export function createBackground(s: Scene): [Mesh, ShaderMaterial] {
  const sh = new ShaderMaterial('starfieldShader', s,
    {vertexElement: 'starfield', fragmentElement: 'starfield'},
    {attributes: ['position', 'normal', 'uv'], uniforms: ['world', 'worldView', 'worldViewProjection', 'view', 'projection']})
  sh.setFloat('time', 6)
  sh.setFloat('alpha', 0.0)
  sh.setFloat('pointLongitude', 0.001)
  sh.setVector3('cameraPosition', Vector3.Zero())
  sh.backFaceCulling = true
  const m = Mesh.CreatePlane('mesh', 100, s)
  m.material = sh
  return [m, sh]
}

export function loopBackground(bgM: Mesh, bgS: ShaderMaterial, c: UniversalCamera, s: Scene): void {
  const ss = new ShaderState(6, 0.0, 0.001, 0.00025, false)
  s.registerBeforeRender(() => {
    bgM.position.set(0, 0, 0)
    bgS.setFloat('time', ss.time)
    bgS.setFloat('pointLongitude', ss.pointLongitude)
    bgS.setFloat('alpha', ss.alpha)
    ss.time = ss.time + ss.bgSpeed
    if (!ss.shown && ss.alpha < 1) {
      ss.bgSpeed += 0.0000005
      ss.pointLongitude += 0.00004
      ss.alpha += 0.00025
    } else {
      if (!ss.shown) {
        ss.shown = true
      }
      if (ss.alpha >= 0.00025) {
        ss.bgSpeed -= 0.0000005
        ss.pointLongitude -= 0.00004
        ss.alpha -= 0.00025
      } else {
        ss.shown = false
      }
    }
  })
}
