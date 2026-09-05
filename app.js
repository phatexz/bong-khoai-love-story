const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const scenes=$$('.scene');
const AUDIO_BASE='https://raw.githubusercontent.com/phatexz/bong-khoai-love-story/9bc3c499f9b89aff3d38795257f161c5975b0d04/assets/audio';
const PARTS={
 1:{name:'Phần I · Mùa áo trắng',track:`${AUDIO_BASE}/1.mp3`,label:'1.mp3',anchor:'#part1'},
 2:{name:'Phần II · Những năm mình lớn',track:`${AUDIO_BASE}/2.mp3`,label:'2.mp3',anchor:'#part2'},
 3:{name:'Phần III · Về chung một nhà',track:`${AUDIO_BASE}/3.mp3`,label:'3.mp3',anchor:'#part3'}
};
const music=$('#music'),audioBtn=$('#audioBtn'),trackPill=$('#trackPill'),partLabel=$('#partLabel');
let audioOn=false,currentPart=1,currentScene=0,isSwitching=false,pendingPart=null,fadeTimer=null;

function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function smooth(t){t=clamp(t);return t*t*(3-2*t)}
function setTrackUI(part,status=''){
 const p=PARTS[part];
 partLabel.textContent=p.name;
 trackPill.textContent=status||`Nhạc: ${p.label}`;
 $$('[data-part-jump]').forEach(b=>{
  const on=+b.dataset.partJump===part;
  b.classList.toggle('active',on);
  b.setAttribute('aria-current',on?'true':'false');
 });
}
function fadeVolume(to,duration=420,done){
 clearInterval(fadeTimer);
 const from=music.volume,steps=18;
 let n=0;
 fadeTimer=setInterval(()=>{
  n++;
  music.volume=from+(to-from)*(n/steps);
  if(n>=steps){clearInterval(fadeTimer);music.volume=to;done&&done()}
 },duration/steps);
}
async function replaceTrack(part){
 const cfg=PARTS[part];
 music.pause();
 music.src=cfg.track;
 music.dataset.part=String(part);
 music.volume=0;
 music.load();
 setTrackUI(part,`Đang tải: ${cfg.label}`);
 if(audioOn){
  try{
   await music.play();
   fadeVolume(.72,520);
  }catch(e){
   setTrackUI(part,`Chạm lại Âm thanh để phát ${cfg.label}`);
   audioOn=false;
   audioBtn.classList.remove('on');
   audioBtn.setAttribute('aria-pressed','false');
  }
 }
}
async function loadPartTrack(part,force=false){
 if(isSwitching){pendingPart=part;return}
 const cfg=PARTS[part];
 if(!cfg)return;
 if(music.dataset.part===String(part)&&!force){setTrackUI(part);return}
 isSwitching=true;
 const run=async()=>{
  await replaceTrack(part);
  isSwitching=false;
  if(pendingPart&&pendingPart!==part){const next=pendingPart;pendingPart=null;loadPartTrack(next)}else pendingPart=null;
 };
 if(!music.paused&&music.volume>.02)fadeVolume(0,260,run);else run();
}
function enableAudio(on){
 audioOn=on;
 audioBtn.classList.toggle('on',on);
 audioBtn.setAttribute('aria-pressed',on?'true':'false');
 if(on)loadPartTrack(currentPart,true);
 else fadeVolume(0,220,()=>{music.pause();setTrackUI(currentPart)});
}

music.addEventListener('playing',()=>setTrackUI(currentPart,`Đang phát: ${PARTS[currentPart].label}`));
music.addEventListener('waiting',()=>setTrackUI(currentPart,`Đang tải: ${PARTS[currentPart].label}`));
music.addEventListener('canplay',()=>{if(audioOn&&music.paused)music.play().catch(()=>{})});
music.addEventListener('error',()=>setTrackUI(currentPart,`Không tải được nhạc: ${PARTS[currentPart].label}`));

audioBtn.addEventListener('click',()=>enableAudio(!audioOn));
$('#fullBtn').addEventListener('click',async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch(e){}});
$('#startSound').addEventListener('click',()=>{$('#soundGate').classList.add('hidden');document.body.classList.remove('no-scroll');enableAudio(true)});
$('#startSilent').addEventListener('click',()=>{$('#soundGate').classList.add('hidden');document.body.classList.remove('no-scroll');enableAudio(false)});
$$('[data-next]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.next)?.scrollIntoView({behavior:'smooth'})));
$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'start'})));
$$('[data-part-jump]').forEach(b=>b.addEventListener('click',()=>$(PARTS[+b.dataset.partJump].anchor)?.scrollIntoView({behavior:'smooth'})));
$('#replay').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

function render(){
 const vh=innerHeight;
 let nearest=0,best=Infinity,detectedPart=currentPart;
 scenes.forEach((sec,i)=>{
  const r=sec.getBoundingClientRect(),runway=Math.max(1,r.height-vh),p=clamp((-r.top)/runway);
  if(r.bottom>0&&r.top<vh){const d=Math.abs(r.top);if(d<best){best=d;nearest=i;detectedPart=+sec.dataset.part||1}}
  const layer=$('.layer',sec);
  if(layer){const depth=parseFloat(layer.dataset.depth||'.06');layer.style.transform=`translate3d(0,${(p-.5)*vh*depth}px,0) scale(1.045)`}
  const caption=$('[data-caption]',sec);
  if(caption){const a=smooth((p-.14)/.28),exit=1-smooth((p-.79)/.16),y=(1-a)*30+(1-exit)*-15;caption.style.opacity=a*exit;caption.style.transform=caption.classList.contains('center')?`translate(-50%,${y}px)`:`translateY(${y}px)`}
  const phone=$('[data-phone]',sec);
  if(phone){const a=smooth((p-.07)/.25),b=1-smooth((p-.83)/.15);phone.style.opacity=a*b;phone.style.transform=`translate(-50%,-50%) rotate(${2-a*2}deg) scale(${.88+.12*a})`}
  const fade=$('[data-fade]',sec);
  if(fade){const a=smooth((p-.03)/.18),b=i===scenes.length-1?1:1-smooth((p-.81)/.15);fade.style.opacity=a*b;fade.style.transform=`translate(-50%,calc(-50% + ${(1-a)*22}px))`}
  if(sec.id==='years'){
   const tl=$('#timeline');
   if(tl){tl.style.setProperty('--fill',`${Math.round(p*100)}%`);$$('.milestone',tl).forEach((n,k)=>n.classList.toggle('active',p>=k/4-.04))}
  }
 });
 currentScene=nearest;
 if(detectedPart!==currentPart){currentPart=detectedPart;setTrackUI(currentPart);if(audioOn)loadPartTrack(currentPart)}
 requestAnimationFrame(render);
}
requestAnimationFrame(render);

addEventListener('keydown',e=>{
 if($('#soundGate')&&!$('#soundGate').classList.contains('hidden'))return;
 if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();scenes[Math.min(scenes.length-1,currentScene+1)].scrollIntoView({behavior:'smooth'})}
 if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();scenes[Math.max(0,currentScene-1)].scrollIntoView({behavior:'smooth'})}
 if(e.key.toLowerCase()==='m')enableAudio(!audioOn);
});
$$('img.photo').forEach(img=>img.addEventListener('error',()=>{img.style.display='none'}));
audioBtn.setAttribute('aria-pressed','false');
setTrackUI(1);
