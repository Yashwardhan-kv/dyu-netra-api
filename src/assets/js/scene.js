/* DYUNETRA — raw WebGL scene (no external libraries) */
(function () {
  'use strict';
  var cv = document.getElementById('gl');
  if (!cv) return;
  var gl = null;
  try {
    gl = cv.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) ||
         cv.getContext('experimental-webgl');
  } catch (e) { gl = null; }
  if (!gl) { document.documentElement.classList.add('no-gl'); return; }

  var scene = document.body.getAttribute('data-scene') || 'page';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = Math.min(window.innerWidth, window.innerHeight) < 700;
  var DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);

  /* ---------- tiny math ---------- */
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      var s = 0;
      for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
    return o;
  }
  function ident() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function persp(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2), o = new Float32Array(16);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    return o;
  }
  function trans(x, y, z) { var m = ident(); m[12] = x; m[13] = y; m[14] = z; return m; }
  function scl(s) { var m = ident(); m[0] = m[5] = m[10] = s; return m; }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a), m = ident(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a), m = ident(); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a), m = ident(); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }

  /* ---------- shaders ---------- */
  function prog(vs, fs) {
    function sh(t, s) {
      var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      return o;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u, pos: gl.getAttribLocation(p, 'a_pos'), aux: gl.getAttribLocation(p, 'a_aux') };
  }

  var P_POINTS = prog(
    'attribute vec3 a_pos;attribute vec2 a_aux;uniform mat4 u_mvp;uniform mat4 u_model;uniform float u_size;uniform float u_facing;varying float v_b;' +
    'void main(){gl_Position=u_mvp*vec4(a_pos,1.);float f=1.;' +
    'if(u_facing>.5){vec3 n=(u_model*vec4(a_pos,0.)).xyz;f=mix(.16,1.,smoothstep(-.35,.55,n.z));}' +
    'v_b=a_aux.x*f;gl_PointSize=max(1.,a_aux.y*u_size/gl_Position.w);}',
    'precision mediump float;uniform vec3 u_color;uniform float u_alpha;varying float v_b;' +
    'void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=1.-d*2.;a=a*a;gl_FragColor=vec4(u_color,a*v_b*u_alpha);}'
  );
  var P_RAIN = prog(
    'attribute vec3 a_pos;attribute vec2 a_aux;uniform mat4 u_mvp;uniform float u_size;uniform float u_time;varying float v_b;' +
    'void main(){vec3 p=a_pos;float h=14.;p.y=mod(p.y-u_time*a_aux.y*.35+h*.5,h)-h*.5;gl_Position=u_mvp*vec4(p,1.);' +
    'v_b=a_aux.x*smoothstep(7.,5.,abs(p.y));gl_PointSize=max(1.,(1.2+a_aux.y)*u_size*.5/gl_Position.w);}',
    'precision mediump float;uniform vec3 u_color;uniform float u_alpha;varying float v_b;' +
    'void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=1.-d*2.;gl_FragColor=vec4(u_color,a*v_b*u_alpha);}'
  );
  var P_LINES = prog(
    'attribute vec3 a_pos;uniform mat4 u_mvp;void main(){gl_Position=u_mvp*vec4(a_pos,1.);}',
    'precision mediump float;uniform vec3 u_color;uniform float u_alpha;void main(){gl_FragColor=vec4(u_color,u_alpha);}'
  );
  var P_SWEEP = prog(
    'attribute vec3 a_pos;uniform mat4 u_mvp;varying vec2 v_uv;void main(){v_uv=a_pos.xz;gl_Position=u_mvp*vec4(a_pos,1.);}',
    'precision mediump float;uniform vec3 u_color;uniform float u_alpha;uniform float u_ang;varying vec2 v_uv;' +
    'void main(){float r=length(v_uv);if(r>1.)discard;float an=atan(v_uv.y,v_uv.x);float d=mod(u_ang-an,6.2831853);' +
    'float sw=exp(-d*2.4)*(1.-r*.35);float ring=0.;ring+=smoothstep(.012,0.,abs(r-.34));ring+=smoothstep(.012,0.,abs(r-.67));ring+=smoothstep(.016,0.,abs(r-.985));' +
    'float cross=smoothstep(.006,0.,abs(v_uv.x))+smoothstep(.006,0.,abs(v_uv.y));' +
    'float a=(sw*.5+ring*.28+cross*.1*(1.-r))*(1.-smoothstep(.9,1.,r)*.0);gl_FragColor=vec4(u_color,a*u_alpha);}'
  );
  if (!P_POINTS || !P_RAIN || !P_LINES || !P_SWEEP) { document.documentElement.classList.add('no-gl'); return; }

  /* ---------- geometry builders ---------- */
  function buf(data, target) {
    var b = gl.createBuffer(); gl.bindBuffer(target || gl.ARRAY_BUFFER, b);
    gl.bufferData(target || gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b;
  }
  function noise3(x, y, z) {
    return Math.sin(x * 2.1 + Math.sin(y * 1.7 + z)) * Math.sin(y * 2.6 + Math.cos(z * 2.2 + x)) +
           Math.sin(z * 3.3 + x * 1.3) * .6 * Math.cos(y * 3.1 - x * 1.9) + Math.sin(x * 5 + y * 4.2 + z * 3.7) * .25;
  }

  // globe dots
  var NG = small ? 3600 : 7600, gd = new Float32Array(NG * 3), ga = new Float32Array(NG * 2), i, k;
  var ga0 = Math.PI * (3 - Math.sqrt(5));
  for (i = 0; i < NG; i++) {
    var y = 1 - (i / (NG - 1)) * 2, rr = Math.sqrt(1 - y * y), th = ga0 * i;
    var x = Math.cos(th) * rr, z = Math.sin(th) * rr;
    gd[i * 3] = x; gd[i * 3 + 1] = y; gd[i * 3 + 2] = z;
    var land = noise3(x * 1.4, y * 1.4, z * 1.4) > .28;
    ga[i * 2] = land ? 1 : .32; ga[i * 2 + 1] = land ? 2.6 : 1.5;
  }
  var B_GLOBE = buf(gd), B_GLOBE_A = buf(ga);

  // wire globe
  var wv = [], seg = 72;
  function pushLine(arr, a, b) { arr.push(a[0], a[1], a[2], b[0], b[1], b[2]); }
  for (k = 0; k < 12; k++) {
    var lon = k / 12 * Math.PI * 2;
    for (i = 0; i < seg; i++) {
      var t0 = i / seg * Math.PI * 2, t1 = (i + 1) / seg * Math.PI * 2;
      pushLine(wv,
        [Math.cos(t0) * Math.cos(lon), Math.sin(t0), Math.cos(t0) * Math.sin(lon)],
        [Math.cos(t1) * Math.cos(lon), Math.sin(t1), Math.cos(t1) * Math.sin(lon)]);
    }
  }
  for (k = -3; k <= 3; k++) {
    var la = k / 4 * (Math.PI / 2) * .96, cy = Math.sin(la), cr = Math.cos(la);
    for (i = 0; i < seg; i++) {
      var s0 = i / seg * Math.PI * 2, s1 = (i + 1) / seg * Math.PI * 2;
      pushLine(wv, [Math.cos(s0) * cr, cy, Math.sin(s0) * cr], [Math.cos(s1) * cr, cy, Math.sin(s1) * cr]);
    }
  }
  var B_WIRE = buf(new Float32Array(wv)), N_WIRE = wv.length / 3;

  // data arcs on globe
  function ll(lat, lon, h) {
    var c = Math.cos(lat);
    return [c * Math.cos(lon) * h, Math.sin(lat) * h, c * Math.sin(lon) * h];
  }
  var arcPairs = [], arcV = [], ARC_SEG = 36, NARC = small ? 6 : 10, seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (k = 0; k < NARC; k++) {
    var A = [(rnd() - .5) * 2.2, rnd() * 6.283], Bp = [(rnd() - .5) * 2.2, rnd() * 6.283];
    var va = ll(A[0], A[1], 1), vb = ll(Bp[0], Bp[1], 1);
    var dot = Math.max(-.99, Math.min(.99, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])), om = Math.acos(dot);
    var pts = [];
    for (i = 0; i <= ARC_SEG; i++) {
      var tt = i / ARC_SEG, s1 = Math.sin((1 - tt) * om) / Math.sin(om), s2 = Math.sin(tt * om) / Math.sin(om);
      var lift = 1 + Math.sin(tt * Math.PI) * (.12 + om * .1);
      pts.push([(va[0] * s1 + vb[0] * s2) * lift, (va[1] * s1 + vb[1] * s2) * lift, (va[2] * s1 + vb[2] * s2) * lift]);
    }
    arcPairs.push({ pts: pts, speed: .12 + rnd() * .16, off: rnd() });
    for (i = 0; i < ARC_SEG; i++) pushLine(arcV, pts[i], pts[i + 1]);
  }
  var B_ARC = buf(new Float32Array(arcV)), N_ARC = arcV.length / 3;
  var pulseData = new Float32Array(NARC * 3), pulseAux = new Float32Array(NARC * 2);
  for (i = 0; i < NARC; i++) { pulseAux[i * 2] = 1; pulseAux[i * 2 + 1] = 7; }
  var B_PULSE = gl.createBuffer(), B_PULSE_A = buf(pulseAux);

  // rings (dashed orbit rings + chain ring + ticks)
  function ringLines(r, n, dash, y) {
    var out = [];
    for (var j = 0; j < n; j++) {
      if (dash && j % dash === dash - 1) continue;
      var a0 = j / n * Math.PI * 2, a1 = (j + 1) / n * Math.PI * 2;
      pushLine(out, [Math.cos(a0) * r, y || 0, Math.sin(a0) * r], [Math.cos(a1) * r, y || 0, Math.sin(a1) * r]);
    }
    return out;
  }
  var B_R1 = buf(new Float32Array(ringLines(1.38, 160, 0))), N_R1 = 160 * 2;
  var rr2 = ringLines(1.78, 120, 4), B_R2 = buf(new Float32Array(rr2)), N_R2 = rr2.length / 3;
  var rr3 = ringLines(2.45, 150, 5), B_R3 = buf(new Float32Array(rr3)), N_R3 = rr3.length / 3;
  var tk = [];
  for (i = 0; i < 120; i++) {
    var ta = i / 120 * Math.PI * 2, l = (i % 5 === 0) ? .12 : .05;
    pushLine(tk, [Math.cos(ta) * 2.62, 0, Math.sin(ta) * 2.62], [Math.cos(ta) * (2.62 + l), 0, Math.sin(ta) * (2.62 + l)]);
  }
  var B_TICK = buf(new Float32Array(tk)), N_TICK = tk.length / 3;

  // cube wireframe
  var cv8 = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  var cvv = []; cv8.forEach(function (v) { cvv.push(v[0], v[1], v[2]); });
  var B_CUBE = buf(new Float32Array(cvv)),
      B_CUBE_I = buf(new Uint16Array([0,1,1,2,2,3,3,0, 4,5,5,6,6,7,7,4, 0,4,1,5,2,6,3,7]), gl.ELEMENT_ARRAY_BUFFER);

  var B_SAT = buf(new Float32Array([0, 0, 0])), B_SAT_A = buf(new Float32Array([1, 11]));

  // radar plane
  var B_QUAD = buf(new Float32Array([-1,0,-1, 1,0,-1, 1,0,1, -1,0,-1, 1,0,1, -1,0,1]));

  // rain / star dust
  var NR = small ? 450 : 1100, rd = new Float32Array(NR * 3), ra = new Float32Array(NR * 2);
  for (i = 0; i < NR; i++) {
    rd[i * 3] = (rnd() - .5) * 16; rd[i * 3 + 1] = (rnd() - .5) * 14; rd[i * 3 + 2] = -rnd() * 14 - 1;
    ra[i * 2] = .25 + rnd() * .75; ra[i * 2 + 1] = .3 + rnd() * 1.8;
  }
  var B_RAIN = buf(rd), B_RAIN_A = buf(ra);

  // floating cubes
  var cubes = [];
  for (i = 0; i < (small ? 5 : 9); i++) {
    cubes.push({
      x: (rnd() - .5) * 9, y: (rnd() - .5) * 5.5, z: -5 - rnd() * 4, s: .07 + rnd() * .13,
      rx: rnd() * 6, ry: rnd() * 6, vx: (rnd() - .5) * .5, vy: (rnd() - .5) * .5, fl: rnd() * 6
    });
  }

  /* ---------- state ---------- */
  var W = 1, H = 1, asp = 1, mx = 0, my = 0, tmx = 0, tmy = 0, spin = 0, ang = 0;
  var cur = { x: 0, y: 0, z: -5.4, rx: .25, bright: 1 };
  var keys = {
    home: [
      { t: 0.00, x: .50, y: 0.00, z: -5.0, rx: .22 },
      { t: 0.22, x: -.52, y: 0.05, z: -5.6, rx: .35 },
      { t: 0.46, x: .52, y: -.05, z: -6.2, rx: .15 },
      { t: 0.72, x: -.45, y: .05, z: -5.4, rx: .40 },
      { t: 1.00, x: 0.00, y: .00, z: -4.0, rx: .25 }
    ],
    page: [
      { t: 0, x: .55, y: .05, z: -6.4, rx: .30 },
      { t: 1, x: .40, y: -.02, z: -5.8, rx: .15 }
    ],
    contact: [
      { t: 0, x: -.55, y: .02, z: -6.0, rx: .28 },
      { t: 1, x: -.35, y: -.03, z: -5.4, rx: .18 }
    ]
  };

  function sample(list, p) {
    var a = list[0], b = list[list.length - 1], j;
    for (j = 0; j < list.length - 1; j++) if (p >= list[j].t && p <= list[j + 1].t) { a = list[j]; b = list[j + 1]; break; }
    var u = b.t === a.t ? 0 : ease((p - a.t) / (b.t - a.t));
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u), rx: lerp(a.rx, b.rx, u) };
  }

  function resize() {
    W = Math.max(1, Math.floor(window.innerWidth * DPR)); H = Math.max(1, Math.floor(window.innerHeight * DPR));
    cv.width = W; cv.height = H; asp = W / H; gl.viewport(0, 0, W, H);
  }
  window.addEventListener('resize', resize, false);
  resize();
  window.addEventListener('pointermove', function (e) {
    tmx = (e.clientX / window.innerWidth - .5) * 2; tmy = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });

  function scrollP() {
    var d = document.documentElement, max = d.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }

  /* ---------- draw helpers ---------- */
  var CY = [.435, .953, 1.0], CY2 = [.15, .81, .9], VIEW = null, PRJ = null;
  function useP(p) { gl.useProgram(p.p); }
  function drawLines(bufr, n, model, col, alpha) {
    useP(P_LINES);
    gl.uniformMatrix4fv(P_LINES.u.u_mvp, false, mul(PRJ, model));
    gl.uniform3fv(P_LINES.u.u_color, col); gl.uniform1f(P_LINES.u.u_alpha, alpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufr);
    gl.enableVertexAttribArray(P_LINES.pos); gl.vertexAttribPointer(P_LINES.pos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, n);
  }
  function drawPoints(bp, ba, n, model, col, alpha, size, facing) {
    useP(P_POINTS);
    gl.uniformMatrix4fv(P_POINTS.u.u_mvp, false, mul(PRJ, model));
    gl.uniformMatrix4fv(P_POINTS.u.u_model, false, model);
    gl.uniform3fv(P_POINTS.u.u_color, col); gl.uniform1f(P_POINTS.u.u_alpha, alpha);
    gl.uniform1f(P_POINTS.u.u_size, size * DPR); gl.uniform1f(P_POINTS.u.u_facing, facing ? 1 : 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bp);
    gl.enableVertexAttribArray(P_POINTS.pos); gl.vertexAttribPointer(P_POINTS.pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, ba);
    gl.enableVertexAttribArray(P_POINTS.aux); gl.vertexAttribPointer(P_POINTS.aux, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, n);
  }

  /* ---------- frame ---------- */
  var last = performance.now(), T = 0;
  function frame(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now; if (reduce) dt = 0; T += dt;
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;

    var kf = keys[scene] || keys.page, tgt = sample(kf, scrollP());
    var k2 = 1 - Math.pow(.0025, dt || .016);
    cur.x += (tgt.x - cur.x) * k2; cur.y += (tgt.y - cur.y) * k2; cur.z += (tgt.z - cur.z) * k2; cur.rx += (tgt.rx - cur.rx) * k2;

    spin += dt * .12 + (reduce ? 0 : 0); ang += dt * 1.1;
    var portrait = asp < 1;
    var fov = portrait ? 1.0 : .82;
    PRJ = persp(fov, asp, .1, 60);
    var halfW = Math.tan(fov / 2) * Math.abs(cur.z) * asp;
    var ox = portrait ? 0 : cur.x * halfW * .62;
    var oy = portrait ? Math.tan(fov / 2) * Math.abs(cur.z) * .18 : cur.y * halfW;
    var gscale = portrait ? .78 : 1;
    var bright = portrait ? .55 : 1;

    gl.clearColor(.008, .02, .035, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.disable(gl.DEPTH_TEST);

    var cam = mul(rotX(my * .08), rotY(mx * .12));
    var world = mul(trans(ox, oy, cur.z), cam);     // globe-space origin
    var modelGlobe = mul(world, mul(rotX(cur.rx), mul(rotY(spin * 3 + mx * .3), scl(gscale))));
    var inclined = mul(world, mul(rotX(cur.rx - .12), scl(gscale)));

    // rain (world space, behind)
    useP(P_RAIN);
    gl.uniformMatrix4fv(P_RAIN.u.u_mvp, false, mul(PRJ, mul(cam, ident())));
    gl.uniform3fv(P_RAIN.u.u_color, CY); gl.uniform1f(P_RAIN.u.u_alpha, .55 * bright);
    gl.uniform1f(P_RAIN.u.u_size, 5 * DPR); gl.uniform1f(P_RAIN.u.u_time, T);
    gl.bindBuffer(gl.ARRAY_BUFFER, B_RAIN);
    gl.enableVertexAttribArray(P_RAIN.pos); gl.vertexAttribPointer(P_RAIN.pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, B_RAIN_A);
    gl.enableVertexAttribArray(P_RAIN.aux); gl.vertexAttribPointer(P_RAIN.aux, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, NR);

    // radar sweep disc (equatorial, wide)
    useP(P_SWEEP);
    var mSweep = mul(inclined, mul(rotY(0), scl(2.2)));
    gl.uniformMatrix4fv(P_SWEEP.u.u_mvp, false, mul(PRJ, mSweep));
    gl.uniform3fv(P_SWEEP.u.u_color, CY); gl.uniform1f(P_SWEEP.u.u_alpha, .75 * bright); gl.uniform1f(P_SWEEP.u.u_ang, ang);
    gl.bindBuffer(gl.ARRAY_BUFFER, B_QUAD);
    gl.enableVertexAttribArray(P_SWEEP.pos); gl.vertexAttribPointer(P_SWEEP.pos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // globe wire + dots + arcs
    drawLines(B_WIRE, N_WIRE, mul(modelGlobe, scl(1.004)), CY2, .16 * bright);
    drawPoints(B_GLOBE, B_GLOBE_A, NG, modelGlobe, CY, .95 * bright, small ? 5.4 : 6.2, true);
    drawLines(B_ARC, N_ARC, modelGlobe, CY, .38 * bright);
    for (i = 0; i < NARC; i++) {
      var ar = arcPairs[i], f = ((T * ar.speed + ar.off) % 1) * ARC_SEG, i0 = Math.floor(f), fr = f - i0;
      var p0 = ar.pts[Math.min(i0, ARC_SEG)], p1 = ar.pts[Math.min(i0 + 1, ARC_SEG)];
      pulseData[i * 3] = lerp(p0[0], p1[0], fr); pulseData[i * 3 + 1] = lerp(p0[1], p1[1], fr); pulseData[i * 3 + 2] = lerp(p0[2], p1[2], fr);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, B_PULSE); gl.bufferData(gl.ARRAY_BUFFER, pulseData, gl.DYNAMIC_DRAW);
    drawPoints(B_PULSE, B_PULSE_A, NARC, modelGlobe, [1, 1, 1], 1, 9, false);

    // orbit rings + satellites
    var o1 = mul(inclined, mul(rotZ(.45), rotY(T * .18)));
    var o2 = mul(inclined, mul(rotZ(-.62), mul(rotX(.3), rotY(-T * .12))));
    var o3 = mul(inclined, rotY(T * .05));
    drawLines(B_R1, N_R1, o1, CY, .55 * bright);
    drawLines(B_R2, N_R2, o2, CY, .5 * bright);
    drawLines(B_R3, N_R3, o3, CY2, .42 * bright);
    drawLines(B_TICK, N_TICK, mul(o3, rotY(-T * .1)), CY, .5 * bright);
    // satellites
    var bs = B_SAT, bsa = B_SAT_A;
    var sA = mul(o1, mul(rotY(0), trans(1.38 * Math.cos(T * .9), 0, 1.38 * Math.sin(T * .9))));
    var sB = mul(o2, trans(1.78 * Math.cos(-T * .55 + 2), 0, 1.78 * Math.sin(-T * .55 + 2)));
    drawPoints(bs, bsa, 1, sA, [1, 1, 1], 1, 1, false);
    drawPoints(bs, bsa, 1, sB, CY, 1, 1, false);

    // two linked hero cubes (logo echo) + drifting cubes
    var hx = ox * 0 , hy = 0;
    var cubeBase = mul(inclined, trans(0, 1.62, 0));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, B_CUBE_I);
    function cube(model, alpha) {
      useP(P_LINES);
      gl.uniformMatrix4fv(P_LINES.u.u_mvp, false, mul(PRJ, model));
      gl.uniform3fv(P_LINES.u.u_color, CY); gl.uniform1f(P_LINES.u.u_alpha, alpha);
      gl.bindBuffer(gl.ARRAY_BUFFER, B_CUBE);
      gl.enableVertexAttribArray(P_LINES.pos); gl.vertexAttribPointer(P_LINES.pos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, B_CUBE_I);
      gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
    }
    cube(mul(cubeBase, mul(rotY(T * .8), mul(rotX(.6), scl(.12)))), .95 * bright);
    cube(mul(cubeBase, mul(trans(0, .3 + Math.sin(T) * .02, 0), mul(rotY(-T * .8), mul(rotX(.6), scl(.1))))), .95 * bright);
    for (i = 0; i < cubes.length; i++) {
      var c = cubes[i];
      var m = mul(cam, mul(trans(c.x + Math.sin(T * .2 + c.fl) * .4, c.y + Math.cos(T * .25 + c.fl) * .3, c.z),
              mul(rotX(c.rx + T * c.vx), mul(rotY(c.ry + T * c.vy), scl(c.s)))));
      cube(m, .24 * bright);
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  // context loss safety
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); document.documentElement.classList.add('no-gl'); }, false);

  requestAnimationFrame(frame);
  if (reduce) { window.addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true }); }
  document.documentElement.classList.add('gl-ok');
})();
