import {store,collectForm,hydrateMedia,fileURL} from './store.js';
import {publicStats,publicPets} from './domain.js';
import {declarations} from './seed.js';
import * as P from './views-public.js';
import * as U from './views-user.js';
import * as A from './views-admin.js';
import {esc,icon,btn,input,select,textarea,upload,hidden,formEnd,toast,openModal,closeModal,empty,callout,localInputDate} from './ui.js';
import {createWorld} from './world.js';
const shell=document.querySelector('#panel-shell'),content=document.querySelector('#workspace-content');
let world,busy=false,tourIndex=0;
const route=()=>{const [path,query='']=(location.hash.slice(1)||'home').split('?');return {path,parts:path.split('/'),q:new URLSearchParams(query)}};
function go(path){if(location.hash==='#'+path)render();else location.hash=path;}
function decorate(){window.lucide?.createIcons();hydrateMedia();}
function header(){const u=store.user;document.querySelector('#account-button').innerHTML=icon('user-round')+`<span>${esc(u?u.name.split(' ').slice(-1)[0]:'Đăng nhập')}</span>`;const count=store.state.notifications.filter(n=>n.userId===u?.id&&!n.readAt).length;const el=document.querySelector('#notification-count');el.hidden=!count;el.textContent=count;}
function render(){const {parts:[name,id],q}=route(),s=store.state,u=store.user;header();document.querySelector('#main-nav').classList.remove('open');document.querySelector('[data-action=menu]').setAttribute('aria-expanded','false');document.querySelectorAll('[data-nav]').forEach(e=>e.classList.toggle('active',e.dataset.nav===name));
 shell.hidden=name==='home';document.body.classList.toggle('panel-open',!shell.hidden);
 if(name==='home'){const p=publicPets(s).find(x=>x.featured)||publicPets(s)[0],stats=publicStats(s);document.querySelector('#world-feature').innerHTML=p?`<a class="featured-pet" href="#pet/${p.id}"><img src="${esc(p.cover)}" alt="${esc(p.name)}"><div><span class="eyebrow">ĐANG CHỜ BẠN</span><h3>${esc(p.name)}</h3><p>${esc(p.breed)}</p><span class="text-link">Làm quen ${icon('arrow-up-right')}</span></div></a><a class="home-impact" href="#impact"><strong>${stats.adopted}</strong><span>người bạn đã có mái ấm</span>${icon('heart')}</a><div class="home-counts">${[['Tổng Pet',stats.total],['Đã nhận nuôi',stats.adopted],['Chó có nhà',stats.dogs],['Mèo có nhà',stats.cats],['Đơn nhận nuôi',stats.applications],['Đang tìm nhà',stats.waiting]].map(([k,v])=>`<a href="#impact"><b>${v}</b><span>${k}</span></a>`).join('')}</div>`:'';decorate();return;}
 const publicRoutes=['pets','pet','rescue','impact','guide','login','register','account'];
 let html;
 try{if(!u&&!publicRoutes.includes(name))html=U.authView();else if(name==='admin'&&u?.role!=='ADMIN')html=empty('Khu vực dành cho quản trị viên','Bạn có thể đổi vai trò trong bản trải nghiệm.',btn('Đổi vai trò','demo'));
 else switch(name){
 case 'pets':html=P.petsView(s,q);break;case 'pet':html=P.petDetail(s,u,id);break;
 case 'pet-new':html=P.petEditor(s,u);break;case 'pet-edit':html=P.petEditor(s,u,id);break;case 'my-pets':html=P.myPetsView(s,u);break;
 case 'rescue':html=id?P.rescueDetail(s,u,id):P.rescueView(s,u,q);break;case 'rescue-new':html=P.rescueEditor(s,u);break;case 'rescue-edit':html=P.rescueEditor(s,u,id);break;
 case 'impact':html=P.impactView(s);break;case 'guide':html=P.guideView();break;
 case 'account':case 'profile':html=U.accountView(s,u);break;case 'login':case 'register':html=U.authView(name);break;case 'identity':html=U.identityView(s,u);break;
 case 'applications':html=U.applicationsView(s,u,q);break;case 'apply':html=U.applyView(s,u,id);break;case 'application':html=U.applicationDetail(s,u,id);break;
 case 'appointments':html=U.appointmentsView(s,u);break;case 'appointment-new':html=U.appointmentEditor(s,u,id);break;case 'appointment-edit':html=U.appointmentEditor(s,u,id,true);break;
 case 'tracking':html=U.trackingView(s,u,id);break;case 'checkin':html=U.checkinView(s,u,id);break;case 'reports':html=U.reportsView(s,u);break;case 'notifications':html=U.notificationsView(s,u);break;
 case 'admin':{const view={dashboard:A.adminDashboard,users:A.adminUsers,identities:A.adminIdentities,pets:A.adminPets,applications:A.adminApplications,rescues:A.adminRescues,reports:A.adminReports,logs:A.adminLogs}[id||'dashboard'];html=view?view(s,q):empty('Không tìm thấy trang');break;}
 default:html=empty('Không tìm thấy trang','Chọn chức năng từ thanh điều hướng.');}
 }catch(e){console.error(e);html=callout('Không mở được màn hình này: '+esc(e.message),'error');}
 content.innerHTML=`<div class="workspace-toolbar"><a href="#home">${icon('arrow-left')} Trở về khu vườn</a><div>${u?`<a href="#account">${icon('layout-grid')} Không gian của tôi</a>${btn('Đăng xuất','logout','','text-btn')}`:''}<a href="#home" class="icon-btn" aria-label="Đóng">${icon('x')}</a></div></div>`+html;decorate();}
