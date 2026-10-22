const C=window.BT_CONFIG,$=id=>document.getElementById(id);
$('f').addEventListener('submit',async ev=>{ev.preventDefault();
 const name=$('n').value.trim(),email=$('e').value.trim().toLowerCase(),m=$('m'),b=$('b');m.textContent='';
 if(!name||!email){m.textContent='Kripya naam aur email dono bharein.';return}
 b.disabled=true;b.textContent='Ek minute...';
 try{const r=await fetch(C.SUPABASE_URL+'/rest/v1/rpc/register',{method:'POST',headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:'Bearer '+C.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_name:name,p_email:email})});
  if(!r.ok)throw 0;const pos=await r.json();
  $('formCard').classList.add('hide');$('ok').classList.remove('hide');
  $('t').textContent='Dhanyavaad, '+name.split(' ')[0]+' ji! 🙏';$('pos').textContent='Aapka number: #'+pos;
 }catch(e){m.textContent='Maaf kijiye, kuch gadbad ho gayi. Kripya thodi der baad dobara koshish karein.';b.disabled=false;b.textContent='Early Access mein judiye'}});
