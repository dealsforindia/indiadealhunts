import * as THREE from 'three';
import { vertexShader, fragmentShader } from './emeraldBallShaders';

/** Bounded scene based on the approved emerald globe, metal belt and connected feather wings. */
export function createEmeraldBall(host: HTMLElement, detail = 1) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  // Keep the drawing buffer detailed without overriding the responsive CSS box.
  renderer.setSize(96*detail,56*detail,false); renderer.setClearColor(0,0);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-4.28,4.28,2.5,-2.5,.1,30);
  camera.position.set(0,.3,10); camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xfff7df,0x163d2b,3));
  const key=new THREE.DirectionalLight(0xfff2da,4);key.position.set(-3,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight(0xb8ffe0,2);rim.position.set(4,1,-2);scene.add(rim);
  const gold=new THREE.MeshStandardMaterial({color:0xc8ae7d,metalness:.78,roughness:.26,side:THREE.DoubleSide});
  const darkGold=new THREE.MeshStandardMaterial({color:0x6f6349,metalness:.7,roughness:.35});
  const emerald=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{uRimIntensity:{value:1.05},uTime:{value:0}}});
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),emerald);scene.add(sphere);
  const belt=new THREE.Mesh(new THREE.CylinderGeometry(1.012,1.012,.15,48,1,true),gold);scene.add(belt);
  for(const y of [-.085,.085]) {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.012,.025,6,48),gold);ring.rotation.x=Math.PI/2;ring.position.y=y;scene.add(ring);
  }
  const featherShape=new THREE.Shape();
  featherShape.moveTo(0,0);featherShape.bezierCurveTo(.3,.24,1,.31,1.65,.08);
  featherShape.bezierCurveTo(1.1,-.16,.38,-.2,0,0);
  const featherGeometry=new THREE.ExtrudeGeometry(featherShape,{depth:.025,bevelEnabled:true,bevelSize:.025,bevelThickness:.015,bevelSegments:1,steps:1,curveSegments:8});
  const wings:THREE.Group[]=[];
  for(const direction of [-1,1]) {
    const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.2,16),gold);
    hinge.rotation.z=Math.PI/2;hinge.position.x=direction*1.01;scene.add(hinge);
    const pin=new THREE.Mesh(new THREE.SphereGeometry(.095,12,8),darkGold);pin.position.set(direction*1.14,0,.13);scene.add(pin);
    const wing=new THREE.Group();wing.position.set(direction*1.08,0,0);wing.scale.x=direction;
    for(let i=0;i<9;i++) {
      const feather=new THREE.Mesh(featherGeometry,gold);
      feather.position.set(i*.115,-.18+i*.047,-i*.025);feather.rotation.z=-.35+i*.14;
      feather.scale.set(1-i*.035,1,1);wing.add(feather);
    }
    wings.push(wing);scene.add(wing);
  }
  host.appendChild(renderer.domElement);
  if(host.parentElement) host.parentElement.dataset.rendered='true';
  let disposed=false,fold=0;
  function dispose() {
    if(disposed)return;disposed=true;
    renderer.domElement.removeEventListener('webglcontextlost',lost);
    const geometries=new Set<THREE.BufferGeometry>();
    scene.traverse(object=>{if(object instanceof THREE.Mesh)geometries.add(object.geometry);});
    geometries.forEach(geometry=>geometry.dispose());gold.dispose();darkGold.dispose();emerald.dispose();
    renderer.dispose();renderer.domElement.remove();if(host.parentElement)delete host.parentElement.dataset.rendered;
  }
  function lost(event:Event){event.preventDefault();dispose();}
  renderer.domElement.addEventListener('webglcontextlost',lost);
  return {render(time:number,flying=true){
    if(disposed)return;
    fold+=(Number(!flying)-fold)*.25;
    sphere.rotation.y=time*.3;emerald.uniforms.uTime.value=time;
    wings.forEach((wing,index)=>{wing.rotation.z=(index===0?-1:1)*(.22+Math.sin(time*38)*.12)*(1-fold);wing.rotation.y=(index===0?1:-1)*fold*1.2;wing.rotation.x=Math.sin(time*38)*.5*(1-fold);});
    renderer.render(scene,camera);
  },dispose};
}
