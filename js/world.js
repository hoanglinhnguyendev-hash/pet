import * as THREE from 'three';
import {createPavilions} from './pavilions.js';
import {createCourtyardPets} from './courtyard-pets.js';
import {createFountain} from './fountain.js';
import {createLandscape} from './landscape.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Sky} from 'three/addons/objects/Sky.js';

export const stations=[
 {id:'pets',name:'Nhà tìm mái ấm',icon:'paw-print',position:[-12,3.5,-6],color:0xdcedbb},
 {id:'rescue',name:'Trạm cứu trợ',icon:'hand-heart',position:[12,3.5,-9],color:0xf5c099},
 {id:'appointments',name:'Nhà kết nối',icon:'calendar-heart',position:[-12,3.2,12],color:0xf1dda7},
 {id:'tracking',name:'Vườn chăm sóc',icon:'heart-pulse',position:[11,3.5,12],color:0xc4dedc},
 {id:'admin',name:'Nhà điều phối',icon:'shield-check',position:[0,4,-21],color:0x9fcaba}
];
export async function createWorld(onNavigate,onStatus){
 const host=document.getElementById('world'),labelHost=document.getElementById('world-labels');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){host.innerHTML='<div class="webgl-fallback"><i data-lucide="trees"></i><h2>Khu vườn vẫn mở cửa</h2><p>Thiết bị hiện chưa bật WebGL. Bạn vẫn có thể dùng đầy đủ chức năng qua menu.</p><a href="#pets" class="btn dark">Gặp các bạn nhỏ</a></div>';onStatus?.('fallback');return {setMode(){},focus(){},toggleDay(){},reset(){},quality(){}};}
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width: 760px)').matches?1.25:1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
 renderer.domElement.setAttribute('aria-label','Không gian 3D. Dùng menu hoặc các nhãn khu nhà để mở chức năng.');renderer.domElement.tabIndex=0;host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xc9e3e9);scene.fog=new THREE.FogExp2(0xc9e3e9,.0036);
 const overviewPosition=()=>new THREE.Vector3(44,36,51).multiplyScalar(Math.min(2.1,Math.max(1,.95/(innerWidth/innerHeight))));
 const camera=new THREE.PerspectiveCamera(innerWidth/innerHeight<.8?52:43,innerWidth/innerHeight,.1,900);camera.position.copy(overviewPosition());
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2,0);controls.enableDamping=true;controls.dampingFactor=.06;controls.minDistance=13;controls.maxDistance=230;controls.maxPolarAngle=Math.PI*.465;controls.minPolarAngle=.17;controls.enablePan=true;controls.maxTargetRadius=25;
 const hemi=new THREE.HemisphereLight(0xe8f6ff,0x60734a,2.7);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffe8c4,4.5);sun.position.set(-28,55,24);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<760?1024:2048,innerWidth<760?1024:2048);Object.assign(sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:1,far:150});sun.shadow.normalBias=.07;sun.shadow.bias=-.00015;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xc1e9ff,.85);fill.position.set(25,20,-30);scene.add(fill);
 const sky=new Sky();sky.scale.setScalar(800);sky.material.uniforms.turbidity.value=3;sky.material.uniforms.rayleigh.value=1.6;sky.material.uniforms.mieCoefficient.value=.004;sky.material.uniforms.mieDirectionalG.value=.8;sky.material.uniforms.sunPosition.value.copy(sun.position).normalize();scene.add(sky);
 const groundMat=new THREE.MeshStandardMaterial({color:0x789858,roughness:1});
 const woodMat=new THREE.MeshStandardMaterial({color:0x94744e,roughness:.88});
 const lightWood=new THREE.MeshStandardMaterial({color:0xd0af7d,roughness:.82});
 const stoneMat=new THREE.MeshStandardMaterial({color:0xe0dacb,roughness:.96});
 const darkMat=new THREE.MeshStandardMaterial({color:0x213f36,roughness:.6});
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xa5cad2,metalness:.16,roughness:.15,transparent:true,opacity:.52,side:THREE.DoubleSide});
 const pathMat=new THREE.MeshStandardMaterial({color:0xe6ddc4,roughness:1});
 const objects=[],obstacles=[],leaves=[],lights=[],mixers=[];
 function mesh(geometry,material,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(w,h,d,mat,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
 const cylinder=(top,bottom,h,mat,x,y,z,parent,segments=32)=>mesh(new THREE.CylinderGeometry(top,bottom,h,segments),mat,x,y,z,parent);
 // Actual navigable WebGL architecture, rather than a rendered background image.
 const island=cylinder(32.7,34.5,3.2,new THREE.MeshStandardMaterial({color:0x8d8b67,roughness:1}),0,-1.85,0,scene,96);island.scale.z=.92;
 const grass=cylinder(32.8,32.8,.24,groundMat,0,-.14,0,scene,96);grass.scale.z=.92;
 const shore=cylinder(34.8,36,.35,new THREE.MeshStandardMaterial({color:0xc9c6a2,roughness:1}),0,-2.9,0,scene,96);shore.scale.z=.94;
 const waterMat=new THREE.MeshPhysicalMaterial({color:0x5dabb0,roughness:.26,metalness:.2,transparent:true,opacity:.92});
 const landscape=createLandscape(scene);
 cylinder(6,6,.18,pathMat,0,.02,0,scene,64);
 for(const [x,z,w,d] of [[0,0,4,53],[0,0,52,3.4],[-12,0,2.9,29],[12,0,2.9,30]])box(w,.12,d,pathMat,x,.02,z);
 // Water choreography inspired by the supplied circular fountain reference.
 const fountain=createFountain(scene);obstacles.push(fountain.bounds);
 // Distinct community destinations and native 3D wayfinding.
 if(document.fonts?.load)await document.fonts.load('700 54px "Petcare Sans"').catch(()=>{});
 createPavilions(scene,stations,objects,obstacles,lights);
 // Footbridge and low fences.
 for(let n=0;n<27;n++)box(4,.15,.32,lightWood,0,.14,25+n*.37);
 for(const side of [-1,1]){for(let n=0;n<9;n++){cylinder(.06,.06,1.1,woodMat,side*2.02,.72,25+n*1.2,scene,8);}box(.07,.08,10.6,woodMat,side*2.02,1.15,30);}
 function bench(x,z,angle=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);for(let i=0;i<5;i++)box(2.6,.1,.14,lightWood,0,.65,-.3+i*.18,g);for(const xx of [-1,1]){box(.12,.7,.8,darkMat,xx,.34,.08,g);box(.1,1.1,.1,darkMat,xx,.7,-.42,g);}for(let i=0;i<3;i++)box(2.6,.16,.09,lightWood,0,1+i*.2,-.42,g);}
 bench(-5,4,.7);bench(5,-3.9,-2.1);bench(-5,-4,2.4);bench(5,4,-.5);
 const rand=(seed)=>{let t=seed+0x6D2B79F5;return ()=>{t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};};const random=rand(1934);
 const windUniform={value:0};
 const foliageMats=[0x436842,0x63844b,0x79964e,0x4a754a].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,flatShading:false}));
 const leafGeometry=new THREE.SphereGeometry(1,10,7);
 function tree(x,z,h=6){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(.12,.26,h*.7,woodMat,0,h*.35,0,g,9);for(let j=0;j<9;j++){const a=j*2.399,rr=.4+(j%3)*.36;const xx=Math.cos(a)*rr,zz=Math.sin(a)*rr,yy=h*.6+(j%4)*h*.075;
 const branch=cylinder(.045,.075,h*.25,woodMat,xx*.45,yy-h*.12,zz*.45,g,5);branch.rotation.z=-xx*.38;branch.rotation.x=zz*.38;
 const m=mesh(leafGeometry,foliageMats[Math.floor(random()*4)],xx,yy,zz,g);m.scale.set(h*.18,h*.15*(.8+random()*.4),h*.17);leaves.push({mesh:m,base:m.rotation.z,phase:random()*6});}return g;}

 for(let i=0;i<70;i++){const angle=i/70*Math.PI*2,r=25+random()*5,x=Math.cos(angle)*r,z=Math.sin(angle)*r*.9;if(Math.abs(x)<3&&z>23)continue;if(stations.some(st=>Math.abs(x-st.position[0])<6&&Math.abs(z-st.position[2])<6))continue;tree(x,z,4.2+random()*3.8);}
 for(const [x,z] of [[-22,5],[-21,-4],[22,5],[-6,-15],[6,-15],[-6,19],[6,20]])tree(x,z,5+random()*2);
 // Subtle foliage grain carries close-up detail without texture downloads.
 for(const mat of foliageMats){mat.onBeforeCompile=shader=>{shader.uniforms.uWind=windUniform;shader.vertexShader='uniform float uWind;\n'+shader.vertexShader;shader.vertexShader='varying vec3 vLeafPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafPosition=position;\n#ifdef USE_INSTANCING\ntransformed.x+=sin(uWind+instanceMatrix[3].x*.4+instanceMatrix[3].z*.3)*position.y*.035;\n#endif');shader.fragmentShader='varying vec3 vLeafPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=fract(sin(dot(floor(vLeafPosition*38.),vec3(12.9898,78.233,37.719)))*43758.5453);diffuseColor.rgb*=.84+grain*.22;');};}
 // Flower borders use instanced geometry to keep navigation light.
 const flowerGeometry=new THREE.IcosahedronGeometry(.12,1),flowerMat=new THREE.MeshStandardMaterial({color:0xf6e7ac,roughness:1});const flowers=new THREE.InstancedMesh(flowerGeometry,flowerMat,260);const dummy=new THREE.Object3D();for(let i=0;i<260;i++){const a=random()*Math.PI*2,r=5.9+random()*1.3;dummy.position.set(Math.cos(a)*r,.18+random()*.15,Math.sin(a)*r);dummy.scale.set(1,random()*.8+.5,1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);flowers.setColorAt(i,new THREE.Color([0xf6e7ac,0xecc5ad,0xdfcbe5,0xfaf9ee][i%4]));}scene.add(flowers);
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=20;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(stations.some(st=>Math.abs(x-st.position[0])<6&&Math.abs(z-st.position[2])<5))continue;cylinder(.055,.085,2.2,darkMat,x,1.1,z,scene,10);const light=mesh(new THREE.SphereGeometry(.19,12,10),new THREE.MeshStandardMaterial({color:0xfff0cc,emissive:0xffcc79,emissiveIntensity:.3}),x,2.3,z);lights.push(light.material);}
 // Clickable information beacons remain available even without model assets.
 const labels=stations.map(st=>{const button=document.createElement('button');button.className='world-label';button.innerHTML=`<span class="label-icon"><i data-lucide="${st.icon}"></i></span><span>${st.name}</span><i data-lucide="arrow-up-right" class="label-arrow"></i>`;button.addEventListener('click',()=>{focus(st.id);onNavigate(st.id);});labelHost.append(button);return {button,position:new THREE.Vector3(...st.position).add(new THREE.Vector3(0,3,0))};});
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,mode='orbit',night=false,lowQuality=matchMedia('(max-width: 760px)').matches,tween=null,walkYaw=0,walkPitch=0,lastTime=0,moving={};
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY};if(mode==='walk')renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(mode==='walk'&&down){walkYaw-=(e.clientX-down.lastX)*.004;walkPitch=THREE.MathUtils.clamp(walkPitch-(e.clientY-down.lastY)*.003,-1,1);down.lastX=e.clientX;down.lastY=e.clientY;}});
 let hoverAt=0;renderer.domElement.addEventListener('pointermove',e=>{if(down||performance.now()-hoverAt<120)return;hoverAt=performance.now();pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(objects,false)[0];renderer.domElement.style.cursor=hit?'pointer':mode==='walk'?'grab':'default';renderer.domElement.title=hit?.object.userData.petName?`${hit.object.userData.petName} · Bấm để làm quen`:hit?'Bấm để mở khu chức năng':'';});
 renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(pointer,camera);scene.updateMatrixWorld(true);const hit=ray.intersectObjects(objects,false)[0];if(hit){onNavigate(hit.object.userData.route);}}down=null;});
 addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||document.querySelector('dialog[open]')||!document.getElementById('panel-shell').hidden)return;if(mode==='walk'&&['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Shift'].includes(e.key)){moving[e.key]=true;e.preventDefault();}});
 renderer.domElement.addEventListener('pointercancel',()=>{down=null;moving={};});addEventListener('keyup',e=>moving[e.key]=false);addEventListener('blur',()=>{moving={};});
 document.querySelectorAll('[data-move]').forEach(btn=>{const stop=()=>moving[btn.dataset.move]=false;btn.addEventListener('pointerdown',e=>{moving[btn.dataset.move]=true;btn.setPointerCapture(e.pointerId);});btn.addEventListener('pointerup',stop);btn.addEventListener('pointercancel',stop);});
 function setMode(m){mode=m;hudMeasuredAt=-1000;document.body.classList.toggle('walking',m==='walk');controls.enabled=m==='orbit';moving={};if(m==='walk'){tween=null;camera.position.set(0,1.75,22);walkYaw=0;walkPitch=0;}else reset();document.querySelector('.walk-pad').hidden=m!=='walk';document.getElementById('world-help').textContent=m==='walk'?'W A S D / phím mũi tên để đi · Kéo chuột để nhìn · Bấm khu nhà để tương tác':'Kéo để xoay · Cuộn để thu phóng · Chạm vào khu nhà';document.querySelectorAll('[data-world="orbit"],[data-world="walk"]').forEach(b=>b.classList.toggle('active',b.dataset.world===m));}
 function focus(id){const st=stations.find(st=>st.id===id);if(!st||mode==='walk')return;const target=new THREE.Vector3(st.position[0],1.6,st.position[2]);tween={from:camera.position.clone(),to:target.clone().add(new THREE.Vector3(14,12,18)),fromTarget:controls.target.clone(),target,start:performance.now(),duration:1200};}
 function reset(){if(mode==='walk'){setMode('orbit');return;}tween={from:camera.position.clone(),to:overviewPosition(),fromTarget:controls.target.clone(),target:new THREE.Vector3(0,2,0),start:performance.now(),duration:1200};}
 function toggleDay(){night=!night;sky.visible=!night;scene.background.set(night?0x102731:0xc9e3e9);scene.fog.color.copy(scene.background);hemi.intensity=night?.92:2.7;sun.intensity=night?.18:4.5;fill.intensity=night?.5:.85;renderer.toneMappingExposure=night?1.35:1.14;for(const light of lights)if(light.isLight)light.intensity=night?12:0;else light.emissiveIntensity=night?2.8:.2;document.body.classList.toggle('night',night);document.getElementById('day-button').setAttribute('aria-pressed',String(night));document.getElementById('day-button').setAttribute('aria-label',night?'Chuyển sang ban ngày':'Chuyển sang ban đêm');document.getElementById('day-button').innerHTML=`<i data-lucide="${night?'moon':'sun'}"></i>`;window.lucide?.createIcons();return night;}
 function quality(){lowQuality=!lowQuality;document.querySelector('[data-world=quality]').setAttribute('aria-pressed',String(lowQuality));renderer.setPixelRatio(lowQuality?1:Math.min(devicePixelRatio,matchMedia('(max-width: 760px)').matches?1.25:1.7));renderer.shadowMap.enabled=!lowQuality;return lowQuality;}
 const desired=new THREE.Vector3(),direction=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 function blocked(v){if(Math.hypot(v.x,v.z/0.93)>31.6)return true;return obstacles.some(o=>Math.abs(v.x-o.x)<o.hw+.4&&Math.abs(v.z-o.z)<o.hd+.4);}
 const projected=new THREE.Vector3();let elapsed=0,renderAt=0,hudMeasuredAt=0,hudRects=[];let running=true;document.addEventListener('visibilitychange',()=>{running=!document.hidden;lastTime=0;});
 function frame(t){requestAnimationFrame(frame);if(!running)return;const panelOpen=!document.getElementById('panel-shell').hidden;if(panelOpen&&t-renderAt<100)return;renderAt=t;const dt=lastTime?Math.min((t-lastTime)/1000,.05):0;lastTime=t;elapsed+=dt;windUniform.value=elapsed*.8;fountain.update(elapsed,night,lowQuality);landscape.update(elapsed,night,lowQuality);residents.update(elapsed,night,reducedMotion.matches,camera.position);
  if(tween){let u=THREE.MathUtils.clamp((t-tween.start)/tween.duration,0,1);const eased=1-Math.pow(1-u,3);camera.position.lerpVectors(tween.from,tween.to,eased);controls.target.lerpVectors(tween.fromTarget,tween.target,eased);if(u===1)tween=null;}
  if(mode==='walk'&&!panelOpen){camera.rotation.order='YXZ';camera.rotation.set(walkPitch,walkYaw,0);camera.getWorldDirection(direction);direction.y=0;direction.normalize();right.crossVectors(direction,up).normalize();desired.copy(camera.position);const speed=dt*(moving.Shift?7:4);if(moving.w||moving.ArrowUp)desired.addScaledVector(direction,speed);if(moving.s||moving.ArrowDown)desired.addScaledVector(direction,-speed);if(moving.a||moving.ArrowLeft)desired.addScaledVector(right,-speed);if(moving.d||moving.ArrowRight)desired.addScaledVector(right,speed);if(!blocked(desired))camera.position.copy(desired);}else controls.update();
  for(let i=0;i<leaves.length;i+=lowQuality?5:1)leaves[i].mesh.rotation.z=leaves[i].base+Math.sin(t*.0007+leaves[i].phase)*.023;
  for(const mix of mixers)mix.update(dt);
  if(t-hudMeasuredAt>400){hudMeasuredAt=t;hudRects=[...document.querySelectorAll('.world-intro,.world-feature,.topbar,.world-controls,.demo-pill')].filter(el=>el.offsetWidth&&el.offsetHeight).map(el=>el.getBoundingClientRect());for(const l of labels){l.width=l.button.offsetWidth||180;}}
  const placed=[];for(const l of labels){const v=projected.copy(l.position).project(camera),px=(v.x*.5+.5)*innerWidth,py=(-v.y*.5+.5)*innerHeight,w=l.width||180;const box={left:px-w/2-5,right:px+w/2+5,top:py-26,bottom:py+26};const overlap=r=>box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top;const hidden=panelOpen||v.z>1||v.z<0||px<w/2+8||px>innerWidth-w/2-8||py<104||py>innerHeight-110||(mode==='walk'&&camera.position.distanceTo(l.position)>22)||hudRects.some(overlap)||placed.some(overlap);l.button.hidden=hidden;if(!hidden){placed.push(box);l.button.style.transform=`translate(${px}px,${py}px) translate(-50%,-50%)`;}}
  renderer.render(scene,camera);
 }
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<.8?52:43;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);hudMeasuredAt=-1000;});
 // Batch architecture per material AND destination so raycast navigation is preserved.
 scene.updateMatrixWorld(true);const animated=new Set(leaves.map(l=>l.mesh)),batches=new Map();
 scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||animated.has(o)||o.material.isShaderMaterial||Array.isArray(o.material)||o.children.length)return;const key=o.material.uuid+':'+(o.userData.route||'')+':'+o.castShadow+':'+o.receiveShadow;const rows=batches.get(key)||[];rows.push(o);batches.set(key,rows);});
 for(const rows of batches.values()){if(rows.length<3)continue;const geometries=rows.map(o=>{const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(g.index)return g.toNonIndexed();return g;});const keys=Object.keys(geometries[0].attributes);if(geometries.some(g=>Object.keys(g.attributes).join()!==keys.join())){geometries.forEach(g=>g.dispose());continue;}const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)continue;const first=rows[0],merged=new THREE.Mesh(geometry,first.material);merged.castShadow=first.castShadow;merged.receiveShadow=first.receiveShadow;merged.userData.route=first.userData.route;rows.forEach(o=>{o.removeFromParent();const i=objects.indexOf(o);if(i>=0)objects.splice(i,1);});scene.add(merged);if(merged.userData.route)objects.push(merged);}
 // Foliage uses four instanced draws with GPU wind, instead of hundreds of objects.
 scene.updateMatrixWorld(true);for(const mat of foliageMats){const rows=leaves.filter(l=>l.mesh.material===mat);if(!rows.length)continue;const instanced=new THREE.InstancedMesh(leafGeometry,mat,rows.length);rows.forEach((l,i)=>{instanced.setMatrixAt(i,l.mesh.matrixWorld);l.mesh.removeFromParent();});instanced.castShadow=true;instanced.receiveShadow=true;scene.add(instanced);}leaves.length=0;
 renderer.shadowMap.enabled=!lowQuality;document.querySelector('[data-world=quality]').setAttribute('aria-pressed',String(lowQuality));
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');const residents=createCourtyardPets(scene,objects);
 document.getElementById('world-loading')?.remove();window.lucide?.createIcons();requestAnimationFrame(frame);onStatus?.('ready');
 return {setMode,focus,toggleDay,reset,quality,get mode(){return mode;}};
}
