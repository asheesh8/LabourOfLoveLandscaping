/* Hero wind — a displacement field over the botanical plate.
   Stems are anchored at the soil and shear sideways; gusts travel across the
   arrangement so the bend arrives at one side before the other. Ambient only —
   the pointer deliberately does not drive it.
   Falls back to the plain <img> when WebGL is unavailable or motion is reduced. */
(() => {
  const holder = document.querySelector('.hero__sway');
  const img = holder && holder.querySelector('img');
  if (!img) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return;

  const VERT = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  const FRAG = [
    'precision highp float;',
    'uniform sampler2D uTex;',
    'uniform float uTime, uGust;',
    'varying vec2 vUv;',

    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }',
    'float noise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),',
    '             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);',
    '}',
    'float fbm(vec2 p){',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv = vUv;',

    // planted at uv.y = 0, tips at uv.y = 1
    '  float hgt = pow(clamp(uv.y, 0.0, 1.0), 1.6);',

    // a gust crosses the plant: offsetting time by x makes the bend arrive left-first
    '  float travel = uTime * 0.9 - uv.x * 1.9;',
    '  float bend = sin(travel) * 0.55 + sin(travel * 0.53 + 1.3) * 0.45;',
    '  bend += (fbm(vec2(uv.x * 3.0, uv.y * 2.2 - uTime * 0.28)) - 0.5) * 1.6;',

    // quick flutter confined to the leaf tips
    '  float flut = (noise(vec2(uv.x * 22.0, uv.y * 20.0 - uTime * 1.6)) - 0.5)',
    '             * pow(clamp(uv.y, 0.0, 1.0), 3.0);',

    '  float shear = bend * 0.026 * hgt * uGust + flut * 0.010;',

    // a leaning stem also loses a little height
    '  vec2 disp = vec2(shear, -abs(shear) * 0.28);',

    '  vec2 suv = uv + disp;',
    '  suv.y = 1.0 - suv.y;',
    '  if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) discard;',
    '  gl_FragColor = texture2D(uTex, suv);',
    '}'
  ].join('\n');

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uGust = gl.getUniformLocation(prog, 'uGust');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const tex = gl.createTexture();
  const upload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };

  const resize = () => {
    const r = img.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.style.width = Math.round(r.width) + 'px';
    canvas.style.height = Math.round(r.height) + 'px';
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  let running = false, t0 = performance.now(), raf = 0;
  const frame = (now) => {
    if (!running) return;
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform1f(uGust, 1.0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  };
  const play = () => { if (!running && canvas.isConnected) { running = true; t0 = performance.now(); raf = requestAnimationFrame(frame); } };
  const pause = () => { running = false; cancelAnimationFrame(raf); };

  const go = () => {
    holder.appendChild(canvas);
    upload(); resize();
    img.style.opacity = '0';
    canvas.classList.add('is-live');
    play();
  };
  if (img.complete && img.naturalWidth) go();
  else img.addEventListener('load', go, { once: true });

  addEventListener('resize', resize, { passive: true });

  new IntersectionObserver(([e]) => e.isIntersecting ? play() : pause(), { threshold: 0 }).observe(holder);
  addEventListener('visibilitychange', () => document.hidden ? pause() : play());
})();
