(() => {
  "use strict";

  const TEX = {
    spark:"./assets/fx/spark.svg",
    star:"./assets/fx/star.svg",
    ember:"./assets/fx/ember.svg",
    flare:"./assets/fx/flare.svg",
    halo:"./assets/fx/halo.svg",
    flame:"./assets/fx/flame.svg",
    bolt:"./assets/fx/bolt.svg",
    snow:"./assets/fx/snow.svg",
    wind:"./assets/fx/wind.svg",
    leaf:"./assets/fx/leaf.svg",
    sun:"./assets/fx/sun.svg",
    moon:"./assets/fx/moon.svg",
    void:"./assets/fx/void.svg",
    prism:"./assets/fx/prism.svg",
    cosmic:"./assets/fx/cosmic.svg"
  };

  const MUTATION_COLORS = [
    "#8d94a3","#ff7043","#69e7ff","#9deaff","#72ffd5",
    "#7ee47e","#ffd761","#bdc9ff","#aa69ff","#ff83e8","#fff0a5"
  ];
  const MUTATION_TEXTURES = [null,"flame","bolt","snow","wind","leaf","sun","moon","void","prism","cosmic"];

  const isMobile = matchMedia("(max-width: 700px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const memory = Number(navigator.deviceMemory || 4);
  const cores = Number(navigator.hardwareConcurrency || 4);
  const lowPower = memory <= 4 || cores <= 4;

  const quality = reducedMotion ? 0.18 : lowPower ? 0.52 : isMobile ? 0.66 : 1;
  const maxParticles = Math.round((isMobile ? 72 : 150) * quality);
  const targetFps = reducedMotion ? 16 : lowPower ? 28 : isMobile ? 36 : 50;
  const frameMs = 1000 / targetFps;

  const canvas = document.createElement("canvas");
  canvas.id = "cardFxCanvas";
  canvas.setAttribute("aria-hidden","true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", {alpha:true, desynchronized:true});
  if(!ctx) return;

  let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.7);
  let vw = 0, vh = 0, running = true, lastFrame = 0, lastScan = 0;
  let targets = [];
  const particles = [];
  const images = {};
  const spawnState = new WeakMap();
  const frameRects = new Map();

  function loadTextures(){
    Object.entries(TEX).forEach(([key,src])=>{
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      images[key] = img;
    });
  }

  function resize(){
    vw = Math.max(1, window.innerWidth);
    vh = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.7);
    canvas.width = Math.round(vw*dpr);
    canvas.height = Math.round(vh*dpr);
    canvas.style.width = vw+"px";
    canvas.style.height = vh+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function classNumber(el,prefix){
    let node=el,depth=0;
    while(node && node!==document.body && depth<3){
      for(const c of node.classList || []){
        if(c.startsWith(prefix)){
          const n=Number(c.slice(prefix.length));
          if(Number.isInteger(n)) return n;
        }
      }
      node=node.parentElement;depth++;
    }
    return 0;
  }

  function scanTargets(force=false){
    const now=performance.now();
    if(!force && now-lastScan<700) return;
    lastScan=now;
    const els=[...document.querySelectorAll(".tier-fx")];
    targets=els.slice(0,90).map(el=>({
      el,
      tier:classNumber(el,"tier-"),
      grade:classNumber(el,"grade-shell-"),
      mutation:classNumber(el,"mutation-")
    })).filter(t=>t.tier>=4 || t.grade>=7 || t.mutation>0);
  }

  function visibleRect(el){
    if(!el.isConnected) return null;
    const r=el.getBoundingClientRect();
    if(r.width<18 || r.height<18 || r.bottom<0 || r.right<0 || r.top>vh || r.left>vw) return null;
    if(r.width>vw*1.5 || r.height>vh*1.5) return null;
    return r;
  }

  function activeLayerAllows(el){
    const modal=document.querySelector(".modal.show");
    if(modal) return modal.contains(el);
    const reveal=document.querySelector("#reveal.show");
    if(reveal) return reveal.contains(el);
    return true;
  }

  function rateFor(tier,grade,mutation=0){
    let rate=0;
    if(tier===4) rate=0.55;
    else if(tier===5) rate=0.8;
    else if(tier===6) rate=1.05;
    else if(tier===7) rate=1.45;
    else if(tier===8) rate=1.9;
    else if(tier>=9) rate=2.45;

    if(grade===7) rate+=0.38;
    else if(grade===8) rate+=0.72;
    else if(grade===9) rate+=1.15;
    else if(grade===10) rate+=1.55;
    else if(grade===11) rate+=1.95;
    else if(grade>=12) rate+=2.4;

    if(mutation>0) rate+=mutation>=8?2.35:mutation>=6?1.95:1.55;
    return rate*quality;
  }

  function chooseTexture(tier,grade,mutation=0){
    const r=Math.random();
    if(mutation>0 && r<.72) return MUTATION_TEXTURES[mutation]||"spark";
    if(grade>=12) return r<.44?"flare":r<.78?"star":"spark";
    if(grade>=11) return r<.36?"flare":r<.68?"star":"spark";
    if(grade>=10) return r<.30?"flare":r<.58?"star":"spark";
    if(grade>=9 && r<.22) return "flare";
    if(tier>=9) return r<.18?"flare":r<.58?"spark":"star";
    if(tier===8) return r<.38?"flare":r<.68?"star":"spark";
    if(tier===7) return r<.72?"star":"spark";
    if(tier===6) return r<.24?"flare":"spark";
    if(tier===5) return r<.72?"ember":"spark";
    return "spark";
  }

  function spawn(target,rect){
    if(particles.length>=maxParticles) return;
    const tier=target.tier,grade=target.grade,mutation=target.mutation||0;
    const edge=Math.random();
    let nx,ny;
    if(edge<.34){nx=Math.random();ny=.06+Math.random()*.18}
    else if(edge<.67){nx=Math.random();ny=.72+Math.random()*.24}
    else {nx=Math.random()<.5?.05:.95;ny=.12+Math.random()*.78}

    const key=chooseTexture(tier,grade,mutation);
    const high=Math.max(tier-3,grade-6);
    const size=(8+Math.random()*8+high*1.5)*(isMobile?.86:1);
    const life=950+Math.random()*1050+(tier>=8?500:0);

    particles.push({
      el:target.el,nx,ny,
      dx:(Math.random()-.5)*18,
      dy:0,
      vx:mutation===4?(10+Math.random()*20):(Math.random()-.5)*(mutation===8?16:tier>=8?10:6),
      vy:mutation===1?-(18+Math.random()*22):mutation===3?-(2+Math.random()*8):-(7+Math.random()*14+(tier-4)*1.2),
      size,life,maxLife:life,
      rot:Math.random()*Math.PI*2,
      vr:(Math.random()-.5)*1.1,
      key,mutation,
      alpha:.42+Math.random()*.45,
      pulse:Math.random()*Math.PI*2
    });
  }

  function updateSpawns(dt){
    for(const t of targets){
      const r=frameRects.get(t.el);
      if(!r) continue;
      let s=spawnState.get(t.el);
      if(!s){s={acc:Math.random()};spawnState.set(t.el,s)}
      s.acc += rateFor(t.tier,t.grade,t.mutation)*dt;
      while(s.acc>=1 && particles.length<maxParticles){
        s.acc-=1; spawn(t,r);
      }
    }
  }

  function roundedRectPath(rect,pad=0,radius=12){
    const x=rect.left-pad,y=rect.top-pad,w=rect.width+pad*2,h=rect.height+pad*2;
    const r=Math.min(radius,w/4,h/4);
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  }

  function perimeterPoint(rect,p,pad=3){
    const x=rect.left-pad,y=rect.top-pad,w=rect.width+pad*2,h=rect.height+pad*2;
    const per=2*(w+h),d=((p%1)+1)%1*per;
    if(d<w)return [x+d,y,0,-1];
    if(d<w+h)return [x+w,y+(d-w),1,0];
    if(d<2*w+h)return [x+w-(d-w-h),y+h,0,1];
    return [x,y+h-(d-2*w-h),-1,0];
  }

  function drawThunderBorder(rect,time,color){
    const steps=28,phase=time*.006;
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    for(let layer=0;layer<2;layer++){
      ctx.beginPath();
      for(let i=0;i<=steps;i++){
        const p=i/steps;
        const [x,y,nx,ny]=perimeterPoint(rect,p,3);
        const jitter=(Math.sin(phase+i*5.31)+Math.sin(phase*1.7+i*2.17))*2.1*(layer?0.55:1);
        const px=x+nx*jitter,py=y+ny*jitter;
        if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      }
      ctx.strokeStyle=layer?"#ffffff":color;
      ctx.lineWidth=layer?1.05:2.7;
      ctx.globalAlpha=layer?.95:.58;
      ctx.shadowBlur=layer?4:12;ctx.shadowColor=color;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMutationBorder(target,rect,time){
    const m=target.mutation||0;if(!m)return;
    const color=MUTATION_COLORS[m]||"#fff";
    const pulse=.72+.22*Math.sin(time*.003+m);
    ctx.save();
    ctx.globalCompositeOperation="lighter";

    if(m===2){
      ctx.restore();drawThunderBorder(rect,time,color);return;
    }

    roundedRectPath(rect,2,m>=8?15:11);
    if(m===9){
      const grad=ctx.createLinearGradient(rect.left,rect.top,rect.right,rect.bottom);
      grad.addColorStop(0,"#ff68d8");grad.addColorStop(.22,"#9c7cff");grad.addColorStop(.44,"#67eaff");
      grad.addColorStop(.66,"#82ffae");grad.addColorStop(.84,"#ffe46b");grad.addColorStop(1,"#ff68d8");
      ctx.strokeStyle=grad;
    }else if(m===10){
      const grad=ctx.createLinearGradient(rect.left,rect.top,rect.right,rect.bottom);
      grad.addColorStop(0,"#fff3a4");grad.addColorStop(.42,"#ffffff");grad.addColorStop(.68,"#70f5ff");grad.addColorStop(1,"#b080ff");
      ctx.strokeStyle=grad;
    }else{
      ctx.strokeStyle=color;
    }
    ctx.lineWidth=m===10?3.2:m>=8?2.7:2.1;
    ctx.globalAlpha=(m===1?.62:m===8?.56:.68)*pulse;
    ctx.shadowBlur=m===10?18:m>=8?14:9;
    ctx.shadowColor=color;

    if(m===4){
      ctx.setLineDash([18,10]);ctx.lineDashOffset=-time*.04;
    }else if(m===7){
      ctx.setLineDash([7,9]);ctx.lineDashOffset=time*.018;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if(m===1){
      roundedRectPath(rect,5,10);ctx.strokeStyle="#ffb14d";ctx.lineWidth=1.2;ctx.globalAlpha=.7*pulse;ctx.stroke();
    }else if(m===3){
      roundedRectPath(rect,5,10);ctx.strokeStyle="#eaffff";ctx.lineWidth=1;ctx.globalAlpha=.65;ctx.stroke();
    }else if(m===8){
      roundedRectPath(rect,6,14);ctx.strokeStyle="#3c145f";ctx.lineWidth=4;ctx.globalAlpha=.36;ctx.stroke();
    }else if(m===10){
      roundedRectPath(rect,7,16);ctx.strokeStyle="#ffffff";ctx.lineWidth=1.1;ctx.globalAlpha=.78;ctx.stroke();
    }
    ctx.restore();
  }

  function drawHalo(target,rect,time){
    if(target.tier<8 && target.grade<9) return;
    const img=images.halo;
    if(!img || !img.complete) return;
    const tierPower=target.tier>=9?1:target.tier===8?.58:.35;
    const gradePower=target.grade>=9?.34:0;
    const alpha=(tierPower+gradePower)*(.38+.12*Math.sin(time*.0016));
    const pad=Math.min(44,Math.max(18,rect.width*.13));
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=Math.min(.8,alpha*quality);
    ctx.translate(rect.left+rect.width/2,rect.top+rect.height/2);
    ctx.rotate(time*.00008*(target.tier>=9?1:-1));
    ctx.drawImage(img,-rect.width/2-pad,-rect.height/2-pad,rect.width+pad*2,rect.height+pad*2);
    ctx.restore();
  }

  function updateAndDrawParticles(dt,time){
    ctx.globalCompositeOperation="source-over";
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.life-=dt*1000;
      if(p.life<=0 || !p.el.isConnected){particles.splice(i,1);continue}
      const r=frameRects.get(p.el);
      if(!r) continue;

      p.dx+=p.vx*dt;
      p.dy+=p.vy*dt;
      p.rot+=p.vr*dt;
      const progress=1-p.life/p.maxLife;
      const fade=Math.sin(Math.min(1,progress)*Math.PI);
      const img=images[p.key];
      if(!img || !img.complete) continue;

      const x=r.left+r.width*p.nx+p.dx;
      const y=r.top+r.height*p.ny+p.dy;
      const pulse=.9+.16*Math.sin(time*.006+p.pulse);
      const size=p.size*pulse*(p.key==="flare"?1.65:p.key==="halo"?2:1);

      ctx.save();
      ctx.globalCompositeOperation="lighter";
      ctx.globalAlpha=p.alpha*fade*quality;
      ctx.translate(x,y);
      ctx.rotate(p.rot);
      ctx.drawImage(img,-size/2,-size/2,size,size);
      ctx.restore();
    }
  }

  function frame(time){
    if(!running){requestAnimationFrame(frame);return}
    if(time-lastFrame<frameMs){requestAnimationFrame(frame);return}
    const dt=Math.min(.08,Math.max(.001,(time-lastFrame)/1000 || .016));
    lastFrame=time;
    scanTargets();

    ctx.clearRect(0,0,vw,vh);

    frameRects.clear();
    for(const t of targets){
      if(!activeLayerAllows(t.el)) continue;
      const r=visibleRect(t.el);
      if(!r) continue;
      frameRects.set(t.el,r);
      drawMutationBorder(t,r,time);
      drawHalo(t,r,time);
    }

    updateSpawns(dt);
    updateAndDrawParticles(dt,time);
    requestAnimationFrame(frame);
  }

  const observer=new MutationObserver(()=>scanTargets(true));
  observer.observe(document.body,{childList:true,subtree:true});

  document.addEventListener("visibilitychange",()=>{
    running=document.visibilityState==="visible";
    if(running){
      lastFrame=performance.now();
      scanTargets(true);
    }
  });
  window.addEventListener("resize",resize,{passive:true});
  window.addEventListener("orientationchange",resize,{passive:true});

  loadTextures();
  resize();
  scanTargets(true);
  requestAnimationFrame(frame);
})();