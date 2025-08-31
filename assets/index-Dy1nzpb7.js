(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();const I=Math.random,T=function t(e){function n(a,o){var i,l;return a=a==null?0:+a,o=o==null?1:+o,function(){var r;if(i!=null)r=i,i=null;else do i=e()*2-1,r=e()*2-1,l=i*i+r*r;while(!l||l>1);return a+o*r*Math.sqrt(-2*Math.log(l)/l)}}return n.source=t,n}(I),O=1664525,A=1013904223,B=1/4294967296;function P(t=Math.random()){let e=(0<=t&&t<1?t/B:Math.abs(t))|0;return()=>(e=O*e+A|0,B*(e>>>0))}function F(t,e,n,a=10,o=10,i){const l=i==null?void 0:P(i),r=l?T.source(l)(0,e):T(0,e),c=Math.max(-a,Math.min(a,Math.round(r()))),v=Math.max(-o,Math.min(o,Math.round(r()))),m=Math.max(0,Math.min(n.width-1,t.x+c)),M=Math.max(0,Math.min(n.height-1,t.y+v));return{x:m,y:M}}function H(t){const e=t==null?null:P(t),n=()=>e?e():Math.random();return{int:a=>Math.floor(n()*a),normal:(a,o)=>(e?T.source(e)(a,o):T(a,o))(),uniform:n}}async function W(t,e){const n=H(t.seed),a=[];for(let r=0;r<t.baseCount;r++)a.push({id:r+1,position:{x:Math.floor(t.width/2),y:t.height-1},capacity:t.droneCount,unspawned:t.droneCount});const o=[],i=[];for(let r=0;r<t.casualtyCount;r++){const c={x:n.int(t.width),y:n.int(Math.floor(t.height*.66))},v=F(c,t.stdDev,{width:t.width,height:t.height},t.maxTranslation,t.maxTranslation,t.seed);i.push({id:r+1,estimatedPosition:c,position:v})}const l={bases:a,drones:o,casualties:i};return e!=null&&e.beforeSimStart&&await e.beforeSimStart({cfg:t,state:l}),e!=null&&e.afterSimStart&&await e.afterSimStart({cfg:t,state:l}),{width:t.width,height:t.height,bases:l.bases,drones:l.drones,casualties:l.casualties}}const y={grid:"#1d2733",base:"#5b6977",drone:"#ffffff",ap:"#f43f5e",ep:"#f59e42",textDark:"#222",textLight:"#fff"};function L(t,e,n,a,o,i){t.fillStyle=i,t.fillRect(e,n,a-e,o-n)}function N(t,e,n,a,o,i,l=0){const r=a-e,c=o-n,v=e+r/2,m=n+c/2,M=Math.min(r,c)/2-l;return t.fillStyle=i,t.beginPath(),t.arc(v,m,Math.max(0,M),0,Math.PI*2),t.fill(),{cx:v,cy:m,r:Math.max(0,M)}}function S(t,e,n,a,o,i){t.fillStyle=i,t.font=`${o}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(e,n,a)}function q(t,e){const n=t.getContext("2d"),a=t.width,o=t.height,{width:i,height:l}=e,r=a/i,c=o/l;n.clearRect(0,0,a,o),n.strokeStyle=y.grid,n.lineWidth=1;for(let s=0;s<=i;s++){const d=Math.round(s*r)+.5;n.beginPath(),n.moveTo(d,.5),n.lineTo(d,o+.5),n.stroke()}for(let s=0;s<=l;s++){const d=Math.round(s*c)+.5;n.beginPath(),n.moveTo(.5,d),n.lineTo(a+.5,d),n.stroke()}const v=Math.min(r,c),m=v*.01,M=v*.01,$=v*.06,C=(s,d,u=0)=>{const h=s*r+m+u,p=d*c+m+u,b=(s+1)*r-m-u,f=(d+1)*c-m-u;return{L:h,T:p,R:b,B:f,cx:(h+b)/2,cy:(p+f)/2,w:b-h,h:f-p}};for(const s of e.bases){const{L:d,T:u,R:h,B:p,cx:b,cy:f,w:x,h:g}=C(s.position.x,s.position.y,M);L(n,d,u,h,p,y.base);const w=Math.round(Math.min(x,g)*.42);S(n,String(s.unspawned??0),b,f,w,y.textLight)}for(const s of e.casualties){const{L:d,T:u,R:h,B:p,cx:b,cy:f,w:x,h:g}=C(s.estimatedPosition.x,s.estimatedPosition.y,0);L(n,d,u,h,p,y.ep);const w=Math.round(Math.min(x,g)*.42);S(n,String(s.id),b,f,w,y.textDark)}for(const s of e.casualties){const{L:d,T:u,R:h,B:p,cx:b,cy:f}=C(s.position.x,s.position.y,0),x=m,{r:g}=N(n,d,u,h,p,y.ap,x),w=Math.round(g*.88);S(n,String(s.id),b,f,w,y.textLight)}for(const s of e.drones){if(!s.spawned)continue;const{L:d,T:u,R:h,B:p,cx:b,cy:f}=C(s.position.x,s.position.y,0),x=m+$,{r:g}=N(n,d,u,h,p,y.drone,x),w=Math.round(g*.88);S(n,String(s.id),b,f,w,y.textDark)}}const R=document.getElementById("main-canvas"),G=document.getElementById("sidebar-key"),K=document.getElementById("top-bar"),V=document.getElementById("bottom-bar"),Y=document.getElementById("sidebar-config");let D={width:50,height:40,baseCount:1,droneCount:4,casualtyCount:1,mean:0,stdDev:2,maxTranslation:10,seed:void 0};function j(t,e){const n=window.devicePixelRatio||1,a=800,o=Math.round(a*(e.width/e.height));t.style.width=o+"px",t.style.height=a+"px",t.width=Math.round(o*n),t.height=Math.round(a*n)}function z(t){Y.innerHTML=`
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
      <div class="cfg-row" style="margin-top:14px; margin-bottom:6px;">
        <label>Seed</label>
        <input name="seed" type="number" placeholder="random" value="${t.seed??""}" />
      </div>
      <div>
        <button type="submit" class="btn-primary">Run Simulation</button>
      </div>
    </form>
  `;const e=document.getElementById("cfg-form");e.onsubmit=async n=>{n.preventDefault();const a=new FormData(e);t.width=Number(a.get("width")),t.height=Number(a.get("height")),t.baseCount=Number(a.get("baseCount")),t.droneCount=Number(a.get("droneCount")),t.casualtyCount=Number(a.get("casualtyCount")),t.mean=Number(a.get("mean")),t.stdDev=Number(a.get("stdDev")),t.maxTranslation=Number(a.get("maxTranslation"));const o=a.get("seed");t.seed=o===""||o==null?void 0:Number(o),await E()}}async function E(){K.textContent="MASAR Demo",V.textContent=`© Steve Marvell ${new Date().getFullYear()}`,G.innerHTML=`
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base">#</span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key ep"></span>Estimated Position</div>
    <div><span class="key ap"></span>Actual Position</div>
  `,z(D);const t=await W(D,{beforeSimStart:({cfg:e})=>j(R,e)});q(R,t)}window.onload=E;
