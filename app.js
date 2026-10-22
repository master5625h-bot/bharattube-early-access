const C=window.BT_CONFIG,$=id=>document.getElementById(id);
const REF=new URLSearchParams(location.search).get('ref')||'';
if(REF)$('refNote').hidden=false;
// Logo intro (once per session)
if(!sessionStorage.getItem('bt_intro')){const i=$('intro');i.hidden=false;sessionStorage.setItem('bt_intro','1');setTimeout(()=>{i.classList.add('bye');setTimeout(()=>i.remove(),700)},1700)}
// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// 3D tilt on hover devices
if(matchMedia('(hover:hover)').matches){document.querySelectorAll('.fcard').forEach(card=>{
 card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  card.style.transform=`perspective(700px) rotateY(${((x/r.width)-.5)*14}deg) rotateX(${((.5-(y/r.height))*12)}deg) translateY(-3px)`});
 card.addEventListener('pointerleave',()=>{card.style.transform=''})})}
// States + capitals (for dropdown and map dots)
const STATES={"Andhra Pradesh":[16.5,80.6],"Arunachal Pradesh":[27.1,93.6],"Assam":[26.2,91.8],"Bihar":[25.6,85.1],"Chhattisgarh":[21.3,81.6],"Goa":[15.5,73.8],"Gujarat":[23.2,72.7],"Haryana":[29.1,76.1],"Himachal Pradesh":[31.1,77.2],"Jharkhand":[23.3,85.3],"Karnataka":[13.0,77.6],"Kerala":[8.5,76.9],"Madhya Pradesh":[23.3,77.4],"Maharashtra":[19.1,72.9],"Manipur":[24.8,93.9],"Meghalaya":[25.6,91.9],"Mizoram":[23.7,92.7],"Nagaland":[25.7,94.1],"Odisha":[20.3,85.8],"Punjab":[30.7,76.8],"Rajasthan":[26.9,75.8],"Sikkim":[27.3,88.6],"Tamil Nadu":[13.1,80.3],"Telangana":[17.4,78.5],"Tripura":[23.8,91.3],"Uttar Pradesh":[26.9,80.9],"Uttarakhand":[30.3,78.0],"West Bengal":[22.6,88.4],"Delhi":[28.6,77.2],"Jammu & Kashmir":[34.1,74.8],"Ladakh":[34.2,77.6],"Chandigarh":[30.7,76.7],"Puducherry":[11.9,79.8],"Andaman & Nicobar":[11.6,92.7],"Lakshadweep":[10.6,72.6],"Dadra & Daman":[20.4,72.8]};
const LANGS=["Hindi","Bhojpuri","Tamil","Telugu","Bengali","Marathi","English"];
const VIDS=["Comedy","Music","News","Bhakti","Education","Shorts"];
const st=$('st'),lg=$('lg');
Object.keys(STATES).forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;st.appendChild(o)});
LANGS.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;lg.appendChild(o)});
// Map + vote rendering
function proj(lat,lon){return [(lon-68)*12,(37.2-lat)*12]}
function renderMap(states){
 const g=$('dots');g.innerHTML='';const chips=$('statechips');chips.innerHTML='';
 const entries=Object.entries(states).filter(([s,c])=>STATES[s]&&c>0).sort((a,b)=>b[1]-a[1]);
 const max=Math.max(1,...entries.map(e=>e[1]));
 entries.forEach(([s,c])=>{const[lat,lon]=STATES[s];const[x,y]=proj(lat,lon);
  const r=4+7*(c/max);
  const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
  dot.setAttribute('class','state-dot');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',r);
  const t=document.createElementNS('http://www.w3.org/2000/svg','title');t.textContent=s+': '+c;dot.appendChild(t);g.appendChild(dot);
  const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
  lbl.setAttribute('class','state-lbl');lbl.setAttribute('x',x);lbl.setAttribute('y',y-r-3);lbl.setAttribute('text-anchor','middle');lbl.textContent=c;g.appendChild(lbl);
  const chip=document.createElement('span');chip.className='statechip';chip.textContent=`${s} · ${c}`;chips.appendChild(chip)});
 if(!entries.length)chips.innerHTML='<span class="statechip">Aapka rajya pehla ho sakta hai!</span>'}
