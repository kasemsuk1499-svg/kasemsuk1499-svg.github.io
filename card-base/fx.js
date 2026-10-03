(() => {
  "use strict";

  const TEX = {
    spark:"./assets/fx/spark.svg",
    star:"./assets/fx/star.svg",
    ember:"./assets/fx/ember.svg",
    flare:"./assets/fx/flare.svg",
    halo:"./assets/fx/halo.svg"
  };

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
      grade:classNumber(el,"grade-shell-")
    })).filter(t=>t.tier>=4 || t.grade>=7);
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

  function rateFor(tier,grade){
    let rate=0;
    if(tier===4) rate=0.55;
    else if(tier===5) rate=0.8;
    else if(tier===6) rate=1.05;
    else if(tier===7) rate=1.45;
    else if(tier===8) rate=1.9;
    else if(tier>=9) rate=2.45;
    if(grade===7) rate+=0.38;
    else if(grade===8) rate+=0.72;
    else if(grade>=9) rate+=1.15;
    return rate*quality;
  }

  function chooseTexture(tier,grade){
    const r=Math.random();
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
    const tier=target.tier,grade=target.grade;
    const edge=Math.random();
    let nx,ny;
    if(edge<.34){nx=Math.random();ny=.06+Math.random()*.18}
    else if(edge<.67){nx=Math.random();ny=.72+Math.random()*.24}
    else {nx=Math.random()<.5?.05:.95;ny=.12+Math.random()*.78}

    const key=chooseTexture(tier,grade);
    const high=Math.max(tier-3,grade-6);
    const size=(8+Math.random()*8+high*1.5)*(isMobile?.86:1);
    const life=950+Math.random()*1050+(tier>=8?500:0);

    particles.push({
      el:target.el,nx,ny,
      dx:(Math.random()-.5)*18,
      dy:0,
      vx:(Math.random()-.5)*(tier>=8?10:6),
      vy:-(7+Math.random()*14+(tier-4)*1.2),
      size,life,maxLife:life,
      rot:Math.random()*Math.PI*2,
      vr:(Math.random()-.5)*1.1,
      key,
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
      s.acc += rateFor(t.tier,t.grade)*dt;
      while(s.acc>=1 && particles.length<maxParticles){
        s.acc-=1; spawn(t,r);
      }
    }
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