/* Progressive enhancement: content and links do not depend on GSAP. */
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');
if (toggle && navigation) {
  const closeMenu = () => { navigation.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu'; };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open); toggle.textContent = open ? 'Close' : 'Menu';
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
  window.matchMedia('(min-width: 721px)').addEventListener('change', closeMenu);
}

const hero = document.querySelector('.hero-stage');
if (hero) {
  document.body.classList.add('nav-enhanced');
  new IntersectionObserver(entries => {
    const pastHero=!entries[0].isIntersecting;
    if(!pastHero && navigation?.classList.contains('open'))return;
    document.body.classList.toggle('past-hero',pastHero);
    if(!pastHero && toggle && navigation){
      navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';
    }
  }, { rootMargin: '-120px 0px 0px 0px' }).observe(hero);
}

document.querySelector('.header-email')?.addEventListener('click',()=>{
  const contact=document.querySelector('.contact-options');
  if(contact){contact.open=true;requestAnimationFrame(()=>contact.querySelector('summary').focus({preventScroll:true}));}
  if(toggle && navigation){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';}
});

document.querySelectorAll('.scene-node-labels a').forEach(link=>{
  link.addEventListener('click',()=>{
    const section=document.querySelector(link.getAttribute('href'));
    if(section){section.setAttribute('tabindex','-1');requestAnimationFrame(()=>section.focus({preventScroll:true}));}
  });
});

let motionContext = null;
let userPaused = false;
try { userPaused = localStorage.getItem('portfolio-motion-paused') === 'true'; } catch {}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const wideScreen = window.matchMedia('(min-width: 721px)');
const gsap = window.gsap;
const siteVersion = new URL(document.currentScript?.src || location.href).searchParams.get('v') || 'current';
const motionAllowed = () => !!gsap && !userPaused && !reduceMotion.matches;

document.querySelectorAll('.timeline-item').forEach(card=>{
  card.addEventListener('pointermove',event=>{
    if(!motionAllowed() || !finePointer.matches)return;
    const rect=card.getBoundingClientRect();
    card.style.setProperty('--glass-x',`${(event.clientX-rect.left)/rect.width*100}%`);
    card.style.setProperty('--glass-y',`${(event.clientY-rect.top)/rect.height*100}%`);
  });
  card.addEventListener('pointerleave',()=>{
    card.style.removeProperty('--glass-x');card.style.removeProperty('--glass-y');
  });
});

function addSVG(parent, tag, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  parent.appendChild(element);
  return element;
}

/* Each thumbnail has a distinct motion vocabulary. These are conceptual previews. */
const cardAnimations = [];
document.querySelectorAll('.project-card').forEach((card, index) => {
  const svg = card.querySelector('svg');
  const visual = card.querySelector('.project-visual');
  const parts = {svg, visual, card, index};
  if (index === 0) {
    parts.signal = addSVG(svg, 'circle', {cx:80,cy:127,r:4,fill:'#d9b58b',class:'motion-signal',opacity:0});
  } else if (index === 1) {
    parts.checks = [95,128,161].map(y => addSVG(svg,'path',{d:`M337 ${y-2}l2 2 4-5`,fill:'none',stroke:'#9b714a','stroke-width':1.7,opacity:0}));
  } else if (index === 2) {
    parts.route = addSVG(svg,'path',{d:'M83 188C147 195 112 115 202 132S303 56 346 85 420 98 476 52',fill:'none',stroke:'#b56d3d','stroke-width':3,'stroke-linecap':'round',class:'hover-route'});
  } else if (index === 3) {
    parts.checks = [118,143,168].map(y => addSVG(svg,'circle',{cx:347,cy:y-3,r:7,fill:'none',stroke:'#889577','stroke-width':1.2,opacity:0}));
  } else {
    parts.bars = Array.from(svg.querySelectorAll('.probability-bar'));
  }
  cardAnimations.push(parts);
});

function animateCard(parts) {
  if (!motionAllowed()) return;
  const tl = gsap.timeline();
  if (parts.index === 0) {
    tl.set(parts.signal, {opacity:1}).fromTo(parts.signal, {attr:{cx:80,cy:127}}, {attr:{cx:480,cy:127},duration:1.1,ease:'power1.inOut'}).to(parts.signal,{opacity:0,duration:.3});
  } else if (parts.index === 1) {
    tl.fromTo(parts.checks,{opacity:0},{opacity:1,duration:.25,stagger:.18});
  } else if (parts.index === 2) {
    tl.fromTo(parts.route,{strokeDashoffset:650},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut'});
  } else if (parts.index === 3) {
    tl.fromTo(parts.checks,{opacity:0},{opacity:.8,duration:.35,stagger:.13});
  } else {
    tl.fromTo(parts.bars,{scaleX:.65,transformOrigin:'left center'},{scaleX:1,duration:.65,stagger:.08,ease:'power3.out'});
  }
  return tl;
}

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  const visible = [];
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(' ').includes(button.dataset.filter);
    if (!card.hidden) visible.push(card);
  });
  if (motionAllowed()) {
    gsap.killTweensOf(visible);
    gsap.fromTo(visible, {opacity:.4,y:12}, {opacity:1,y:0,duration:.4,stagger:.045,clearProps:'opacity,transform',overwrite:true});
  }
  const status = document.querySelector('#filter-status');
  if (status) status.textContent = `${visible.length} projects shown`;
}));

