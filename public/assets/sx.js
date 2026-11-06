
(function(){
  // Inquiry list count (same storage key the catalog uses)
  try{
    var items=JSON.parse(localStorage.getItem('suplushies-inquiry-v1')||'[]');
    var n=Array.isArray(items)?items.length:0;
    document.querySelectorAll('a[href="/inquiry/"] span.grid').forEach(function(el){el.textContent=n;});
    var a=document.querySelector('header a[href="/inquiry/"]'); if(a) a.setAttribute('aria-label','Inquiry list, '+n+' items');
  }catch(e){}

  // Mobile menu
  var btn=document.querySelector('header button[aria-controls="mobile-nav"]');
  var nav=document.getElementById('mobile-nav');
  if(btn&&nav){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o?'true':'false');});}

  // Netlify form submit (same endpoint the rest of the site uses)
  function submitForm(form,done){
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var status=form.querySelector('[role=status]');
      var fd=new FormData(form), map={};
      fd.forEach(function(v,k){ if(typeof v==='string'&&v!==''){ (map[k]=map[k]||[]).push(v);} });
      var body=new URLSearchParams(); body.set('form-name',form.getAttribute('name'));
      Object.keys(map).forEach(function(k){ if(k!=='form-name') body.set(k,map[k].join(', ')); });
      var b=form.querySelector('button[type=submit]'); if(b){b.disabled=true;}
      fetch('/__forms.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()})
        .then(function(r){ if(!r.ok) throw new Error(r.status); done(form,map); })
        .catch(function(){ if(status){status.className='sx-err';status.textContent='Something went wrong. Please try again, or email su@suplushies.com.';} if(b) b.disabled=false; });
    });
  }
  document.querySelectorAll('form[name=newsletter]').forEach(function(f){
    submitForm(f,function(form){ var s=form.querySelector('[role=status]'); form.querySelectorAll('input,button').forEach(function(i){i.disabled=true;}); if(s){s.className='text-sm'; s.textContent="You're in. Watch your inbox for new stories.";} });
  });
  var sf=document.querySelector('form[name=store-suggestion]');
  if(sf){
    submitForm(sf,function(form,map){
      var store=(map['store-name']||[''])[0], city=(map['store-city']||[''])[0];
      form.innerHTML='<div class="sx-ok" role="status"><p style="font-weight:700;font-size:1.1rem">Thank you! We’ll reach out to '+store.replace(/[<>&]/g,'')+'.</p><p style="margin-top:.4rem">We’ll let them know shoppers in '+city.replace(/[<>&]/g,'')+' are asking for these. If you left your email, we’ll tell you when it’s on their shelves.</p><p style="margin-top:.8rem"><a href="/find-a-store/" style="text-decoration:underline">Suggest another store</a></p></div>';
      form.scrollIntoView({behavior:'smooth',block:'center'});
    });
    var rel=sf.querySelector('select[name=relationship]'), own=document.getElementById('own-note');
    if(rel&&own){rel.addEventListener('change',function(){own.classList.toggle('sx-hide',!/own|manage|buy for/i.test(rel.value));});}
  }

  // Store finder search: no public stockists yet
  var q=document.getElementById('store-q'), live=document.getElementById('store-live');
  function nothing(){ if(live) live.textContent='No listed stockists near "'+(q.value||'you')+'" yet. Tell us your favorite shop below and we’ll reach out to them.'; var f=document.getElementById('suggest'); if(f) f.scrollIntoView({behavior:'smooth'}); }
  if(q){ q.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault();nothing();} }); var go=document.getElementById('store-go'); if(go) go.addEventListener('click',nothing); }

  // Story filter by character
  var pills=document.querySelectorAll('[data-filter]');
  pills.forEach(function(p){ p.addEventListener('click',function(){
    var who=p.getAttribute('data-filter');
    pills.forEach(function(x){x.setAttribute('aria-pressed',x===p?'true':'false');});
    document.querySelectorAll('[data-cast]').forEach(function(c){ c.classList.toggle('sx-hide', who!=='all' && c.getAttribute('data-cast').split(' ').indexOf(who)<0); });
  });});
})();
