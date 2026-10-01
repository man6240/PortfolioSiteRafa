// The hero's 3D stage: a studio display and an iPhone on a stone ledge, lit by one shaft of light
// from above, each screen rotating through the work. Loaded on demand by Hero.jsx (never on the server).
//
// The phone is "iPhone 17 Pro" by Ibrahim.Bhl (CC-BY 4.0), https://sketchfab.com/3d-models/iphone-17-pro-4aeeeb41f9d14f96bb3f2589edc3edac
// compressed for the web into public/hero/iphone-17-pro.glb.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const HOLD = 4.5; // seconds each screen stays up
const FADE = 0.9; // crossfade length

/* ---------- small helpers ---------- */

// Tiling fBm value noise, used for the stone and the caustic light pattern.
function noiseField(n, octaves, seed = 1) {
  const rnd = (x, y, s) => { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); };
  const out = new Float32Array(n * n);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const f = 4 << o, cell = n / f;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const gx = x / cell, gy = y / cell, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = gx - x0, ty = gy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = rnd(x0 % f, y0 % f, seed + o), b = rnd((x0 + 1) % f, y0 % f, seed + o);
      const c = rnd(x0 % f, (y0 + 1) % f, seed + o), d = rnd((x0 + 1) % f, (y0 + 1) % f, seed + o);
      out[y * n + x] += amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
    }
    total += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function pixelTexture(n, fn, srgb) {
  const c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'), im = g.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const [r, gg, b] = fn(i); im.data[i * 4] = r; im.data[i * 4 + 1] = gg; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stoneMaps(n, seed, tint, repeat) {
  const h = noiseField(n, 6, seed), grain = Float32Array.from({ length: n * n }, () => Math.random());
  const H = (x, y) => h[((y + n) % n) * n + ((x + n) % n)];
  const map = pixelTexture(n, (i) => { const k = 0.62 + h[i] * 0.45 + (grain[i] - 0.5) * 0.5; return tint.map((c) => Math.min(255, c * k)); }, true);
  const roughnessMap = pixelTexture(n, (i) => { const v = 150 + h[i] * 90; return [v, v, v]; });
  const normalMap = pixelTexture(n, (i) => {
    const x = i % n, y = (i / n) | 0, s = 3;
    const dx = (H(x + 1, y) - H(x - 1, y)) * s, dy = (H(x, y + 1) - H(x, y - 1)) * s, l = Math.hypot(dx, dy, 1);
    return [(-dx / l * 0.5 + 0.5) * 255, (-dy / l * 0.5 + 0.5) * 255, (1 / l * 0.5 + 0.5) * 255];
  });
  [map, roughnessMap, normalMap].forEach((t) => t.repeat.set(...repeat));
  return { map, roughnessMap, normalMap };
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Flat shape geometry with UVs stretched 0..1 over its bounds.
function fitUV(geo) {
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox, p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - min.x) / (max.x - min.x), (p.getY(i) - min.y) / (max.y - min.y));
  return geo;
}