function renderVotes(votes){
 [['language','langres'],['video','vidres']].forEach(([type,rid])=>{
  const box=$(rid);const data=votes[type]||{};const total=Object.values(data).reduce((a,b)=>a+b,0);
  if(!total){box.classList.remove('show');return}
  box.classList.add('show');box.innerHTML='';
  Object.entries(data).sort((a,b)=>b[1]-a[1]).forEach(([name,c])=>{
   const pct=Math.round(c/total*100);
   const row=document.createElement('div');row.className='rrow';
   row.innerHTML=`<span class="rname">${name}</span><span class="rbar"><span class="rfill" style="width:${pct}%"></span></span><span class="rpct">${pct}%</span>`;
   box.appendChild(row)})})}
async function loadStats(){try{const r=await fetch(C.API_URL+'?action=stats');const j=await r.json();
 if(j&&j.ok){$('count').textContent=(j.count||0).toLocaleString('en-IN');$('counter').hidden=false;
 renderMap(j.states||{});renderVotes(j.votes||{})}}catch(e){}}
loadStats();
// Vote chips
function buildChips(id,opts,type){const box=$(id);opts.forEach(v=>{
 const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=v;
 if(localStorage.getItem('bt_vote_'+type)){b.disabled=true;if(localStorage.getItem('bt_vote_'+type)===v)b.classList.add('voted')}
 b.onclick=async()=>{if(localStorage.getItem('bt_vote_'+type))return;
  b.disabled=true;b.textContent=v+' ⏳';
  try{await fetch(C.API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'vote',type:type,value:v})});
   localStorage.setItem('bt_vote_'+type,v)}catch(e){}
  box.querySelectorAll('.chip').forEach(c=>c.disabled=true);b.classList.add('voted');b.textContent=v+' ✓';loadStats()};
 box.appendChild(b)})}
buildChips('langchips',LANGS,'language');
buildChips('vidchips',VIDS,'video');
// Confetti
function confetti(){const cv=$('confetti'),cx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;
 const cols=['#ff9933','#ff8a00','#ff3b30','#ffffff','#138808'],P=[];
 for(let i=0;i<140;i++)P.push({x:innerWidth/2,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:Math.random()*-11-3,g:.28,s:Math.random()*7+4,c:cols[i%cols.length],r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3});
 let t=0;(function f(){cx.clearRect(0,0,cv.width,cv.height);t++;
  P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.r+=p.vr;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});
  if(t<160)requestAnimationFrame(f);else cx.clearRect(0,0,cv.width,cv.height)})()}