function modalForm(title,command,fields,values={}){openModal(title,`<form data-form="command">${hidden('command',command)}${Object.entries(values).map(([k,v])=>hidden(k,v)).join('')}${fields}${formEnd('Xác nhận')}`);decorate();}
function reason(title,command,data,field='reason'){modalForm(title,command,textarea(field==='resolution'?'Kết luận':'Lý do',field,'',{required:true}),data);}
function commit(cmd,data={}){const result=store.dispatch(cmd,data);render();return result;}
function needUser(){if(store.user)return true;go('login');toast('Hãy đăng nhập để tiếp tục.','info');return false;}
document.addEventListener('click',async e=>{const n=e.target.closest('[data-notification]');if(n&&store.user)store.dispatch('NOTIFICATION_READ',{id:n.dataset.notification});const el=e.target.closest('[data-action],[data-world]');if(!el)return;const d=el.dataset;try{
 if(d.world){if(!world)return;if(['orbit','walk'].includes(d.world)){world.setMode(d.world);document.querySelectorAll('[data-world="orbit"],[data-world="walk"]').forEach(x=>x.classList.toggle('active',x.dataset.world===d.world));}else if(d.world==='day')world.toggleDay();else if(d.world==='quality'){world.quality();toast('Đã đổi mức đồ họa.');}else if(d.world==='reset')world.reset();else if(d.world==='fullscreen'){if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}return;}
 const id=d.id,status=d.status;
 switch(d.action){
 case 'close-modal':closeModal();break;case 'account':go('account');break;case 'notifications':go('notifications');break;case 'menu':{const opened=document.querySelector('#main-nav').classList.toggle('open');el.setAttribute('aria-expanded',String(opened));break;}
 case 'logout':store.logout();go('home');break;case 'demo-login':store.demo(id);closeModal();go('account');toast('Đã chuyển vai trò.');break;
 case 'demo':openModal('Bản trải nghiệm PETCARE HUB',callout('Không gian 3D và nghiệp vụ chạy cục bộ. Dữ liệu mẫu được lưu trên trình duyệt này. Không dùng giấy tờ thật.')+U.authView()+ (store.user?.role==='ADMIN'?`<hr><h3>Mô phỏng thời gian hậu kiểm</h3><p>Đẩy thời gian để xem nhắc nhở và cảnh báo.</p>${btn('Tiến 1 ngày','clock','data-days="1"')}${btn('Tiến 4 ngày','clock','data-days="4"')}<form data-form="settings">${select('Thời gian hậu kiểm mới','trackingMonths',store.state.settings.trackingMonths,[[2,'2 tháng'],[3,'3 tháng']],{empty:false})}${formEnd('Lưu')}</form>`:''),true);break;
 case 'clock':commit('CLOCK',{days:d.days});store.tick();toast('Đã cập nhật thời gian mô phỏng.');break;
 case 'refresh-session':store.refresh();toast('Phiên đăng nhập đã được làm mới.');break;
 case 'reset-demo':modalForm('Khôi phục dữ liệu mẫu','RESET',callout('Các thay đổi nghiệp vụ trên trình duyệt này sẽ được thay bằng dữ liệu mẫu.'));break;
 case 'tour':world?.focus(['pets','rescue','appointments','tracking','admin'][tourIndex++%5]);break;
 case 'toggle-filters':{const panel=document.querySelector('#advanced-filters');panel.hidden=!panel.hidden;el.setAttribute('aria-expanded',String(!panel.hidden));break;}
 case 'gallery':document.querySelector('[data-main-image]').src=await fileURL(d.src);break;
 case 'apply-gate':go('apply/'+id);break;
 case 'map':{const p=store.state.pets.find(x=>x.id===id),coords=d.lat&&d.lng&&Number.isFinite(Number(d.lat))&&Number.isFinite(Number(d.lng))?`${Number(d.lat)},${Number(d.lng)}`:'';openModal('Khu vực bàn giao',`<p>${esc(p?.handoverLocation||p?.city||d.address||'Chưa cung cấp địa điểm')}</p><a class="btn dark" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords||p?.handoverLocation||p?.city||d.address||'Việt Nam')}" target="_blank" rel="noopener">Mở Google Maps ${icon('external-link')}</a>`);break;}
 case 'report':if(needUser()){openModal('Gửi báo cáo',U.reportModal(store.state,d.type||'CONTENT',id,d.application||''));decorate();}break;
 case 'admin-user':openModal('Thông tin & xử lý người dùng',A.adminUserModal(store.state,id,d.report));decorate();break;
 case 'pet-submit':commit('PET_SUBMIT',{id});toast('Đã gửi bài chờ duyệt.');break;
 case 'pet-delete':modalForm('Xóa bài thú cưng','PET_DELETE',callout('Bài bị xóa sẽ không còn xuất hiện trong danh sách.'),{id});break;
 case 'pet-state':commit('PET_STATE',{id,status});toast('Đã cập nhật trạng thái.');break;
 case 'pet-review':commit('PET_REVIEW',{id,status});toast('Đã duyệt bài.');break;
 case 'pet-reject':reason('Từ chối bài thú cưng','PET_REVIEW',{id,status:'REJECTED'});break;
 case 'pet-visibility':commit('PET_VISIBILITY',{id});break;case 'pet-featured':commit('PET_FEATURED',{id});break;
 case 'identity-review':commit('IDENTITY_REVIEW',{id,status});toast('Đã xác minh hồ sơ.');break;case 'identity-reject':reason('Yêu cầu bổ sung xác minh','IDENTITY_REVIEW',{id,status:'FAILED'});break;
 case 'application-review':commit('APPLICATION_REVIEW',{id,status});toast('Đã cập nhật hồ sơ.');break;
 case 'application-reject':reason('Từ chối lời đề nghị','APPLICATION_REVIEW',{id,status:'REJECTED'});break;case 'application-cancel':reason('Hủy lời đề nghị','APPLICATION_CANCEL',{id});break;
 case 'appointment-status':reason('Hủy lịch hẹn','APPOINTMENT_STATUS',{id,status},'result');break;
 case 'appointment-result':modalForm('Kết quả cuộc gặp','APPOINTMENT_STATUS',select('Trạng thái','status','COMPLETED',[['COMPLETED','Đã gặp'],['NO_SHOW','Vắng mặt']],{empty:false})+select('Kết luận','decision','PROCEED',[['PROCEED','Có thể bàn giao'],['NEED_MORE_INFO','Cần trao đổi thêm'],['REJECT','Không phù hợp']],{empty:false})+textarea('Nội dung kết quả','result','',{required:true}),{id});break;
 case 'commitment-create':modalForm('Nội dung cam kết hai bên','COMMITMENT_CREATE',textarea('Thỏa thuận chăm sóc & bàn giao','content','Hai bên đồng ý bàn giao đúng thú cưng, cung cấp thông tin trung thực, chăm sóc có trách nhiệm, không bán/đổi/bỏ rơi; duy trì hậu kiểm và thông báo sự cố.',{required:true,rows:6}),{applicationId:id});break;
 case 'commitment-sign':modalForm('Xác nhận ký cam kết','COMMITMENT_SIGN',callout('Tôi đã đọc và đồng ý với nội dung cam kết của hai bên.'),{id});break;
 case 'commitment-cancel':reason('Hủy cam kết','COMMITMENT_CANCEL',{id});break;
 case 'handover-create':modalForm('Lên lịch bàn giao','HANDOVER_CREATE',input('Địa điểm','location','Nhà kết nối Petcare',{required:true})+input('Ngày giờ dự kiến','scheduledAt',localInputDate(store.now()+86400000),{type:'datetime-local',required:true})+textarea('Ghi chú','notes',''),{applicationId:id});break;
 case 'handover-confirm':modalForm('Xác nhận đã bàn giao','HANDOVER_CONFIRM',callout('Chỉ xác nhận sau khi việc bàn giao thực tế hoàn tất. Cả hai bên cùng xác nhận để hoàn tất nhận nuôi.'),{id});break;
 case 'incident':modalForm('Thông báo sự cố','INCIDENT',select('Loại sự cố','type','ILLNESS',[['ILLNESS','Bị bệnh'],['INJURY','Bị thương'],['LOST','Bị mất'],['DEATH','Qua đời'],['OTHER','Khác']],{empty:false})+input('Thời điểm','occurredAt',localInputDate(store.now()),{type:'datetime-local',required:true})+textarea('Mô tả','description','',{required:true})+textarea('Nguyên nhân nếu biết','cause','')+upload('Bằng chứng (bắt buộc nếu qua đời)','evidence',[],{accept:'image/*,application/pdf'}),{applicationId:id});break;
 case 'incident-review':modalForm('Ghi kết quả kiểm tra','INCIDENT_REVIEW',select('Trạng thái','status','RESOLVED',[['REVIEWING','Đang kiểm tra'],['RESOLVED','Đã giải quyết']],{empty:false})+textarea('Kết quả','notes','',{required:true}),{id});break;
 case 'rescue-state':if(['CANCELLED','REJECTED'].includes(status))reason('Cập nhật bài cứu trợ','RESCUE_STATE',{id,status});else {commit('RESCUE_STATE',{id,status});toast('Đã cập nhật bài cứu trợ.');}break;
 case 'rescue-reject':reason('Từ chối bài cứu trợ','RESCUE_STATE',{id,status:'REJECTED'});break;
 case 'report-review':commit('REPORT_REVIEW',{id,status});break;case 'report-resolve':reason('Kết luận báo cáo','REPORT_REVIEW',{id,status},'resolution');break;
 case 'notifications-read':commit('NOTIFICATION_READ',{});break;
 case 'export-report':{const q=route().q;A.exportAdminCSV(store.state,d.group,q);commit('EXPORT',{group:d.group,filters:Object.fromEntries(q)});toast('Đã xuất CSV theo bộ lọc.');break;}
 case 'credits':{const m=await fetch('./assets/manifest.json').then(r=>r.json());openModal('Nguồn tài nguyên',`<p>Không gian được dựng bằng Three.js. Biểu tượng: Lucide (ISC). Các ảnh là ảnh minh họa hồ sơ mẫu.</p>${(m.images||[]).map(a=>`<p><b>${esc(a.file||a.name)}</b> · ${esc(a.author||'')}<br><a href="${esc(a.source||a.source_url||a.sourceUrl||a.url)}" target="_blank" rel="noopener">Nguồn ảnh</a> · ${esc(a.license||'')}</p>`).join('')}`);break;}
 }
 }catch(err){toast(err.message,'error');}});