function setupMotion() {
  if (motionContext) { motionContext.revert(); motionContext = null; }
  if (gsap) {
    const transient = document.querySelectorAll('.project-card,.section-heading,.research-card,.writing-card,.timeline-item,.case-content');
    gsap.killTweensOf(transient);
    gsap.set(transient,{clearProps:'opacity,transform'});
  }
  window.dispatchEvent(new CustomEvent('portfolio:motion'));
  if (!motionAllowed()) return;
  motionContext = gsap.context(() => {
    const cleanup = [];
    const listen = (target,event,handler) => { target.addEventListener(event,handler); cleanup.push(()=>target.removeEventListener(event,handler)); };
    const loops = [];
    if (hero) {
      gsap.timeline({defaults:{ease:'power3.out'}})
        .from('.hero-words .eyebrow',{opacity:0,y:10,duration:.7})
        .from('.headline-line',{opacity:0,y:25,duration:.9,stagger:.1},'-.45')
        .from('.hero-role, .hero-copy, .hero-words .actions',{opacity:0,y:16,duration:.7,stagger:.1},'-.65')
        .from('.sculpture-stage',{opacity:0,scale:.96,duration:1.2},'<')
        .from('.hero-foot > *',{opacity:0,y:8,duration:.6,stagger:.07},'-.8');
      if (wideScreen.matches) {
        loops.push(gsap.to('.ambient-one',{x:-85,y:35,scale:1.15,duration:13,repeat:-1,yoyo:true,ease:'sine.inOut'}));
        loops.push(gsap.to('.ambient-two',{x:65,y:-55,duration:16,repeat:-1,yoyo:true,ease:'sine.inOut'}));
      }
      if (finePointer.matches && wideScreen.matches) {
        const stage = document.querySelector('.sculpture-stage');
        const sculpture = document.querySelector('.systems-sculpture');
        const xTo = gsap.quickTo(sculpture,'rotationY',{duration:1.2,ease:'power3.out'});
        const yTo = gsap.quickTo(sculpture,'rotationX',{duration:1.2,ease:'power3.out'});
        listen(stage,'pointermove',event => { const r=stage.getBoundingClientRect(); xTo((event.clientX-r.left-r.width/2)/r.width*13); yTo(-(event.clientY-r.top-r.height/2)/r.height*9); });
        listen(stage,'pointerleave',()=>{ xTo(0);yTo(0); });
      }
      const updateLoops = () => { const r=hero.getBoundingClientRect();const active=!document.hidden && r.bottom>75 && r.top<window.innerHeight; loops.forEach(loop=>loop.paused(!active)); };
      const observer = new IntersectionObserver(updateLoops);
      observer.observe(hero); cleanup.push(()=>observer.disconnect());
      listen(document,'visibilitychange',updateLoops);
      updateLoops();
    }
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || !motionAllowed()) return;
        gsap.fromTo(entry.target,{y:18,opacity:.45},{y:0,opacity:1,duration:.7,ease:'power2.out',clearProps:'opacity,transform'});
        revealObserver.unobserve(entry.target);
      });
    },{threshold:.12});
    document.querySelectorAll('.section-heading,.research-card,.writing-card,.timeline-item,.case-content').forEach(node=>revealObserver.observe(node));
    cleanup.push(()=>revealObserver.disconnect());

    cardAnimations.forEach(parts => {
      let activeTween;
      const play = () => { activeTween?.kill(); activeTween = animateCard(parts); };
      listen(parts.visual,'focus',play);
      if (finePointer.matches) {
        const xTo=gsap.quickTo(parts.svg,'rotationY',{duration:.6,ease:'power3.out'});
        const yTo=gsap.quickTo(parts.svg,'rotationX',{duration:.6,ease:'power3.out'});
        listen(parts.visual,'pointerenter',play);
        listen(parts.visual,'pointermove',event=>{const r=parts.visual.getBoundingClientRect();xTo((event.clientX-r.left-r.width/2)/r.width*5);yTo(-(event.clientY-r.top-r.height/2)/r.height*4);});
        listen(parts.visual,'pointerleave',()=>{xTo(0);yTo(0);});
      }
      cleanup.push(()=>{activeTween?.revert();gsap.set(parts.svg,{clearProps:'transform'});});
    });
    return ()=>cleanup.forEach(fn=>fn());
  });
}

