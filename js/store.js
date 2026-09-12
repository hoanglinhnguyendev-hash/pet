import {createSeed,DEMO_PASSWORD} from './seed.js';
import {command,runScheduler,nowOf} from './domain.js';
const KEY='petcare-hub-state-v1',SESSION='petcare-hub-session-v1';
const events=new EventTarget();
let memory;
function read(){try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(s.version===1&&Array.isArray(s.users)&&Array.isArray(s.pets))return s;}}catch{}return memory||createSeed();}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));memory=s;events.dispatchEvent(new Event('change'));}
memory=read();if(!localStorage.getItem(KEY))save(memory);
export const store={
 get state(){memory=read();return memory;},
 get user(){let session;try{session=JSON.parse(sessionStorage.getItem(SESSION)||'null');}catch{}if(!session||session.expires<Date.now())return null;const u=this.state.users.find(x=>x.id===session.userId);return u?.status!=='BANNED'?u:null;},
 on(fn){events.addEventListener('change',fn);return ()=>events.removeEventListener('change',fn);},
 dispatch(type,payload){const {state,result}=command(this.state,this.user?.id,type,payload);save(state);return result;},
 demo(id){const u=this.state.users.find(x=>x.id===id);if(!u||u.status==='BANNED')throw new Error('Tài khoản không thể đăng nhập.');sessionStorage.setItem(SESSION,JSON.stringify({userId:id,expires:Date.now()+8*3600000}));const {state}=command(this.state,id,'LOGIN');save(state);},
 async login(email,password){const u=this.state.users.find(u=>u.email===email.trim().toLowerCase());if(!u||!(u.passwordHash?await verifyPassword(password,u.passwordHash):password===DEMO_PASSWORD))throw new Error('Email hoặc mật khẩu không chính xác.');this.demo(u.id);},
 async register(data){if(data.password!==data.passwordConfirm)throw new Error('Xác nhận mật khẩu chưa trùng khớp.');if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(data.password))throw new Error('Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số.');data.passwordHash=await hashPassword(data.password);delete data.password;delete data.passwordConfirm;const {state,result}=command(this.state,null,'REGISTER',data);save(state);this.demo(result);return result;},
 logout(){if(this.user)this.dispatch('LOGOUT',{});sessionStorage.removeItem(SESSION);events.dispatchEvent(new Event('change'));},
 refresh(){if(!this.user)throw new Error('Phiên đã hết hạn. Hãy đăng nhập lại.');sessionStorage.setItem(SESSION,JSON.stringify({userId:this.user.id,expires:Date.now()+8*3600000}));},
 async changePassword(oldPassword,password,confirm){const u=this.user;if(!u)throw new Error('Bạn cần đăng nhập.');if(!(u.passwordHash?await verifyPassword(oldPassword,u.passwordHash):oldPassword===DEMO_PASSWORD))throw new Error('Mật khẩu hiện tại chưa đúng.');if(password!==confirm)throw new Error('Mật khẩu xác nhận không khớp.');if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password))throw new Error('Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số.');this.dispatch('PASSWORD',{passwordHash:await hashPassword(password)});this.refresh();},
 tick(){const result=runScheduler(this.state);if(result.changed)save(result.state);},
 reset(){sessionStorage.removeItem(SESSION);save(createSeed());},
 now(){return nowOf(this.state);}
};
addEventListener('storage',event=>{if(event.key===KEY){memory=read();events.dispatchEvent(new Event('change'));}});
setInterval(()=>{try{store.tick();}catch{}},30000);
export async function hashPassword(password,salt){const encoder=new TextEncoder(),s=salt||crypto.getRandomValues(new Uint8Array(16));const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:s,iterations:120000,hash:'SHA-256'},key,256);return {salt:Array.from(s),hash:Array.from(new Uint8Array(bits)),iterations:120000};}
export async function verifyPassword(password,stored){const value=await hashPassword(password,new Uint8Array(stored.salt));return value.hash.every((v,i)=>v===stored.hash[i]);}

let fileDB;
const fileURLs=new Map();
async function openFiles(){if(fileDB)return fileDB;fileDB=await new Promise((resolve,reject)=>{const r=indexedDB.open('petcare-hub-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Không mở được bộ nhớ tệp của trình duyệt.'));});return fileDB;}
export async function saveFile(file){
 if(!file.type.startsWith('image/')&&!file.type.startsWith('video/')&&file.type!=='application/pdf')throw new Error('Chỉ hỗ trợ ảnh, video hoặc PDF.');
 if(file.size>12*1024*1024)throw new Error(`${file.name}: giới hạn 12 MB mỗi tệp.`);
 const id=crypto.randomUUID(),db=await openFiles();
 await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put({id,name:file.name,type:file.type,blob:file,createdAt:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(new Error('Không đủ bộ nhớ để lưu tệp.'));});
 return `local:${id}`;
}
export async function fileURL(ref){if(!ref)return '';if(!ref.startsWith('local:'))return ref;if(fileURLs.has(ref))return fileURLs.get(ref);const db=await openFiles();const record=await new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(ref.slice(6));r.onsuccess=()=>resolve(r.result);r.onerror=reject;});if(!record)return '';const url=URL.createObjectURL(record.blob);fileURLs.set(ref,url);return url;}
export async function hydrateMedia(root=document){for(const el of root.querySelectorAll('[data-media]')){try{const url=await fileURL(el.dataset.media);if(url){if(el.tagName==='A')el.href=url;else el.src=url;}}catch{el.setAttribute('alt','Không đọc được tệp cục bộ.');}}}
export async function collectForm(form){const data=Object.fromEntries(new FormData(form));for(const el of form.querySelectorAll('input[type="checkbox"]'))data[el.name]=el.checked;for(const input of form.querySelectorAll('input[type="file"]')){const values=[];for(const file of input.files)values.push(await saveFile(file));data[input.name]=values;}return data;}