const careKeys='housing housingOther petsAllowed livingArea householdSize children allergies experience experienceSpecies experienceDuration otherPets otherPetCount otherPetSpecies careTime caregiver food vaccines treatment medicalVisits routineCare travelPlan businessPlan absencePlan'.split(' ');
document.addEventListener('submit',async event=>{const f=event.target;if(!(f instanceof HTMLFormElement))return;if(!f.dataset.form&&!f.dataset.filter)return;event.preventDefault();if(busy)return;
 if(f.dataset.filter){const data=Object.fromEntries(new FormData(f));const path=data.path||f.dataset.filter;delete data.path;go(path+'?'+new URLSearchParams(Object.entries(data).filter(([,v])=>v)));return;}
 busy=true;const submit=f.querySelector('[type="submit"],button:not([type])');if(submit)submit.disabled=true;try{const d=await collectForm(f);for(const k of Object.keys(d).filter(k=>k.startsWith('existing_'))){const name=k.slice(9);d[name]=JSON.parse(d[k]||'[]').filter((_,i)=>!d[`remove_${name}_${i}`]).concat(d[name]||[]);delete d[k];}let dest=route().path,result;switch(f.dataset.form){
 case 'login':await store.login(d.email,d.password);dest='account';break;case 'register':await store.register(d);dest='account';break;
 case 'password':await store.changePassword(d.oldPassword,d.password,d.confirm);break;case 'profile':store.dispatch('PROFILE',d);break;case 'identity':store.dispatch('IDENTITY_SUBMIT',d);dest='identity';break;
 case 'pet':{d.health=Object.fromEntries(Object.entries(d).filter(([k])=>k.startsWith('health_')).map(([k,v])=>[k.slice(7),v]));d.personality=Object.fromEntries(Object.entries(d).filter(([k])=>k.startsWith('personality_')).map(([k,v])=>[k.slice(12),v]));d.conditions=d.conditions.split('\n').map(x=>x.trim()).filter(Boolean);d.cover=d.images[Number(d.coverIndex)]||d.images[0];d.mainImage=d.images[Number(d.mainIndex)]||d.cover;result=store.dispatch('PET_SAVE',d);dest='my-pets';break;}
 case 'rescue':store.dispatch('RESCUE_SAVE',d);dest='rescue?tab=mine';break;
 case 'application':d.care=Object.fromEntries(careKeys.map(k=>[k,d[k]]));d.declarations=Object.fromEntries(declarations.map(([k])=>[k,d[k]]));result=store.dispatch('APPLICATION_SUBMIT',d);dest='application/'+result;break;
 case 'appointment':store.dispatch('APPOINTMENT_SAVE',d);dest='application/'+d.applicationId;break;
 case 'checkin':store.dispatch('CHECKIN',d);dest='tracking/'+d.applicationId;break;case 'feedback':store.dispatch('FEEDBACK',d);break;case 'message':store.dispatch('MESSAGE',d);break;
 case 'report':store.dispatch('REPORT',d);dest='reports';break;case 'moderate':store.dispatch('MODERATE',d);break;case 'settings':store.dispatch('SETTINGS',d);break;
 case 'command':if(d.command==='RESET'){store.reset();dest='home';}else {const c=d.command;delete d.command;store.dispatch(c,d);}break;
 default:throw new Error('Chưa hỗ trợ biểu mẫu này.');}
 closeModal();go(dest);render();toast('Đã lưu thành công.');
 }catch(err){const error=f.querySelector('.form-error');if(error)error.textContent=err.message;else toast(err.message,'error');}finally{busy=false;if(submit)submit.disabled=false;}});