// A screen that crossfades between two textures, each cover-fitted to the panel.
function screenMaterial(panelAspect) {
  return new THREE.ShaderMaterial({
    uniforms: { a: { value: null }, b: { value: null }, aa: { value: 1 }, ba: { value: 1 }, k: { value: 0 }, pa: { value: panelAspect }, gain: { value: 0.8 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform sampler2D a, b; uniform float aa, ba, k, pa, gain; varying vec2 vUv;
      vec2 cover(vec2 uv, float ta){ vec2 s = ta > pa ? vec2(pa / ta, 1.) : vec2(1., ta / pa); return (uv - .5) * s + .5; }
      void main(){
        vec3 c = mix(texture2D(a, cover(vUv, aa)).rgb, texture2D(b, cover(vUv, ba)).rgb, smoothstep(0., 1., k));
        gl_FragColor = vec4(c * gain, 1.);
        #include <colorspace_fragment>
      }`,
  });
}

// Average colour of an image, used to tint the glow behind the devices.
function averageColor(img) {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 8;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, 8, 8);
    const d = g.getImageData(0, 0, 8, 8).data; let r = 0, gg = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
    const col = new THREE.Color(r / 64 / 255, gg / 64 / 255, b / 64 / 255);
    const hsl = {}; col.getHSL(hsl);
    return col.setHSL(hsl.h, Math.min(1, hsl.s * 1.4 + 0.1), 0.62); // keep the hue, normalise the strength
  } catch { return new THREE.Color(0x9fb7c8); }
}

/* ---------- the stage ---------- */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ monitor: {src: string}[], phone: {src: string, video?: boolean}[], reduced: boolean,
 *           onSlide: (m: number, p: number) => void, anchors: { monitor: HTMLElement, phone: HTMLElement },
 *           onReady: () => void, onProgress: (f: number) => void, box: HTMLElement }} opts
 * box: the element whose content box the devices should line up with (the hero's text column wrapper).
 */
export function mountHero(canvas, { monitor, phone: phoneSlides, reduced, onSlide, anchors, onReady, onProgress, box }) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020203);
  scene.fog = new THREE.FogExp2(0x020203, 0.045);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.2;

  const disposables = [];
  const keep = (x) => { disposables.push(x); return x; };

  /* loading: the phone model and the first slide on each screen gate the reveal; the rest load after */
  const progress = { glb: 0, monitor: 0, phone: 0 };
  const report = () => onProgress?.(progress.glb * 0.7 + progress.monitor * 0.15 + progress.phone * 0.15);

  /* screens' content */
  const loader = new THREE.TextureLoader();
  let video = null;
  const tints = [];
  const later = [];
  const load = (s, i, list) => {
    if (s.video) {
      video = document.createElement('video');
      Object.assign(video, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
      s.src.forEach(([src, type]) => { const so = document.createElement('source'); so.src = src; so.type = type; video.append(so); });
      canvas.parentElement.append(video);
      video.play().catch(() => {});
      video.addEventListener('loadeddata', () => { if (i === 0) { progress[list] = 1; report(); } }, { once: true });
      const t = keep(new THREE.VideoTexture(video)); t.colorSpace = THREE.SRGBColorSpace; t.userData.aspect = 9 / 20;
      return t;
    }
    const t = keep(new THREE.Texture());
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.aspect = list === 'monitor' ? 16 / 9 : 9 / 19.5;
    const fetchIt = () => loader.load(s.src, (tex) => {
      t.image = tex.image; t.needsUpdate = true;
      t.userData.aspect = tex.image.width / tex.image.height;
      if (list === 'monitor') tints[i] = averageColor(tex.image);
      if (i === 0) { progress[list] = 1; report(); }
    });
    if (i === 0) fetchIt(); else later.push(fetchIt);
    return t;
  };
  const monTex = monitor.map((s, i) => load(s, i, 'monitor'));
  const phoneTex = phoneSlides.map((s, i) => load(s, i, 'phone'));

  /* the ledge */
  const PH = 4.0;
  const ledge = new THREE.Mesh(
    keep(new RoundedBoxGeometry(6.4, PH, 2.6, 8, 0.035)),
    keep(new THREE.MeshStandardMaterial({ ...stoneMaps(256, 7, [62, 60, 58], [2.4, 1.5]), roughness: 1, metalness: 0, normalScale: new THREE.Vector2(1.2, 1.2) })),
  );
  ledge.position.set(2.4, -PH / 2, 0.15);
  ledge.castShadow = ledge.receiveShadow = true;
  scene.add(ledge);

  /* the display: silver body, black glass, thin rim */
  const MW = 3.7, MH = MW * 9 / 16, BZ = 0.075, DEPTH = 0.075;
  const alu = keep(new THREE.MeshPhysicalMaterial({ color: 0xc4c7cc, metalness: 1, roughness: 0.34 }));
  const standMat = keep(new THREE.MeshPhysicalMaterial({ color: 0x8a8d93, metalness: 1, roughness: 0.42 }));
  const glassMat = keep(new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 }));
  const mon = new THREE.Group();
  const body = new THREE.Mesh(keep(new RoundedBoxGeometry(MW + BZ * 2, MH + BZ * 2, DEPTH, 10, 0.03)), alu); body.castShadow = true; mon.add(body);
  // the glass sits just inside the rim; any larger and it z-fights with the rounded edge
  const front = new THREE.Mesh(keep(new THREE.ShapeGeometry(roundRect(MW + BZ * 2 - 0.07, MH + BZ * 2 - 0.07, 0.02), 16)), glassMat);
  front.position.z = DEPTH / 2 + 0.006; mon.add(front);
  const monScreen = new THREE.Mesh(keep(new THREE.PlaneGeometry(MW, MH)), keep(screenMaterial(16 / 9)));
  monScreen.position.z = DEPTH / 2 + 0.007; mon.add(monScreen);
  const sheen = new THREE.Mesh(keep(new THREE.PlaneGeometry(MW, MH)), keep(new THREE.MeshBasicMaterial({
    map: keep(canvasTexture(512, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.03)'); gr.addColorStop(0.36, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    })),
    transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
  })));
  sheen.position.z = DEPTH / 2 + 0.009; mon.add(sheen);
  const blade = new THREE.Mesh(keep(new RoundedBoxGeometry(0.62, 1.25, 0.045, 6, 0.02)), standMat);
  blade.position.set(0, -MH / 2 - 0.2, -0.2); blade.rotation.x = -0.18; blade.castShadow = true; mon.add(blade);
  const foot = new THREE.Mesh(keep(new RoundedBoxGeometry(0.66, 0.035, 0.95, 6, 0.016)), standMat);
  foot.position.set(0, -MH / 2 - 0.79, -0.05); foot.castShadow = foot.receiveShadow = true; mon.add(foot);
  // the panel lights what's in front of it in the colour it's showing
  const panelLight = new THREE.RectAreaLight(0xffffff, 4, MW, MH); panelLight.position.z = DEPTH / 2 + 0.05; mon.add(panelLight);
  mon.position.set(2.0, MH / 2 + 0.8, -0.45); mon.rotation.y = -0.55;
  scene.add(mon);

  /* the phone */
  const phone = new THREE.Group();
  const phoneScreenMat = keep(screenMaterial(1.924 / 4.015));
  phone.position.set(3.55, 0.81, 0.95); phone.rotation.set(-0.12, -0.55, 0);
  scene.add(phone);

  let phoneReady = false;
  const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  gltf.load('/hero/iphone-17-pro.glb', (g) => {
    const m = g.scene;
    m.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      const n = o.material.name;
      if (n === 'Screen_BG') o.visible = false; // replaced by our own screen below
      if (n.startsWith('Camera_Pixel') && new THREE.Box3().setFromObject(o).max.z > 0) o.visible = false; // front camera lens
      if (n === 'Material.002' || n === 'Material.004') { // frame and back: silver
        o.material = o.material.clone(); o.material.color.setRGB(0.62, 0.63, 0.66); o.material.metalness = 1; o.material.roughness = 0.28;
      }
    });
    const scr = new THREE.Mesh(fitUV(keep(new THREE.ShapeGeometry(roundRect(1.924, 4.015, 0.24), 24))), phoneScreenMat);
    scr.position.z = 0.126; m.add(scr);
    // a solid black Dynamic Island
    const island = new THREE.Mesh(keep(new THREE.ShapeGeometry(roundRect(0.6, 0.175, 0.0875), 24)), keep(new THREE.MeshBasicMaterial({ color: 0x000000 })));
    island.position.set(0, 1.827, 0.134); m.add(island);
    m.scale.setScalar(0.4);
    phone.add(m);
    progress.glb = 1; report();
    // compile every shader before the first frame, so the reveal doesn't stutter
    const go = () => { phoneReady = true; sync(); };
    (renderer.compileAsync ? renderer.compileAsync(scene, camera) : Promise.resolve()).then(go, go);
  }, (e) => { if (e.total) { progress.glb = e.loaded / e.total; report(); } });

  /* light: one shaft from a square opening above, with a caustic pattern where it lands */
  const gobo = keep((() => {
    const n = 256, f1 = noiseField(n, 5, 21), f2 = noiseField(n, 4, 33);
    return pixelTexture(n, (i) => {
      const x = i % n, y = (i / n) | 0, u = x / n - 0.5, v = y / n - 0.5;
      const edge = Math.max(Math.abs(u), Math.abs(v)), m = 1 - Math.min(1, Math.max(0, (edge - 0.34) / 0.12));
      const ca = Math.pow(1 - Math.abs(f1[i] - f2[i]) * 3.2, 6), val = m * (0.6 + 0.4 * Math.max(0, ca)) * 255;
      return [val * 0.92, val * 0.97, val];
    }, true);
  })());
  gobo.wrapS = gobo.wrapT = THREE.ClampToEdgeWrapping;
  const key = new THREE.SpotLight(0xe9f1ff, 650, 0, 0.27, 0.35, 2);
  key.position.set(2.2, 11, -5.5); key.target.position.set(2.6, 0, 1.25); key.map = gobo;
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0008; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  key.shadow.camera.near = 4; key.shadow.camera.far = 20;
  scene.add(key, key.target);
  // rim lights from behind draw the devices' edges out of the dark
  const rimR = new THREE.SpotLight(0xbfd2ff, 140, 0, 0.35, 0.8, 2); rimR.position.set(6.5, 3.5, -3.5); rimR.target.position.set(3.2, 1.0, 0.6); scene.add(rimR, rimR.target);
  const rimL = new THREE.SpotLight(0xffd9b0, 70, 0, 0.4, 0.8, 2); rimL.position.set(-2.5, 3.2, -3.2); rimL.target.position.set(1.4, 1.6, -0.4); scene.add(rimL, rimL.target);
  scene.add(new THREE.HemisphereLight(0x1a2233, 0x000000, 0.25));
  const glow = new THREE.PointLight(0x9fb7c8, 3, 5, 1.2); glow.position.set(1.6, 1.8, 1.2); scene.add(glow);

  // haze behind the devices, tinted by what's on the monitor
  const haze = new THREE.Mesh(keep(new THREE.PlaneGeometry(20, 11)), keep(new THREE.MeshBasicMaterial({
    transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    map: keep(canvasTexture(512, 280, (g) => {
      const r = g.createRadialGradient(256, 140, 0, 256, 140, 160);
      r.addColorStop(0, 'rgba(255,255,255,.2)'); r.addColorStop(0.5, 'rgba(255,255,255,.05)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 512, 280);
    })),
  })));
  haze.position.set(3.6, 1.8, -7); scene.add(haze);

  // the visible beam: camera-facing slabs with soft edges and drifting streaks, behind the monitor
  const beamMat = keep(new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, op: { value: 0.085 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform float t, op; varying vec2 vUv;
      float h(float x){ return fract(sin(x * 91.7) * 43758.5); }
      float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3. - 2. * f); return mix(h(i), h(i + 1.), f); }
      void main(){
        float x = vUv.x, y = vUv.y;
        float edge = smoothstep(0.0, 0.22, x) * smoothstep(1.0, 0.78, x);
        float streak = 0.55 + 0.45 * n1(x * 38. + t * 0.15) * (0.6 + 0.4 * n1(x * 11. - t * 0.1));
        float vert = smoothstep(0.0, 0.25, y) * mix(0.6, 1.0, y) * smoothstep(1.0, 0.95, y);
        gl_FragColor = vec4(vec3(0.85, 0.92, 1.0) * edge * streak * vert * op, 1.);
      }`,
  }));
  const BEAM_TOP = new THREE.Vector3(3.4, 11, -7.5), BEAM_END = new THREE.Vector3(3.3, -0.5, -1.6);
  const beamDir = new THREE.Vector3().subVectors(BEAM_END, BEAM_TOP), beamLen = beamDir.length();
  const beam = new THREE.Group();
  [[3.0, 0], [2.6, 0.8], [3.3, -0.7]].forEach(([w, r]) => { const p = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, beamLen)), beamMat); p.rotation.y = r; beam.add(p); });
  beam.position.copy(BEAM_TOP).add(BEAM_END).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamDir.clone().negate().normalize());
  scene.add(beam);

  // dust drifting in the light
  const DN = coarse ? 180 : 320, dpos = new Float32Array(DN * 3), dseed = new Float32Array(DN);
  const top = key.position, hit = key.target.position;
  for (let i = 0; i < DN; i++) {
    const r = Math.sqrt(Math.random()) * 0.9, th = Math.random() * 6.28, p = top.clone().lerp(hit, 0.25 + Math.random() * 0.75);
    dpos.set([p.x + Math.cos(th) * r, p.y, p.z + Math.sin(th) * r], i * 3); dseed[i] = Math.random();
  }
  const dustGeo = keep(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dustGeo.setAttribute('seed', new THREE.BufferAttribute(dseed, 1));
  const dust = new THREE.Points(dustGeo, keep(new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, px: { value: dpr } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float seed; uniform float t, px; varying float vA;
      void main(){
        vec3 p = position; p.y += sin(t * 0.2 + seed * 30.) * 0.15; p.x += sin(t * 0.13 + seed * 17.) * 0.12;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + seed * 2.0) * 14. * px / -mv.z;
        vA = 0.25 + 0.75 * abs(sin(t * 0.5 + seed * 40.));
      }`,
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(1.) * smoothstep(.5, .0, d) * vA * 0.35, 1.); }',
  })));
  scene.add(dust);

  /* post: multisampled render (that's the antialiasing), gentle bloom, then grain and vignette */
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.22, 0.6, 0.97));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, t: { value: 0 }, center: { value: new THREE.Vector2(0.62, 0.5) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float t; uniform vec2 center; varying vec2 vUv;
      float r(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + t) * 43758.5453); }
      void main(){
        vec3 c = texture2D(tDiffuse, vUv).rgb; vec2 q = vUv - center;
        c *= mix(.55, 1., smoothstep(1.05, .25, length(q * vec2(1.25, 1.))));
        c += (r(vUv * 1000.) - .5) * 0.03;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  composer.addPass(grade);

  /* framing: the devices sit right of the copy on wide screens, below it on tall ones */
  const GROUP = new THREE.Vector3(2.6, 1.25, 0.2), SPAN = 4.7;
  const VIEW_DIR = new THREE.Vector3(-1.4, 0.55, 8.4).normalize();
  const base = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  let narrow = false;
  function frame(w, h) {
    const aspect = w / h;
    const k = THREE.MathUtils.clamp((aspect - 0.75) / (1.45 - 0.75), 0, 1);
    // on wide screens the devices fill the right part of the text column's box, so text and devices
    // stay one centred composition however wide the window is
    let uw = 0.735, fw = 0.6;
    if (box) {
      const cr = canvas.getBoundingClientRect(), br = box.getBoundingClientRect(), cs = getComputedStyle(box);
      const left = br.left - cr.left + parseFloat(cs.paddingLeft), width = br.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (width > 0) { uw = (left + width * 0.735) / w; fw = Math.min(0.6, (width * 0.62) / w); }
    }
    const u = THREE.MathUtils.lerp(0.54, uw, k), v = 0.5, frac = THREE.MathUtils.lerp(0.74, fw, k);
    camera.aspect = aspect;
    narrow = aspect < 0.8;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = SPAN / (frac * 2 * tan * aspect);
    // aim so the group lands at (u, v) of the frame: shift the look point along the camera's own axes
    const look = GROUP.clone();
    for (let i = 0; i < 3; i++) {
      camera.position.copy(look).addScaledVector(VIEW_DIR, d); camera.lookAt(look); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      const p = GROUP.clone().project(camera);
      const dx = (u * 2 - 1) - p.x, dy = (v * 2 - 1) - p.y;
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      look.addScaledVector(right, -dx * d * tan * aspect).addScaledVector(up, -dy * d * tan);
    }
    base.look.copy(look); base.pos.copy(look).addScaledVector(VIEW_DIR, d);
    camera.position.copy(base.pos); camera.lookAt(base.look);
    scene.fog.density = 0.045 * 8.4 / d;
    grade.uniforms.center.value.set(u - 0.08, 1 - v);
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    frame(w, h);
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  /* rotation state */
  let lastM = -1, lastP = -1;
  const tint = new THREE.Color(0x9fb7c8);
  function setScreen(mat, texs, t, offset) {
    const n = texs.length, p = (t + offset) / HOLD, i = Math.floor(p) % n;
    const k = reduced ? 0 : Math.max(0, ((p % 1) * HOLD - (HOLD - FADE)) / FADE);
    const A = texs[i], B = texs[(i + 1) % n];
    const u = mat.uniforms; u.a.value = A; u.b.value = B; u.aa.value = A.userData.aspect; u.ba.value = B.userData.aspect; u.k.value = k;
    return k > 0.5 ? (i + 1) % n : i;
  }
  const v3 = new THREE.Vector3();
  function place(el, obj, x, y, z, align = -50) {
    if (!el) return;
    v3.set(x, y, z); obj.localToWorld(v3); v3.project(camera);
    el.style.transform = `translate(${((v3.x + 1) / 2 * canvas.clientWidth).toFixed(1)}px, ${((1 - v3.y) / 2 * canvas.clientHeight).toFixed(1)}px) translateX(${align}%)`;
  }

  /* pointer parallax */
  const mouse = { x: 0, y: 0 };
  const onMove = (e) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; };
  if (!reduced && !coarse) window.addEventListener('pointermove', onMove, { passive: true });

  /* loop: only while the hero is on screen and the tab is visible */
  let visible = true, running = false, t = 0, last = performance.now(), firstFrame = true;
  function tick() {
    const now = performance.now(), dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now; t += dt;
    if (!reduced) {
      camera.position.x += (base.pos.x + mouse.x * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (base.pos.y - mouse.y * 0.2 - camera.position.y) * 0.04;
      camera.lookAt(base.look);
    }
    const mi = setScreen(monScreen.material, monTex, t, 0), pi = setScreen(phoneScreenMat, phoneTex, t, HOLD / 2);
    if (mi !== lastM || pi !== lastP) { lastM = mi; lastP = pi; onSlide?.(mi, pi); }
    tint.lerp(tints[mi] || tint, reduced ? 1 : 0.05);
    glow.color.copy(tint); panelLight.color.copy(tint); haze.material.color.copy(tint).multiplyScalar(0.5);
    beamMat.uniforms.t.value = t; dust.material.uniforms.t.value = reduced ? 0 : t; grade.uniforms.t.value = t % 10;
    if (narrow) {
      // tall screens: both labels on one line under the devices, pinned to the left and right edges
      v3.set(0, -0.86, 0.15); phone.localToWorld(v3); v3.project(camera);
      const y = ((1 - v3.y) / 2 * canvas.clientHeight + 12).toFixed(1), edge = 20;
      if (anchors?.monitor) anchors.monitor.style.transform = `translate(${edge}px, ${y}px)`;
      if (anchors?.phone) anchors.phone.style.transform = `translate(${canvas.clientWidth - edge}px, ${y}px) translateX(-100%)`;
    } else {
      place(anchors?.monitor, mon, -0.2, -MH / 2 - 1.02, 0.4);
      place(anchors?.phone, phone, 0, -0.9, 0.25);
    }
    composer.render();
    if (firstFrame) {
      firstFrame = false;
      onReady?.();
      later.forEach((f, i) => setTimeout(f, 200 * i)); // the other slides, one at a time
    }
  }
  function sync() {
    const should = phoneReady && visible && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); renderer.setAnimationLoop(tick); video?.play().catch(() => {}); }
    if (!should && running) { running = false; renderer.setAnimationLoop(null); video?.pause(); }
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
  io.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  sync();

  return () => {
    renderer.setAnimationLoop(null);
    io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('pointermove', onMove);
    video?.pause(); video?.remove();
    disposables.forEach((d) => d.dispose?.());
    phone.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); [].concat(o.material).forEach((m) => m.dispose()); } });
    target.dispose(); composer.dispose?.(); pmrem.dispose(); renderer.dispose();
  };
}
