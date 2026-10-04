'use strict';

// PERSONALIZE HERE. Separate paragraphs with a blank line. Plain text, not HTML.
const FINAL_MESSAGE = `
PASTE MY PERSONAL MESSAGE HERE
`;

const CONFIG = {
  girlfriendName: 'Shashi',
  boyfriendName: 'Melan',
  openingGreeting: 'Hi, Shashi ♡',
  openingSubtitle: 'I made a tiny little world for you…',
  mainQuestion: 'Green light or Red light? 😁',
  greenLightText: '🟢 Green Light',
  redLightText: '🔴 Red Light',
  greenSuccessText: 'Green light it is… ❤️',
  finalMessage: FINAL_MESSAGE,
  flowersRequired: 4,
  starsRequired: 5,
  redButtonReactions: ['Nice try 😂', 'Nope 😌', 'Not that one 👀', 'You know which one to press ❤️'],
  enableHaptics: true,
  enableSound: false,
  audioFile: 'assets/audio/dream.mp3', // Add your own licensed music, then enable sound.
  animationSpeed: 1,
  decorativeIntensity: 'medium' // 'low' or 'medium'
};

(() => {
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sceneIds = ['opening','intro','flowers','stars','choice','success','suspense','special','pause','letter','ending'];
  const state = { scene: 'opening', flowers: 0, stars: 0, attempts: 0, timers: new Set(), redX: 0, redY: 0, lastEscape: 0 };
  const speed = Math.max(.25, Math.min(3, Number(CONFIG.animationSpeed) || 1));
  const flowerCount = Math.max(1, Math.min(6, Math.round(Number(CONFIG.flowersRequired) || 4)));
  const starCount = Math.max(1, Math.min(8, Math.round(Number(CONFIG.starsRequired) || 5)));
  document.documentElement.style.setProperty('--speed', speed);
  document.body.classList.toggle('low-decoration', CONFIG.decorativeIntensity === 'low');

  // Every delayed action belongs to its scene and is cancelled on navigation/replay.
  function later(fn, ms, fixed = false) {
    const timer = setTimeout(() => { state.timers.delete(timer); fn(); }, fixed ? ms : ms * speed);
    state.timers.add(timer);
    return timer;
  }
  function clearTimers() { state.timers.forEach(clearTimeout); state.timers.clear(); }
  function haptic(pattern = 12) {
    if (!CONFIG.enableHaptics || reducedMotion.matches) return;
    try { navigator.vibrate?.(pattern); } catch { /* Unsupported devices stay silent. */ }
  }
  function sparkAt(x,y) {
    if (reducedMotion.matches || CONFIG.decorativeIntensity === 'low') return;
    for(let i=0;i<5;i++) {
      const spark = document.createElement('span');
      spark.className='spark';spark.textContent=i%2 ? '✧' : '·';
      spark.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(i*1.26)*45}px;--dy:${Math.sin(i*1.26)*45-20}px`;
      $('#sparkles').append(spark);
      spark.addEventListener('animationend',()=>spark.remove(),{once:true});
    }
  }
  function feedback(element) { const r=element.getBoundingClientRect();sparkAt(r.x+r.width/2,r.y+r.height/2);haptic(); }
  function showScene(id) {
    if(!sceneIds.includes(id)) return;
    clearTimers();
    state.scene=id;
    document.querySelectorAll('.scene').forEach(scene=>{scene.hidden=scene.id!==id;});
    document.querySelectorAll('.flying-flower').forEach(el=>el.remove());
    $('#sparkles').replaceChildren();
    document.body.classList.toggle('is-night',['stars','ending'].includes(id));
    document.body.classList.toggle('calm',sceneIds.indexOf(id)>=5);
    window.scrollTo({top:0,behavior:'instant'});
    document.querySelectorAll('.chapter-dots i').forEach((dot,i)=>dot.classList.toggle('active',i===Math.min(4,Math.floor(sceneIds.indexOf(id)/2))));
    requestAnimationFrame(()=>{
      if(state.scene!==id) return;
      $(`#${id} h1, #${id} h2`)?.focus({preventScroll:true});
      positionFooter();
      if(id==='choice') resetRed();
    });
    if(id==='success') {haptic([15,80,15]);later(()=>showScene('suspense'),3200);}
    if(id==='suspense') later(()=>showScene('special'),4600);
    // Deliberately independent of animationSpeed AND reduced-motion preferences.
    if(id==='pause') later(()=>{showScene('letter');haptic(18);},5000,true);
  }
  function positionFooter(){const scene=$(`#${state.scene}`);document.querySelector('footer').style.top=`${Math.max(scene.offsetHeight,window.innerHeight)-42}px`;document.querySelector('footer').style.bottom='auto';}

  function flowerSVG(color='#d9a1b5') {
    return `<svg viewBox="0 0 70 120" aria-hidden="true"><path d="M35 45Q27 79 35 113M33 87Q10 85 14 68Q33 68 33 87M32 99Q54 94 57 80Q35 81 32 99" fill="#a8b499" stroke="#899b83" stroke-width="2"/><g fill="${color}" stroke="#a8758922"><ellipse cx="35" cy="25" rx="11" ry="17"/><ellipse cx="51" cy="37" rx="11" ry="17" transform="rotate(65 51 37)"/><ellipse cx="45" cy="55" rx="11" ry="17" transform="rotate(145 45 55)"/><ellipse cx="25" cy="55" rx="11" ry="17" transform="rotate(35 25 55)"/><ellipse cx="19" cy="37" rx="11" ry="17" transform="rotate(-65 19 37)"/></g><circle cx="35" cy="40" r="9" fill="#eed5a0"/><circle cx="33" cy="38" r="2" fill="#fff2c8"/></svg>`;
  }
  function makeFlowers(){
    $('#flower-garden').replaceChildren();
    const colors=['#d5a1b4','#d9c0d9','#e6b4a2','#c2bad6','#d7a6bc','#e4c9a0'];
    for(let i=0;i<flowerCount;i++){
      const b=document.createElement('button');b.className='flower';b.setAttribute('aria-label',`Pick flower ${i+1}`);b.innerHTML=flowerSVG(colors[i]);
      b.addEventListener('click',()=>{
        if(b.disabled || state.scene!=='flowers') return;
        const rect=b.getBoundingClientRect();const destination=$('#flowers .illustration').getBoundingClientRect();
        const flying=document.createElement('div');flying.className='flying-flower';flying.innerHTML=b.innerHTML;flying.style.left=`${rect.x}px`;flying.style.top=`${rect.y}px`;document.body.append(flying);
        requestAnimationFrame(()=>{flying.style.transform=`translate(${destination.x+destination.width*.55-rect.x}px,${destination.y+destination.height*.6-rect.y}px) scale(.55)`;flying.style.opacity='.3';});
        later(()=>flying.remove(),750);b.disabled=true;b.classList.add('collected');feedback(b);state.flowers++;
        $('#flower-status').textContent=state.flowers===flowerCount?'For you. Every single one. ♡':`${state.flowers} little ${state.flowers===1?'flower':'flowers'}, picked with love.`;
        const stem=document.createElement('span');
        stem.innerHTML=flowerSVG(colors[i]);
        stem.style.setProperty('--stem-angle',`${(state.flowers-1-(flowerCount-1)/2)*17}deg`);
        $('#bouquet').append(stem);$('#bouquet').style.opacity='1';
        const next=[...$('#flower-garden').children].find(el=>!el.disabled);next?.focus({preventScroll:true});
        if(state.flowers===flowerCount){$('#flowers').classList.add('complete');later(()=>showScene('stars'),2300);}
      });$('#flower-garden').append(b);
    }
  }
  function makeStars(){
    $('#star-buttons').replaceChildren();
    const positions=[[20,25],[42,20],[78,25],[80,54],[50,88],[20,54],[58,20],[50,40]];
    for(let i=0;i<starCount;i++){
      const b=document.createElement('button');b.className='star';b.textContent='✦';b.setAttribute('aria-label',`Light star ${i+1}`);b.setAttribute('aria-pressed','false');b.style.left=`${positions[i][0]}%`;b.style.top=`${positions[i][1]}%`;
      b.addEventListener('click',()=>{
        if(b.disabled || state.scene!=='stars')return;
        b.disabled=true;b.classList.add('lit');b.setAttribute('aria-pressed','true');state.stars++;feedback(b);
        $('#star-status').textContent=state.stars===starCount?'Look at that. A sky that feels like us. ♡':`${state.stars} ${state.stars===1?'wish':'wishes'} in our little sky.`;
        [...$('#star-buttons').children].find(el=>!el.disabled)?.focus({preventScroll:true});
        if(state.stars===starCount){$('#constellation').classList.add('complete');haptic(18);later(()=>showScene('choice'),2100);}
      });$('#star-buttons').append(b);
    }
  }

  // Dedicated lower arena excludes the heading, stable Green CTA, reactions and footer.
  // Intersect its rectangle with the visible viewport for pinch zoom/browser chrome.
  function redBounds(){
    const arena=$('#red-arena').getBoundingClientRect();const button=$('#red').getBoundingClientRect();const vv=window.visualViewport;
    const left=vv?.offsetLeft||0, top=vv?.offsetTop||0;
    const right=left+(vv?.width||innerWidth), bottom=top+(vv?.height||innerHeight);
    return {minX:Math.max(6,left+8-arena.left),maxX:Math.min(arena.width-button.width-6,right-8-arena.left-button.width),minY:Math.max(6,top+8-arena.top),maxY:Math.min(arena.height-button.height-6,bottom-12-arena.top-button.height),width:button.width,height:button.height,arena};
  }
  function moveRed(x,y){state.redX=x;state.redY=y;$('#red').style.transform=`translate(${x}px,${y}px)`;}
  function resetRed(){if(state.scene!=='choice')return;const b=redBounds();if(b.maxX<b.minX||b.maxY<b.minY)return;moveRed((b.minX+b.maxX)/2,b.minY);}
  function escapeRed(event){
    if(state.scene!=='choice')return;
    event?.preventDefault();
    const now=performance.now();if(now-state.lastEscape<180)return;state.lastEscape=now;
    const b=redBounds();
    if(b.maxX>=b.minX&&b.maxY>=b.minY){
      const px=Number.isFinite(event?.clientX)?event.clientX-b.arena.left:state.redX+b.width/2;
      const py=Number.isFinite(event?.clientY)?event.clientY-b.arena.top:state.redY+b.height/2;
      let best=null;
      for(let row=0;row<3;row++)for(let col=0;col<5;col++){
        const x=b.minX+(b.maxX-b.minX)*col/4,y=b.minY+(b.maxY-b.minY)*row/2;
        const pointerDistance=Math.hypot(x+b.width/2-px,y+b.height/2-py);
        const travel=Math.hypot(x-state.redX,y-state.redY);
        const candidate={x,y,score:pointerDistance+travel*.55};if(!best||candidate.score>best.score)best=candidate;
      }
      if(best)moveRed(best.x,best.y);
    }
    state.attempts++;
    const reactions=CONFIG.redButtonReactions.length?CONFIG.redButtonReactions:['Nice try 😂'];
    const text=state.attempts<=reactions.length?reactions[state.attempts-1]:['Still the other one 😌','That button has plans of its own 😂','Follow the green little glow ♡'][(state.attempts-reactions.length-1)%3];
    const reaction=$('#red-reaction');reaction.textContent=text;reaction.classList.remove('react');void reaction.offsetWidth;reaction.classList.add('react');
    if(state.attempts===4){$('#easter-egg').hidden=false;later(()=>$('#easter-egg').hidden=true,2400);}
  }
  $('#red').addEventListener('pointerdown',escapeRed);
  $('#red').addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')escapeRed(event);});
  $('#red').addEventListener('click',event=>{event.preventDefault();if(event.detail===0)escapeRed(event);});
  $('#green').addEventListener('click',()=>{if(state.scene==='choice'){feedback($('#green'));showScene('success');}});
  $('#reveal').addEventListener('click',()=>{if(state.scene==='special'){feedback($('#reveal'));showScene('pause');}});
  document.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>{feedback(button);showScene(button.dataset.next);}));

  function fillLetter(){
    $('#letter-title').textContent=`My dear ${CONFIG.girlfriendName},`;
    $('#signature').textContent=CONFIG.boyfriendName;
    const message=String(CONFIG.finalMessage).trim();
    // A gentle sample keeps the out-of-the-box experience complete; replace FINAL_MESSAGE above.
    const sample=`I made this little world because sometimes the smallest things hold the biggest feelings. A flower. A wish. A moment with you.\n\nAnd somewhere between all those little things, there is this: I’m so happy it’s you.\n\nThank you for being part of my world, ${CONFIG.girlfriendName}. You make it a softer, brighter place.\n\nIf I could choose my favourite place to be, it would always be beside you.`;
    (message&&message!=='PASTE MY PERSONAL MESSAGE HERE'?message:sample).split(/\n\s*\n/).forEach((text,i)=>{const p=document.createElement('p');p.textContent=text.trim();p.style.animationDelay=`${Math.min(i*.12,.6)}s`;$('#letter-body').append(p);});
  }
  function setupAudio(){
    if(!CONFIG.enableSound||!CONFIG.audioFile)return;
    const control=$('#sound'),audio=new Audio();audio.loop=true;audio.volume=.28;audio.preload='none';audio.src=CONFIG.audioFile;control.hidden=false;
    control.addEventListener('click',async()=>{
      if(audio.paused){try{await audio.play();control.textContent='Sound on ♫';control.setAttribute('aria-pressed','true');}catch{control.textContent='Sound unavailable';control.disabled=true;}}
      else{audio.pause();control.textContent='Sound off ♫';control.setAttribute('aria-pressed','false');}
    });
    audio.addEventListener('error',()=>{control.textContent='Sound unavailable';control.disabled=true;});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();control.textContent='Sound off ♫';control.setAttribute('aria-pressed','false');}});
  }
  function reset(){
    clearTimers();state.flowers=0;state.stars=0;state.attempts=0;state.lastEscape=0;
    $('#flowers').classList.remove('complete');$('#constellation').classList.remove('complete');$('#bouquet').replaceChildren();$('#bouquet').style.opacity='0';$('#easter-egg').hidden=true;
    $('#red-reaction').textContent='A very difficult decision. Obviously.';$('#flower-status').textContent='Tap each little flower to gather it.';$('#star-status').textContent='Tap the stars. Make a little wish.';
    makeFlowers();makeStars();showScene('opening');
  }
  $('#replay').addEventListener('click',reset);
  $('#opening-title').textContent=CONFIG.openingGreeting;
  $('#opening-subtitle').textContent=CONFIG.openingSubtitle;
  $('#choice-title').textContent=CONFIG.mainQuestion;
  $('#green').textContent=CONFIG.greenLightText;$('#red').textContent=CONFIG.redLightText;$('#success-title').textContent=CONFIG.greenSuccessText;
  $('#footer-love').textContent=`MADE WITH LOVE, BY ${CONFIG.boyfriendName.toUpperCase()}`;
  $('.monogram').innerHTML='';$('.monogram').append(document.createTextNode(CONFIG.boyfriendName.charAt(0).toLowerCase()+' '));const heart=document.createElement('span');heart.textContent='♡';$('.monogram').append(heart,document.createTextNode(' '+CONFIG.girlfriendName.charAt(0).toLowerCase()));
  document.title=`A little world for ${CONFIG.girlfriendName} ♡`;
  document.querySelectorAll('[data-couple]').forEach(el=>{const img=document.createElement('img');img.src=`assets/illustrations/${el.dataset.couple==='seated'?'seated':'couple'}.svg`;img.alt='';img.width=500;img.height=330;el.append(img);img.addEventListener('load',positionFooter);});
  // Anchor the growing bouquet to the boy's hands, then offer it toward the girl.
  $('#flowers .illustration').append($('#bouquet'));
  let resizeFrame;function resized(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{positionFooter();resetRed();});}
  window.addEventListener('resize',resized);window.visualViewport?.addEventListener('resize',resized);window.visualViewport?.addEventListener('scroll',resized);window.addEventListener('scroll',()=>{if(state.scene==='choice')resetRed();},{passive:true});
  fillLetter();setupAudio();reset();
})();
