import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Continuous ballistic arcs, not individual spheres moved by the CPU.
export function createFountain(scene){
 const group=new THREE.Group();group.name='Musical water garden';scene.add(group);
 const uniforms={uTime:{value:0},uNight:{value:0}};
 const stone=new THREE.MeshStandardMaterial({color:0x9eaaa9,roughness:.72,metalness:.08});
 const rim=new THREE.MeshStandardMaterial({color:0xc5c4b9,roughness:.6,metalness:.12});
 const put=(geo,mat,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;};
 const outline=[];for(let i=0;i<=144;i++){const a=i/144*Math.PI*2,r=4.25+.38*Math.cos(3*(a+Math.PI/2));outline.push(new THREE.Vector2(Math.cos(a)*r,-Math.sin(a)*r));}
 const shape=new THREE.Shape(outline);
 const base=put(new THREE.ExtrudeGeometry(shape,{depth:.35,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.1,bevelThickness:.08}),stone,0,.1,0);base.rotation.x=-Math.PI/2;
 const edge=new THREE.CatmullRomCurve3(outline.slice(0,-1).map(p=>new THREE.Vector3(p.x,.53,-p.y)),true);
 put(new THREE.TubeGeometry(edge,144,.12,7,true),rim);
 const surfaceMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uTime;uniform float uNight;varying vec2 vP;
 void main(){float r=length(vP);float w=sin(r*19.-uTime*3.5)*.5+.5;float crossWave=sin(vP.x*13.+uTime)*sin(vP.y*11.-uTime*.8);float ring=pow(w,14.);vec3 day=mix(vec3(.025,.19,.21),vec3(.23,.49,.48),.38+crossWave*.12);vec3 night=vec3(.018,.07,.115)+vec3(.24,.05,.29)*ring*.5;vec3 color=mix(day,night,uNight)+ring*mix(vec3(.1,.17,.16),vec3(.25,.1,.29),uNight);gl_FragColor=vec4(color,.94);}`});
 const surface=put(new THREE.ShapeGeometry(shape,48),surfaceMaterial,0,.52,0);surface.rotation.x=-Math.PI/2;surface.castShadow=false;
 put(new THREE.CylinderGeometry(1.03,1.09,.2,64),rim,0,.6,0);
 const rings=[];for(const radius of [1.11,2.05,3.7]){const ring=put(new THREE.TorusGeometry(radius,.035,6,100),new THREE.MeshBasicMaterial({color:0xb5dffa,transparent:true,opacity:.4}),0,.55,0);ring.rotation.x=Math.PI/2;rings.push(ring);}
 const streams=[],jets=[];
 function jet(x,z,tx,tz,height,phase){const points=[];for(let i=0;i<=36;i++){const t=i/36;points.push(new THREE.Vector3(x+(tx-x)*t,.56+4*height*t*(1-t),z+(tz-z)*t));}
  const curve=new THREE.CatmullRomCurve3(points),g=new THREE.TubeGeometry(curve,36,.022,5,false),count=g.attributes.position.count;
  g.setAttribute('aPhase',new THREE.Float32BufferAttribute(new Float32Array(count).fill(phase),1));streams.push(g);jets.push({x,z,tx,tz,height,phase});
 }
 // High central crown, inner ring, outer parabolic jets and two small domes.
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2;jet(Math.cos(a)*1.12,Math.sin(a)*1.12,Math.cos(a)*1.37,Math.sin(a)*1.37,2.7+.35*Math.sin(a*3),i*.17);}
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2;jet(Math.cos(a)*2.05,Math.sin(a)*2.05,Math.cos(a)*2.5,Math.sin(a)*2.5,1.9,i*.14);}
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2;if(Math.sin(a)<-.2&&Math.abs(Math.cos(a))>.65)continue;const r=4.04+.34*Math.cos(3*(a+Math.PI/2));jet(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*2.65,Math.sin(a)*2.65,1.2,i*.12);}
 for(const sign of [-1,1])for(let i=0;i<18;i++){const a=i/18*Math.PI*2,cx=sign*3.05,cz=-1.85;jet(cx+Math.cos(a)*.18,cz+Math.sin(a)*.18,cx+Math.cos(a)*.83,cz+Math.sin(a)*.83,1.25,i*.2);}
 const streamMat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.NormalBlending,
 vertexShader:`attribute float aPhase;uniform float uTime;varying float vPhase;varying float vFlow;varying float vHeight;void main(){vec3 p=position;float pulse=.9+.1*sin(uTime*.65+aPhase*.25);p.y=.56+(p.y-.56)*pulse;p.x+=sin(p.y*10.+uTime*2.+aPhase)*.008*p.y;vPhase=aPhase;vFlow=uv.x;vHeight=p.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float uTime;uniform float uNight;varying float vPhase;varying float vFlow;varying float vHeight;void main(){float flow=.5+.5*sin(vFlow*155.-uTime*15.+vPhase);vec3 day=vec3(.7,.93,.98);vec3 night=mix(vec3(.32,.68,1.),vec3(1.,.43,.82),.5+.5*sin(uTime*.17+vPhase*.18));vec3 col=mix(day,night,uNight);gl_FragColor=vec4(col*(.9+.3*flow),mix(.64,.88,uNight));}`});
 const merged=mergeGeometries(streams);streams.forEach(g=>g.dispose());const streamMesh=put(merged,streamMat);streamMesh.castShadow=false;streamMesh.frustumCulled=false;
 // Fine mist uses one draw call. GPU evaluates trajectories at a stable elapsed time.
 const count=jets.length*9,positions=new Float32Array(count*3),origin=new Float32Array(count*4),target=new Float32Array(count*3),phases=new Float32Array(count);
 jets.forEach((j,index)=>{for(let k=0;k<9;k++){const n=index*9+k;origin.set([j.x,j.z,j.height,j.phase],n*4);target.set([j.tx,j.tz,(k%3-1)*.035],n*3);phases[n]=k/9;}});
 const mistGeo=new THREE.BufferGeometry();mistGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));mistGeo.setAttribute('aOrigin',new THREE.BufferAttribute(origin,4));mistGeo.setAttribute('aTarget',new THREE.BufferAttribute(target,3));mistGeo.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
 const mistMat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`attribute vec4 aOrigin;attribute vec3 aTarget;attribute float aPhase;uniform float uTime;varying float vAlpha;void main(){float t=fract(aPhase+uTime*.55);vec3 p=vec3(mix(aOrigin.x,aTarget.x,t),.56+4.*aOrigin.z*t*(1.-t)*(.9+.1*sin(uTime*.65+aOrigin.w*.25)),mix(aOrigin.y,aTarget.y,t));p.x+=aTarget.z*t;p.z+=sin(aOrigin.w+t*7.)*.025*t;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(34./-mv.z,1.,4.);vAlpha=sin(t*3.14159)*.45;}`,
 fragmentShader:`uniform float uNight;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(mix(vec3(.75,.95,1.),vec3(.8,.55,1.),uNight),(1.-r*r)*vAlpha);}`});
 const mist=new THREE.Points(mistGeo,mistMat);mist.frustumCulled=false;group.add(mist);
 const glow=new THREE.PointLight(0xaa77ff,0,13,2);glow.position.set(0,1.6,0);group.add(glow);
 return {update(time,night,low){uniforms.uTime.value=time;uniforms.uNight.value=night?1:0;glow.intensity=night?14:0;mist.visible=!low;for(const r of rings){r.material.color.set(night?0xc58cff:0x8fbec2);r.material.opacity=night?.8:.35;}},bounds:{x:0,z:0,hw:4.65,hd:4.65},jetCount:jets.length};
}
