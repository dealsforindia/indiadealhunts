import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'motion/react';
import { playSuccessChime } from '../utils/audio';
import { stageBallPosition, catchPose, canReact, registerPoint, throwSample, CATCH_DURATION, SAD_AFTER } from '../utils/companionScene';

import registration from '../utils/companion-registration.json';

const EXPRESSIONS = ['wave','surprise','thinking','celebration','looking_down','sunglasses'];
type Phase = 'catching' | 'holding' | 'sad' | 'throwing' | 'complete';
function Wings() {
  return <><svg className="deal-ball-wing left" viewBox="0 0 40 20"><path d="M40 10Q21-2 2 1Q6 14 40 10M38 10 9 3M37 10 12 7" /></svg><svg className="deal-ball-wing right" viewBox="0 0 40 20"><path d="M40 10Q21-2 2 1Q6 14 40 10M38 10 9 3M37 10 12 7" /></svg></>;
}
export function DealOrb({ onReveal, disabled = false }: { onReveal: () => void; disabled?: boolean }) {
  const root = useRef<HTMLButtonElement>(null);
  const actor = useRef<HTMLSpanElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  const ballHost = useRef<HTMLSpanElement>(null);
  const thrownHost = useRef<HTMLSpanElement>(null);
  const thrownRenderer = useRef<{render:(time:number,flying?:boolean)=>void;dispose:()=>void}|null>(null);
  const renderer = useRef<{ render: (time: number, flying?: boolean) => void; dispose: () => void } | null>(null);
  const clock = useRef(0);
  const queued = useRef(false);
  const completed = useRef(false);
  const throwStarted = useRef(0);
  const thrown = useRef<HTMLSpanElement>(null);
  const phaseNow = useRef<Phase>('complete');
  const poseNow = useRef(-1);
  const finished = useRef(false);
  const [holdingReady, setHoldingReady] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  function changePhase(next: Phase) { phaseNow.current = next; setPhase(next); }
  function register(element: HTMLElement | null, entry: {x:number;y:number;scale:number}) {
    if (element) element.style.transform = `translate(${entry.x}%,${entry.y}%) scale(${entry.scale})`;
  }
  function drawPose(pose: number) {
    if (poseNow.current === pose) return;
    poseNow.current = pose;
    if (actor.current) { actor.current.style.backgroundPosition = `${pose/15*100}% 0`; register(actor.current,registration.poses[pose]); }
  }
  function drawBall(time: number) {
    const element = ball.current;
    if (!element) return;
    const position = stageBallPosition(time, registration, holdingReady);
    element.dataset.held = String(position.held);
    element.style.left = `${position.x}%`;
    element.style.top = `${position.y}%`;
    element.style.opacity = position.visible ? '1' : '0';
    element.dataset.flying = String(position.flying);
  }
  const [visible, setVisible] = useState(false);
  const visibleNow = useRef(false);
  visibleNow.current = visible;
  const [loaded, setLoaded] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>('complete');
  const reduced = useReducedMotion();
  const [reaction, setReaction] = useState<number | null>(null);
  const reactionImage = useRef<HTMLImageElement>(null);
  const [reactionReady, setReactionReady] = useState(false);
  const lastReaction = useRef(-1);

  useEffect(() => {
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setSupportsHover(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reaction === null) { setReactionReady(false); return; }
    let live = true, raf = 0;
    const urls = Array.from({length:15}, (_, i) => `/brand/expressions/${EXPRESSIONS[reaction]}/${String(i+1).padStart(2,'0')}.webp`);
    const images = urls.map(url => { const img = new Image(); img.src = url; return img; });
    Promise.all(images.map(img => img.decode())).then(() => {
      if (!live) return;
      const show = (frame:number) => { if (reactionImage.current) { reactionImage.current.src = urls[frame]; register(reactionImage.current, registration.reactions[EXPRESSIONS[reaction] as keyof typeof registration.reactions][frame]); } };
      show(reduced ? 7 : 0);
      setReactionReady(true);
      let last = performance.now(), elapsed = 0, shown = -1;
      const tick = (now: number) => {
        if (!live) return;
        if (visibleNow.current && !document.hidden) elapsed += Math.min(now-last,100);
        last = now;
        const frame = Math.min(14,Math.floor(elapsed/240));
        if (!reduced && frame !== shown && reactionImage.current) { show(frame); shown=frame; }
        if (elapsed >= 3600) { setReaction(null); return; }
        raf=requestAnimationFrame(tick);
      };
      raf=requestAnimationFrame(tick);
    }).catch(() => { if(live) setReaction(null); });
    return () => { live=false; cancelAnimationFrame(raf); };
  }, [reaction, reduced]);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const latest = useRef({ onReveal, disabled });
  latest.current = { onReveal, disabled };

  useEffect(() => {
    let live = true;
    const holdingImage = new Image(); holdingImage.src = '/brand/approved-catcher.webp';
    holdingImage.decode().then(() => { if(live) setHoldingReady(true); }).catch(() => {});
    const image = new Image(); image.src = '/brand/pixel-neel-catch.webp?v=2';
    image.decode().then(() => { if (live) setLoaded(true); }).catch(() => { if (live) setAssetFailed(true); });
    return () => { live = false; };
  }, []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; update(); }, { threshold: .15 });
    observer.observe(element); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    if (!loaded || !visible || reduced || !ballHost.current || phase === 'complete') return;
    let live = true;
    import('./emeraldBallScene').then(({ createEmeraldBall }) => {
      if (!live || !ballHost.current) return;
      try { renderer.current = createEmeraldBall(ballHost.current); } catch { /* The styled sphere remains usable without WebGL. */ }
    }).catch(() => {});
    return () => { live = false; renderer.current?.dispose(); renderer.current = null; };
  }, [loaded, visible, reduced, phase === 'complete']);

  useEffect(() => {
    if(phase!=='throwing'||reduced||!visible)return;
    let live=true;
    import('./emeraldBallScene').then(({createEmeraldBall})=>{
      if(live&&thrownHost.current)try{thrownRenderer.current=createEmeraldBall(thrownHost.current,4);}catch{/* Material fallback stays visible. */}
    }).catch(()=>{});
    return()=>{live=false;thrownRenderer.current?.dispose();thrownRenderer.current=null;};
  },[phase,reduced,visible]);

  function reactToHover() {
    if (!loaded || reaction !== null || !canReact(phaseNow.current)) return;
    setReactionReady(false);
    if (!reduced && lastReaction.current >= 0 && Math.random() < .25) {
      clock.current = 0; completed.current = false; finished.current = false; queued.current = false; changePhase('catching'); return;
    }
    const next = (lastReaction.current + 1 + Math.floor(Math.random()*5)) % 6;
    lastReaction.current = next; setReaction(next);
  }
  function beginThrow() {
    if (latest.current.disabled || completed.current) return;
    setReaction(null);
    completed.current = true;
    finished.current = false;
    const rect = actor.current?.getBoundingClientRect();
    // Contact in the release drawing: palm centre (116,155) on the360×460 atlas cell.
    const anchor = registerPoint({x:116/360*100,y:155/460*100}, registration.poses[13]);
    const stage = root.current?.querySelector('.catch-stage')?.getBoundingClientRect();
    setOrigin({
      x: stage ? stage.left+stage.width*anchor.x/100 : rect?.left ?? innerWidth/2,
      y: stage ? stage.top+stage.height*anchor.y/100 : rect?.top ?? innerHeight/2,
    });
    throwStarted.current = clock.current;
    changePhase('throwing');
  }
  function finishThrow() {
    if (phaseNow.current !== 'throwing' || finished.current) return;
    finished.current = true;
    drawPose(0);
    if (ball.current) ball.current.style.opacity = '0';
    changePhase('complete');
    if (!latest.current.disabled) { playSuccessChime(); latest.current.onReveal(); }
  }
  useLayoutEffect(() => {
    if (phase === 'complete') {
      drawPose(0);
      if (ball.current) ball.current.style.opacity = '0';
    }
  }, [phase, reaction]);
  useEffect(() => {
    if (!visible || !loaded || phase === 'complete' || reaction !== null) return;
    if (reduced) {
      if (phase === 'throwing') { finishThrow(); return; }
      clock.current = CATCH_DURATION;
      drawPose(11);
      drawBall(CATCH_DURATION);
      if (queued.current) { queued.current = false; beginThrow(); }
      else if (phase === 'catching') changePhase('holding');
      return;
    }
    let frame = 0, last = performance.now(), drawn = 0;
    const tick = (now: number) => {
      // A callback scheduled before a click/completion must never write a stale pose.
      if (phaseNow.current !== phase) return;
      const delta = Math.min((now-last)/1000,.1); last=now; clock.current+=delta;
      const t=clock.current;
      if (phase === 'throwing') {
        const sample=throwSample(t-throwStarted.current);
        drawPose(sample.pose);
        if (ball.current) {
          const anchor=registerPoint({x:112/360*100,y:132/460*100},registration.poses[12]);
          ball.current.style.left = `${anchor.x}%`;
          ball.current.style.top = `${anchor.y}%`;
          ball.current.style.opacity = sample.released ? '0' : '1';
          ball.current.dataset.flying='false';
          ball.current.dataset.held='false';
        }
        if (thrown.current) {
          const u=sample.progress;
          // Depth is dominant: a small forward arc, not a trip across the page.
          thrown.current.style.transform=`translate3d(${-18*u}px,${-26*Math.sin(u*Math.PI)}px,0) scale(${sample.scale})`;
          thrown.current.style.opacity=sample.released ? String(sample.opacity) : '0';
        }
        if (sample.done) { finishThrow(); return; }
      } else {
        const pose=catchPose(t); drawPose(pose===15 ? 11 : pose);
        drawBall(t);
        if (t>=CATCH_DURATION && queued.current) { queued.current=false; beginThrow(); return; }
        const next:Phase=t>=SAD_AFTER ? 'sad' : t>=CATCH_DURATION ? 'holding' : 'catching';
        if(next!==phase) { changePhase(next); return; }
      }
      if(now-drawn>1000/30) { renderer.current?.render(t,ball.current?.dataset.flying==='true'); thrownRenderer.current?.render(t,false); drawn=now; }
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible,loaded,reduced,phase,reaction,holdingReady]);

  function tap() {
    if (assetFailed) { if (!latest.current.disabled) latest.current.onReveal(); return; }
    if (!loaded || phaseNow.current === 'throwing' || latest.current.disabled) return;
    setReaction(null);

    if (phaseNow.current === 'complete') {
      clock.current = 0; completed.current = false; finished.current = false; queued.current = true;
      changePhase('catching'); return;
    }
    if (phaseNow.current === 'holding' || phaseNow.current === 'sad' || reduced) beginThrow();
    else queued.current = true;
  }
  const hint = assetFailed ? 'Explore a surprise deal' : !loaded ? 'Getting ready…' : phase === 'catching' ? 'Watch me catch a find…' : phase === 'sad' ? 'Your find is ready. Tap me?' : phase === 'complete' ? supportsHover ? 'Hover to say hello · tap for a find' : 'Tap for a surprise find' : phase === 'throwing' ? 'Coming your way!' : 'Caught one. Tap to throw!';
  return <>
    <button ref={root} type="button" className={'deal-orb catch-companion' + (visible ? ' is-visible' : '')} data-phase={phase} onClick={tap} onPointerEnter={reactToHover} onFocus={reactToHover} data-reacting={reactionReady}
      aria-label={hint} aria-busy={!loaded && !assetFailed} disabled={!loaded && !assetFailed}>
      <span className="catch-stage" aria-hidden="true">
        {assetFailed && <span className="companion-fallback">✦</span>}
        <span ref={actor} className="catch-actor" style={{ opacity: reactionReady || (holdingReady && (phase === 'holding' || phase === 'sad')) ? 0 : 1, backgroundImage: loaded ? "url('/brand/pixel-neel-catch.webp?v=2')" : undefined }} />
        {holdingReady && (phase === 'holding' || phase === 'sad') && <img className="catch-holding" src="/brand/approved-catcher.webp" alt="" style={{transform:`translate(${registration.holding.x}%,${registration.holding.y}%) scale(${registration.holding.scale})`}} />}
        {reaction !== null && <img ref={reactionImage} src={`/brand/expressions/${EXPRESSIONS[reaction]}/01.webp`} className="catch-individual-reaction" style={{opacity:reactionReady ? 1 : 0}} alt="" aria-hidden="true" />}
        <span ref={ball} className="deal-flying-ball" data-flying="true"><Wings /><span className="deal-ball-core" /><span ref={ballHost} className="deal-ball-webgl" /></span>
      </span>
      <span className="deal-orb-prompt" aria-live="polite">{hint}</span>
    </button>
    {phase === 'throwing' && !reduced && createPortal(<span ref={thrown} aria-hidden="true" className="deal-ball-thrown" style={{left:origin.x,top:origin.y,opacity:0}}>
      <span className="deal-ball-core" /><span ref={thrownHost} className="deal-ball-webgl" />
    </span>,document.body)}
  </>;
}