if (gsap) {
  const motionButton=document.createElement('button');
  motionButton.className='motion-button'; motionButton.type='button';
  const labelButton = () => {
    const stopped=userPaused || reduceMotion.matches;
    document.documentElement.classList.toggle('motion-paused',stopped);
    let preferenceStyle=document.querySelector('#motion-preference');
    if(!preferenceStyle){preferenceStyle=document.createElement('style');preferenceStyle.id='motion-preference';document.head.appendChild(preferenceStyle);}
    preferenceStyle.textContent=stopped?'@view-transition{navigation:none}':'';
    motionButton.innerHTML=`<span aria-hidden="true">${stopped?'▷':'Ⅱ'}</span><span>${stopped?'Motion off':'Pause motion'}</span>`;
    motionButton.setAttribute('aria-pressed',String(stopped));
    motionButton.setAttribute('aria-label',reduceMotion.matches?'Motion disabled by your reduced-motion preference':stopped?'Enable motion':'Pause motion');
    motionButton.disabled=reduceMotion.matches;
  };
  motionButton.addEventListener('click',()=>{
    userPaused=!userPaused;
    try {localStorage.setItem('portfolio-motion-paused',String(userPaused));} catch {}
    labelButton();setupMotion();
  });
  document.body.appendChild(motionButton);
  reduceMotion.addEventListener('change',()=>{labelButton();setupMotion();});
  finePointer.addEventListener('change',setupMotion);
  wideScreen.addEventListener('change',setupMotion);
  labelButton();setupMotion();
}

/* Load the actual React Three Fiber scene only for suitable desktop visitors. */
if (hero) {
  let disposeScene=null;
  let generation=0;
  const isPaused=()=>userPaused || reduceMotion.matches;
  async function syncScene() {
    const ticket=++generation;
    const eligible=wideScreen.matches && !reduceMotion.matches && !navigator.connection?.saveData && (navigator.deviceMemory===undefined || navigator.deviceMemory>=4);
    if(!eligible){disposeScene?.();disposeScene=null;document.body.classList.remove('has-webgl');return;}
    if(disposeScene)return;
    try {
      const {mountHero}=await import(`./hero-scene.js?v=${encodeURIComponent(siteVersion)}`);
      if(ticket!==generation)return;
      disposeScene=mountHero({host:document.querySelector('#hero-webgl'),stage:document.querySelector('.sculpture-stage'),hero,isPaused});
    } catch { document.querySelector('#hero-webgl').dataset.scene='fallback'; }
  }
  wideScreen.addEventListener('change',syncScene);
  reduceMotion.addEventListener('change',syncScene);
  if('requestIdleCallback' in window)requestIdleCallback(syncScene,{timeout:1800});else setTimeout(syncScene,300);
}

document.querySelectorAll('.contact-copy').forEach(button=>{
  button.addEventListener('click',async()=>{
    const panel=button.closest('.contact-panel');
    const status=panel.querySelector('.contact-feedback');
    try {
      await navigator.clipboard.writeText(button.dataset.email);
      button.textContent='Copied ✓';status.textContent='Email address copied.';
    } catch {
      const selection=window.getSelection();
      const range=document.createRange();range.selectNodeContents(panel.querySelector('.contact-address'));
      selection.removeAllRanges();selection.addRange(range);
      status.textContent='Select and copy the email above, or choose Gmail.';
    }
  });
});
document.querySelectorAll('.contact-options').forEach(details=>{
  details.addEventListener('keydown',event=>{if(event.key==='Escape'){details.open=false;details.querySelector('summary').focus();}});
});
