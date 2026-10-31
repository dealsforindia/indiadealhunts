import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/utils/companionScene.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { catchPose, ballPosition, stageBallPosition, holdingBallAnchor, SAD_AFTER, canReact, throwSample, THROW_RELEASE, THROW_TOTAL } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const frames=JSON.parse(readFileSync(new URL('../src/utils/companion-registration.json',import.meta.url),'utf8'));
test('search, reach, catch and hold occur in order; sadness only follows the waiting threshold', () => {
  assert.equal(catchPose(0), 1); assert.equal(catchPose(3), 3);
  assert.equal(catchPose(7.5), 7); assert.equal(catchPose(8), 8);
  assert.equal(catchPose(10), 11); assert.equal(catchPose(SAD_AFTER - .01), 11);
  assert.equal(catchPose(SAD_AFTER), 15);
});

test('holding/catching/throwing cannot swap to a handless hover reaction', () => {
  assert.equal(canReact('complete'),true);
  for(const phase of ['catching','holding','sad','throwing']) assert.equal(canReact(phase),false);
});
test('release follows wind-up; depth grows monotonically and recovery ends idle', () => {
  assert.equal(throwSample(0).pose,12);
  assert.equal(throwSample(THROW_RELEASE-.001).released,false);
  assert.equal(throwSample(THROW_RELEASE).released,true);
  let scale=0;
  for(let t=THROW_RELEASE;t<THROW_TOTAL;t+=.025){const sample=throwSample(t);assert.ok(sample.scale>=scale);assert.ok(sample.opacity>=0&&sample.opacity<=1);scale=sample.scale;}
  assert.equal(throwSample(THROW_TOTAL).pose,0);
  assert.equal(throwSample(THROW_TOTAL).done,true);
});
test('every existing drawing has finite registration to the same body baseline', () => {
  const data=JSON.parse(readFileSync(new URL('../src/utils/companion-registration.json',import.meta.url),'utf8'));
  assert.equal(data.poses.length,16);
  assert.equal(Object.keys(data.reactions).length,6);
  for(const frames of Object.values(data.reactions)) assert.equal(frames.length,15);
  for(const r of [...data.poses,data.holding,...Object.values(data.reactions).flat()]) {
    assert.ok(Number.isFinite(r.scale)&&r.scale>.7&&r.scale<1.4);
    assert.ok(Number.isFinite(r.x)&&Number.isFinite(r.y));
  }
});
test('ball is hidden before arrival, stops flying on catch, and stays held while awaiting tap', () => {
  assert.equal(ballPosition(1).visible, false);
  assert.equal(ballPosition(7.99).flying, true);
  assert.equal(ballPosition(8).flying, false);
  assert.deepEqual(ballPosition(10), ballPosition(18));
});
test('caught ball stays attached to each registered hand pose', () => {
  for (const [time, x, y] of [[8,91,32],[9,40,38],[9.5,44,39],[10,51,47]]) {
    assert.equal(ballPosition(time).x, x);
    assert.equal(ballPosition(time).y, y);
  }
  const before = ballPosition(7.9999), caught = ballPosition(8);
  assert.ok(Math.hypot(before.x-caught.x,before.y-caught.y)<.1);
});

test('approaching ball meets the registered palm without a coordinate-space jump', () => {
  const before=stageBallPosition(7.99999,frames,true), contact=stageBallPosition(8,frames,true);
  assert.ok(Math.hypot(before.x-contact.x,before.y-contact.y)<.01);
  assert.equal(contact.flying,false);
  assert.equal(contact.held,false);
});

test('approved holding artwork and reduced-motion state use the same cupped-hand anchor', () => {
  const anchor=holdingBallAnchor(frames.holding);
  assert.ok(anchor.x>45&&anchor.x<55);
  assert.ok(anchor.y>35&&anchor.y<45);
  for(const time of [10,18,SAD_AFTER,100]) {
    const sample=stageBallPosition(time,frames,true);
    assert.equal(sample.x,anchor.x); assert.equal(sample.y,anchor.y);
    assert.equal(sample.visible,true); assert.equal(sample.flying,false); assert.equal(sample.held,true);
  }
  const fallback=stageBallPosition(10,frames,false);
  assert.equal(fallback.held,false);
  assert.equal(fallback.x,frames.poses[11].x+51*frames.poses[11].scale);
  assert.equal(fallback.y,frames.poses[11].y+47*frames.poses[11].scale);
});
