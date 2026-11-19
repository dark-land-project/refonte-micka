(() => {
'use strict';
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const $ = (selector, root=document) => root.querySelector(selector);
const header = $('#site-header');
const progress = $('#progress');
const backTop = $('#backtop');
function updateScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  if(progress) progress.style.width = (100 * scrollY / max).toFixed(2) + '%';
  header?.classList.toggle('stuck', scrollY > 25);
  backTop?.classList.toggle('visible', scrollY > 550);
}
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();
$('#backtop button')?.addEventListener('click', () => scrollTo({top: 0, behavior: 'smooth'}));
const motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!motionOff && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-in'); observer.unobserve(entry.target); } });
  }, {rootMargin: '0px 0px -40px 0px', threshold: .07});
  $$('.reveal').forEach(el => observer.observe(el));
} else $$('.reveal').forEach(el => el.classList.add('is-in'));
const mobileToggle = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMobile(){ mobileToggle?.setAttribute('aria-expanded','false'); mobileMenu?.classList.remove('open'); document.body.classList.remove('menu-open'); }
mobileToggle?.addEventListener('click', () => {
  const next = mobileToggle.getAttribute('aria-expanded') !== 'true';
  mobileToggle.setAttribute('aria-expanded', String(next));
  mobileMenu.classList.toggle('open',next);
  document.body.classList.toggle('menu-open',next);
});
$$('#mobile-menu a').forEach(a => a.addEventListener('click', closeMobile));
const mega = $('.nav-mega');
const megaBtn = $('.nav-services');
megaBtn?.addEventListener('click', () => {let open = !mega.classList.contains('open'); mega.classList.toggle('open',open);megaBtn.setAttribute('aria-expanded',String(open));});
document.addEventListener('click',e => { if(mega && !mega.contains(e.target)){mega.classList.remove('open');megaBtn.setAttribute('aria-expanded','false');} });
document.addEventListener('keydown',e => { if(e.key==='Escape'){ closeMobile(); mega?.classList.remove('open'); megaBtn?.setAttribute('aria-expanded','false'); } });
// Filterable gallery + keyboard accessible fullscreen image viewer.
const tiles = $$('.gallery-tile');
const filters = $$('.filter');
let visible = tiles;
let currentIndex = 0;
let previousFocus = null;
const lightbox = $('#lightbox');
function updateLightbox() {
  if(!lightbox || !visible.length) return;
  const tile = visible[currentIndex];
  const img = $('.lb-media img',lightbox);
  img.src = tile.dataset.src; img.alt = tile.dataset.title;
  $('.lb-caption',lightbox).textContent = tile.dataset.title;
  $('.lb-count',lightbox).textContent = String(currentIndex + 1).padStart(2,'0') + ' / ' + String(visible.length).padStart(2,'0');
}
function openLightbox(tile) {
  previousFocus = document.activeElement;
  currentIndex = Math.max(0, visible.indexOf(tile));
  if(lightbox){ lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); document.body.classList.add('menu-open'); updateLightbox(); $('.lb-close',lightbox)?.focus(); }
}
function closeLightbox(){ if(lightbox){lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); document.body.classList.remove('menu-open');previousFocus?.focus();} }
function move(delta){ if(visible.length){currentIndex=(currentIndex+delta+visible.length)%visible.length;updateLightbox();} }
filters.forEach(button => button.addEventListener('click',()=> {
  const category = button.dataset.filter;
  filters.forEach(b => {b.classList.toggle('active', b===button);b.setAttribute('aria-pressed',String(b===button));});
  tiles.forEach(tile => {tile.hidden = category!=='all' && tile.dataset.category!==category;});
  visible = tiles.filter(tile => !tile.hidden);
}));
tiles.forEach(tile=>tile.addEventListener('click',()=>openLightbox(tile)));
$('.lb-close')?.addEventListener('click',closeLightbox);
$('.lb-prev')?.addEventListener('click',()=>move(-1));
$('.lb-next')?.addEventListener('click',()=>move(1));
lightbox?.addEventListener('click',e=>{if(e.target===lightbox) closeLightbox();});
document.addEventListener('keydown', e => {
 if(!lightbox?.classList.contains('open'))return;
 if(e.key==='Escape'){e.preventDefault();closeLightbox();}
 if(e.key==='ArrowRight'){e.preventDefault();move(1);}
 if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}
 if(e.key==='Tab') {const els=$$('button',lightbox);const first=els[0];const last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
// No backend in static HTML: open an email draft with entered details.
$('#contact-form')?.addEventListener('submit',e=>{
 e.preventDefault();
 const f=e.currentTarget;
 if(!f.reportValidity()) return;
 const d=new FormData(f);
 const name=String(d.get('name')||'').trim();
 const email=String(d.get('email')||'').trim();
 const service=String(d.get('service')||'').trim();
 const subject=`Demande de devis — ${service} — ${name}`;
 const body=[`Bonjour,`,``,`Je vous contacte pour un projet de ${service}.`,``,`Nom : ${name}`,`E-mail : ${email}`,`Téléphone : ${d.get('phone')||'Non communiqué'}`,`Commune du chantier : ${d.get('city')||'Non communiquée'}`,``,`Description :`,` ${d.get('message')||''}`,``,`Bien cordialement,`,name].join('\n');
 const link=`mailto:micka.renovation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 $('.form-info',f).textContent='Votre messagerie va s’ouvrir. Vérifiez le message puis cliquez sur « Envoyer ».';
 window.location.href=link;
});
})();
