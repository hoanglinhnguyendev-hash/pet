import * as THREE from 'three';

/** Five destinations with distinct silhouettes and visible, functional signage. */
export function createPavilions(scene,stations,objects,obstacles,lights){
 const material=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const m={wood:material(0xbc9466),timber:material(0x76563b),cream:material(0xf4e8d0),white:material(0xe9f2ef),green:material(0x366c50),roof:material(0xad614c),orange:material(0xe2a15e),blue:material(0x5b9eaa),dark:material(0x25413c),cushion:material(0xcbd4b5),glass:new THREE.MeshPhysicalMaterial({color:0xcce7e6,transparent:true,opacity:.27,roughness:.15,metalness:.08,side:THREE.DoubleSide})};
 const mesh=(g,mat,x,y,z,parent)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(w,h,d,mat,x,y,z,g)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,g);
 const cyl=(r,h,mat,x,y,z,g)=>mesh(new THREE.CylinderGeometry(r,r,h,24),mat,x,y,z,g);
 function sign(text,sub,w,h,x,y,z,g,bg='#234c40'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext?.('2d');let mat;
  if(ctx){ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.strokeStyle='#ffffff45';ctx.lineWidth=5;ctx.strokeRect(14,14,996,228);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff7e5';ctx.font='700 54px "Petcare Sans", sans-serif';ctx.fillText(text,512,99,950);ctx.fillStyle='#dfebe0';ctx.font='400 30px "Petcare Sans", sans-serif';ctx.fillText(sub,512,175,950);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;mat=new THREE.MeshBasicMaterial({map});}
  else mat=new THREE.MeshBasicMaterial({color:0x234c40});
  const o=mesh(new THREE.PlaneGeometry(w,h),mat,x,y,z,g);o.castShadow=false;return o;
 }
 function roof(w,d,eave,rise,mat,g){const a=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise);for(const side of [-1,1]){const r=box(length+.24,.2,d,mat,side*w/4,eave+rise/2,0,g);r.rotation.z=-side*a;}box(.15,.15,d+.05,m.cream,0,eave+rise,0,g);}
 function plant(x,z,g){cyl(.28,.55,m.cream,x,.7,z,g);for(let i=0;i<5;i++){const a=i*1.25;const leaf=mesh(new THREE.SphereGeometry(.3,8,6),m.green,x+Math.cos(a)*.17,1.05+Math.sin(i)*.12,z+Math.sin(a)*.17,g);leaf.scale.set(.6,1.5,.65);}}
 function paw(x,y,z,g,scale=1){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);g.add(group);const pad=mesh(new THREE.SphereGeometry(.25,12,8),m.cream,0,0,0,group);pad.scale.set(1,.8,.3);for(const [xx,yy] of [[-.28,.25],[-.1,.38],[.1,.38],[.28,.25]]){const toe=mesh(new THREE.SphereGeometry(.105,10,8),m.cream,xx,yy,0,group);toe.scale.z=.4;}}
 function kennel(x,z,g,color=m.wood){box(1.4,.95,1.1,color,x,.97,z,g);const k=new THREE.Group();k.position.set(x,0,z);g.add(k);roof(1.6,1.3,1.5,.5,m.roof,k);const hole=mesh(new THREE.CircleGeometry(.36,24),m.dark,x,.99,z+.56,g);hole.scale.y=1.18;box(.7,.09,.55,m.cushion,x,.51,z+.9,g);}
 const descriptions=[['NHÀ TÌM MÁI ẤM','Làm quen · Kết nối · Nhận nuôi'],['TRẠM CỨU TRỢ','Tiếp nhận vật phẩm · Cùng sẻ chia'],['NHÀ KẾT NỐI','Gặp gỡ · Trao đổi · Cam kết'],['VƯỜN CHĂM SÓC','Sức khỏe · Hậu kiểm · Đồng hành'],['NHÀ ĐIỀU PHỐI','Hỗ trợ cộng đồng · Quản lý hồ sơ']];
 stations.forEach((st,i)=>{const g=new THREE.Group();g.name=st.name;g.position.set(st.position[0],0,st.position[2]);scene.add(g);const w=8.5,d=6,h=3.7;
  box(w+1,.26,d+2,m.cream,0,.15,.35,g);box(w,.18,d,m.wood,0,.36,0,g);box(w,h,.22,i===1?m.orange:i===3?m.white:m.cream,0,h/2+.45,-d/2,g);
  for(const side of [-1,1]){box(.2,h,d, i===3?m.white:m.wood,side*w/2,h/2+.45,0,g);box(2.25,2.25,.065,m.glass,side*2.82,1.98,d/2,g);for(const x of [side*1.65,side*3.99])box(.1,3.3,.13,m.dark,x,2,d/2+.03,g);}
  // Clear central entrance and a front step, with sign above the opening.
  box(2.9,.18,1.1,m.cream,0,.12,4,g);plant(-3.8,3.6,g);plant(3.8,3.6,g);
  if(i===0){roof(9.5,7.5,4.05,1.7,m.roof,g);for(const x of [-2.8,0,2.8])kennel(x,-1.6,g);paw(0,4.64,3.82,g,.9);sign(...descriptions[i],6.7,.96,0,3.42,3.15,g);for(const side of [-1,1]){const awning=box(2.4,.12,1.7,m.green,side*2.75,3.25,3.7,g);awning.rotation.x=.13;}
   // Low welcome fence with an open walkway.
   for(const side of [-1,1])for(let n=0;n<7;n++)box(.11,.72,.11,m.cream,side*(1.75+n*.48),.66,4.3,g);
   sign('PETCARE · NHẬN NUÔI','Mỗi bạn nhỏ, một cơ hội mới',2.5,.65,-5.55,1.35,2,g);box(.12,1.5,.12,m.wood,-5.55,.77,1.95,g);
  }else if(i===1){roof(9.5,7.5,4.05,1.05,m.dark,g);box(9.2,.19,2.3,m.orange,0,3.3,3.8,g);for(const x of [-4.3,4.3])box(.13,3.3,.13,m.dark,x,1.7,4.7,g);sign(...descriptions[i],6.8,.98,0,3.73,3.08,g,'#795033');
   for(let col=0;col<3;col++){box(1.4,.16,1.2,m.timber,-2.7+col*2.7,.58,-1.9,g);for(let n=0;n<3;n++)box(1.15,.58,1.0,n%2?m.cream:m.orange,-2.7+col*2.7,.94+n*.6,-1.9,g);}
   for(const [x,t] of [[-2.8,'THỨC ĂN'],[0,'CHĂN ẤM'],[2.8,'VẬT TƯ']])sign(t,'Tiếp nhận tại đây',1.8,.52,x,2.98,-1.33,g,'#795033');
   const cart=new THREE.Group();cart.position.set(5.25,0,.5);g.add(cart);box(1.1,.12,1.65,m.blue,0,.5,0,cart);box(1,.8,.9,m.orange,0,.97,0,cart);for(const x of [-.46,.46])for(const z of [-.63,.63]){const wheel=cyl(.17,.12,m.dark,x,.25,z,cart);wheel.rotation.z=Math.PI/2;}box(.08,1.3,.08,m.dark,.45,1,-.7,cart);box(.08,1.3,.08,m.dark,-.45,1,-.7,cart);box(1,.08,.08,m.dark,0,1.6,-.7,cart);
  }else if(i===2){box(9.6,.22,7.4,m.timber,0,4.17,0,g);for(let n=0;n<12;n++)box(.16,.25,8,m.wood,-4.4+n*.8,4.36,0,g);sign(...descriptions[i],6.8,.98,0,3.58,3.13,g,'#61583e');
   // Conversation table, four seats and a commitment desk visible through glazing.
   cyl(1.08,.13,m.wood,0,1.38,.2,g);cyl(.13,.95,m.dark,0,.88,.2,g);for(const [x,z] of [[-1.65,.2],[1.65,.2],[0,1.85],[0,-1.45]]){box(.85,.42,.85,m.cushion,x,.74,z,g);box(.75,.58,.1,m.wood,x,1.18,z-.4,g);}
   box(2.3,1.05,.75,m.cream,-2.7,.99,-1.95,g);sign('LỊCH GẶP HÔM NAY','Hẹn một ngày, đón một người bạn',2.7,1.08,2.35,2.05,-2.82,g,'#61583e');
   const swing=new THREE.Group();swing.position.set(5.8,0,.9);g.add(swing);for(const x of [-1.15,1.15])box(.16,2.65,.16,m.timber,x,1.33,0,swing);box(2.6,.18,.25,m.timber,0,2.68,0,swing);for(const x of [-.75,.75])box(.025,1.7,.025,m.dark,x,1.77,0,swing);box(1.8,.14,.6,m.wood,0,.92,0,swing);
  }else if(i===3){box(9.6,.28,7.1,m.white,0,4.25,0,g);box(9.5,.16,1.8,m.blue,0,3.65,3.9,g);for(const x of [-4.2,4.2])cyl(.08,3.7,m.blue,x,1.92,4.45,g);sign(...descriptions[i],6.5,.97,0,3.22,3.12,g,'#315f67');
   box(.26,1.2,.12,m.green,0,4.98,3.02,g);box(1.2,.26,.12,m.green,0,4.98,3.02,g);box(2.5,.18,1.05,m.blue,0,1.25,-.65,g);for(const x of [-1,1])box(.12,.8,.12,m.dark,x,.77,-.65,g);box(1.35,2.2,.6,m.white,-2.8,1.6,-2.5,g);for(let n=0;n<3;n++){box(1.2,.06,.55,m.blue,-2.8,1+n*.6,-2.16,g);for(let j=0;j<3;j++)cyl(.09,.25,m.cream,-3.1+j*.3,1.15+n*.6,-2.12,g);}kennel(2.7,-1.7,g,m.white);
   // Outdoor agility and gentle exercise area beside care pavilion.
   const hoop=mesh(new THREE.TorusGeometry(.65,.08,8,32),m.blue,5.6,1.05,1.1,g);box(.14,1.05,.14,m.wood,5.6,.52,1.1,g);for(let j=0;j<4;j++)cyl(.055,.9,j%2?m.blue:m.orange,5.5,.5,-1.9-j*.85,g);
  }else{roof(9.6,7.1,4.3,1.4,m.green,g);sign(...descriptions[i],7.1,1.02,0,3.65,3.11,g);box(5.3,1.1,1,m.wood,0,1.02,.1,g);for(const x of [-1.65,1.65]){box(.95,.62,.09,m.dark,x,1.92,-.03,g);box(.12,.3,.12,m.dark,x,1.51,0,g);}
   sign('PETCARE HUB','Thông tin · Hỗ trợ · Cộng đồng',5,1.25,0,2.5,-2.85,g);for(let i=0;i<6;i++)box(.46,1.5,.6,i%2?m.blue:m.cream,-2.5+i,.99,-2.3,g);
   // Small clock tower makes the coordinator a clear landmark.
   box(1.2,1.8,1.2,m.cream,0,6.1,-.2,g);const clock=mesh(new THREE.CircleGeometry(.44,32),m.white,0,6.28,.42,g);box(.035,.3,.03,m.dark,0,6.4,.45,g);const hand=box(.26,.035,.03,m.dark,.12,6.28,.46,g);const cap=new THREE.Group();cap.position.z=-.2;g.add(cap);roof(1.6,1.6,7,.6,m.green,cap);
  }
  const glow=material(0xffe7b3);glow.emissive=new THREE.Color(0xffc47d);glow.emissiveIntensity=.2;for(const x of [-3.7,3.7])mesh(new THREE.SphereGeometry(.16,12,8),glow,x,2.8,3.2,g);lights.push(glow);const lamp=new THREE.PointLight(0xffd29a,0,12,2);lamp.position.set(0,2.8,2.2);g.add(lamp);lights.push(lamp);
  g.traverse(o=>{if(o.isMesh){o.userData.route=st.id;objects.push(o);}});obstacles.push({x:st.position[0],z:st.position[2],hw:w/2+.22,hd:d/2+.2});
 });
}
