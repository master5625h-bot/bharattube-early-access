const C=window.BT_CONFIG,$=id=>document.getElementById(id);
// Live counter
(async()=>{try{const r=await fetch(C.API_URL+'?action=count');const j=await r.json();
 if(j&&j.ok&&typeof j.count==='number'){$('count').textContent=j.count.toLocaleString('en-IN');$('counter').hidden=false}}catch(e){}})();
// Scroll reveal
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// 3D tilt (hover-capable devices)
if(matchMedia('(hover:hover)').matches){document.querySelectorAll('.fcard').forEach(card=>{
 card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  card.style.setProperty('--mx',x+'px');card.style.setProperty('--my',y+'px');
  card.style.transform=`perspective(700px) rotateY(${((x/r.width)-.5)*14}deg) rotateX(${((.5-(y/r.height))*12)}deg) translateY(-3px)`});
 card.addEventListener('pointerleave',()=>{card.style.transform=''})})}
// Confetti
function confetti(){const cv=$('confetti'),cx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;
 const cols=['#ff9933','#ff8a00','#ff3b30','#ffffff','#138808'],P=[];
 for(let i=0;i<140;i++)P.push({x:innerWidth/2,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:Math.random()*-11-3,g:.28,s:Math.random()*7+4,c:cols[i%cols.length],r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3});
 let t=0;(function f(){cx.clearRect(0,0,cv.width,cv.height);t++;
  P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.r+=p.vr;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});
  if(t<160)requestAnimationFrame(f);else cx.clearRect(0,0,cv.width,cv.height)})()}
// Form
$('f').addEventListener('submit',async ev=>{ev.preventDefault();
 const name=$('n').value.trim(),email=$('e').value.trim().toLowerCase(),m=$('m'),b=$('b');m.textContent='';
 if(!name||!email){m.textContent='Kripya naam aur email dono bharein.';return}
 b.disabled=true;b.textContent='Ek minute...';
 try{const r=await fetch(C.API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'register',name:name,email:email})});
  const j=await r.json();if(!j.ok)throw 0;const pos=j.pos;
  $('formCard').classList.add('hide');$('ok').classList.remove('hide');
  $('t').textContent='Dhanyavaad, '+name.split(' ')[0]+' ji! 🙏';$('pos').textContent='Aapka number: #'+pos;
  confetti();$('ok').scrollIntoView({behavior:'smooth',block:'center'});
 }catch(e){m.textContent='Maaf kijiye, kuch gadbad ho gayi. Kripya thodi der baad dobara koshish karein.';b.disabled=false;b.textContent='Early Access mein judiye'}});
