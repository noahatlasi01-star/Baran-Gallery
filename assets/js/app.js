/* Gallery Baran — single-user, local-first art studio */
(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const stores={gallery:'artworks',vision:'ideas',journal:'journal',wip:'wip',inspiration:'inspiration',collections:'collections',messages:'messages'};
const titles={overview:'نمای کلی',gallery:'گالری باران',vision:'ایده‌های آینده',journal:'دفتر هنری',evolution:'مسیر پیشرفت',wip:'در حال طراحی',inspiration:'تابلوی الهام',collections:'مجموعه‌ها',favorites:'علاقه‌مندی‌ها',calendar:'تقویم هنری',letter:'گوشه دنج باران',settings:'تنظیمات'};
const sampleArt=[
 {id:'sample-1',title:'Quiet Presence',description:'مطالعه‌ای درباره سکوت و حالت چهره.',date:'2026-10-14',technique:'Charcoal',category:'Portrait',image:'assets/images/portrait-study.svg',favorite:true,sample:true},
 {id:'sample-2',title:'The Gaze',description:'تمرین نور و سایه در جزئیات چشم.',date:'2026-10-28',technique:'Graphite',category:'Study',image:'assets/images/eye-study.svg',favorite:false,sample:true},
 {id:'sample-3',title:'Gentle Gesture',description:'مطالعه فرم دست و حرکت انگشتان.',date:'2026-11-05',technique:'Pencil',category:'Study',image:'assets/images/hands-study.svg',favorite:false,sample:true}
];
let currentPage='overview', currentUpload='', editingId=null, editingStore='', calendarDate=new Date();
const dateFmt=(d)=>{if(!d)return 'بدون تاریخ';try{return new Date(d+'T12:00:00').toLocaleDateString('fa-IR',{year:'numeric',month:'long',day:'numeric'});}catch{return d;}};
const todayISO=()=>new Date().toISOString().slice(0,10);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getAll=async key=>await BarANDB.all(stores[key]||key);
const save=async(key,item)=>BarANDB.put(stores[key]||key,item);
const del=async(key,id)=>BarANDB.remove(stores[key]||key,id);
const artData=async()=>{const a=await getAll('gallery');return [...sampleArt.filter(s=>!a.some(x=>x.id===s.id)),...a].sort((x,y)=>(y.date||'').localeCompare(x.date||''));};
function toast(msg,type=''){const el=document.createElement('div');el.className='toast '+type;el.textContent=msg;$('#toastRoot').append(el);setTimeout(()=>el.remove(),3300);}
function empty(icon,title,desc,action,label){return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p>${action?`<button class="btn btn-outline btn-small" data-action="${action}">${label||'افزودن مورد جدید'}</button>`:''}</div>`;}
function pageHead(kicker,title,sub,actions=''){return `<div class="page-head"><div><div class="page-kicker">${kicker}</div><h1 class="page-title">${title}</h1><p class="page-subtitle">${sub}</p></div><div class="head-actions">${actions}</div></div>`;}
function btn(label,action,cls='btn btn-gold',icon='＋'){return `<button class="${cls}" data-action="${action}">${icon?`<span>${icon}</span>`:''}${label}</button>`;}
function artCard(a,withActions=false){
 const img=a.image||'assets/images/portrait-study.svg';
 return `<article class="art-card" data-art-id="${esc(a.id)}"><div class="art-thumb"><img src="${esc(img)}" alt="${esc(a.title)}" loading="lazy"><span class="art-tag">${esc(a.category||'Artwork')}</span><button class="art-fav ${a.favorite?'active':''}" data-action="favorite" data-id="${esc(a.id)}" title="علاقه‌مندی">♡</button></div><div class="art-info"><h4>${esc(a.title)}</h4><div class="art-meta"><span>${esc(a.technique||'Mixed media')}</span><span>${dateFmt(a.date)}</span></div>${withActions?`<div class="art-actions"><button data-action="edit-art" data-id="${esc(a.id)}">ویرایش</button><button data-action="delete-art" data-id="${esc(a.id)}">حذف</button><button data-action="view-art" data-id="${esc(a.id)}">نمایش</button></div>`:''}</div></article>`;
}
async function stats(){
 const arts=await artData(),ideas=await getAll('vision'),wip=await getAll('wip'),notes=await getAll('journal');
 return {arts:arts.length,ideas:ideas.length,wip:wip.length,notes:notes.length};
}
async function render(){
 $('#currentSection').textContent=titles[currentPage]||'استودیو';
 $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===currentPage));
 const root=$('#pageContent');
 root.innerHTML=await pages[currentPage]();
 root.classList.remove('page-content');void root.offsetWidth;root.classList.add('page-content');
}
const pages={
 overview:async()=>{
  const s=await stats(),arts=await artData(),ideas=await getAll('vision'),recent=arts.slice(0,3);
  return `<section class="hero-panel"><div class="hero-content"><span class="eyebrow">A PRIVATE WORLD OF ART · EST. 2026</span><h1>Every portrait<br><i>holds a story.</i></h1><p>به استودیوی شخصی خودت خوش اومدی، باران. اینجا هر خط، شروع یک داستان تازه‌ست.</p><div class="hero-buttons">${btn('رفتن به گالری','go-gallery','btn btn-gold','↗')}${btn('ثبت یک ایده','add-idea','btn btn-outline','✧')}</div></div><div class="hero-stamp">ART<br>IS LIFE</div></section>
  <div class="stat-grid"><div class="stat-card"><div class="stat-top"><span>آثار تکمیل‌شده</span><span class="stat-icon">▧</span></div><div class="stat-value">${s.arts}</div><div class="stat-note">Pieces in your gallery</div></div><div class="stat-card"><div class="stat-top"><span>ایده‌های آینده</span><span class="stat-icon">✧</span></div><div class="stat-value">${s.ideas}</div><div class="stat-note">Ideas waiting to bloom</div></div><div class="stat-card"><div class="stat-top"><span>طرح‌های نیمه‌تمام</span><span class="stat-icon">◌</span></div><div class="stat-value">${s.wip}</div><div class="stat-note">Works in progress</div></div><div class="stat-card"><div class="stat-top"><span>یادداشت‌های هنری</span><span class="stat-icon">▤</span></div><div class="stat-value">${s.notes}</div><div class="stat-note">Thoughts from your studio</div></div></div>
  <div class="section-heading"><h3>آخرین آثار</h3><button class="text-link" data-action="go-gallery">مشاهده همه ↗</button></div>
  ${recent.length?`<div class="art-grid">${recent.map(a=>artCard(a)).join('')}</div>`:empty('▧','هنوز اثری ثبت نشده','اولین نقاشی‌ات را به گالری اضافه کن.','add-art','افزودن اولین اثر')}
  <div class="split-layout" style="margin-top:24px"><div class="panel"><div class="panel-title"><h3>ایده‌هایی برای روزهای آینده</h3><small>THE VISION</small></div>${ideas.length?ideas.slice(0,3).map(i=>`<div class="idea-row"><img class="idea-thumb" src="${esc(i.image||'assets/images/eye-study.svg')}"><div class="idea-row-main"><b>${esc(i.title)}</b><small>${esc(i.description||'ایده‌ای برای یک اثر تازه')}</small></div><span class="priority">${esc(i.priority||'عادی')}</span></div>`).join(''): `<p class="muted" style="font-size:11px">هنوز ایده‌ای ثبت نشده. هر فکری می‌تواند شروع یک اثر باشد.</p>`}<button class="text-link" data-action="go-vision" style="margin-top:12px">رفتن به ایده‌ها ↗</button></div><div class="feature-quote"><p>Art is the quietest form of courage.</p><small>A NOTE FOR YOUR CREATIVE JOURNEY</small></div></div>`;
 },
 gallery:async()=>{
  const arts=await artData();
  return `${pageHead('THE ART COLLECTION','گالری باران','هر اثر، بخشی از مسیر هنری توست.',btn('افزودن نقاشی','add-art','btn btn-gold','＋'))}
  <div class="toolbar"><div class="searchbox"><input id="gallerySearch" placeholder="جستجو در آثار..."></div><select id="galleryCategory"><option value="">همه دسته‌بندی‌ها</option><option>Portrait</option><option>Study</option><option>Nature</option><option>Other</option></select><select id="gallerySort"><option value="new">جدیدترین</option><option value="old">قدیمی‌ترین</option><option value="az">نام اثر</option></select></div>
  <div id="galleryGrid" class="art-grid">${arts.length?arts.map(a=>artCard(a,true)).join(''):empty('▧','گالری هنوز خالی است','اولین اثر هنری‌ات را ثبت کن.','add-art')}</div>`;
 },
 vision:async()=>{
  const items=await getAll('vision');
  return `${pageHead('FUTURE CREATIONS','ایده‌های آینده','ایده‌هایی که منتظرند روی کاغذ جان بگیرند.',btn('ثبت ایده جدید','add-idea','btn btn-gold','＋'))}
  ${items.length?`<div class="idea-card-grid">${items.map(i=>`<article class="idea-card"><img src="${esc(i.image||'assets/images/eye-study.svg')}" alt="${esc(i.title)}"><div class="idea-card-body"><h4>${esc(i.title)}</h4><p>${esc(i.description||'بدون توضیحات')}</p><div class="art-meta"><span>اولویت: ${esc(i.priority||'عادی')}</span><span>${dateFmt(i.date)}</span></div><div class="art-actions"><button data-action="edit-idea" data-id="${i.id}">ویرایش</button><button data-action="complete-idea" data-id="${i.id}">تکمیل و انتقال</button><button data-action="delete-item" data-store="vision" data-id="${i.id}">حذف</button></div></div></article>`).join('')}</div>`:empty('✧','ایده‌ای در دفتر نیست','هر سوژه یا تصویری که دوست داری روزی طراحی کنی، اینجا ذخیره کن.','add-idea','ثبت اولین ایده')}`;
 },
 journal:async()=>{
  const items=(await getAll('journal')).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  return `${pageHead('ARTIST JOURNAL','دفتر خاطرات هنری','لحظه‌ها، تجربه‌ها و فکرهایی که بخشی از مسیر تو هستند.',btn('یادداشت جدید','add-note','btn btn-gold','＋'))}
  <div class="toolbar"><div class="searchbox"><input id="journalSearch" placeholder="جستجو در یادداشت‌ها..."></div></div>
  <div id="journalGrid" class="idea-card-grid">${items.length?items.map(noteCard).join(''):empty('▤','صفحه اول دفترت منتظر توست','اولین خاطره یا تجربه هنری‌ات را ثبت کن.','add-note','نوشتن یادداشت')}</div>`;
 },
 evolution:async()=>{
  const arts=await artData();
  return `${pageHead('THE ARTISTIC JOURNEY','مسیر پیشرفت','نگاهی به مسیر، تمرین‌ها و تغییراتی که در هنر تو شکل گرفته‌اند.')}
  <div class="panel" style="margin-bottom:18px"><div class="panel-title"><h3>روند ثبت آثار</h3><small>YOUR TIMELINE</small></div><div class="timeline">${arts.map(a=>`<div class="timeline-item"><b>${esc(a.title)}</b><p>${esc(a.technique||'Technique not specified')} · ${esc(a.category||'Artwork')}</p><time>${dateFmt(a.date)}</time></div>`).join('')||'<p class="muted">با ثبت اولین اثر، مسیر هنری تو اینجا شکل می‌گیرد.</p>'}</div></div>
  <div class="evolution-line">${arts.map(a=>`<div class="evolution-card"><img src="${esc(a.image)}" alt="${esc(a.title)}"><div><b>${esc(a.title)}</b><small>${dateFmt(a.date)}</small></div></div>`).join('')}</div>`;
 },
 wip:async()=>{
  const items=await getAll('wip');
  return `${pageHead('IN THE MAKING','در حال طراحی','طرح‌هایی که هنوز داستانشان کامل نشده.',btn('افزودن طرح','add-wip','btn btn-gold','＋'))}
  ${items.length?`<div class="idea-card-grid">${items.map(i=>`<article class="idea-card"><img src="${esc(i.image||'assets/images/portrait-study.svg')}"><div class="idea-card-body"><h4>${esc(i.title)}</h4><p>${esc(i.description||'')}</p><div class="progress-track"><span style="width:${Math.max(0,Math.min(100,Number(i.progress)||0))}%"></span></div><small style="color:#938b7d;font-size:10px">${Number(i.progress)||0}% تکمیل</small><div class="art-actions"><button data-action="edit-wip" data-id="${i.id}">ویرایش</button><button data-action="finish-wip" data-id="${i.id}">انتقال به گالری</button><button data-action="delete-item" data-store="wip" data-id="${i.id}">حذف</button></div></div></article>`).join('')}</div>`:empty('◌','فعلاً طرح نیمه‌تمامی نداری','هر نقاشی در مسیر خلقش می‌تواند اینجا ثبت شود.','add-wip','افزودن طرح نیمه‌تمام')}`;
 },
 inspiration:async()=>{
  const items=await getAll('inspiration');
  return `${pageHead('INSPIRATION BOARD','تابلوی الهام','تصاویر و ایده‌هایی که جرقه یک طراحی تازه را روشن می‌کنند.',btn('افزودن تصویر','add-inspiration','btn btn-gold','＋'))}
  ${items.length?`<div class="idea-card-grid">${items.map(i=>`<article class="idea-card"><img src="${esc(i.image)}"><div class="idea-card-body"><h4>${esc(i.title)}</h4><p>${esc(i.description||'')}</p><div class="art-actions"><button data-action="delete-item" data-store="inspiration" data-id="${i.id}">حذف</button></div></div></article>`).join('')}</div>`:empty('⌘','تابلوی الهام خالی است','تصاویر مرجع و چیزهایی که دوست داری را اینجا نگه دار.','add-inspiration','افزودن تصویر')}`;
 },
 collections:async()=>{
  const items=await getAll('collections'),arts=await artData();
  return `${pageHead('CURATED STORIES','مجموعه‌ها','آثار را بر اساس موضوع، تکنیک یا حال‌وهوا کنار هم قرار بده.',btn('مجموعه جدید','add-collection','btn btn-gold','＋'))}
  ${items.length?`<div class="idea-card-grid">${items.map(c=>`<article class="panel"><div class="panel-title"><h3>${esc(c.title)}</h3><small>${(c.artIds||[]).length} WORKS</small></div><p class="muted" style="font-size:11px">${esc(c.description||'')}</p><div class="art-actions"><button data-action="edit-collection" data-id="${c.id}">ویرایش</button><button data-action="delete-item" data-store="collections" data-id="${c.id}">حذف</button></div></article>`).join('')}</div>`:empty('▦','هنوز مجموعه‌ای نساخته‌ای','مثلاً یک مجموعه برای پرتره‌ها یا مطالعات چهره بساز.','add-collection','ساخت مجموعه')}
  <div class="section-heading"><h3>همه آثار برای دسته‌بندی</h3><small>ARTWORKS · ${arts.length}</small></div><div class="art-grid">${arts.slice(0,3).map(a=>artCard(a)).join('')}</div>`;
 },
 favorites:async()=>{
  const arts=(await artData()).filter(a=>a.favorite);
  return `${pageHead('SAVED ARTWORKS','علاقه‌مندی‌ها','آثاری که می‌خواهی همیشه نزدیکت باشند.')}
  ${arts.length?`<div class="art-grid">${arts.map(a=>artCard(a,true)).join('')}</div>`:empty('♡','هنوز اثری ذخیره نشده','با انتخاب قلب روی هر اثر، آن را به این بخش اضافه کن.')}`;
 },
 calendar:async()=>{
  const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=(first.getDay()+1)%7;
  const arts=await artData(),ideas=await getAll('vision'),events=[...arts,...ideas];
  const names=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
  let cells=names.map(n=>`<div class="calendar-dayname">${n}</div>`).join('');
  for(let i=0;i<start;i++)cells+='<div class="calendar-day muted-day"></div>';
  for(let d=1;d<=days;d++){const iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,has=events.some(e=>e.date===iso);cells+=`<div class="calendar-day ${d===new Date().getDate()&&m===new Date().getMonth()?'today':''} ${has?'has-event':''}">${d}</div>`;}
  return `${pageHead('CREATIVE CALENDAR','تقویم هنری','روزهای خلق، برنامه‌ها و ایده‌های آینده را دنبال کن.')}
  <div class="calendar"><div class="calendar-head"><button class="icon-btn" data-action="cal-prev">‹</button><h3>${calendarDate.toLocaleDateString('fa-IR',{year:'numeric',month:'long'})}</h3><button class="icon-btn" data-action="cal-next">›</button></div><div class="calendar-grid">${cells}</div></div>
  <div class="notice">نقطه طلایی زیر تاریخ یعنی در آن روز یک اثر یا ایده ثبت شده است.</div>`;
 },
 letter:async()=>{
  const messages=await getAll('messages'),notes=await getAll('journal');
  const defaults=['گاهی آرام پیش رفتن هم نوعی پیشرفت است.','تو لازم نیست هر روز شاهکار خلق کنی؛ فقط کافی است دوباره شروع کنی.','Your art does not need to be perfect. It needs to be yours.'];
  return `${pageHead('A LITTLE PLACE FOR YOUR HEART','گوشه دنج باران','برای روزهایی که دلت می‌خواهد کمی مکث کنی، بنویسی یا فقط نفس بکشی.')}
  <div class="letter-wrap"><div class="letter-hero"><div><span class="eyebrow gold">A LETTER FOR YOU</span><h2>Dear Baran...</h2><p>گاهی بین تمام خطوط و سایه‌ها، خودت هم به کمی مهربانی احتیاج داری. این گوشه برای توست.</p></div></div>
  <div class="letter-paper"><div class="handwriting">هر وقت دلت گرفت، هر وقت حرفی برای گفتن داشتی، یادت باشه داداشی همیشه هست که به حرف‌هات گوش بده. لازم نیست همیشه قوی باشی. من همیشه برای شنیدن حرف‌هات وقت دارم.</div><div class="signature">With love, your brother.</div></div>
  <div class="section-heading"><h3>چند جمله برای روزهای تو</h3><button class="text-link" data-action="add-message">＋ افزودن جمله</button></div>
  <div class="message-grid">${(messages.length?messages:defaults.map((text,i)=>({id:'default-'+i,text}))).map(m=>`<div class="message-card"><p>${esc(m.text)}</p><small>✦ A NOTE TO REMEMBER</small>${!String(m.id).startsWith('default')?`<button class="text-link" data-action="delete-item" data-store="messages" data-id="${m.id}">حذف</button>`:''}</div>`).join('')}</div>
  <div class="section-heading"><h3>دفتر حرف‌های دلت</h3><button class="text-link" data-action="add-note">＋ نوشتن یادداشت</button></div>
  <p class="muted" style="font-size:11px;margin-top:-7px">هر چیزی که دوست داری برای خودت بنویس. این یادداشت‌ها فقط در همین مرورگر ذخیره می‌شوند.</p>
  <div class="idea-card-grid">${notes.slice(0,3).map(noteCard).join('')||'<div class="panel muted" style="font-size:11px">هنوز یادداشتی ثبت نکرده‌ای.</div>'}</div></div>`;
 },
 settings:async()=>{
  const endpoint=localStorage.getItem('baranWorkerURL')||'';
  return `${pageHead('YOUR STUDIO, YOUR RULES','تنظیمات','فضای شخصی‌ات را مطابق سلیقه خودت تنظیم کن.')}
  <div class="settings-grid">
   <div class="settings-card"><h3>تغییر رمز عبور</h3><p>رمز ورود به استودیوی شخصی‌ات را تغییر بده.</p><form id="passwordForm"><div class="field"><label>رمز فعلی</label><input type="password" id="oldPass" required></div><div class="field"><label>رمز جدید</label><input type="password" id="newPass" minlength="4" required></div><div class="field"><label>تکرار رمز جدید</label><input type="password" id="confirmPass" minlength="4" required></div><button class="btn btn-gold btn-small" type="submit">ذخیره رمز جدید ↗</button></form><div class="notice">این نسخه از رمز محلی مرورگر استفاده می‌کند. برای اطلاعات حساس یا محافظت واقعی در برابر دسترسی فنی، به احراز هویت سمت سرور نیاز است.</div></div>
   <div class="settings-card"><h3>ظاهر استودیو</h3><p>تنظیمات نمایشی و تجربه کاربری.</p><div class="setting-row"><span>پخش انیمیشن‌های ظریف</span><input class="switch" type="checkbox" id="motionToggle" checked></div><div class="setting-row"><span>نمایش پیام سورپرایز در ورود اول</span><input class="switch" type="checkbox" id="surpriseToggle" ${localStorage.getItem('baranSurprise')==='off'?'':'checked'}></div><div class="setting-row"><span>زبان رابط</span><select id="languageSelect" style="background:#222;color:#eee;border:1px solid var(--line);padding:6px;border-radius:6px"><option value="fa">فارسی + English</option></select></div></div>
   <div class="settings-card"><h3>پشتیبان‌گیری ابری اختیاری</h3><p>آدرس Worker را در صورت راه‌اندازی وارد کن. توکن GitHub نباید در اینجا یا کد مرورگر قرار بگیرد.</p><div class="field"><label>Cloudflare Worker URL</label><input id="workerURL" placeholder="https://your-worker.example.workers.dev" value="${esc(endpoint)}"></div><button class="btn btn-outline btn-small" data-action="save-worker">ذخیره آدرس</button><div class="notice">بدون Worker، تصاویر و اطلاعات در همین مرورگر و IndexedDB ذخیره می‌شوند. برای انتقال به دستگاه دیگر از خروجی پشتیبان استفاده کن.</div></div>
   <div class="settings-card"><h3>پشتیبان‌گیری و داده‌ها</h3><p>از اطلاعاتت نسخه پشتیبان بگیر یا آن را بازیابی کن.</p><div class="stack-form"><button class="btn btn-outline btn-small" data-action="export-data">دریافت فایل پشتیبان JSON</button><label class="upload-zone"><strong>بازیابی نسخه پشتیبان</strong><small>فایل JSON قبلی را انتخاب کن<input id="importFile" type="file" accept=".json,application/json" hidden></small></label><button class="btn btn-danger btn-small" data-action="clear-data">پاک کردن تمام داده‌های محلی</button></div></div>
  </div>`;
 }
};
function noteCard(n){return `<article class="note-card"><h4>${esc(n.title||'یادداشت بدون عنوان')}</h4><p>${esc(n.text||'')}</p><small>${dateFmt(n.date)}</small><div class="note-actions"><button data-action="edit-note" data-id="${n.id}">ویرایش</button><button data-action="delete-item" data-store="journal" data-id="${n.id}">حذف</button></div></article>`;}
function modal(title,body){$('#modalRoot').innerHTML=`<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h3>${title}</h3><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body">${body}</div></div></div>`;}
function closeModal(){$('#modalRoot').innerHTML='';currentUpload='';editingId=null;editingStore='';}
function uploadField(){return `<div class="field full"><label>تصویر</label><label class="upload-zone"><strong>＋ انتخاب تصویر یا رها کردن فایل اینجا</strong><small>JPG, PNG, WEBP · حداکثر 8MB</small><input id="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label><img id="uploadPreview" class="upload-preview ${currentUpload?'':'hidden'}" src="${currentUpload||''}" alt="پیش‌نمایش"></div>`;}
async function showArtForm(id){
 const arts=await getAll('gallery'),a=arts.find(x=>x.id===id)||{};
 editingId=id||null;currentUpload=a.image||'';
 modal(id?'ویرایش اثر هنری':'افزودن اثر جدید',`<form id="artForm"><div class="form-grid">
 <div class="field full"><label>عنوان اثر *</label><input name="title" required value="${esc(a.title||'')}"></div>
 ${uploadField()}
 <div class="field"><label>تاریخ خلق اثر</label><input name="date" type="date" value="${esc(a.date||todayISO())}"></div>
 <div class="field"><label>تکنیک</label><select name="technique"><option ${a.technique==='Charcoal'?'selected':''}>Charcoal</option><option ${a.technique==='Graphite'?'selected':''}>Graphite</option><option ${a.technique==='Pencil'?'selected':''}>Pencil</option><option>Mixed Media</option><option>Other</option></select></div>
 <div class="field"><label>دسته‌بندی</label><select name="category"><option>Portrait</option><option>Study</option><option>Nature</option><option>Other</option></select></div>
 <div class="field"><label>مدت زمان طراحی (اختیاری)</label><input name="duration" placeholder="مثلاً ۶ ساعت" value="${esc(a.duration||'')}"></div>
 <div class="field full"><label>توضیحات</label><textarea name="description">${esc(a.description||'')}</textarea></div>
 <div class="field full"><label>یادداشت شخصی (اختیاری)</label><textarea name="notes">${esc(a.notes||'')}</textarea></div>
 </div><div class="form-footer"><button class="btn btn-gold" type="submit">ذخیره اثر</button><button class="btn btn-outline" type="button" data-action="close-modal">انصراف</button></div></form>`);
 const cat=$('[name="category"]');if(a.category)cat.value=a.category;
 bindUpload();
}
async function showIdeaForm(id){
 const items=await getAll('vision'),a=items.find(x=>x.id===id)||{};editingId=id||null;currentUpload=a.image||'';
 modal(id?'ویرایش ایده':'ثبت ایده آینده',`<form id="ideaForm"><div class="form-grid"><div class="field full"><label>عنوان ایده *</label><input name="title" required value="${esc(a.title||'')}"></div>${uploadField()}<div class="field"><label>تاریخ احتمالی</label><input name="date" type="date" value="${esc(a.date||'')}"></div><div class="field"><label>اولویت</label><select name="priority"><option>عادی</option><option>متوسط</option><option>بالا</option></select></div><div class="field full"><label>توضیحات</label><textarea name="description">${esc(a.description||'')}</textarea></div></div><div class="form-footer"><button class="btn btn-gold">ذخیره ایده</button><button type="button" class="btn btn-outline" data-action="close-modal">انصراف</button></div></form>`);
 if(a.priority)$('[name="priority"]').value=a.priority;bindUpload();
}
async function showNoteForm(id){
 const items=await getAll('journal'),n=items.find(x=>x.id===id)||{};editingId=id||null;
 modal(id?'ویرایش یادداشت':'یادداشت تازه',`<form id="noteForm"><div class="form-grid"><div class="field full"><label>عنوان</label><input name="title" value="${esc(n.title||'')}" placeholder="امروز چه چیزی در ذهنت بود؟"></div><div class="field full"><label>متن یادداشت *</label><textarea name="text" required style="min-height:180px">${esc(n.text||'')}</textarea></div></div><div class="form-footer"><button class="btn btn-gold">ذخیره یادداشت</button><button type="button" class="btn btn-outline" data-action="close-modal">انصراف</button></div></form>`);
}
function showSimpleForm(type){
 const configs={
  wip:{title:'افزودن طرح نیمه‌تمام',store:'wip',fields:`<div class="field full"><label>عنوان طرح *</label><input name="title" required></div>${uploadField()}<div class="field"><label>درصد پیشرفت</label><input name="progress" type="number" min="0" max="100" value="20"></div><div class="field"><label>تاریخ</label><input name="date" type="date" value="${todayISO()}"></div><div class="field full"><label>توضیحات</label><textarea name="description"></textarea></div>`},
  inspiration:{title:'افزودن تصویر الهام',store:'inspiration',fields:`<div class="field full"><label>عنوان *</label><input name="title" required></div>${uploadField()}<div class="field full"><label>توضیحات</label><textarea name="description"></textarea></div>`},
  collection:{title:'ساخت مجموعه',store:'collections',fields:`<div class="field full"><label>نام مجموعه *</label><input name="title" required></div><div class="field full"><label>توضیحات</label><textarea name="description"></textarea></div>`}
 };
 const c=configs[type];if(!c)return;
 modal(c.title,`<form id="simpleForm" data-store="${c.store}"><div class="form-grid">${c.fields}</div><div class="form-footer"><button class="btn btn-gold">ذخیره</button><button type="button" class="btn btn-outline" data-action="close-modal">انصراف</button></div></form>`);if(type!=='collection')bindUpload();
}
function bindUpload(){
 const input=$('#imageFile');if(!input)return;
 input.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(f.size>8*1024*1024){toast('حجم تصویر باید کمتر از ۸ مگابایت باشد.','error');return;}if(!/^image\/(png|jpeg|webp|gif)$/.test(f.type)){toast('فرمت تصویر پشتیبانی نمی‌شود.','error');return;}currentUpload=await fileToDataURL(f);const p=$('#uploadPreview');p.src=currentUpload;p.classList.remove('hidden');});
 const zone=$('.upload-zone');zone?.addEventListener('dragover',e=>{e.preventDefault();zone.style.borderColor='var(--gold)';});zone?.addEventListener('drop',async e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/')&&f.size<=8*1024*1024){currentUpload=await fileToDataURL(f);const p=$('#uploadPreview');p.src=currentUpload;p.classList.remove('hidden');}});
}
function fileToDataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
function download(name,content,type='application/json'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
async function exportData(){
 const out={app:'Gallery Baran',version:1,exportedAt:new Date().toISOString(),data:{}};
 for(const k of Object.keys(stores))out.data[k]=await getAll(k);
 download('gallery-baran-backup-'+todayISO()+'.json',JSON.stringify(out,null,2));
 toast('فایل پشتیبان آماده شد.');
}
async function importData(file){
 try{const data=JSON.parse(await file.text());if(!data.data)throw new Error('Invalid');for(const [k,items] of Object.entries(data.data)){if(stores[k]&&Array.isArray(items)){for(const item of items)await save(k,item);}}toast('اطلاعات با موفقیت بازیابی شد.');await render();}catch{toast('فایل پشتیبان معتبر نیست.','error');}
}
async function finishItem(store,id){
 const item=(await getAll(store)).find(x=>x.id===id);if(!item)return;
 const art={id:uid(),title:item.title,description:item.description||'',date:item.date||todayISO(),technique:'Charcoal',category:'Portrait',image:item.image||'assets/images/portrait-study.svg',favorite:false};
 await save('gallery',art);await del(store,id);toast('به گالری منتقل شد.');await render();
}
async function editWip(id){
 const items=await getAll('wip'),a=items.find(x=>x.id===id);if(!a)return;editingId=id;currentUpload=a.image||'';
 modal('ویرایش طرح نیمه‌تمام',`<form id="wipEditForm"><div class="form-grid"><div class="field full"><label>عنوان</label><input name="title" value="${esc(a.title)}" required></div>${uploadField()}<div class="field"><label>درصد پیشرفت</label><input name="progress" type="number" min="0" max="100" value="${a.progress||0}"></div><div class="field"><label>تاریخ</label><input name="date" type="date" value="${a.date||''}"></div><div class="field full"><label>توضیحات</label><textarea name="description">${esc(a.description||'')}</textarea></div></div><div class="form-footer"><button class="btn btn-gold">ذخیره تغییرات</button></div></form>`);bindUpload();
}
async function editCollection(id){
 const c=(await getAll('collections')).find(x=>x.id===id);if(!c)return;editingId=id;
 modal('ویرایش مجموعه',`<form id="collectionEditForm"><div class="field"><label>نام مجموعه</label><input name="title" value="${esc(c.title)}" required></div><div class="field"><label>توضیحات</label><textarea name="description">${esc(c.description||'')}</textarea></div><div class="form-footer"><button class="btn btn-gold">ذخیره</button></div></form>`);
}
async function addMessage(){
 modal('افزودن جمله انگیزشی',`<form id="messageForm"><div class="field"><label>جمله</label><textarea name="text" required placeholder="یک جمله برای روزهای خوب و سخت..."></textarea></div><div class="form-footer"><button class="btn btn-gold">ذخیره جمله</button></div></form>`);
}
async function handleAction(action,el){
 const id=el.dataset.id;
 switch(action){
 case 'go-gallery':currentPage='gallery';await render();break;
 case 'go-vision':currentPage='vision';await render();break;
 case 'add-art':await showArtForm();break;
 case 'add-idea':await showIdeaForm();break;
 case 'add-note':await showNoteForm();break;
 case 'add-wip':showSimpleForm('wip');break;
 case 'add-inspiration':showSimpleForm('inspiration');break;
 case 'add-collection':showSimpleForm('collection');break;
 case 'add-message':addMessage();break;
 case 'close-modal':if(el.classList.contains('modal-backdrop')&&el!==event.target)return;closeModal();break;
 case 'favorite':{
  const arts=await getAll('gallery'),a=arts.find(x=>x.id===id);if(a){a.favorite=!a.favorite;await save('gallery',a);}else{const s=sampleArt.find(x=>x.id===id);if(s){await save('gallery',{...s,sample:false,favorite:!s.favorite});}}await render();break;}
 case 'edit-art':await showArtForm(id);break;
 case 'delete-art':if(confirm('این اثر حذف شود؟')){await del('gallery',id);toast('اثر حذف شد.');await render();}break;
 case 'view-art':{const a=(await artData()).find(x=>x.id===id);if(a){$('#lightboxImage').src=a.image;$('#lightboxCaption').textContent=a.title+' · '+dateFmt(a.date);$('#lightbox').classList.remove('hidden');}break;}
 case 'edit-idea':await showIdeaForm(id);break;
 case 'complete-idea':await finishItem('vision',id);break;
 case 'finish-wip':await finishItem('wip',id);break;
 case 'edit-wip':await editWip(id);break;
 case 'edit-note':await showNoteForm(id);break;
 case 'edit-collection':await editCollection(id);break;
 case 'delete-item':if(confirm('این مورد حذف شود؟')){await del(el.dataset.store,id);toast('حذف شد.');await render();}break;
 case 'cal-prev':calendarDate.setMonth(calendarDate.getMonth()-1);await render();break;
 case 'cal-next':calendarDate.setMonth(calendarDate.getMonth()+1);await render();break;
 case 'export-data':await exportData();break;
 case 'clear-data':if(confirm('تمام اطلاعات محلی پاک شود؟ این کار قابل بازگشت نیست.')){await BarANDB.clearAll();toast('داده‌های محلی پاک شدند.');await render();}break;
 case 'save-worker':{const v=$('#workerURL').value.trim();localStorage.setItem('baranWorkerURL',v);toast('آدرس ذخیره شد.');break;}
 }
}
document.addEventListener('click',async e=>{
 const actionEl=e.target.closest('[data-action]');if(actionEl){const action=actionEl.dataset.action;if(action==='close-modal'){if(e.target.closest('.modal')&&!e.target.closest('.modal-close'))return;closeModal();return;}await handleAction(action,actionEl);return;}
 const nav=e.target.closest('[data-page]');if(nav){e.preventDefault();currentPage=nav.dataset.page;$('#sidebar').classList.remove('open');$('#sidebarShade').classList.remove('show');await render();return;}
 const card=e.target.closest('.art-card');if(card&&!e.target.closest('button')){const a=(await artData()).find(x=>x.id===card.dataset.artId);if(a){$('#lightboxImage').src=a.image;$('#lightboxCaption').textContent=a.title+' · '+dateFmt(a.date);$('#lightbox').classList.remove('hidden');}}
});
document.addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target,fd=new FormData(f);
 if(f.id==='loginForm')return;
 if(f.id==='artForm'){
  const item={id:editingId||uid(),title:fd.get('title').trim(),description:fd.get('description'),date:fd.get('date')||todayISO(),technique:fd.get('technique'),category:fd.get('category'),duration:fd.get('duration'),notes:fd.get('notes'),image:currentUpload||'assets/images/portrait-study.svg',favorite:false,createdAt:new Date().toISOString()};
  if(editingId){const old=(await getAll('gallery')).find(x=>x.id===editingId);item.favorite=old?.favorite||false;}
  await save('gallery',item);closeModal();toast('اثر هنری ذخیره شد.');await render();
 }else if(f.id==='ideaForm'){
  const item={id:editingId||uid(),title:fd.get('title').trim(),description:fd.get('description'),date:fd.get('date'),priority:fd.get('priority'),image:currentUpload||'assets/images/eye-study.svg'};
  await save('vision',item);closeModal();toast('ایده ذخیره شد.');await render();
 }else if(f.id==='noteForm'){
  await save('journal',{id:editingId||uid(),title:fd.get('title'),text:fd.get('text'),date:todayISO(),updatedAt:new Date().toISOString()});closeModal();toast('یادداشت ذخیره شد.');await render();
 }else if(f.id==='simpleForm'){
  const store=f.dataset.store,item={id:uid(),title:fd.get('title')?.trim(),description:fd.get('description')||'',date:fd.get('date')||todayISO(),image:currentUpload||'',progress:Number(fd.get('progress'))||0};
  await save(store,item);closeModal();toast('با موفقیت ذخیره شد.');await render();
 }else if(f.id==='wipEditForm'){
  await save('wip',{id:editingId,title:fd.get('title'),description:fd.get('description'),date:fd.get('date'),image:currentUpload,progress:Number(fd.get('progress'))||0});closeModal();toast('تغییرات ذخیره شد.');await render();
 }else if(f.id==='collectionEditForm'){
  const c=(await getAll('collections')).find(x=>x.id===editingId)||{};await save('collections',{...c,id:editingId,title:fd.get('title'),description:fd.get('description')});closeModal();toast('مجموعه ویرایش شد.');await render();
 }else if(f.id==='messageForm'){
  await save('messages',{id:uid(),text:fd.get('text')});closeModal();toast('جمله اضافه شد.');await render();
 }else if(f.id==='passwordForm'){
  const old=localStorage.getItem('baranPassword')||'baran',np=fd.get('newPass');
  if(fd.get('oldPass')!==old){toast('رمز فعلی اشتباه است.','error');return;}
  if(np!==fd.get('confirmPass')){toast('تکرار رمز جدید مطابقت ندارد.','error');return;}
  if(np.length<4){toast('رمز جدید باید حداقل ۴ کاراکتر باشد.','error');return;}
  localStorage.setItem('baranPassword',np);f.reset();toast('رمز عبور با موفقیت تغییر کرد.');
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='gallerySearch'||e.target.id==='galleryCategory'||e.target.id==='gallerySort')filterGallery();
 if(e.target.id==='journalSearch')filterJournal(e.target.value);
});
async function filterGallery(){
 const arts=await artData(),q=($('#gallerySearch')?.value||'').toLowerCase(),cat=$('#galleryCategory')?.value||'',sort=$('#gallerySort')?.value||'new';
 let list=arts.filter(a=>(a.title+' '+(a.description||'')+' '+(a.technique||'')).toLowerCase().includes(q)&&(!cat||a.category===cat));
 if(sort==='old')list.reverse();if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title));
 $('#galleryGrid').innerHTML=list.map(a=>artCard(a,true)).join('')||empty('⌕','نتیجه‌ای پیدا نشد','عبارت جستجو یا فیلتر را تغییر بده.');
}
async function filterJournal(q){const items=await getAll('journal');const list=items.filter(n=>(n.title+' '+n.text).toLowerCase().includes(q.toLowerCase()));$('#journalGrid').innerHTML=list.map(noteCard).join('')||empty('⌕','یادداشتی پیدا نشد','عبارت دیگری را امتحان کن.');}
function setLoggedIn(on){$('#loginView').classList.toggle('hidden',on);$('#appView').classList.toggle('hidden',!on);}
async function start(){
 $('#todayText').textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase();
 $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const u=$('#loginUser').value.trim().toLowerCase(),p=$('#loginPassword').value,stored=localStorage.getItem('baranPassword')||'baran';if(u==='baran'&&p===stored){sessionStorage.setItem('baranLoggedIn','yes');setLoggedIn(true);if(localStorage.getItem('baranSurprise')!=='off'&&!sessionStorage.getItem('baranSurpriseSeen')){sessionStorage.setItem('baranSurpriseSeen','yes');showSurprise();}await render();}else $('#loginError').textContent='نام کاربری یا رمز عبور درست نیست.';});
 $$('[data-reveal]').forEach(b=>b.addEventListener('click',()=>{const i=$('#'+b.dataset.reveal);i.type=i.type==='password'?'text':'password';}));
 $('#logoutBtn').addEventListener('click',()=>{sessionStorage.removeItem('baranLoggedIn');setLoggedIn(false);$('#loginPassword').value='';});
 $('#quickAddBtn').addEventListener('click',()=>showArtForm());
 $('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#sidebarShade').classList.add('show');});
 $('#sidebarClose').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#sidebarShade').classList.remove('show');});
 $('#sidebarShade').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#sidebarShade').classList.remove('show');});
 $('#lightboxClose').addEventListener('click',()=>$('#lightbox').classList.add('hidden'));
 $('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')$('#lightbox').classList.add('hidden');});
 document.addEventListener('change',e=>{
  if(e.target.id==='importFile'&&e.target.files[0])importData(e.target.files[0]);
  if(e.target.id==='surpriseToggle')localStorage.setItem('baranSurprise',e.target.checked?'on':'off');
  if(e.target.id==='motionToggle')document.body.classList.toggle('reduce-motion',!e.target.checked);
 });
 if(sessionStorage.getItem('baranLoggedIn')==='yes'){setLoggedIn(true);await render();}else setLoggedIn(false);
}
function showSurprise(){
 const wrap=document.createElement('div');wrap.className='surprise-overlay';wrap.innerHTML=`<div class="surprise-stars"></div><div class="surprise-content"><span class="eyebrow gold">A LITTLE SURPRISE FOR YOU</span><div class="surprise-monogram">B.</div><h2>Dear Baran,</h2><p>بعضی آدم‌ها دنیا را با نگاهشان زیباتر می‌کنند.<br>این گوشه کوچک از دنیا، برای تو ساخته شده.</p><button class="btn btn-gold" id="surpriseEnter">ورود به دنیای من <span>↗</span></button><small>WITH LOVE, ALWAYS</small></div>`;document.body.append(wrap);$('#surpriseEnter').onclick=()=>{wrap.classList.add('closing');setTimeout(()=>wrap.remove(),650);};
}
const surpriseStyle=document.createElement('style');surpriseStyle.textContent=`.surprise-overlay{position:fixed;inset:0;z-index:100;background:radial-gradient(circle at 50% 42%,#30291d,#080808 65%);display:grid;place-items:center;text-align:center;animation:fadeIn .8s}.surprise-overlay:before,.surprise-overlay:after{content:"";position:absolute;width:65vw;height:65vw;max-width:650px;max-height:650px;border:1px solid rgba(185,154,98,.16);border-radius:50%;animation:orbit 35s linear infinite}.surprise-overlay:after{width:80vw;height:80vw;max-width:800px;max-height:800px;animation-direction:reverse;border-style:dashed;opacity:.35}.surprise-content{position:relative;z-index:1;max-width:500px;padding:25px;animation:rise 1s .2s both}.surprise-monogram{width:90px;height:90px;border:1px solid var(--gold);border-radius:50%;display:grid;place-items:center;color:var(--gold);font:italic 48px var(--serif);margin:28px auto}.surprise-content h2{font:italic 42px var(--serif);margin:0 0 15px}.surprise-content p{color:#c7bdab;line-height:2;font-size:13px;margin-bottom:25px}.surprise-content small{display:block;font:9px "DM Sans";letter-spacing:2px;color:#736b5d;margin-top:25px}.surprise-overlay.closing{animation:fadeIn .5s reverse forwards}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes rise{from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:none}}.reduce-motion *{animation:none!important;transition:none!important}`;document.head.append(surpriseStyle);
start();
})();