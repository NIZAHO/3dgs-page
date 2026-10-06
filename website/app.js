/* Original interface code. All visual controls are explicitly synthetic. */
(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const root = document.documentElement;
const theme = $('#theme');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
function currentTheme(){return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');}
function labelTheme(){theme.setAttribute('aria-label',`Switch to ${currentTheme()==='dark'?'light':'dark'} theme`);}
theme.addEventListener('click',()=>{const t=currentTheme()==='dark'?'light':'dark';root.dataset.theme=t;try{localStorage.setItem('chuan-theme',t)}catch(e){}labelTheme();});
darkQuery.addEventListener('change',labelTheme);labelTheme();
const menu=$('#menu'), nav=$('#navigation');
function closeMenu(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav.addEventListener('click',(e)=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
const links=[...nav.querySelectorAll('a')];
let tick=false;
function scrollState(){const max=root.scrollHeight-window.innerHeight;$('#progress').style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,window.scrollY/max)):0})`;let selected=null;for(const a of links){const section=$(a.getAttribute('href'));if(section&&section.getBoundingClientRect().top<=150)selected=a;}links.forEach(a=>{if(a===selected)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});tick=false;}
window.addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(scrollState);}},{passive:true});window.addEventListener('resize',scrollState);scrollState();
const phaseData={
 init:{k:'01 / Initialize',title:'Start from geometry, not an empty scene.',copy:'The documented native profile seeds the scene from sparse reconstruction and sampled LiDAR, adds environment Gaussians, and uses exact 3-nearest-neighbor initialization.',detail:'Preparation supplies PINHOLE views, exclusion masks, calibrated poses, and LiDAR in a consistent world coordinate system.'},
 fit:{k:'02 / Supervise',title:'Fit appearance and measured geometry.',copy:'Paired RGB and LiDAR updates act on the shared Gaussian scene. RGB uses Huber / SSIM with depth and opacity regularization; the LiDAR branch rasterizes depth for its own loss.',detail:'The default path also optimizes image-specific appearance, distortion, and cameras. These fitting variables must be distinguished from the portable Gaussian model.'},
 refine:{k:'03 / Refine',title:'Adapt the scene while learning.',copy:'The native schedule maintains the scene with pruning and densification on a 100-step cadence, epoch weight pruning, and a final pruning pass. Gaussian parameters and Adam state remain GPU-resident.',detail:'The capacity policy can skip a maintenance operation when capacity is insufficient. This illustration shows the mechanism, not a measured change in point count.'},
 export:{k:'04 / Freeze & export',title:'Freeze the model. Keep the contracts separate.',copy:'A completed run exports the main and environment Gaussian models in PLY-encoded PLY, alongside a checkpoint for image-specific fitting parameters. Stage 10 then creates SOG and the browser viewer.',detail:'The checkpoint is not an exact optimizer-resume snapshot. SOG does not carry per-image appearance or distortion, so browser quality requires its own evaluation.'}
};
const tabs=[...document.querySelectorAll('[data-phase][role=tab]')];
function selectTab(tab,focus=false){const phase=tab.dataset.phase;const data=phaseData[phase];if(!data)return;tabs.forEach(t=>{const yes=t===tab;t.setAttribute('aria-selected',String(yes));t.tabIndex=yes?0:-1;});const panel=$('#training-panel');panel.dataset.phase=phase;panel.setAttribute('aria-labelledby',tab.id);$('#phase-kicker').textContent=data.k;$('#phase-title').textContent=data.title;$('#phase-copy').textContent=data.copy;$('#phase-detail').textContent=data.detail;if(focus)tab.focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',(e)=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();selectTab(tabs[n],true);});});
const ns='http://www.w3.org/2000/svg';const group=$('#gaussian-primitives');const primitives=[];
function ellipse(x,y,angle,warm){const g=document.createElementNS(ns,'g');g.setAttribute('transform',`translate(${x} ${y}) rotate(${angle})`);const fill=document.createElementNS(ns,'ellipse');fill.setAttribute('fill',`url(#demo-${warm?'orange':'blue'})`);g.append(fill);const line=document.createElementNS(ns,'ellipse');line.setAttribute('fill','none');line.setAttribute('stroke',warm?'#b97c51':'#5686b0');line.setAttribute('stroke-opacity','.38');line.setAttribute('stroke-width','1');g.append(line);group.append(g);primitives.push({fill,line});}
// Deterministic, synthetic L-shaped surfaces. These are not acquired scene points.
for(let row=0;row<5;row++){for(let col=0;col<7;col++){ellipse(170+col*31,120+row*23-col*11,-28,false);}}
for(let row=0;row<4;row++){for(let col=0;col<6;col++){ellipse(170+col*31+row*24,236+col*11-row*13,28,true);}}
function renderGaussians(){const scale=Number($('#scale').value)/100,opacity=Number($('#opacity').value)/100;for(const p of primitives){p.fill.setAttribute('rx',String(34*scale));p.fill.setAttribute('ry',String(17*scale));p.line.setAttribute('rx',String(22*scale));p.line.setAttribute('ry',String(9*scale));}group.setAttribute('opacity',String(opacity));$('#scale-value').value=`${scale.toFixed(1)}×`;$('#opacity-value').value=opacity.toFixed(2);}
$('#scale').addEventListener('input',renderGaussians);$('#opacity').addEventListener('input',renderGaussians);$('#reset-gaussian').addEventListener('click',()=>{$('#scale').value='100';$('#opacity').value='65';renderGaussians();});renderGaussians();
})();
