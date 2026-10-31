export const CATCH_DURATION = 10;
export const SAD_AFTER = 22;
export const THROW_DURATION = 1.1;export const THROW_RELEASE = .38;export const THROW_RECOVERY = .24;export const THROW_TOTAL = THROW_RELEASE + THROW_DURATION + THROW_RECOVERY;export function canReact(phase: string) { return phase === 'complete'; }type Point = { x: number; y: number };type Registration = Point & { scale: number };type SceneRegistration = { poses: Registration[]; holding: Registration };export function registerPoint(point: Point, frame: Registration): Point {  return { x: frame.x + point.x * frame.scale, y: frame.y + point.y * frame.scale };}/** The orb centre in the approved 512×768 holding image, after object-fit:contain. */export function holdingBallAnchor(frame: Registration): Point {  const containedWidth = (512 / 768) / (360 / 460);  return registerPoint({    x: ((1 - containedWidth) / 2 + 261 / 512 * containedWidth) * 100,    y: 247.5 / 768 * 100,  }, frame);}/** All flight/contact positions are returned in the same registered stage space. */export function stageBallPosition(time: number, frames: SceneRegistration, approvedHolding: boolean) {  const position = ballPosition(time);  if (time >= CATCH_DURATION && approvedHolding) {    return { ...position, ...holdingBallAnchor(frames.holding), held: true };  }  if (time >= 8) {    const pose = Math.min(catchPose(time), 11);    return { ...position, ...registerPoint(position, frames.poses[pose]), held: false };  }  // Meet the transformed palm, rather than jumping from unregistered flight coordinates.  const contact = registerPoint({ x: 91, y: 32 }, frames.poses[8]);  const approach = Math.max(0, Math.min(1, (time - 6.8) / 1.2));  const blend = approach * approach * (3 - 2 * approach);  return {    ...position,    x: position.x + (contact.x - 91) * blend,    y: position.y + (contact.y - 32) * blend,    held: false,  };}export function throwSample(elapsed: number) {  const progress = Math.max(0, Math.min(1, (elapsed - THROW_RELEASE) / THROW_DURATION));  return {    pose: elapsed < THROW_RELEASE ? 12 : progress < .35 ? 13 : progress < 1 ? 14 : 0,    released: elapsed >= THROW_RELEASE,    progress,    scale: 1 / (1 - .94 * progress * progress),    opacity: progress < .76 ? 1 : Math.max(0, (1-progress)/.24),    done: elapsed >= THROW_TOTAL,  };}
export function catchPose(time: number) {
  if (time < 1) return 1;
  if (time < 2) return 2;
  if (time < 4) return 3;
  if (time < 5) return 4;
  if (time < 6) return 5;
  if (time < 7) return 6;
  if (time < 8) return 7;
  if (time < 9) return 8;
  if (time < 9.5) return 9;
  if (time < 10) return 10;
  return time >= SAD_AFTER ? 15 : 11;
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function ballPosition(time: number) {
  if (time < 2) return { x: 115, y: 16, visible: false, flying: true };
  if (time < 8) {
    const t = (time - 2) / 6;
    // A banking approach, a brief hovering loop, then a committed catch arc.
    const path = [[0,112,8],[.23,74,12],[.46,68,25],[.64,89,16],[.8,101,25],[1,91,32]];
    for (let i=1;i<path.length;i++) {
      if (t <= path[i][0]) {
        const a=path[i-1], b=path[i], u=(t-a[0])/(b[0]-a[0]);
        const ease=u*u*(3-2*u);
        return { x:mix(a[1],b[1],ease), y:mix(a[2],b[2],ease)-Math.sin(u*Math.PI)*3, visible:true, flying:true };
      }
    }
    return {x:91,y:32,visible:true,flying:true};
  }
  // These anchors are measured on the fixed 360 � 460 character canvas.
  // A held prop must change with its hand pose, never slide independently.
  const anchors: Record<number, [number, number]> = {
    8: [91, 32], 9: [40, 38], 10: [44, 39], 11: [51, 47], 15: [51, 47],
  };
  const [x, y] = anchors[catchPose(time)] ?? anchors[11];
  return { x, y, visible: true, flying: false };
}