window.addEventListener('hashchange',()=>{closeModal();render();document.querySelector('#workspace').scrollTop=0;});
document.querySelector('#panel-backdrop').addEventListener('click',()=>go('home'));
store.on(()=>{header();if(!busy&&!document.querySelector('#modal').open&&!document.activeElement?.closest('form'))render();});
render();createWorld(go,message=>{if(message==='ready')return;if(message==='fallback')message='Dùng menu để tiếp tục trải nghiệm.';document.querySelector('#world-help').textContent=message;}).then(w=>world=w).catch(e=>{console.error(e);document.querySelector('#world-loading').innerHTML='<b>Không mở được đồ họa 3D</b><a href="#pets" class="btn dark">Tiếp tục với danh sách thú cưng</a>';});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'search_public_pets',description:'Tìm hồ sơ thú cưng công khai và mở danh sách kết quả.',inputSchema:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:({query})=>{if(typeof query!=='string'||query.length>200)throw new Error('Truy vấn không hợp lệ.');go('pets?q='+encodeURIComponent(query));return {pets:publicPets(store.state).filter(p=>`${p.name} ${p.breed}`.toLowerCase().includes(query.toLowerCase())).map(p=>({id:p.id,name:p.name,breed:p.breed,status:p.status}))};}})).catch(()=>{});}catch{}}

document.addEventListener('change',e=>{if(e.target.matches('input[type=file][name=images]')&&e.target.form?.dataset.form==='pet'){const f=e.target.form;const existing=JSON.parse(f.elements.existing_images.value||'[]').length,count=existing+e.target.files.length;for(const key of ['coverIndex','mainIndex']){const select=f.elements[key],old=select.value;select.innerHTML=Array.from({length:count},(_,i)=>`<option value="${i}">Ảnh ${i+1}</option>`).join('');select.value=old||'0';}}});
