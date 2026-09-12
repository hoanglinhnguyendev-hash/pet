import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const courtyardResidents=[
 {id:'p-milo',name:'Milo',species:'DOG',coat:0xd4a15e,accent:0xf4dcaf,collar:0x458c79,center:[-7.7,1.4],radii:[1.35,1.6],phase:0,activity:'walk'},
 {id:'p-teddy',name:'Teddy',species:'DOG',coat:0xb37b4b,accent:0xe7c696,collar:0x6a91b5,center:[9.4,3.4],radii:[1.8,1.4],phase:8,activity:'walk'},
 {id:'p-mochi',name:'Mochi',species:'CAT',coat:0x30383a,accent:0xf4efdf,collar:0xc78a66,center:[-18.4,3],radii:[1,1.1],phase:15,activity:'walk'},
 {id:'p-bong',name:'Bông',species:'CAT',coat:0xdab18b,accent:0xffefcf,collar:0xa592b6,center:[-18.6,12],radii:[0,0],phase:3,activity:'rest'},
 {id:'p-bun',name:'Bún',species:'DOG',coat:0xddceb0,accent:0x785c43,collar:0xd48672,center:[-3.3,12],radii:[.7,.7],phase:11,activity:'play'},
 {id:'p-luna',name:'Luna',species:'CAT',coat:0xc4884d,accent:0xf1e2c7,collar:0x75a3a5,center:[4.4,-12.5],radii:[.7,.75],phase:21,activity:'sniff'}
];
export function createCourtyardPets(scene,clickTargets){
 const sphere=new THREE.SphereGeometry(1,12,9),eyeMat=new THREE.MeshStandardMaterial({color:0x172c26,roughness:.32}),noseMat=new THREE.MeshStandardMaterial({color:0x3d2d2a,roughness:.55});
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.88});const roots=[],animals=[];
 function part(g,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function box(g,m,x,y,z,w,h,d){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;}
 function rigidBatch(group){for(const child of [...group.children])if(child.isGroup)rigidBatch(child);const buckets=new Map();for(const o of group.children)if(o.isMesh&&!o.userData.keepAnimated){const rows=buckets.get(o.material)||[];rows.push(o);buckets.set(o.material,rows);}
  for(const [material,rows] of buckets){if(rows.length<2)continue;const gs=rows.map(o=>{o.updateMatrix();const g=o.geometry.clone();g.applyMatrix4(o.matrix);return g.index?g.toNonIndexed():g;});const geo=mergeGeometries(gs);gs.forEach(g=>g.dispose());if(!geo)continue;rows.forEach(o=>o.removeFromParent());const merged=new THREE.Mesh(geo,material);merged.castShadow=true;merged.receiveShadow=true;group.add(merged);}}
 for(const spec of courtyardResidents){const root=new THREE.Group();root.name=spec.name;root.userData.petId=spec.id;root.scale.setScalar(spec.species==='CAT'?1.45:1.3);scene.add(root);roots.push(root);const cat=spec.species==='CAT',coat=mat(spec.coat),accent=mat(spec.accent),collarMat=mat(spec.collar);const torso=new THREE.Group();root.add(torso);
  const height=cat?.48:.66,length=cat?.45:.62,width=cat?.23:.31;
  part(torso,coat,0,height,0,width,cat?.23:.32,length);part(torso,accent,0,height-.045,.32,width*.86,.22,.22);
  const head=new THREE.Group();head.position.set(0,cat?.75:1.02,cat?.47:.64);torso.add(head);
  part(head,coat,0,0,0,cat?.26:.29,cat?.23:.3,cat?.22:.28);
  part(head,accent,0,-.09,cat?.2:.27,cat?.15:.19,.12,cat?.13:.22);
  part(head,noseMat,0,-.045,cat?.306:.463,cat?.045:.074,.045,.045);
  const eyes=[];for(const side of [-1,1]){const eye=part(head,eyeMat,side*(cat?.13:.145),.035,cat?.192:.244,.036,.047,.024);eye.userData.keepAnimated=true;eyes.push(eye);part(head,mat(0xffffff),side*(cat?.12:.135),.051,cat?.212:.265,.011,.013,.008);}
  const ears=[];for(const side of [-1,1]){const ear=new THREE.Group();ear.position.set(side*.22,cat?.16:.14,-.015);head.add(ear);
   if(cat){const shape=new THREE.Shape();shape.moveTo(-.11,0);shape.lineTo(0,.29);shape.lineTo(.11,0);shape.closePath();const outer=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.07,bevelEnabled:true,bevelSegments:1,bevelSize:.025,bevelThickness:.018}),coat);outer.rotation.z=-side*.2;ear.add(outer);const inside=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat(0xc8958c));inside.scale.set(.6,.65,1);inside.position.set(0,.025,.1);ear.add(inside);}
   else{part(ear,spec.id==='p-bun'?accent:coat,side*.05,-.18,0,.14,.28,.11);ear.rotation.z=side*.16;}
   ears.push(ear);
  }
  // A collar and a small round tag make each resident easy to recognise.
  const collar=new THREE.Mesh(new THREE.TorusGeometry(cat?.2:.245,.037,6,22),collarMat);collar.rotation.x=Math.PI/2;collar.position.set(0,cat?.66:.86,cat?.41:.51);torso.add(collar);part(torso,mat(0xe9c779),0,cat?.57:.74,cat?.59:.73,.05,.06,.025);
  const legs=[];for(const [side,front] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const leg=new THREE.Group();leg.position.set(side*width*.72,cat?.4:.56,front*(cat?.29:.39));root.add(leg);part(leg,coat,0,cat?-.14:-.2,0,cat?.072:.09,cat?.18:.24,cat?.074:.095);part(leg,accent,0,cat?-.31:-.46,.048,cat?.088:.11,.07,cat?.13:.16);legs.push({group:leg,front,side});}
  const tail=new THREE.Group();tail.position.set(0,cat?.53:.74,-length*.85);torso.add(tail);const tails=[];let previous=tail;
  for(let i=0;i<(cat?5:3);i++){const bone=new THREE.Group();if(i)bone.position.z=-.17;previous.add(bone);part(bone,i===4?accent:coat,0,0,-.085,cat?.043:.075,cat?.043:.065,.13);bone.rotation.x=cat?-.27:-.17;tails.push(bone);previous=bone;}
  // Small whiskers are actual thin geometry, not an image texture.
  if(cat)for(const side of [-1,1])for(let n=0;n<2;n++){const whisker=box(head,accent,side*.23,-.065+n*.04,.23,.22,.008,.008);whisker.rotation.z=side*(n?-.12:.12);}
  rigidBatch(root);root.traverse(o=>{if(o.isMesh){o.userData.route='pet/'+spec.id;o.userData.petName=spec.name;clickTargets.push(o);}});
  // Very soft contact shadow remains useful when low-quality mode disables shadow maps.
  const shadowMat=new THREE.MeshBasicMaterial({color:0x163b24,transparent:true,opacity:.14,depthWrite:false});const shadow=new THREE.Mesh(new THREE.CircleGeometry(.66,24),shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.y=.09;shadow.scale.set(.7,1.1,1);scene.add(shadow);
  let nameplate=null;const canvas=document.createElement('canvas');canvas.width=384;canvas.height=96;const ctx=canvas.getContext?.('2d');if(ctx){ctx.fillStyle='#163b32';ctx.fillRect(0,0,384,96);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff8e9';ctx.font='700 36px "Petcare Sans", sans-serif';ctx.fillText(spec.name+' ↗',192,48);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;nameplate=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:true}));nameplate.scale.set(1.35,.34,1);nameplate.position.y=cat?1.65:2;nameplate.userData.route='pet/'+spec.id;nameplate.userData.petName=spec.name;scene.add(nameplate);clickTargets.push(nameplate);}
  animals.push({spec,root,torso,head,eyes,ears,legs,tail,tails,shadow,nameplate});
 }
 // Beds and toys belong to the pet areas and remain outside circulation routes.
 const props=new THREE.Group();props.name='Pet play and rest areas';scene.add(props);const bedMat=mat(0x8aa28a);
 const bed=new THREE.Mesh(new THREE.TorusGeometry(.68,.13,9,32),bedMat);bed.rotation.x=-Math.PI/2;bed.position.set(-18.6,.16,12);props.add(bed);const cushion=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.12,28),mat(0xe8d8b9));cushion.position.set(-18.6,.13,12);props.add(cushion);
 const ball=part(props,mat(0xe9a269),-3.3,.22,12,.2,.2,.2);const ballStripe=new THREE.Mesh(new THREE.TorusGeometry(.195,.022,5,20),mat(0xffffff));ball.add(ballStripe);ballStripe.scale.setScalar(5);
 for(const [x,z] of [[-6.7,-.9],[7.2,5.6]]){const bowl=new THREE.Mesh(new THREE.TorusGeometry(.21,.055,8,20),mat(0x799aaa));bowl.rotation.x=-Math.PI/2;bowl.position.set(x,.13,z);props.add(bowl);const water=new THREE.Mesh(new THREE.CircleGeometry(.18,20),new THREE.MeshBasicMaterial({color:0x88b7c0}));water.rotation.x=-Math.PI/2;water.position.set(x,.14,z);props.add(water);}
 const ease=x=>x*x*(3-2*x);
 function update(t,night=false,reduced=false,cameraPosition=null){for(const a of animals){const {spec:s,root,torso,head,legs,ears,eyes,tail,tails,shadow}=a;const clock=t+s.phase,cycle=clock%28;const resting=s.activity==='rest';let gait=0,speed=0;
   // Integrate an eased travel phase: movement gently starts/stops with a six-second rest.
   const phase=cycle<2?cycle*cycle/4:cycle<20?cycle-1:cycle<22?19+(cycle-20)-(cycle-20)*(cycle-20)/4:20;
   const angle=(Math.floor(clock/28)*20+phase)*.16;const moving=!resting&&cycle<22;
   if(!resting){root.position.set(s.center[0]+Math.cos(angle)*s.radii[0],.07,s.center[1]+Math.sin(angle)*s.radii[1]);root.rotation.y=Math.atan2(-Math.sin(angle)*s.radii[0],Math.cos(angle)*s.radii[1]);speed=moving?(cycle<2?cycle/2:cycle>20?(22-cycle)/2:1):0;gait=Math.sin(phase*8+s.phase)*speed;}
   else{root.position.set(s.center[0],.07,s.center[1]);root.rotation.y=-.8;}
   const settle=resting?1:cycle>22?ease(Math.min(1,(cycle-22)/1.5)):cycle<1.5?1-ease(cycle/1.5):0;
   torso.position.y=-settle*(s.species==='CAT'?.15:.12);torso.rotation.z=!reduced?Math.sin(clock*2)*.015:0;torso.scale.y=1+Math.sin(clock*2.2)*.012;
   for(const leg of legs){leg.group.rotation.x=(leg.front===leg.side?1:-1)*gait*.43*(reduced?.35:1)+settle*.65;}
   head.rotation.x=(s.activity==='sniff'?.24:0)+Math.sin(clock*.9)*.055+settle*.15;head.rotation.y=Math.sin(clock*.65)*.1*(moving?.35:1);
   tail.rotation.y=Math.sin(clock*(s.species==='DOG'?7:1.7))*(s.species==='DOG'?.4:.18);for(let i=0;i<tails.length;i++)tails[i].rotation.x=(s.species==='CAT'?-.27:-.17)+Math.sin(clock*1.7+i*.7)*.045;
   ears.forEach((e,i)=>{if(s.species==='DOG')e.rotation.x=gait*.16;else e.rotation.z=(i?-.2:.2)+Math.sin(clock*.5+i)*.055;});
   const blink=(clock%4.8)>4.64;eyes.forEach(e=>e.scale.y=blink?.005:.047);shadow.position.x=root.position.x;shadow.position.z=root.position.z;shadow.rotation.z=-root.rotation.y;shadow.material.opacity=night?.22:.14;if(a.nameplate){a.nameplate.position.x=root.position.x;a.nameplate.position.z=root.position.z;a.nameplate.visible=!cameraPosition||cameraPosition.distanceTo(root.position)<24;}
  }
  ball.position.set(-3.3+Math.sin(t*.65)*.27,.22+Math.abs(Math.sin(t*1.3))*.06,12+Math.cos(t*.65)*.24);ball.rotation.x=t*.6;
 }
 update(0);return {update,animals,roots,props};
}
