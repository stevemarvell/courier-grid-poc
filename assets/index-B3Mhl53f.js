(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const h of r.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&o(h)}).observe(document,{childList:!0,subtree:!0});function n(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(i){if(i.ep)return;i.ep=!0;const r=n(i);fetch(i.href,r)}})();const A=(t,e)=>t.x===e.x&&t.y===e.y,J=(t,e=1)=>t.toFixed(e);function X(){const t=$("main-canvas"),e=$("top-bar"),n=$("bottom-bar"),o=$("sidebar"),i=L(o,"sidebar-key"),r=L(o,"sidebar-controls"),h=L(o,"sidebar-log"),a=L(o,"sidebar-transcript");return o.append(i,r,h,a),{canvas:t,key:i,controls:r,log:h,transcript:a,setTopBar:d=>{e.textContent=d},setBottomBar:d=>{n.textContent=d}}}function $(t){const e=document.getElementById(t);if(!e)throw new Error(`Missing DOM element: ${t}`);return e}function L(t,e){let n=document.getElementById(e);return n||(n=document.createElement("div"),n.id=e,t.appendChild(n)),n}function Y(t){t.innerHTML=`
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base">#</span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key ep"></span>Estimated Position</div>
    <div><span class="key ap"></span>Actual Position</div>
  `}function j(t){t.innerHTML=`
    <div class="log-header">
      <div class="log-label">Log</div>
      <button type="button" class="btn-icon" id="log-clear" title="Clear log" aria-label="Clear log">Clear</button>
    </div>
    <div class="log-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `;const e=t.querySelector("#log-clear");e&&(e.onclick=()=>z(t))}function C(t,e){const n=t.querySelector(".log-box");if(!n)return;const o=document.createElement("div");o.textContent=e,n.appendChild(o),n.scrollTop=n.scrollHeight}function z(t){const e=t.querySelector(".log-box");e&&(e.innerHTML="")}function Q(t){t.innerHTML=`
    <div class="transcript-header">
      <div class="transcript-label">Radio</div>
      <button type="button" class="btn-icon" id="transcript-clear" title="Clear transcript" aria-label="Clear transcript">Clear</button>
    </div>
    <div class="transcript-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `;const e=t.querySelector("#transcript-clear");e&&(e.onclick=()=>tt(t))}function Z(t,e){const n=t.querySelector(".transcript-box");if(!n)return;const o=document.createElement("div");o.textContent=e,n.appendChild(o),n.scrollTop=n.scrollHeight}function tt(t){const e=t.querySelector(".transcript-box");e&&(e.innerHTML="")}const B="masar.seed";function et(t,e,n){if(e.seed==null){const h=localStorage.getItem(B);h!=null&&h!==""&&(e.seed=Number(h))}t.innerHTML=ot(e);const o=t.querySelector("#cfg-form"),i=t.querySelector("#seed-input"),r=t.querySelector("#seed-clear");r.onclick=()=>{i.value="",localStorage.removeItem(B)},o.onsubmit=h=>{h.preventDefault();const a=new FormData(o),d={width:k(a,"width"),height:k(a,"height"),baseCount:k(a,"baseCount"),droneCount:k(a,"droneCount"),casualtyCount:k(a,"casualtyCount"),mean:k(a,"mean"),stdDev:k(a,"stdDev"),maxTranslation:k(a,"maxTranslation"),playbackTicksPerSec:k(a,"playbackTicksPerSec"),launchEveryTicks:k(a,"launchEveryTicks"),seed:H(a,"seed")===""?void 0:Number(H(a,"seed"))};d.seed!=null&&localStorage.setItem(B,String(d.seed)),n(d)}}function nt(t,e){const n=t.querySelector("#seed-input");n&&(n.value=e==null?"":String(e),e!=null&&localStorage.setItem("masar.seed",String(e)))}function ot(t){return`
    <form id="cfg-form" class="cfg-form">
      <div class="cfg-group">
        <div class="cfg-group-label">Grid</div>
        <div class="cfg-row">
          <label>Width</label>
          <input name="width" type="number" min="5" max="200" value="${t.width}" />
        </div>
        <div class="cfg-row">
          <label>Height</label>
          <input name="height" type="number" min="5" max="200" value="${t.height}" />
        </div>
      </div>
      <div class="cfg-group">
        <div class="cfg-group-label">Assets</div>
        <div class="cfg-row">
          <label>Bases</label>
          <input name="baseCount" type="number" min="1" max="7" value="${t.baseCount}" />
        </div>
        <div class="cfg-row">
          <label>Drones</label>
          <input name="droneCount" type="number" min="1" max="42" value="${t.droneCount}" />
        </div>
      </div>
      <div class="cfg-group">
        <div class="cfg-group-label">Scenario</div>
        <div class="cfg-row">
          <label>Casualties</label>
          <input name="casualtyCount" type="number" min="1" max="10" value="${t.casualtyCount}" />
        </div>
        <div class="cfg-row">
          <label>Mean (μ)</label>
          <input name="mean" type="number" step="0.1" value="${t.mean}" />
        </div>
        <div class="cfg-row">
          <label>Std Dev (σ)</label>
          <input name="stdDev" type="number" min="0.1" max="20" step="0.1" value="${t.stdDev}" />
        </div>
        <div class="cfg-row">
          <label>Max translation</label>
          <input name="maxTranslation" type="number" min="1" max="50" step="1" value="${t.maxTranslation}" />
        </div>
      </div>

      <div class="cfg-group">
        <div class="cfg-group-label">Timing (ticks)</div>
        <div class="cfg-row">
          <label>Playback (ticks/s)</label>
          <input name="playbackTicksPerSec" type="number" min="1" step="1" value="${t.playbackTicksPerSec}" />
        </div>
        <div class="cfg-row">
          <label>Launch every (ticks)</label>
          <input name="launchEveryTicks" type="number" min="1" step="1" value="${t.launchEveryTicks}" />
        </div>
      </div>

      <div class="cfg-row seed-row" style="margin-top:10px;">
        <label>Seed</label>
        <div class="seed-wrap">
          <input id="seed-input" name="seed" type="number" placeholder="random" value="${t.seed??""}" />
          <button type="button" id="seed-clear" class="btn-icon" title="Clear seed" aria-label="Clear seed">×</button>
        </div>
      </div>

      <div>
        <button type="submit" class="btn-primary">Run Simulation</button>
      </div>
    </form>
  `}function k(t,e){return Number(t.get(e))}function H(t,e){const n=t.get(e);return n==null?"":String(n)}const st=Math.random,P=(function t(e){function n(o,i){var r,h;return o=o==null?0:+o,i=i==null?1:+i,function(){var a;if(r!=null)a=r,r=null;else do r=e()*2-1,a=e()*2-1,h=r*r+a*a;while(!h||h>1);return o+i*a*Math.sqrt(-2*Math.log(h)/h)}}return n.source=t,n})(st),it=1664525,at=1013904223,F=1/4294967296;function _(t=Math.random()){let e=(0<=t&&t<1?t/F:Math.abs(t))|0;return()=>(e=it*e+at|0,F*(e>>>0))}function rt(t,e,n,o=10,i=10,r,h=0){const a=r==null?void 0:_(r),d=a?P.source(a)(0,e):P(0,e),b=Math.max(-o,Math.min(o,Math.round(d()+h))),f=Math.max(-i,Math.min(i,Math.round(d()+h))),x=Math.max(0,Math.min(n.width-1,t.x+b)),w=Math.max(0,Math.min(n.height-1,t.y+f));return{x,y:w}}function lt(t){const e=t==null?null:_(t),n=()=>e?e():Math.random();return{int:o=>Math.floor(n()*o),normal:(o,i)=>(e?P.source(e)(o,i):P(o,i))(),uniform:n}}function q(t,e,n){return Math.max(e,Math.min(n,t))}function R(t,e){return q(Math.floor((1-t)*(e-1)),0,e-1)}function O(t,e){return q(Math.floor(t*(e-1)),0,e-1)}function ct(t){const e=new Set,n=[];for(const o of t){const i=`${o.position.x},${o.position.y}`;e.has(i)||(e.add(i),n.push(o))}return n}function dt(t,e){return[{x:Math.floor(t/2),y:e-1},{x:0,y:R(1/3,e)},{x:t-1,y:R(1/3,e)},{x:O(1/4,t),y:e-1},{x:O(3/4,t),y:e-1},{x:0,y:R(1/6,e)},{x:t-1,y:R(1/6,e)}]}async function ut(t,e){const n=lt(t.seed),o=dt(t.width,t.height),r=q(t.baseCount,1,7),h=ct(o.slice(0,Math.min(r,o.length)).map((s,l)=>({id:l+1,position:s}))),a=[],d=h.length,b=Math.floor(t.droneCount/d),f=t.droneCount%d;for(let s=0;s<d;s++){const l=b+(s<f?1:0);a.push({id:h[s].id,position:h[s].position,capacity:l,unspawned:l})}const x=[];for(let s=0;s<t.casualtyCount;s++){const l={x:n.int(t.width),y:n.int(Math.floor(t.height*.66))},m=t.seed==null?void 0:t.seed+s*9973,p=rt(l,t.stdDev,{width:t.width,height:t.height},t.maxTranslation,t.maxTranslation,m);x.push({id:s+1,estimatedPosition:l,position:p})}const w=[];if(t.droneCount>0&&a.length>0){const s=a.map(c=>c.capacity),l=a.map(()=>0),m=Math.max(1,t.launchEveryTicks);let p=0;for(let c=0;c<t.droneCount;c++){let u=-1;for(let M=0;M<a.length;M++){const T=(p+M)%a.length;if(s[T]>0){u=T;break}}u===-1&&(u=0);const y=l[u];l[u]=y+1,s[u]--;const g=a[u].position;w.push({id:c+1,baseId:a[u].id,position:g,spawned:!1,launchAtTick:(y+1)*m,path:void 0,step:void 0}),p=(u+1)%a.length}}const v={bases:a,drones:w,casualties:x};return e?.beforeSimStart&&await e.beforeSimStart({cfg:t,state:v}),e?.afterSimStart&&await e.afterSimStart({cfg:t,state:v}),{width:t.width,height:t.height,bases:v.bases,drones:v.drones,casualties:v.casualties}}const S={grid:"#1d2733",base:"#5b6977",drone:"#ffffff",ap:"#f43f5e",ep:"#f59e42",textDark:"#222",textLight:"#fff",visitedFill:"rgba(52,143,255,0.10)",pathVisited:"rgba(255,255,255,0.85)",pathRemaining:"rgba(255,255,255,0.35)",currentCellStroke:"#34a1ff"};function W(t,e,n,o,i,r){t.fillStyle=r,t.fillRect(e,n,o-e,i-n)}function I(t,e,n,o,i,r,h=0){const a=o-e,d=i-n,b=e+a/2,f=n+d/2,x=Math.min(a,d)/2-h;return t.fillStyle=r,t.beginPath(),t.arc(b,f,Math.max(0,x),0,Math.PI*2),t.fill(),{cx:b,cy:f,r:Math.max(0,x)}}function D(t,e,n,o,i,r){t.fillStyle=r,t.font=`${i}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(e,n,o)}function N(t,e,n,o,i){const r=t*n+i,h=e*o+i,a=(t+1)*n-i,d=(e+1)*o-i;return{cx:(r+a)/2,cy:(h+d)/2}}function E(t,e){const n=t.getContext("2d"),o=t.width,i=t.height,{width:r,height:h}=e,a=o/r,d=i/h;n.clearRect(0,0,o,i),n.strokeStyle=S.grid,n.lineWidth=1;for(let s=0;s<=r;s++){const l=Math.round(s*a)+.5;n.beginPath(),n.moveTo(l,.5),n.lineTo(l,i+.5),n.stroke()}for(let s=0;s<=h;s++){const l=Math.round(s*d)+.5;n.beginPath(),n.moveTo(.5,l),n.lineTo(o+.5,l),n.stroke()}const b=Math.min(a,d),f=b*.01,x=b*.01,w=b*.06,v=(s,l,m=0)=>{const p=s*a+f+m,c=l*d+f+m,u=(s+1)*a-f-m,y=(l+1)*d-f-m;return{L:p,T:c,R:u,B:y,cx:(p+u)/2,cy:(c+y)/2,w:u-p,h:y-c}};for(const s of e.drones){if(!s.spawned||!s.path||s.path.length<1)continue;const l=s.step==null?s.path.length-1:Math.max(0,Math.min(s.step,s.path.length-1));n.save(),n.fillStyle=S.visitedFill;for(let m=0;m<=l;m++){const p=s.path[m],{L:c,T:u,R:y,B:g}=v(p.x,p.y,0);n.fillRect(c,u,y-c,g-u)}n.restore()}for(const s of e.drones){if(!s.spawned||!s.path||s.path.length<2)continue;const l=s.step==null?s.path.length-1:Math.max(1,Math.min(s.step,s.path.length-1));n.save(),n.beginPath();for(let m=0;m<=l;m++){const p=s.path[m],{cx:c,cy:u}=N(p.x,p.y,a,d,f);m===0?n.moveTo(c,u):n.lineTo(c,u)}if(n.lineWidth=Math.max(1.25,Math.min(a,d)*.12),n.lineCap="round",n.lineJoin="round",n.strokeStyle=S.pathVisited,n.stroke(),n.restore(),l<s.path.length-1){n.save(),n.beginPath();const m=s.path[l];let{cx:p,cy:c}=N(m.x,m.y,a,d,f);n.moveTo(p,c);for(let u=l+1;u<s.path.length;u++){const y=s.path[u];({cx:p,cy:c}=N(y.x,y.y,a,d,f)),n.lineTo(p,c)}n.setLineDash([Math.max(3,b*.45),Math.max(3,b*.4)]),n.lineWidth=Math.max(1,Math.min(a,d)*.08),n.lineCap="round",n.lineJoin="round",n.strokeStyle=S.pathRemaining,n.stroke(),n.restore()}}for(const s of e.bases){const{L:l,T:m,R:p,B:c,cx:u,cy:y,w:g,h:M}=v(s.position.x,s.position.y,x);W(n,l,m,p,c,S.base);const T=Math.round(Math.min(g,M)*.42);D(n,String(s.unspawned??0),u,y,T,S.textLight)}for(const s of e.casualties){const{L:l,T:m,R:p,B:c,cx:u,cy:y,w:g,h:M}=v(s.estimatedPosition.x,s.estimatedPosition.y,0);W(n,l,m,p,c,S.ep);const T=Math.round(Math.min(g,M)*.42);D(n,String(s.id),u,y,T,S.textDark)}for(const s of e.casualties){const{L:l,T:m,R:p,B:c,cx:u,cy:y}=v(s.position.x,s.position.y,0),{r:g}=I(n,l,m,p,c,S.ap,f),M=Math.round(g*.88);D(n,String(s.id),u,y,M,S.textLight)}for(const s of e.drones){if(!s.spawned||!s.path||s.path.length===0)continue;const l=s.step==null?s.path.length-1:Math.max(0,Math.min(s.step,s.path.length-1)),m=s.path[l],{L:p,T:c,R:u,B:y}=v(m.x,m.y,0);n.save(),n.lineWidth=Math.max(1.5,Math.min(a,d)*.12),n.strokeStyle=S.currentCellStroke,n.strokeRect(p+1,c+1,u-p-2,y-c-2),n.restore()}for(const s of e.drones){if(!s.spawned)continue;const l=s.path&&s.step!=null&&s.path[s.step]||s.position,{L:m,T:p,R:c,B:u,cx:y,cy:g}=v(l.x,l.y,0);n.save();const M=f+w+Math.max(1,b*.04);I(n,m,p,c,u,"rgba(52,161,255,0.18)",M),n.restore();const T=f+w,{r:V}=I(n,m,p,c,u,S.drone,T),G=Math.round(V*.88);D(n,String(s.id),y,g,G,S.textDark)}}function ht(t,e){return t.x!==e.x?{x:t.x+Math.sign(e.x-t.x),y:t.y}:t.y!==e.y?{x:t.x,y:t.y+Math.sign(e.y-t.y)}:t}function pt(t,e,n,o){if(o<=0)return e===t.x&&n===t.y?1:0;const i=e-t.x,r=n-t.y;return Math.exp(-(i*i+r*r)/(2*o*o))}function mt(t){let e=0;for(const n of t)for(const o of n)e+=o;if(e===0)return t;for(let n=0;n<t.length;n++)for(let o=0;o<t[0].length;o++)t[n][o]/=e;return t}function ft(t,e,n,o){const i=Array.from({length:e},(r,h)=>Array.from({length:t},(a,d)=>pt(n,d,h,o)));return mt(i)}class yt{constructor(e,n,o,i,r){this.width=e,this.height=n,this.belief=ft(e,n,o,i),this.visited=new Set,this.casualty={...r},this.ep={...o}}k(e,n){return`${e},${n}`}nextStep(e,n){if(e.x===this.casualty.x&&e.y===this.casualty.y)return e;let o=null,i=-1/0;for(let d=0;d<this.height;d++)for(let b=0;b<this.width;b++){const f=this.belief[d][b];if(f<=0)continue;const x=this.k(b,d);if(this.visited.has(x)||n.has(x))continue;const w=Math.max(1,Math.abs(b-e.x)+Math.abs(d-e.y)),v=f/w;v>i&&(i=v,o={x:b,y:d})}const r=o??this.ep,h=ht(e,r),a=this.k(h.x,h.y);return this.visited.add(a),this.belief[h.y][h.x]=0,n.add(a),h}}class bt{constructor(){this.handlers=new Set,this.tick=0,this.nextId=1}setTick(e){this.tick=e|0}advance(e=1){this.tick=this.tick+e|0}now(){return this.tick}subscribe(e){return this.handlers.add(e),()=>this.handlers.delete(e)}say(e,...n){const o=this.nextId++,i=n.map(String),r=[String(o),e,...i];this.deliver({id:o,from:e,tokens:i,frame:r,tick:this.tick})}sayLine(e,n){const o=this.nextId++,i=n.trim()?n.trim().split(/\s+/):[],r=[String(o),e,...i];this.deliver({id:o,from:e,tokens:i,frame:r,tick:this.tick})}reset(){this.handlers.clear(),this.nextId=1}deliver(e){const n=Array.from(this.handlers);for(const o of n)o(e)}}const U={width:50,height:40,baseCount:1,droneCount:3,casualtyCount:1,mean:0,stdDev:2,maxTranslation:10,playbackTicksPerSec:30,launchEveryTicks:3,seed:void 0};function vt(){const t=X();t.setTopBar("MASAR Demo"),t.setBottomBar(`© Steve Marvell ${new Date().getFullYear()}`),Y(t.key),j(t.log),Q(t.transcript),wt(t.canvas,U),et(t.controls,U,async e=>{await xt(t.canvas,t.controls,t.log,t.transcript,e)})}async function xt(t,e,n,o,i){if(i.seed==null){const l=gt();i.seed=l,nt(e,l)}C(n,`t: 0 START seed ${i.seed}`);const r=new bt;r.setTick(0);const h=r.subscribe(l=>{Z(o,`${l.id} t:${l.tick} ${l.from} ${l.tokens.join(" ")}`)});r.say("command","-","-","START","seed",i.seed);const a=await ut(i,{beforeSimStart:({cfg:l})=>K(t,l)});if(!a.casualties.length){E(t,a),r.say("command","-","-","END"),C(n,"t: 0 END"),h();return}const d=a.casualties[0],b=new yt(i.width,i.height,d.estimatedPosition,i.stdDev,d.position),f={...a,drones:a.drones.map(l=>({...l})),bases:a.bases.map(l=>({...l}))};let x=null,w=0,v=0;const s=l=>{x==null&&(x=l);const m=l-x;for(x=l,w+=i.playbackTicksPerSec*m/1e3;w>=1;){w-=1,r.setTick(v);let p=null;for(const c of f.drones)!c.spawned&&v>=c.launchAtTick&&(c.spawned=!0,c.path=[c.position],c.step=0,C(n,`t: ${v} LAUNCH drone#${c.id} base#${c.baseId}`),r.say(`drone#${c.id}`,"-","-","LAUNCH","base",`base#${c.baseId}`),A(c.position,d.position)&&(p=c.id));if(p==null){const c=new Set;for(const u of f.drones){if(!u.spawned)continue;const y=u.path[u.path.length-1];if(A(y,d.position)){p=u.id;continue}const g=b.nextStep(y,c);u.path.push(g),u.position=g,u.step=u.path.length-1,r.say(`drone#${u.id}`,g.x,g.y,"SEARCHED","POD",J(1,1)),A(g,d.position)&&(p=u.id)}}if(p!=null){const c=f.drones.find(u=>u.id===p);C(n,`t: ${v} FOUND drone#${p} casualty#${d.id}`),r.say(`drone#${p}`,c.position.x,c.position.y,"FOUND",`casualty#${d.id}`),E(t,f),C(n,`t: ${v} END`),r.say("command","-","-","END"),h();return}v+=1}E(t,f),requestAnimationFrame(s)};requestAnimationFrame(s)}function gt(){if(window.crypto&&"getRandomValues"in window.crypto){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),t[0]===0?1:t[0]}return Math.floor(1+Math.random()*2147483646)}function wt(t,e){K(t,e);const n={width:e.width,height:e.height,bases:[],drones:[],casualties:[]};E(t,n)}function K(t,e){const n=window.devicePixelRatio||1,o=800,i=Math.round(o*(e.width/e.height));t.style.width=i+"px",t.style.height=o+"px",t.width=Math.round(i*n),t.height=Math.round(o*n)}window.addEventListener("DOMContentLoaded",vt);