// Creator card (1080x1920 story, drawn at 540x960)
function drawCard(name,pos){
 const cv=$('ccard'),cx=cv.getContext('2d'),W=540,H=960;
 const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffedd5');g.addColorStop(.5,'#fff6ec');g.addColorStop(1,'#dcfce7');
 cx.fillStyle=g;cx.fillRect(0,0,W,H);
 const blob=(x,y,r,c)=>{const rg=cx.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,c);rg.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill()};
 blob(80,120,150,'rgba(253,186,116,.55)');blob(470,350,160,'rgba(134,239,172,.5)');blob(120,800,170,'rgba(191,219,254,.5)');
 const rr=(x,y,w,h,r)=>{cx.beginPath();cx.roundRect(x,y,w,h,r)};
 const img=new Image();img.onload=()=>{
  cx.fillStyle='#ffffff';cx.shadowColor='rgba(140,100,60,.35)';cx.shadowBlur=30;cx.shadowOffsetY=14;
  rr(50,150,440,640,36);cx.fill();cx.shadowColor='transparent';cx.shadowBlur=0;cx.shadowOffsetY=0;
  cx.save();rr(200,190,140,140,34);cx.clip();cx.drawImage(img,200,190,140,140);cx.restore();
  cx.strokeStyle='#fdba74';cx.lineWidth=4;rr(200,190,140,140,34);cx.stroke();
  cx.textAlign='center';cx.fillStyle='#1c1917';
  cx.font='800 44px Poppins,system-ui,sans-serif';cx.fillText('BharatTube',W/2,395);
  cx.fillStyle='#9a3412';cx.font='700 19px system-ui';cx.fillText('EARLY MEMBER',W/2,440);
  let fs=52;cx.font=`800 ${fs}px Poppins,system-ui,sans-serif`;
  while(cx.measureText(name).width>380&&fs>26){fs-=2;cx.font=`800 ${fs}px Poppins,system-ui,sans-serif`}
  cx.fillStyle='#1c1917';cx.fillText(name,W/2,510);
  const badge=`#${pos}`;cx.font='800 30px Poppins,system-ui,sans-serif';
  const bw=cx.measureText(badge).width+56;
  const bg2=cx.createLinearGradient(W/2-bw/2,0,W/2+bw/2,0);bg2.addColorStop(0,'#f97316');bg2.addColorStop(1,'#ea580c');
  cx.fillStyle=bg2;rr(W/2-bw/2,545,bw,58,29);cx.fill();
  cx.fillStyle='#fff';cx.fillText(badge,W/2,586);
  cx.fillStyle='#57534e';cx.font='500 21px system-ui';
  cx.fillText('Bharat ka apna video platform',W/2,660);
  cx.fillText('Early Access list mein shaamil',W/2,695);
  cx.fillStyle='#a8a29e';cx.font='500 16px system-ui';
  cx.fillText('Early Member Card · BharatTube',W/2,760);
  cx.fillStyle='#9a3412';cx.font='700 22px system-ui';
  cx.fillText('bharattube-early-access-in.netlify.app',W/2,880);
 };
 img.src='logo.jpg'}
$('dlcard').onclick=()=>{$('ccard').toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='bharattube-creator-card.png';a.click()})};
// Form submit
$('f').addEventListener('submit',async ev=>{ev.preventDefault();
 const name=$('n').value.trim(),email=$('e').value.trim().toLowerCase(),m=$('m'),b=$('b');m.textContent='';
 if(!name||!email){m.textContent='Kripya naam aur email dono bharein.';return}
 b.disabled=true;b.textContent='Ek minute...';
 try{const r=await fetch(C.API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'register',name:name,email:email,state:st.value,language:lg.value,ref:REF})});
  const j=await r.json();if(!j.ok)throw 0;const pos=j.pos;
  $('formCard').classList.add('hide');$('ok').classList.remove('hide');
  $('t').textContent='Dhanyavaad, '+name.split(' ')[0]+' ji! 🙏';$('pos').textContent='Aapka number: #'+pos;
  confetti();drawCard(name,pos);
  const link=location.origin+location.pathname+'?ref='+pos;
  $('reflink').value=link;
  $('washare').href='https://wa.me/?text='+encodeURIComponent('Maine BharatTube ki Early Access list join kar li! Bharat ka apna video platform 🇮🇳 Aap bhi mere link se judiye: '+link);
  fetch(C.API_URL+'?action=refcount&pos='+pos).then(r=>r.json()).then(j=>{if(j.ok&&j.count>0)$('refcount').textContent='🔥 '+j.count+' log aapke link se judd chuke hain!'}).catch(()=>{});
  $('copylink').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(link);$('copylink').textContent='Copied ✓'};
  $('ok').scrollIntoView({behavior:'smooth',block:'center'});
 }catch(e){m.textContent='Maaf kijiye, kuch gadbad ho gayi. Kripya thodi der baad dobara koshish karein.';b.disabled=false;b.textContent='Early Access mein judiye'}});
