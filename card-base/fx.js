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
    cosmic:"./assets/fx/cosmic.svg",
    amaterasu:"./assets/fx/amaterasu.svg"
  };

  const MUTATION_COLORS = [
    "#8d94a3","#ff7043","#69e7ff","#9deaff","#72ffd5",
    "#7ee47e","#ffd761","#bdc9ff","#aa69ff","#ff83e8","#fff0a5",
    "#ff5fb7","#77fff1","#5fffea","#b9ff6a","#ff7cf5","#6fe7ff",
    "#7aa2ff","#ff9ad5","#8a64ff","#ffe47a","#ff2b35"
  ];
  const MUTATION_TEXTURES = [null,"flame","bolt","snow","wind","leaf","sun","moon","void","prism","cosmic","halo",null,null,null,null,null,null,null,null,null,"amaterasu"];
  const PARTICLES_PREF_KEY = "card-base-particles-enabled-v1";

  function mutationParticleKind(m){
    return ({
      12:"chrono",13:"glitch",14:"helix",15:"shard",
      16:"inverse",17:"scan",18:"echo",19:"gravity",20:"rune",21:"amaterasu"
    })[m]||"";
  }

  const isMobile = matchMedia("(max-width: 700px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const memory = Number(navigator.deviceMemory || 4);
  const cores = Number(navigator.hardwareConcurrency || 4);
  const lowPower = memory <= 4 || cores <= 4;

  const quality = reducedMotion ? 0.18 : lowPower ? 0.52 : isMobile ? 0.66 : 1;
  const maxParticles = Math.round((isMobile ? 64 : 132) * quality);
  const targetFps = reducedMotion ? 16 : lowPower ? 28 : isMobile ? 36 : 50;
  const frameMs = 1000 / targetFps;

  const canvas = document.createElement("canvas");
  canvas.id = "cardFxCanvas";
  canvas.setAttribute("aria-hidden","true");
  document.body.appendChild(canvas);
  // Some mobile Chromium/WebView GPU paths can composite a desynchronized
  // transparent canvas as an opaque black layer. Keep the desktop fast path,
  // but use the regular alpha context on phones/tablets.
  const ctx = canvas.getContext("2d", isMobile ? {alpha:true} : {alpha:true, desynchronized:true});
  if(!ctx) return;

  let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.7);
  let vw = 0, vh = 0, running = true, lastFrame = 0, lastScan = 0;
  let particleEnabled = localStorage.getItem(PARTICLES_PREF_KEY)!=="0";
  let targets = [];
  const particles = [];
  const images = {};
  const spawnState = new WeakMap();
  const frameRects = new Map();
  let spawnCursor = 0;
  let mobileParticleCount = 0;

  function clearParticleLayer(){
    particles.length=0;
    document.querySelectorAll(".mobile-card-particle").forEach(el=>el.remove());
    mobileParticleCount=0;
  }

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
    const els=[...document.querySelectorAll(".tier-fx")].filter(activeLayerAllows);
    targets=els.slice(0,90).map(el=>{
      const awakenBadge=el.querySelector(".awakening-badge");
      const awakenMatch=awakenBadge?.textContent?.match(/★\s*(\d+)/);
      const dataAwakening=Math.max(0,Math.floor(Number(el.dataset.awakening)||0));
      return {
        el,
        tier:classNumber(el,"tier-"),
        grade:classNumber(el,"grade-shell-"),
        mutation:classNumber(el,"mutation-"),
        mutation2:classNumber(el,"mutation2-"),
        awakening:dataAwakening||(awakenMatch?Math.max(0,Number(awakenMatch[1])||0):0),
        visitor:!!el.closest("#socialBaseModal")
      };
    }).filter(t=>t.tier>=4 || t.grade>=7 || t.mutation>0 || t.mutation2>0 || t.awakening>0);
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
    const panel=el.closest(".panel");
    if(panel && !panel.classList.contains("active")) return false;
    return true;
  }

  function rateFor(tier,grade,mutation=0,mutation2=0,showcaseBoost=1){
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

    const addMutationRate=m=>{
      if(!m)return;
      // Amaterasu remains intentionally lighter than other top mutations.
      rate+=m>=21?1.85:m>=11?3.15:m>=8?2.65:m>=6?2.2:1.8;
    };
    addMutationRate(mutation);
    addMutationRate(mutation2);
    if(mutation&&mutation2)rate+=1.05;

    return rate*quality*showcaseBoost;
  }

  function chooseTexture(tier,grade,mutation=0,mutation2=0){
    const r=Math.random();
    const pickedMutation=mutation2&&mutation
      ? (Math.random()<.5?mutation:mutation2)
      : (mutation||mutation2);

    if(pickedMutation>=12) return "__special";
    if(pickedMutation>0 && r<.78) return MUTATION_TEXTURES[pickedMutation]||"spark";
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
    const tier=target.tier,grade=target.grade,mutation=target.mutation||0,mutation2=target.mutation2||0;
    const activeMutation=mutation2&&mutation?(Math.random()<.5?mutation:mutation2):(mutation||mutation2);
    const edge=Math.random();
    let nx,ny;
    if(edge<.34){nx=Math.random();ny=.06+Math.random()*.18}
    else if(edge<.67){nx=Math.random();ny=.72+Math.random()*.24}
    else {nx=Math.random()<.5?.05:.95;ny=.12+Math.random()*.78}

    const key=chooseTexture(tier,grade,mutation,mutation2);
    const kind=mutationParticleKind(activeMutation)||(!activeMutation&&grade===11?"gradePrism":"");
    const high=Math.max(tier-3,grade-6);
    const size=(12+Math.random()*10+high*1.8)*(isMobile?.88:1)*(target.visitor?1.28:1)*(activeMutation===21?1.12:1);
    const life=950+Math.random()*1050+(tier>=8?500:0)+(activeMutation>=11?350:0)+(activeMutation===21?180:0);

    if(activeMutation===16){ny=.78+Math.random()*.18}
    let vx=activeMutation===4?(10+Math.random()*20):(Math.random()-.5)*(activeMutation>=8?18:tier>=8?10:7);
    let vy=activeMutation===1?-(18+Math.random()*22):activeMutation===3?-(2+Math.random()*8):-(7+Math.random()*15+(tier-4)*1.2);
    if(activeMutation===16){vx=(Math.random()-.5)*4;vy=-(24+Math.random()*30)}
    if(activeMutation===19){
      vx=(.5-nx)*rect.width*(.52+Math.random()*.18);
      vy=(.5-ny)*rect.height*(.52+Math.random()*.18);
    }

    particles.push({
      el:target.el,nx,ny,
      dx:(Math.random()-.5)*18,
      dy:0,vx,vy,
      size,life,maxLife:life,
      rot:Math.random()*Math.PI*2,
      vr:kind==="amaterasu"?(0.55+Math.random()*.35):(Math.random()-.5)*(kind==="glitch"?3.4:1.1),
      key,kind,mutation:activeMutation,
      alpha:Math.min(1,(.56+Math.random()*.36)*(target.visitor?1.12:1)),
      pulse:Math.random()*Math.PI*2
    });
  }

  function spawnMobileParticle(target){
    if(!particleEnabled || !isMobile || reducedMotion || !target?.el?.isConnected) return;
    const cap=target.visitor?34:26;
    if(mobileParticleCount>=cap) return;

    const m1=target.mutation||0,m2=target.mutation2||0;
    const activeMutation=m1&&m2?(Math.random()<.5?m1:m2):(m1||m2);
    const computed=getComputedStyle(target.el);
    const color=activeMutation
      ? (MUTATION_COLORS[activeMutation]||"#ffffff")
      : (computed.getPropertyValue("--tier").trim()||"#ffffff");

    const p=document.createElement("i");
    p.className="mobile-card-particle"+(activeMutation===21?" amaterasu-eye-particle":"");
    p.setAttribute("aria-hidden","true");
    const glyphs={11:"✺",12:"⧖",13:"▧",14:"⌁",15:"◈",16:"↑",17:"◎",18:"◫",19:"◉",20:"⌬",21:"⦿"};
    p.textContent=activeMutation===21?"":(activeMutation>=11?(glyphs[activeMutation]||"◆"):(Math.random()<.58?"✦":Math.random()<.72?"✧":"•"));

    const edge=Math.random();
    let x,y;
    if(edge<.42){x=8+Math.random()*84;y=72+Math.random()*22}
    else if(edge<.72){x=8+Math.random()*84;y=6+Math.random()*18}
    else{x=Math.random()<.5?5+Math.random()*8:87+Math.random()*8;y=18+Math.random()*66}

    const strength=target.visitor?1.2:1;
    const dx=(Math.random()-.5)*(30*strength);
    const dy=-(20+Math.random()*34)*strength;
    const size=(10+Math.random()*8+(target.tier>=8?3:0))*(target.visitor?1.12:1)*(activeMutation===21?1.10:1);
    const life=Math.round((900+Math.random()*650)*(target.visitor?1.05:1));

    p.style.left=x+"%";
    p.style.top=y+"%";
    p.style.setProperty("--fx-color",color);
    p.style.setProperty("--fx-dx",dx.toFixed(1)+"px");
    p.style.setProperty("--fx-dy",dy.toFixed(1)+"px");
    p.style.setProperty("--fx-size",size.toFixed(1)+"px");
    p.style.setProperty("--fx-life",life+"ms");
    p.style.setProperty("--fx-rot",activeMutation===21?(480+Math.random()*240).toFixed(0)+"deg":((Math.random()-.5)*150).toFixed(0)+"deg");

    mobileParticleCount++;
    const cleanup=()=>{
      if(!p.isConnected)return;
      p.remove();
      mobileParticleCount=Math.max(0,mobileParticleCount-1);
    };
    p.addEventListener("animationend",cleanup,{once:true});
    target.el.appendChild(p);
    setTimeout(cleanup,life+180);
  }



  function updateSpawns(dt){
    // Mobile browsers can fail to composite the canvas particles even while
    // borders/halos still draw. Use lightweight DOM sparks on mobile only.
    if(isMobile){
      for(const t of targets){
        if(!frameRects.get(t.el)) continue;
        let s=spawnState.get(t.el);
        if(!s){s={acc:Math.random()};spawnState.set(t.el,s)}
        const nativeRate=rateFor(t.tier,t.grade,t.mutation,t.mutation2,t.visitor?2.15:1.25);
        const floorRate=t.visitor?1.45:.85;
        s.acc=Math.min(3,s.acc+Math.max(floorRate,nativeRate)*dt);
        while(s.acc>=1 && mobileParticleCount<(t.visitor?34:26)){
          s.acc-=1;
          spawnMobileParticle(t);
        }
      }
      return;
    }

    // Build a ready queue first, then spend the shared particle budget in
    // round-robin order. Previously targets were processed from slot 1 onward,
    // so when maxParticles filled up the later stands could be starved forever.
    const ready=[];
    for(const t of targets){
      const r=frameRects.get(t.el);
      if(!r) continue;
      let s=spawnState.get(t.el);
      if(!s){s={acc:Math.random()};spawnState.set(t.el,s)}
      s.acc=Math.min(4,s.acc+rateFor(t.tier,t.grade,t.mutation,t.mutation2,t.visitor?1.75:1)*dt);
      if(s.acc>=1)ready.push({t,r,s});
    }
    if(!ready.length || particles.length>=maxParticles) return;

    const start=spawnCursor%ready.length;
    let free=maxParticles-particles.length;
    let progressed=true,rounds=0;

    // One particle per ready card per pass keeps every visible stand alive,
    // while a few extra passes still let stronger cards look stronger.
    while(free>0 && progressed && rounds<4){
      progressed=false;
      for(let i=0;i<ready.length && free>0;i++){
        const item=ready[(start+i)%ready.length];
        if(item.s.acc<1) continue;
        item.s.acc-=1;
        spawn(item.t,item.r);
        free--;
        progressed=true;
      }
      rounds++;
    }
    spawnCursor=(start+1)%ready.length;
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


  function drawSingleMutationBorder(m,rect,time,secondary=false){
    if(!m)return;
    const color=MUTATION_COLORS[m]||"#fff";
    const phase=time+(secondary?760:0);
    const pulse=.72+.22*Math.sin(phase*.003+m);
    ctx.save();
    ctx.globalCompositeOperation="lighter";

    if(m===2){
      ctx.restore();drawThunderBorder(rect,phase,color);return;
    }

    roundedRectPath(rect,secondary?6:2,m>=8?15:11);
    if(m===9){
      const grad=ctx.createLinearGradient(rect.left,rect.top,rect.right,rect.bottom);
      grad.addColorStop(0,"#ff68d8");grad.addColorStop(.22,"#9c7cff");grad.addColorStop(.44,"#67eaff");
      grad.addColorStop(.66,"#82ffae");grad.addColorStop(.84,"#ffe46b");grad.addColorStop(1,"#ff68d8");
      ctx.strokeStyle=grad;
    }else if(m===10){
      const grad=ctx.createLinearGradient(rect.left,rect.top,rect.right,rect.bottom);
      grad.addColorStop(0,"#fff3a4");grad.addColorStop(.42,"#ffffff");grad.addColorStop(.68,"#70f5ff");grad.addColorStop(1,"#b080ff");
      ctx.strokeStyle=grad;
    }else if(m===11){
      const grad=ctx.createLinearGradient(rect.left,rect.bottom,rect.right,rect.top);
      grad.addColorStop(0,"#6a174e");grad.addColorStop(.34,"#ff5fb7");grad.addColorStop(.68,"#ffc0e3");grad.addColorStop(1,"#8a2cff");
      ctx.strokeStyle=grad;
    }else if(m===12){
      const grad=ctx.createLinearGradient(rect.left,rect.top,rect.right,rect.bottom);
      grad.addColorStop(0,"#77fff1");grad.addColorStop(.36,"#ffffff");grad.addColorStop(.62,"#ffd56f");grad.addColorStop(1,"#7ea2ff");
      ctx.strokeStyle=grad;
    }else{
      ctx.strokeStyle=color;
    }

    ctx.lineWidth=(m>=11?3.5:m===10?3.2:m>=8?2.7:2.1)*(secondary?.8:1);
    ctx.globalAlpha=(m===1?.65:m===8?.60:.74)*pulse*(secondary?.78:1);
    ctx.shadowBlur=m>=11?22:m===10?18:m>=8?14:10;
    ctx.shadowColor=color;

    if(m===4){
      ctx.setLineDash([18,10]);ctx.lineDashOffset=-phase*.04;
    }else if(m===7){
      ctx.setLineDash([7,9]);ctx.lineDashOffset=phase*.018;
    }else if(m===11){
      ctx.setLineDash([4,6,14,6]);ctx.lineDashOffset=-phase*.025;
    }else if(m===12){
      ctx.setLineDash([22,6]);ctx.lineDashOffset=phase*.035;
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
    }else if(m===11){
      roundedRectPath(rect,8,17);ctx.strokeStyle="#ffb7dc";ctx.lineWidth=1.2;ctx.globalAlpha=.68*pulse;ctx.stroke();
    }else if(m===12){
      roundedRectPath(rect,9,18);ctx.strokeStyle="#ffffff";ctx.lineWidth=1.25;ctx.globalAlpha=.82*pulse;ctx.stroke();
    }
    ctx.restore();
  }

  function awakeningColor(stars){
    const s=Math.max(1,Math.floor(Number(stars)||1));
    const fixed=[
      "#72eaff", // ★1 cyan
      "#a77bff", // ★2 violet
      "#ff4968", // ★3 crimson
      "#ffd45c", // ★4 gold
      "#67f5ad", // ★5 emerald
      "#ff70d7", // ★6 magenta
      "#ff914d", // ★7 orange
      "#699cff", // ★8 royal blue
      "#f4feff"  // ★9 white
    ];
    if(s<=fixed.length)return fixed[s-1];
    const hue=(210+(s-9)*47)%360;
    return "hsl("+hue+" 94% 68%)";
  }

  function drawAwakeningShardCrown(target,rect,time){
    const stars=Math.max(0,Math.floor(Number(target.awakening)||0));
    if(!stars)return;

    const color=awakeningColor(stars);
    const count=Math.min(5,3+Math.floor((stars-1)/3));
    const centerX=rect.left+rect.width*.5;
    const crownY=rect.top+Math.max(15,rect.height*.105);
    const spread=Math.min(rect.width*.30,58);
    const motion=reducedMotion?0:1;
    const phase=time*.0012;

    ctx.save();
    roundedRectPath(rect,-3,14);
    ctx.clip();

    for(let i=0;i<count;i++){
      const mid=(count-1)/2;
      const rel=i-mid;
      const norm=mid?rel/mid:0;
      const centerBoost=1-Math.min(1,Math.abs(norm));
      const shardH=(12+centerBoost*8)*(rect.height/260);
      const shardW=(5.2+centerBoost*1.7)*(rect.width/190);
      const x=centerX+(mid?rel*(spread/(count-1))*2:0);
      const y=crownY-Math.abs(norm)*5+
        Math.sin(phase*1.9+i*.92)*1.7*motion;
      const rot=norm*.34+Math.sin(phase*.8+i*.7)*.035*motion;
      const pulse=.78+.18*Math.sin(phase*2.15+i*.8);

      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(rot);

      // Soft colored edge, but no full-card aura.
      ctx.globalCompositeOperation="source-over";
      ctx.globalAlpha=.86*pulse*quality;
      ctx.shadowBlur=7;
      ctx.shadowColor=color;

      const grad=ctx.createLinearGradient(0,-shardH,0,shardH*.25);
      grad.addColorStop(0,"rgba(255,255,255,.95)");
      grad.addColorStop(.18,color);
      grad.addColorStop(.72,color);
      grad.addColorStop(1,"rgba(4,7,12,.96)");
      ctx.fillStyle=grad;

      ctx.beginPath();
      ctx.moveTo(0,-shardH);
      ctx.lineTo(shardW,0);
      ctx.lineTo(0,shardH*.34);
      ctx.lineTo(-shardW,0);
      ctx.closePath();
      ctx.fill();

      // Dark inner facet gives a premium crystal/shard look.
      ctx.globalAlpha=.78*pulse*quality;
      ctx.shadowBlur=0;
      ctx.fillStyle="rgba(3,6,12,.78)";
      ctx.beginPath();
      ctx.moveTo(0,-shardH*.68);
      ctx.lineTo(shardW*.42,0);
      ctx.lineTo(0,shardH*.16);
      ctx.lineTo(-shardW*.22,0);
      ctx.closePath();
      ctx.fill();

      // Thin highlight.
      ctx.globalCompositeOperation="lighter";
      ctx.globalAlpha=.62*pulse*quality;
      ctx.strokeStyle="#ffffff";
      ctx.lineWidth=.65;
      ctx.beginPath();
      ctx.moveTo(0,-shardH*.82);
      ctx.lineTo(-shardW*.18,-shardH*.12);
      ctx.stroke();

      ctx.restore();
    }

    // Small central crown gem pulse; still contained and cheap.
    const gemPulse=.62+.28*Math.sin(phase*2.4);
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=gemPulse*quality;
    ctx.fillStyle=color;
    ctx.shadowBlur=8;
    ctx.shadowColor=color;
    ctx.beginPath();
    ctx.arc(centerX,crownY+7,1.7+(stars>=4?.5:0),0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawMutationBorder(target,rect,time){
    const m1=target.mutation||0,m2=target.mutation2||0;
    if(m1)drawSingleMutationBorder(m1,rect,time,false);
    if(m2)drawSingleMutationBorder(m2,rect,time,true);
    if(m1&&m2){
      const c1=MUTATION_COLORS[m1]||"#fff",c2=MUTATION_COLORS[m2]||"#fff";
      const grad=ctx.createLinearGradient(rect.left,rect.top,rect.right,rect.bottom);
      grad.addColorStop(0,c1);grad.addColorStop(.5,"#ffffff");grad.addColorStop(1,c2);
      ctx.save();ctx.globalCompositeOperation="lighter";
      roundedRectPath(rect,11,19);
      ctx.strokeStyle=grad;ctx.lineWidth=1.4;
      ctx.globalAlpha=(.48+.18*Math.sin(time*.004))*quality;
      ctx.shadowBlur=18;ctx.shadowColor=c2;ctx.stroke();ctx.restore();
    }
  }

  function drawHalo(target,rect,time){
    // Keep the original unlock conditions. Higher tiers use a different
    // hologram language instead of just brightening the same ring.
    if(target.grade===11 && target.tier<8) return;
    if(target.tier<8 && target.grade<9) return;

    const visitorBoost=target.visitor?1.12:1;

    // Base holo / Tier 8: original soft ring, intentionally faint.
    if(target.tier<9){
      const img=images.halo;
      if(!img || !img.complete) return;
      const pad=Math.min(40,Math.max(17,rect.width*.12));
      const pulse=.24+.035*Math.sin(time*.0015);
      ctx.save();
      ctx.globalCompositeOperation="lighter";
      ctx.globalAlpha=pulse*quality*visitorBoost;
      ctx.translate(rect.left+rect.width/2,rect.top+rect.height/2);
      ctx.rotate(-time*.000045);
      ctx.drawImage(img,-rect.width/2-pad,-rect.height/2-pad,rect.width+pad*2,rect.height+pad*2);
      ctx.restore();
      return;
    }

    // Tier 9: Cross Sweep — always-on crossed foil lines plus moving sweeps.
    if(target.tier===9){
      const cycle=5200;
      const p=(time%cycle)/cycle;
      const span=Math.hypot(rect.width,rect.height)*.86;
      const centerX=rect.left+rect.width*.5;
      const centerY=rect.top+rect.height*.5;

      ctx.save();
      roundedRectPath(rect,-2,14);
      ctx.clip();
      ctx.globalCompositeOperation="lighter";
      ctx.lineCap="round";

      const drawLine=(cx,cy,angle,alpha,width,blur)=>{
        const dx=Math.cos(angle)*span;
        const dy=Math.sin(angle)*span;
        ctx.beginPath();
        ctx.moveTo(cx-dx,cy-dy);
        ctx.lineTo(cx+dx,cy+dy);
        ctx.strokeStyle="rgba(214,249,255,.98)";
        ctx.lineWidth=width;
        ctx.globalAlpha=alpha*quality*visitorBoost;
        ctx.shadowBlur=blur;
        ctx.shadowColor="rgba(118,225,255,.66)";
        ctx.stroke();
      };

      // Permanent crossed reflection: this keeps the hologram continuous.
      drawLine(centerX,centerY,-.66,.19,1.15,4);
      drawLine(centerX,centerY,.68,.135,.85,3);

      // Two staggered moving sweeps: one is always near/on the card.
      const sweepPos=q=>rect.left+rect.width*(-.18+q*1.36);
      const p2=(p+.5)%1;
      drawLine(sweepPos(p),centerY,-.66,.25,1.35,5);
      drawLine(sweepPos(p2),centerY,.68,.19,1.05,4);

      // A very faint center glint adds presence without turning into an aura.
      const glint=.07+.025*Math.sin(time*.0024);
      ctx.fillStyle="rgba(174,239,255,.9)";
      ctx.globalAlpha=glint*quality*visitorBoost;
      ctx.fillRect(rect.left,rect.top+rect.height*.49,rect.width,1);
      ctx.restore();
      return;
    }

    // Tier 10: Prism Facets — broader translucent foil geometry, no ring.
    const phase=time*.00046;
    const shards=[
      {x:.16,y:.22,w:.20,h:.29,r:-.36,c:"rgba(118,232,255,.78)"},
      {x:.50,y:.18,w:.17,h:.24,r:.08,c:"rgba(157,194,255,.70)"},
      {x:.80,y:.29,w:.22,h:.26,r:.30,c:"rgba(202,132,255,.72)"},
      {x:.24,y:.69,w:.21,h:.24,r:.24,c:"rgba(255,155,227,.66)"},
      {x:.53,y:.62,w:.18,h:.28,r:-.08,c:"rgba(255,221,142,.60)"},
      {x:.78,y:.74,w:.19,h:.28,r:-.28,c:"rgba(126,255,209,.66)"}
    ];

    ctx.save();
    roundedRectPath(rect,-2,14);
    ctx.clip();
    ctx.globalCompositeOperation="lighter";

    for(let i=0;i<shards.length;i++){
      const s=shards[i];
      const drift=Math.sin(phase*2.3+i*1.21)*2.5;
      const x=rect.left+rect.width*s.x;
      const y=rect.top+rect.height*s.y+drift;
      const w=rect.width*s.w;
      const h=rect.height*s.h;

      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(s.r+Math.sin(phase+i*.9)*.03);
      ctx.globalAlpha=(.13+.026*Math.sin(phase*3+i))*quality*visitorBoost;
      ctx.fillStyle=s.c;
      ctx.beginPath();
      ctx.moveTo(0,-h*.56);
      ctx.lineTo(w*.60,-h*.10);
      ctx.lineTo(w*.20,h*.54);
      ctx.lineTo(-w*.56,h*.12);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha=.17*quality*visitorBoost;
      ctx.strokeStyle="rgba(244,253,255,.82)";
      ctx.lineWidth=.72;
      ctx.stroke();

      // Inner facet catches light so the shape reads even on bright artwork.
      ctx.globalAlpha=.075*quality*visitorBoost;
      ctx.fillStyle="rgba(255,255,255,.92)";
      ctx.beginPath();
      ctx.moveTo(0,-h*.47);
      ctx.lineTo(w*.20,-h*.07);
      ctx.lineTo(-w*.06,h*.20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Slow prism sheen through the center, kept subtle.
    const sheenX=rect.left+rect.width*((time%7600)/7600);
    const sheen=ctx.createLinearGradient(sheenX-22,0,sheenX+22,0);
    sheen.addColorStop(0,"rgba(255,255,255,0)");
    sheen.addColorStop(.5,"rgba(220,248,255,.26)");
    sheen.addColorStop(1,"rgba(255,255,255,0)");
    ctx.globalAlpha=.18*quality*visitorBoost;
    ctx.fillStyle=sheen;
    ctx.fillRect(rect.left,rect.top,rect.width,rect.height);

    ctx.restore();
  }

  function drawSpecialParticle(p,size,time,color){
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(1,size*.08);
    const phase=time*.006+p.pulse;
    if(p.kind==="glitch"){
      const w=size*(.42+.22*Math.sin(phase*1.7));
      ctx.fillRect(-w*.5,-size*.16,w,size*.32);
      ctx.globalAlpha*=.58;ctx.fillRect(-w*.8,size*.23,w*.9,size*.12);
    }else if(p.kind==="helix"){
      const a=Math.sin(phase)*size*.28;
      ctx.beginPath();ctx.arc(a,-size*.22,size*.10,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(-a,size*.22,size*.10,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(a,-size*.22);ctx.lineTo(-a,size*.22);ctx.stroke();
    }else if(p.kind==="shard"){
      ctx.beginPath();ctx.moveTo(0,-size*.55);ctx.lineTo(size*.34,size*.35);ctx.lineTo(-size*.42,size*.18);ctx.closePath();ctx.stroke();
    }else if(p.kind==="inverse"){
      ctx.beginPath();ctx.moveTo(0,size*.48);ctx.lineTo(0,-size*.48);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-size*.18,-size*.25);ctx.lineTo(0,-size*.5);ctx.lineTo(size*.18,-size*.25);ctx.stroke();
    }else if(p.kind==="scan"){
      ctx.beginPath();ctx.arc(0,0,size*(.20+.30*((Math.sin(phase)+1)/2)),0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-size*.5,0);ctx.lineTo(size*.5,0);ctx.stroke();
    }else if(p.kind==="echo"){
      ctx.strokeRect(-size*.38,-size*.48,size*.76,size*.96);
      ctx.globalAlpha*=.42;ctx.strokeRect(-size*.52,-size*.38,size*.76,size*.96);
    }else if(p.kind==="gravity"){
      ctx.beginPath();ctx.arc(0,0,size*.17,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha*=.62;ctx.beginPath();ctx.arc(0,0,size*.48,phase,phase+Math.PI*1.35);ctx.stroke();
    }else if(p.kind==="rune"){
      ctx.font=Math.max(9,size*.78)+"px serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(["⌬","ᚱ","✣","⟡"][Math.abs(Math.floor(p.pulse*10))%4],0,1);
    }else if(p.kind==="amaterasu"){
      const img=images.amaterasu;
      if(img&&img.complete){
        ctx.save();
        ctx.globalCompositeOperation="source-over";
        ctx.globalAlpha*=.88;
        ctx.shadowBlur=Math.max(8,size*.72);
        ctx.shadowColor="#ff2635";
        ctx.drawImage(img,-size*.55,-size*.55,size*1.1,size*1.1);
        ctx.restore();
      }
    }else if(p.kind==="chrono"){
      ctx.beginPath();ctx.arc(0,0,size*.38,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(phase)*size*.30,Math.sin(phase)*size*.30);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(-phase*.55)*size*.22,Math.sin(-phase*.55)*size*.22);ctx.stroke();
    }else if(p.kind==="gradePrism"){
      const h=size*.54,w=size*.34;
      const grad=ctx.createLinearGradient(-w,-h,w,h);
      grad.addColorStop(0,"#d798ff");
      grad.addColorStop(.48,"#ffffff");
      grad.addColorStop(1,"#7ee8ff");
      ctx.strokeStyle=grad;
      ctx.lineWidth=Math.max(1.1,size*.075);
      ctx.beginPath();
      ctx.moveTo(0,-h);ctx.lineTo(w,0);ctx.lineTo(0,h);ctx.lineTo(-w,0);ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha*=.62;
      ctx.beginPath();ctx.moveTo(-w*.78,0);ctx.lineTo(w*.78,0);ctx.moveTo(0,-h*.78);ctx.lineTo(0,h*.78);ctx.stroke();
    }
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
      const x=r.left+r.width*p.nx+p.dx;
      const y=r.top+r.height*p.ny+p.dy;
      const pulse=.9+.16*Math.sin(time*.006+p.pulse);
      const size=p.size*pulse*(p.key==="flare"?1.65:p.key==="halo"?2:1);

      ctx.save();
      ctx.globalCompositeOperation="lighter";
      ctx.globalAlpha=p.alpha*fade*quality;
      ctx.translate(x,y);
      ctx.rotate(p.rot);

      if(p.kind){
        drawSpecialParticle(p,size,time,p.kind==="gradePrism"?"#d798ff":(MUTATION_COLORS[p.mutation]||"#fff"));
      }else{
        const img=images[p.key];
        if(img&&img.complete)ctx.drawImage(img,-size/2,-size/2,size,size);
      }
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
      drawAwakeningShardCrown(t,r,time);
    }

    if(particleEnabled){
      updateSpawns(dt);
      updateAndDrawParticles(dt,time);
    }else if(particles.length || mobileParticleCount){
      clearParticleLayer();
    }
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

  window.addEventListener("cardbase:particles",event=>{
    particleEnabled=event?.detail?.enabled!==false;
    if(!particleEnabled)clearParticleLayer();
    else scanTargets(true);
  });
  window.addEventListener("resize",resize,{passive:true});
  window.addEventListener("orientationchange",resize,{passive:true});

  loadTextures();
  resize();
  scanTargets(true);
  requestAnimationFrame(frame);
})();