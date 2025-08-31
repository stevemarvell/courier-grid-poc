(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();function J(){const t=L("main-canvas"),n=L("top-bar"),e=L("bottom-bar"),s=L("sidebar"),i=D(s,"sidebar-key"),r=D(s,"sidebar-controls"),c=D(s,"sidebar-log");return s.append(i,r,c),{canvas:t,key:i,controls:r,log:c,setTopBar:a=>{n.textContent=a},setBottomBar:a=>{e.textContent=a}}}function L(t){const n=document.getElementById(t);if(!n)throw new Error(`Missing DOM element: ${t}`);return n}function D(t,n){let e=document.getElementById(n);return e||(e=document.createElement("div"),e.id=n,t.appendChild(e)),e}function X(t){t.innerHTML=`
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base">#</span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key ep"></span>Estimated Position</div>
    <div><span class="key ap"></span>Actual Position</div>
  `}function Y(t){t.innerHTML=`
    <div class="log-header">
      <div class="log-label">Log</div>
      <button type="button" class="btn-icon" id="log-clear" title="Clear log" aria-label="Clear log">Clear</button>
    </div>
    <div class="log-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `;const n=t.querySelector("#log-clear");n&&(n.onclick=()=>j(t))}function T(t,n){const e=t.querySelector(".log-box");if(!e)return;const s=document.createElement("div");s.textContent=n,e.appendChild(s),e.scrollTop=e.scrollHeight}function j(t){const n=t.querySelector(".log-box");n&&(n.innerHTML="")}const A="masar.seed";function z(t,n,e){if(n.seed==null){const c=localStorage.getItem(A);c!=null&&c!==""&&(n.seed=Number(c))}t.innerHTML=Z(n);const s=t.querySelector("#cfg-form"),i=t.querySelector("#seed-input"),r=t.querySelector("#seed-clear");r.onclick=()=>{i.value="",localStorage.removeItem(A)},s.onsubmit=c=>{c.preventDefault();const a=new FormData(s),u={width:k(a,"width"),height:k(a,"height"),baseCount:k(a,"baseCount"),droneCount:k(a,"droneCount"),casualtyCount:k(a,"casualtyCount"),mean:k(a,"mean"),stdDev:k(a,"stdDev"),maxTranslation:k(a,"maxTranslation"),playbackTicksPerSec:k(a,"playbackTicksPerSec"),launchEveryTicks:k(a,"launchEveryTicks"),seed:F(a,"seed")===""?void 0:Number(F(a,"seed"))};u.seed!=null&&localStorage.setItem(A,String(u.seed)),e(u)}}function Q(t,n){const e=t.querySelector("#seed-input");e&&(e.value=n==null?"":String(n),n!=null&&localStorage.setItem("masar.seed",String(n)))}function Z(t){return`
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
  `}function k(t,n){return Number(t.get(n))}function F(t,n){const e=t.get(n);return e==null?"":String(e)}const tt=Math.random,B=(function t(n){function e(s,i){var r,c;return s=s==null?0:+s,i=i==null?1:+i,function(){var a;if(r!=null)a=r,r=null;else do r=n()*2-1,a=n()*2-1,c=r*r+a*a;while(!c||c>1);return s+i*a*Math.sqrt(-2*Math.log(c)/c)}}return e.source=t,e})(tt),et=1664525,nt=1013904223,O=1/4294967296;function K(t=Math.random()){let n=(0<=t&&t<1?t/O:Math.abs(t))|0;return()=>(n=et*n+nt|0,O*(n>>>0))}function ot(t,n,e,s=10,i=10,r,c=0){const a=r==null?void 0:K(r),u=a?B.source(a)(0,n):B(0,n),y=Math.max(-s,Math.min(s,Math.round(u()+c))),f=Math.max(-i,Math.min(i,Math.round(u()+c))),g=Math.max(0,Math.min(e.width-1,t.x+y)),v=Math.max(0,Math.min(e.height-1,t.y+f));return{x:g,y:v}}function st(t){const n=t==null?null:K(t),e=()=>n?n():Math.random();return{int:s=>Math.floor(e()*s),normal:(s,i)=>(n?B.source(n)(s,i):B(s,i))(),uniform:e}}function N(t,n,e){return Math.max(n,Math.min(e,t))}function R(t,n){return N(Math.floor((1-t)*(n-1)),0,n-1)}function H(t,n){return N(Math.floor(t*(n-1)),0,n-1)}function it(t){const n=new Set,e=[];for(const s of t){const i=`${s.position.x},${s.position.y}`;n.has(i)||(n.add(i),e.push(s))}return e}function at(t,n){return[{x:Math.floor(t/2),y:n-1},{x:0,y:R(1/3,n)},{x:t-1,y:R(1/3,n)},{x:H(1/4,t),y:n-1},{x:H(3/4,t),y:n-1},{x:0,y:R(1/6,n)},{x:t-1,y:R(1/6,n)}]}async function rt(t,n){const e=st(t.seed),s=at(t.width,t.height),r=N(t.baseCount,1,7),c=it(s.slice(0,Math.min(r,s.length)).map((o,l)=>({id:l+1,position:o}))),a=[],u=c.length,y=Math.floor(t.droneCount/u),f=t.droneCount%u;for(let o=0;o<u;o++){const l=y+(o<f?1:0);a.push({id:c[o].id,position:c[o].position,capacity:l,unspawned:l})}const g=[];for(let o=0;o<t.casualtyCount;o++){const l={x:e.int(t.width),y:e.int(Math.floor(t.height*.66))},d=t.seed==null?void 0:t.seed+o*9973,m=ot(l,t.stdDev,{width:t.width,height:t.height},t.maxTranslation,t.maxTranslation,d);g.push({id:o+1,estimatedPosition:l,position:m})}const v=[];if(t.droneCount>0&&a.length>0){const o=a.map(h=>h.capacity),l=a.map(()=>0),d=Math.max(1,t.launchEveryTicks);let m=0;for(let h=0;h<t.droneCount;h++){let p=-1;for(let S=0;S<a.length;S++){const C=(m+S)%a.length;if(o[C]>0){p=C;break}}p===-1&&(p=0);const b=l[p];l[p]=b+1,o[p]--;const M=a[p].position;v.push({id:h+1,baseId:a[p].id,position:M,spawned:!1,launchAtTick:(b+1)*d,path:void 0,step:void 0}),m=(p+1)%a.length}}const x={bases:a,drones:v,casualties:g};return n?.beforeSimStart&&await n.beforeSimStart({cfg:t,state:x}),n?.afterSimStart&&await n.afterSimStart({cfg:t,state:x}),{width:t.width,height:t.height,bases:x.bases,drones:x.drones,casualties:x.casualties}}const w={grid:"#1d2733",base:"#5b6977",drone:"#ffffff",ap:"#f43f5e",ep:"#f59e42",textDark:"#222",textLight:"#fff",visitedFill:"rgba(52,143,255,0.10)",pathVisited:"rgba(255,255,255,0.85)",pathRemaining:"rgba(255,255,255,0.35)",currentCellStroke:"#34a1ff"};function W(t,n,e,s,i,r){t.fillStyle=r,t.fillRect(n,e,s-n,i-e)}function E(t,n,e,s,i,r,c=0){const a=s-n,u=i-e,y=n+a/2,f=e+u/2,g=Math.min(a,u)/2-c;return t.fillStyle=r,t.beginPath(),t.arc(y,f,Math.max(0,g),0,Math.PI*2),t.fill(),{cx:y,cy:f,r:Math.max(0,g)}}function $(t,n,e,s,i,r){t.fillStyle=r,t.font=`${i}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(n,e,s)}function I(t,n,e,s,i){const r=t*e+i,c=n*s+i,a=(t+1)*e-i,u=(n+1)*s-i;return{cx:(r+a)/2,cy:(c+u)/2}}function P(t,n){const e=t.getContext("2d"),s=t.width,i=t.height,{width:r,height:c}=n,a=s/r,u=i/c;e.clearRect(0,0,s,i),e.strokeStyle=w.grid,e.lineWidth=1;for(let o=0;o<=r;o++){const l=Math.round(o*a)+.5;e.beginPath(),e.moveTo(l,.5),e.lineTo(l,i+.5),e.stroke()}for(let o=0;o<=c;o++){const l=Math.round(o*u)+.5;e.beginPath(),e.moveTo(.5,l),e.lineTo(s+.5,l),e.stroke()}const y=Math.min(a,u),f=y*.01,g=y*.01,v=y*.06,x=(o,l,d=0)=>{const m=o*a+f+d,h=l*u+f+d,p=(o+1)*a-f-d,b=(l+1)*u-f-d;return{L:m,T:h,R:p,B:b,cx:(m+p)/2,cy:(h+b)/2,w:p-m,h:b-h}};for(const o of n.drones){if(!o.spawned||!o.path||o.path.length<1)continue;const l=o.step==null?o.path.length-1:Math.max(0,Math.min(o.step,o.path.length-1));e.save(),e.fillStyle=w.visitedFill;for(let d=0;d<=l;d++){const m=o.path[d],{L:h,T:p,R:b,B:M}=x(m.x,m.y,0);e.fillRect(h,p,b-h,M-p)}e.restore()}for(const o of n.drones){if(!o.spawned||!o.path||o.path.length<2)continue;const l=o.step==null?o.path.length-1:Math.max(1,Math.min(o.step,o.path.length-1));e.save(),e.beginPath();for(let d=0;d<=l;d++){const m=o.path[d],{cx:h,cy:p}=I(m.x,m.y,a,u,f);d===0?e.moveTo(h,p):e.lineTo(h,p)}if(e.lineWidth=Math.max(1.25,Math.min(a,u)*.12),e.lineCap="round",e.lineJoin="round",e.strokeStyle=w.pathVisited,e.stroke(),e.restore(),l<o.path.length-1){e.save(),e.beginPath();const d=o.path[l];let{cx:m,cy:h}=I(d.x,d.y,a,u,f);e.moveTo(m,h);for(let p=l+1;p<o.path.length;p++){const b=o.path[p];({cx:m,cy:h}=I(b.x,b.y,a,u,f)),e.lineTo(m,h)}e.setLineDash([Math.max(3,y*.45),Math.max(3,y*.4)]),e.lineWidth=Math.max(1,Math.min(a,u)*.08),e.lineCap="round",e.lineJoin="round",e.strokeStyle=w.pathRemaining,e.stroke(),e.restore()}}for(const o of n.bases){const{L:l,T:d,R:m,B:h,cx:p,cy:b,w:M,h:S}=x(o.position.x,o.position.y,g);W(e,l,d,m,h,w.base);const C=Math.round(Math.min(M,S)*.42);$(e,String(o.unspawned??0),p,b,C,w.textLight)}for(const o of n.casualties){const{L:l,T:d,R:m,B:h,cx:p,cy:b,w:M,h:S}=x(o.estimatedPosition.x,o.estimatedPosition.y,0);W(e,l,d,m,h,w.ep);const C=Math.round(Math.min(M,S)*.42);$(e,String(o.id),p,b,C,w.textDark)}for(const o of n.casualties){const{L:l,T:d,R:m,B:h,cx:p,cy:b}=x(o.position.x,o.position.y,0),{r:M}=E(e,l,d,m,h,w.ap,f),S=Math.round(M*.88);$(e,String(o.id),p,b,S,w.textLight)}for(const o of n.drones){if(!o.spawned||!o.path||o.path.length===0)continue;const l=o.step==null?o.path.length-1:Math.max(0,Math.min(o.step,o.path.length-1)),d=o.path[l],{L:m,T:h,R:p,B:b}=x(d.x,d.y,0);e.save(),e.lineWidth=Math.max(1.5,Math.min(a,u)*.12),e.strokeStyle=w.currentCellStroke,e.strokeRect(m+1,h+1,p-m-2,b-h-2),e.restore()}for(const o of n.drones){if(!o.spawned)continue;const l=o.path&&o.step!=null&&o.path[o.step]||o.position,{L:d,T:m,R:h,B:p,cx:b,cy:M}=x(l.x,l.y,0);e.save();const S=f+v+Math.max(1,y*.04);E(e,d,m,h,p,"rgba(52,161,255,0.18)",S),e.restore();const C=f+v,{r:G}=E(e,d,m,h,p,w.drone,C),U=Math.round(G*.88);$(e,String(o.id),b,M,U,w.textDark)}}function lt(t,n){return t.x!==n.x?{x:t.x+Math.sign(n.x-t.x),y:t.y}:t.y!==n.y?{x:t.x,y:t.y+Math.sign(n.y-t.y)}:t}function ct(t,n,e,s){if(s<=0)return n===t.x&&e===t.y?1:0;const i=n-t.x,r=e-t.y;return Math.exp(-(i*i+r*r)/(2*s*s))}function dt(t){let n=0;for(const e of t)for(const s of e)n+=s;if(n===0)return t;for(let e=0;e<t.length;e++)for(let s=0;s<t[0].length;s++)t[e][s]/=n;return t}function ut(t,n,e,s){const i=Array.from({length:n},(r,c)=>Array.from({length:t},(a,u)=>ct(e,u,c,s)));return dt(i)}class ht{constructor(n,e,s,i,r){this.width=n,this.height=e,this.belief=ut(n,e,s,i),this.visited=new Set,this.casualty={...r},this.ep={...s}}k(n,e){return`${n},${e}`}nextStep(n,e){if(n.x===this.casualty.x&&n.y===this.casualty.y)return n;let s=null,i=-1/0;for(let u=0;u<this.height;u++)for(let y=0;y<this.width;y++){const f=this.belief[u][y];if(f<=0)continue;const g=this.k(y,u);if(this.visited.has(g)||e.has(g))continue;const v=Math.max(1,Math.abs(y-n.x)+Math.abs(u-n.y)),x=f/v;x>i&&(i=x,s={x:y,y:u})}const r=s??this.ep,c=lt(n,r),a=this.k(c.x,c.y);return this.visited.add(a),this.belief[c.y][c.x]=0,e.add(a),c}}const _={width:50,height:40,baseCount:1,droneCount:3,casualtyCount:1,mean:0,stdDev:2,maxTranslation:10,playbackTicksPerSec:30,launchEveryTicks:3,seed:void 0};function pt(){const t=J();t.setTopBar("MASAR Demo"),t.setBottomBar(`© Steve Marvell ${new Date().getFullYear()}`),X(t.key),Y(t.log),yt(t.canvas,_),z(t.controls,_,async n=>{await mt(t.canvas,t.controls,t.log,n)})}async function mt(t,n,e,s){if(s.seed==null){const v=ft();s.seed=v,Q(n,v)}T(e,`t: 0 START seed ${s.seed}`);const i=await rt(s,{beforeSimStart:({cfg:v})=>V(t,v)});if(!i.casualties.length){P(t,i),T(e,"t: 0 END");return}const r=i.casualties[0],c=new ht(s.width,s.height,r.estimatedPosition,s.stdDev,r.position),a={...i,drones:i.drones.map(v=>({...v})),bases:i.bases.map(v=>({...v}))};let u=null,y=0,f=0;const g=v=>{u==null&&(u=v);const x=v-u;for(u=v,y+=s.playbackTicksPerSec*x/1e3;y>=1;){y-=1;let o=null;for(const l of a.drones)!l.spawned&&f>=l.launchAtTick&&(l.spawned=!0,l.path=[l.position],l.step=0,T(e,`t: ${f} LAUNCH drone #${l.id} base #${l.baseId}`),q(l.position,r.position)&&(o=l.id));if(o==null){const l=new Set;for(const d of a.drones){if(!d.spawned)continue;const m=d.path[d.path.length-1];if(q(m,r.position)){o=d.id;continue}const h=c.nextStep(m,l);d.path.push(h),d.position=h,d.step=d.path.length-1,q(h,r.position)&&(o=d.id)}}if(o!=null){T(e,`t: ${f} FOUND drone #${o} casualty #${r.id}`),P(t,a),T(e,`t: ${f} END`);return}f+=1}P(t,a),requestAnimationFrame(g)};requestAnimationFrame(g)}function ft(){if(window.crypto&&"getRandomValues"in window.crypto){const t=new Uint32Array(1);return window.crypto.getRandomValues(t),t[0]===0?1:t[0]}return Math.floor(1+Math.random()*2147483646)}function q(t,n){return t.x===n.x&&t.y===n.y}function yt(t,n){V(t,n);const e={width:n.width,height:n.height,bases:[],drones:[],casualties:[]};P(t,e)}function V(t,n){const e=window.devicePixelRatio||1,s=800,i=Math.round(s*(n.width/n.height));t.style.width=i+"px",t.style.height=s+"px",t.width=Math.round(i*e),t.height=Math.round(s*e)}window.addEventListener("DOMContentLoaded",pt);
