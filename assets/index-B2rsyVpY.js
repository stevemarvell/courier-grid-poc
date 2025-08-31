(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function e(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(s){if(s.ep)return;s.ep=!0;const a=e(s);fetch(s.href,a)}})();function G(){const t=L("main-canvas"),n=L("top-bar"),e=L("bottom-bar"),o=L("sidebar"),s=$(o,"sidebar-key"),a=$(o,"sidebar-controls"),d=$(o,"sidebar-log");return o.append(s,a,d),{canvas:t,key:s,controls:a,log:d,setTopBar:r=>{n.textContent=r},setBottomBar:r=>{e.textContent=r}}}function L(t){const n=document.getElementById(t);if(!n)throw new Error(`Missing DOM element: ${t}`);return n}function $(t,n){let e=document.getElementById(n);return e||(e=document.createElement("div"),e.id=n,t.appendChild(e)),e}function U(t){t.innerHTML=`
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base">#</span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key ep"></span>Estimated Position</div>
    <div><span class="key ap"></span>Actual Position</div>
  `}function _(t){t.innerHTML=`
    <div class="log-header">
      <div class="log-label">Log</div>
      <button type="button" class="btn-icon" id="log-clear" title="Clear log" aria-label="Clear log">Clear</button>
    </div>
    <div class="log-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `;const n=t.querySelector("#log-clear");n&&(n.onclick=()=>J(t))}function T(t,n){const e=t.querySelector(".log-box");if(!e)return;const o=document.createElement("div");o.textContent=n,e.appendChild(o),e.scrollTop=e.scrollHeight}function J(t){const n=t.querySelector(".log-box");n&&(n.innerHTML="")}const B="masar.seed";function Y(t,n,e){if(n.seed==null){const d=localStorage.getItem(B);d!=null&&d!==""&&(n.seed=Number(d))}t.innerHTML=z(n);const o=t.querySelector("#cfg-form"),s=t.querySelector("#seed-input"),a=t.querySelector("#seed-clear");a.onclick=()=>{s.value="",localStorage.removeItem(B)},o.onsubmit=d=>{d.preventDefault();const r=new FormData(o),l={width:M(r,"width"),height:M(r,"height"),baseCount:M(r,"baseCount"),droneCount:M(r,"droneCount"),casualtyCount:M(r,"casualtyCount"),mean:M(r,"mean"),stdDev:M(r,"stdDev"),maxTranslation:M(r,"maxTranslation"),playbackTicksPerSec:M(r,"playbackTicksPerSec"),launchEveryTicks:M(r,"launchEveryTicks"),seed:N(r,"seed")===""?void 0:Number(N(r,"seed"))};l.seed!=null&&localStorage.setItem(B,String(l.seed)),e(l)}}function j(t,n){const e=t.querySelector("#seed-input");e&&(e.value=n==null?"":String(n),n!=null&&localStorage.setItem("masar.seed",String(n)))}function z(t){return`
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
          <input name="baseCount" type="number" min="1" max="4" value="${t.baseCount}" />
        </div>
        <div class="cfg-row">
          <label>Drones</label>
          <input name="droneCount" type="number" min="1" max="20" value="${t.droneCount}" />
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
  `}function M(t,n){return Number(t.get(n))}function N(t,n){const e=t.get(n);return e==null?"":String(e)}const Q=Math.random,P=(function t(n){function e(o,s){var a,d;return o=o==null?0:+o,s=s==null?1:+s,function(){var r;if(a!=null)r=a,a=null;else do a=n()*2-1,r=n()*2-1,d=a*a+r*r;while(!d||d>1);return o+s*r*Math.sqrt(-2*Math.log(d)/d)}}return e.source=t,e})(Q),X=1664525,Z=1013904223,q=1/4294967296;function H(t=Math.random()){let n=(0<=t&&t<1?t/q:Math.abs(t))|0;return()=>(n=X*n+Z|0,q*(n>>>0))}function tt(t,n,e,o=10,s=10,a,d=0){const r=a==null?void 0:H(a),l=r?P.source(r)(0,n):P(0,n),h=Math.max(-o,Math.min(o,Math.round(l()+d))),p=Math.max(-s,Math.min(s,Math.round(l()+d))),v=Math.max(0,Math.min(e.width-1,t.x+h)),m=Math.max(0,Math.min(e.height-1,t.y+p));return{x:v,y:m}}function et(t){const n=t==null?null:H(t),e=()=>n?n():Math.random();return{int:o=>Math.floor(e()*o),normal:(o,s)=>(n?P.source(n)(o,s):P(o,s))(),uniform:e}}async function nt(t,n){const e=et(t.seed),o=[],s=Math.floor(t.droneCount/t.baseCount),a=t.droneCount%t.baseCount;for(let h=0;h<t.baseCount;h++){const p=s+(h<a?1:0);o.push({id:h+1,position:{x:Math.floor(t.width/2),y:t.height-1},capacity:p,unspawned:p})}const d=[];for(let h=0;h<t.casualtyCount;h++){const p={x:e.int(t.width),y:e.int(Math.floor(t.height*.66))},v=t.seed==null?void 0:t.seed+h*9973,m=tt(p,t.stdDev,{width:t.width,height:t.height},t.maxTranslation,t.maxTranslation,v,t.mean);d.push({id:h+1,estimatedPosition:p,position:m})}const r=[];if(t.droneCount>0&&o.length>0){const h=o.map(v=>v.unspawned);let p=0;for(let v=0;v<t.droneCount;v++){let m=-1;for(let i=0;i<o.length;i++){const c=(p+i)%o.length;if(h[c]>0){m=c;break}}m===-1&&(m=0),h[m]--,p=(m+1)%o.length;const g=o[m].position;r.push({id:v+1,baseId:o[m].id,position:g,spawned:!1,launchAtTick:(v+1)*Math.max(1,t.launchEveryTicks),path:void 0,step:void 0})}for(let v=0;v<o.length;v++)o[v].unspawned=Math.max(0,h[v])}const l={bases:o,drones:r,casualties:d};return n?.beforeSimStart&&await n.beforeSimStart({cfg:t,state:l}),n?.afterSimStart&&await n.afterSimStart({cfg:t,state:l}),{width:t.width,height:t.height,bases:l.bases,drones:l.drones,casualties:l.casualties}}const w={grid:"#1d2733",base:"#5b6977",drone:"#ffffff",ap:"#f43f5e",ep:"#f59e42",textDark:"#222",textLight:"#fff",visitedFill:"rgba(52,143,255,0.10)",pathVisited:"rgba(255,255,255,0.85)",pathRemaining:"rgba(255,255,255,0.35)",currentCellStroke:"#34a1ff"};function O(t,n,e,o,s,a){t.fillStyle=a,t.fillRect(n,e,o-n,s-e)}function E(t,n,e,o,s,a,d=0){const r=o-n,l=s-e,h=n+r/2,p=e+l/2,v=Math.min(r,l)/2-d;return t.fillStyle=a,t.beginPath(),t.arc(h,p,Math.max(0,v),0,Math.PI*2),t.fill(),{cx:h,cy:p,r:Math.max(0,v)}}function R(t,n,e,o,s,a){t.fillStyle=a,t.font=`${s}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(n,e,o)}function A(t,n,e,o,s){const a=t*e+s,d=n*o+s,r=(t+1)*e-s,l=(n+1)*o-s;return{cx:(a+r)/2,cy:(d+l)/2}}function D(t,n){const e=t.getContext("2d"),o=t.width,s=t.height,{width:a,height:d}=n,r=o/a,l=s/d;e.clearRect(0,0,o,s),e.strokeStyle=w.grid,e.lineWidth=1;for(let i=0;i<=a;i++){const c=Math.round(i*r)+.5;e.beginPath(),e.moveTo(c,.5),e.lineTo(c,s+.5),e.stroke()}for(let i=0;i<=d;i++){const c=Math.round(i*l)+.5;e.beginPath(),e.moveTo(.5,c),e.lineTo(o+.5,c),e.stroke()}const h=Math.min(r,l),p=h*.01,v=h*.01,m=h*.06,g=(i,c,u=0)=>{const y=i*r+p+u,f=c*l+p+u,b=(i+1)*r-p-u,x=(c+1)*l-p-u;return{L:y,T:f,R:b,B:x,cx:(y+b)/2,cy:(f+x)/2,w:b-y,h:x-f}};for(const i of n.drones){if(!i.spawned||!i.path||i.path.length<1)continue;const c=i.step==null?i.path.length-1:Math.max(0,Math.min(i.step,i.path.length-1));e.save(),e.fillStyle=w.visitedFill;for(let u=0;u<=c;u++){const y=i.path[u],{L:f,T:b,R:x,B:S}=g(y.x,y.y,0);e.fillRect(f,b,x-f,S-b)}e.restore()}for(const i of n.drones){if(!i.spawned||!i.path||i.path.length<2)continue;const c=i.step==null?i.path.length-1:Math.max(1,Math.min(i.step,i.path.length-1));e.save(),e.beginPath();for(let u=0;u<=c;u++){const y=i.path[u],{cx:f,cy:b}=A(y.x,y.y,r,l,p);u===0?e.moveTo(f,b):e.lineTo(f,b)}if(e.lineWidth=Math.max(1.25,Math.min(r,l)*.12),e.lineCap="round",e.lineJoin="round",e.strokeStyle=w.pathVisited,e.stroke(),e.restore(),c<i.path.length-1){e.save(),e.beginPath();const u=i.path[c];let{cx:y,cy:f}=A(u.x,u.y,r,l,p);e.moveTo(y,f);for(let b=c+1;b<i.path.length;b++){const x=i.path[b];({cx:y,cy:f}=A(x.x,x.y,r,l,p)),e.lineTo(y,f)}e.setLineDash([Math.max(3,h*.45),Math.max(3,h*.4)]),e.lineWidth=Math.max(1,Math.min(r,l)*.08),e.lineCap="round",e.lineJoin="round",e.strokeStyle=w.pathRemaining,e.stroke(),e.restore()}}for(const i of n.bases){const{L:c,T:u,R:y,B:f,cx:b,cy:x,w:S,h:C}=g(i.position.x,i.position.y,v);O(e,c,u,y,f,w.base);const k=Math.round(Math.min(S,C)*.42);R(e,String(i.unspawned??0),b,x,k,w.textLight)}for(const i of n.casualties){const{L:c,T:u,R:y,B:f,cx:b,cy:x,w:S,h:C}=g(i.estimatedPosition.x,i.estimatedPosition.y,0);O(e,c,u,y,f,w.ep);const k=Math.round(Math.min(S,C)*.42);R(e,String(i.id),b,x,k,w.textDark)}for(const i of n.casualties){const{L:c,T:u,R:y,B:f,cx:b,cy:x}=g(i.position.x,i.position.y,0),{r:S}=E(e,c,u,y,f,w.ap,p),C=Math.round(S*.88);R(e,String(i.id),b,x,C,w.textLight)}for(const i of n.drones){if(!i.spawned||!i.path||i.path.length===0)continue;const c=i.step==null?i.path.length-1:Math.max(0,Math.min(i.step,i.path.length-1)),u=i.path[c],{L:y,T:f,R:b,B:x}=g(u.x,u.y,0);e.save(),e.lineWidth=Math.max(1.5,Math.min(r,l)*.12),e.strokeStyle=w.currentCellStroke,e.strokeRect(y+1,f+1,b-y-2,x-f-2),e.restore()}for(const i of n.drones){if(!i.spawned)continue;const c=i.path&&i.step!=null&&i.path[i.step]||i.position,{L:u,T:y,R:f,B:b,cx:x,cy:S}=g(c.x,c.y,0);e.save();const C=p+m+Math.max(1,h*.04);E(e,u,y,f,b,"rgba(52,161,255,0.18)",C),e.restore();const k=p+m,{r:K}=E(e,u,y,f,b,w.drone,k),V=Math.round(K*.88);R(e,String(i.id),x,S,V,w.textDark)}}function ot(t,n){return t.x!==n.x?{x:t.x+Math.sign(n.x-t.x),y:t.y}:t.y!==n.y?{x:t.x,y:t.y+Math.sign(n.y-t.y)}:t}function it(t,n,e,o){if(o<=0)return n===t.x&&e===t.y?1:0;const s=n-t.x,a=e-t.y;return Math.exp(-(s*s+a*a)/(2*o*o))}function st(t){let n=0;for(const e of t)for(const o of e)n+=o;if(n===0)return t;for(let e=0;e<t.length;e++)for(let o=0;o<t[0].length;o++)t[e][o]/=n;return t}function at(t,n,e,o){const s=Array.from({length:n},(a,d)=>Array.from({length:t},(r,l)=>it(e,l,d,o)));return st(s)}class rt{constructor(n,e,o,s,a){this.width=n,this.height=e,this.belief=at(n,e,o,s),this.visited=new Set,this.casualty={...a},this.ep={...o}}k(n,e){return`${n},${e}`}nextStep(n,e){if(n.x===this.casualty.x&&n.y===this.casualty.y)return n;let o=null,s=-1/0;for(let l=0;l<this.height;l++)for(let h=0;h<this.width;h++){const p=this.belief[l][h];if(p<=0)continue;const v=this.k(h,l);if(this.visited.has(v)||e.has(v))continue;const m=Math.max(1,Math.abs(h-n.x)+Math.abs(l-n.y)),g=p/m;g>s&&(s=g,o={x:h,y:l})}const a=o??this.ep,d=ot(n,a),r=this.k(d.x,d.y);return this.visited.add(r),this.belief[d.y][d.x]=0,e.add(r),d}}const F={width:50,height:40,baseCount:1,droneCount:3,casualtyCount:1,mean:0,stdDev:2,maxTranslation:10,playbackTicksPerSec:30,launchEveryTicks:3,seed:void 0};function lt(){const t=G();t.setTopBar("MASAR Demo"),t.setBottomBar(`© Steve Marvell ${new Date().getFullYear()}`),U(t.key),_(t.log),ut(t.canvas,F),Y(t.controls,F,async n=>{await ct(t.canvas,t.controls,t.log,n)})}async function ct(t,n,e,o){if(o.seed==null){const m=dt();o.seed=m,j(n,m)}T(e,`t: 0 START seed ${o.seed}`);const s=await nt(o,{beforeSimStart:({cfg:m})=>W(t,m)});if(!s.casualties.length){D(t,s),T(e,"t: 0 END");return}const a=s.casualties[0],d=new rt(o.width,o.height,a.estimatedPosition,o.stdDev,a.position),r={...s,drones:s.drones.map(m=>({...m})),bases:s.bases.map(m=>({...m}))};let l=null,h=0,p=0;const v=m=>{l==null&&(l=m);const g=m-l;for(l=m,h+=o.playbackTicksPerSec*g/1e3;h>=1;){h-=1;let i=null;for(const c of r.drones)!c.spawned&&p>=c.launchAtTick&&(c.spawned=!0,c.path=[c.position],c.step=0,T(e,`t: ${p} LAUNCH drone #${c.id} base #${c.baseId}`),I(c.position,a.position)&&(i=c.id));if(i==null){const c=new Set;for(const u of r.drones){if(!u.spawned)continue;const y=u.path[u.path.length-1];if(I(y,a.position)){i=u.id;continue}const f=d.nextStep(y,c);u.path.push(f),u.position=f,u.step=u.path.length-1,I(f,a.position)&&(i=u.id)}}if(i!=null){T(e,`t: ${p} FOUND drone #${i} casualty #${a.id}`),D(t,r),T(e,`t: ${p} END`);return}p+=1}D(t,r),requestAnimationFrame(v)};requestAnimationFrame(v)}function dt(){if(window.crypto&&"getRandomValues"in window.crypto){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),t[0]===0?1:t[0]}return Math.floor(1+Math.random()*2147483646)}function I(t,n){return t.x===n.x&&t.y===n.y}function ut(t,n){W(t,n);const e={width:n.width,height:n.height,bases:[],drones:[],casualties:[]};D(t,e)}function W(t,n){const e=window.devicePixelRatio||1,o=800,s=Math.round(o*(n.width/n.height));t.style.width=s+"px",t.style.height=o+"px",t.width=Math.round(s*e),t.height=Math.round(o*e)}window.addEventListener("DOMContentLoaded",lt);
