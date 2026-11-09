'use client';

import { useEffect, useRef, useState } from 'react';
import { VOXEL } from './voxel-data';

/**
 * Ben's photo as a block bust: every 6px cell of the photo is a column of
 * voxels pushed forward by a depth map (scripts/voxel-head/build-head.py).
 *
 * The flat pixel portrait renders first and stays put without WebGL. Once the
 * canvas is ready the columns extrude out of it, and the bust then turns
 * gently and follows the pointer. With reduced motion it extrudes instantly
 * and holds still at a three-quarter angle.
 */

const VERT = `#version 300 es
in vec3 aCorner;
in vec3 aNormal;
in vec4 aCell;   // x, y, depth, delay
in vec3 aColour;
uniform mat4 uMvp;
uniform mat3 uRot;
uniform float uT;
out vec3 vColour;
out vec3 vNormal;
void main() {
  float e = clamp((uT - aCell.w) / 0.7, 0.0, 1.0);
  e = 1.0 - pow(1.0 - e, 3.0);
  float len = max(aCell.z * e, 0.02);
  vec3 p = vec3(aCell.x + aCorner.x, aCell.y + aCorner.y, (aCorner.z + 0.5) * len);
  gl_Position = uMvp * vec4(p, 1.0);
  vColour = aColour;
  vNormal = uRot * aNormal;
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec3 vColour;
in vec3 vNormal;
out vec4 outColour;
void main() {
  vec3 n = normalize(vNormal);
  float key = max(dot(n, normalize(vec3(-0.35, 0.45, 0.82))), 0.0);
  float rim = max(dot(n, normalize(vec3(0.9, -0.1, -0.2))), 0.0);
  vec3 c = vColour * (0.5 + 0.56 * key) + vec3(0.02, 0.05, 0.14) * rim;
  outColour = vec4(c, 1.0);
}`;

// A unit box from -0.5 to 0.5 in x and y, and -0.5 to 0.5 in z (stretched later).
function box() {
  const faces: [number[], number[][]][] = [
    [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]],
    [[0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]],
    [[1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]],
    [[-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]],
    [[0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]],
    [[0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]],
  ];
  const pos: number[] = [];
  const nor: number[] = [];
  for (const [n, q] of faces) {
    for (const i of [0, 1, 2, 0, 2, 3]) {
      pos.push(...q[i].map((v) => v * 0.5));
      nor.push(...n);
    }
  }
  return { pos: new Float32Array(pos), nor: new Float32Array(nor) };
}

function hex(h: string) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function cellsFromData() {
  const { w, h, palette, colour, depth } = VOXEL;
  const pal = palette.map(hex);
  const cell: number[] = [];
  const rgb: number[] = [];
  let maxZ = 0;
  for (let i = 0; i < w * h; i++) {
    const c = parseInt(colour[i], 36);
    if (!c) continue;
    const x = i % w;
    const y = Math.floor(i / w);
    const z = parseInt(depth[i], 36);
    maxZ = Math.max(maxZ, z);
    // Columns rise from the top of the head down, with a little scatter.
    const delay = (y / h) * 0.55 + (((x * 7919 + y * 104729) % 97) / 97) * 0.12;
    cell.push(x - w / 2 + 0.5, h / 2 - y - 0.5, z, delay);
    rgb.push(...pal[c - 1]);
  }
  return { cell: new Float32Array(cell), rgb: new Float32Array(rgb), count: cell.length / 4, maxZ };
}

type M4 = Float32Array;
function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}
function perspective(fovy: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function translate(x: number, y: number, z: number): M4 {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}
function rotY(a: number): M4 {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}
function rotX(a: number): M4 {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

const REST_YAW = -0.32;
const REST_PITCH = 0.06;

export function VoxelHead({ className = '' }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const { pos, nor } = box();
    const { cell, rgb, count, maxZ } = cellsFromData();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const attr = (name: string, data: Float32Array, size: number, divisor: number) => {
      const loc = gl.getAttribLocation(prog, name);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(loc, divisor);
    };
    attr('aCorner', pos, 3, 0);
    attr('aNormal', nor, 3, 0);
    attr('aCell', cell, 4, 1);
    attr('aColour', rgb, 3, 1);
    const uMvp = gl.getUniformLocation(prog, 'uMvp');
    const uRot = gl.getUniformLocation(prog, 'uRot');
    const uT = gl.getUniformLocation(prog, 'uT');

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);

    // The camera sits so the back plane fills the canvas exactly, which keeps
    // the flat start frame lined up with the fallback image underneath.
    const fov = (18 * Math.PI) / 180;
    const pivot = maxZ * 0.45;
    const dist = VOXEL.h / 2 / Math.tan(fov / 2) - pivot;

    let w = 0, h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.round(el.clientWidth * dpr);
      h = Math.round(el.clientHeight * dpr);
      if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
    };

    let yaw = reduce ? REST_YAW : 0;
    let pitch = reduce ? REST_PITCH : 0;
    let target: [number, number] | null = null;
    let pointerAt = 0;
    const start = performance.now();
    let raf = 0;
    let visible = true;

    const draw = (now: number) => {
      resize();
      const t = reduce ? 10 : (now - start) / 1000;
      // Turn from straight-on to the resting angle as the columns come out,
      // then sway, unless the pointer is steering.
      const settle = Math.min(1, Math.max(0, (t - 0.4) / 1.4));
      let ty = REST_YAW * settle + Math.sin(t * 0.55) * 0.12 * settle;
      let tp = REST_PITCH * settle + Math.sin(t * 0.4 + 1) * 0.03 * settle;
      if (target && now - pointerAt < 4000) [ty, tp] = target;
      if (!reduce) {
        yaw += (ty - yaw) * 0.06;
        pitch += (tp - pitch) * 0.06;
      }
      const model = mul(rotX(pitch), mul(rotY(yaw), translate(0, 0, -pivot)));
      // Normals only need the rotation: the model's upper-left 3x3.
      const rot = new Float32Array([0, 1, 2, 4, 5, 6, 8, 9, 10].map((i) => model[i]));
      const mvp = mul(perspective(fov, VOXEL.w / VOXEL.h, 1, dist * 3), mul(translate(0, 0, -dist), model));
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.uniformMatrix3fv(uRot, false, rot);
      gl.uniform1f(uT, t);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, count);
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      target = [nx * 0.55, ny * 0.25];
      pointerAt = performance.now();
    };

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !reduce) raf = requestAnimationFrame(draw);
    });
    io.observe(el);
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });
    const onResize = () => { if (reduce) draw(performance.now()); };
    window.addEventListener('resize', onResize);

    raf = requestAnimationFrame((now) => { draw(now); setLive(true); });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${VOXEL.w} / ${VOXEL.h}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/voxel/ben-flat.png" alt="Ben Stewart as a pixelated block bust, holding a microphone"
        width={VOXEL.w} height={VOXEL.h} className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'pixelated', opacity: live ? 0 : 1, transition: 'opacity 0.2s' }} />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" style={{ opacity: live ? 1 : 0 }} />
    </div>
  );
}
