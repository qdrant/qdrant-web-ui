import chroma from 'chroma-js';

// Minimal WebGL2 scatter plot renderer.
//
// Renders points as instanced circular sprites from a single Float32Array of
// positions, so updating an animation frame is one buffer upload. Scales to
// hundreds of thousands of points, which Chart.js (2D canvas) cannot.
//
// Interactions: wheel zoom (cursor-centered), drag pan, exact hover/click
// hit-testing via an offscreen picking framebuffer with color-encoded ids.

const POINT_VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 a_position;
in vec4 a_color;
in float a_visible;
uniform vec2 u_scale;
uniform vec2 u_offset;
uniform float u_pointSize;
out vec4 v_color;
void main() {
  if (a_visible < 0.5) {
    // Clip hidden points away
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    v_color = vec4(0.0);
    return;
  }
  vec2 p = a_position * u_scale + u_offset;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = u_pointSize;
  v_color = a_color;
}`;

const POINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec4 v_color;
uniform float u_ring;      // 0 = filled disc, 1 = ring outline (selected marker)
uniform vec4 u_ringColor;  // ring color, used only when u_ring == 1
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float dist = length(c);
  if (dist > 0.5) discard;
  if (u_ring > 0.5) {
    // Annulus: opaque near the rim, hollow in the middle
    float a = u_ringColor.a * smoothstep(0.30, 0.40, dist) * smoothstep(0.5, 0.44, dist);
    outColor = vec4(u_ringColor.rgb * a, a);
  } else {
    // Soft edge
    float alpha = v_color.a * smoothstep(0.5, 0.42, dist);
    outColor = vec4(v_color.rgb * alpha, alpha);
  }
}`;

const PICKING_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  if (length(c) > 0.5) discard;
  outColor = v_color;
}`;

const CLICK_TOLERANCE_PX = 4;
// Positions arriving from the layout worker are tweened over this duration,
// so the animation reads as continuous motion instead of discrete jumps
const POSITION_TWEEN_MS = 260;

function compileProgram(gl, vertexSource, fragmentSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

export default class ScatterGL {
  constructor(canvas, { onHover = null, onClick = null, onBoxSelect = null, onBoxRect = null, pointSize = 7 } = {}) {
    this.canvas = canvas;
    this.onHover = onHover;
    this.onClick = onClick;
    // Called with an array of selected point indices after a shift+drag
    this.onBoxSelect = onBoxSelect;
    // Called with a pixel-space rect during a shift+drag (null when done),
    // so the host can render a selection rectangle overlay
    this.onBoxRect = onBoxRect;
    this.basePointSize = pointSize;

    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!gl) {
      throw new Error('WebGL2 is not supported by this browser');
    }
    this.gl = gl;

    this.program = compileProgram(gl, POINT_VERTEX_SHADER, POINT_FRAGMENT_SHADER);
    this.pickingProgram = compileProgram(gl, POINT_VERTEX_SHADER, PICKING_FRAGMENT_SHADER);

    this.n = 0;
    this.positions = null;
    this.positionBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();
    this.pickingColorBuffer = gl.createBuffer();
    this.visibilityBuffer = gl.createBuffer();

    // View transform: world -> clip. Updated by fit / pan / zoom.
    this.viewScale = [1, 1];
    this.viewOffset = [0, 0];
    this.userAdjustedView = false;

    this.hoveredIndex = null;
    this.highlightIndex = null;
    // The clicked point, drawn enlarged with a contrasting ring so it stands
    // out from its (also emphasized) nearest neighbors
    this.selectedIndex = null;
    this.selectedRing = [1, 1, 1, 1];
    this.renderScheduled = false;
    this.pickingDirty = true;
    this.destroyed = false;

    this.pickingFramebuffer = gl.createFramebuffer();
    this.pickingTexture = gl.createTexture();
    this.pickingDepth = null;

    this.setupVertexArrays();
    this.attachEvents();
    this.resize();

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.requestRender();
    });
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
  }

  setupVertexArrays() {
    const gl = this.gl;
    const configure = (program, colorBuffer) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const positionLoc = gl.getAttribLocation(program, 'a_position');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const colorLoc = gl.getAttribLocation(program, 'a_color');
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.UNSIGNED_BYTE, true, 0, 0);

      const visibleLoc = gl.getAttribLocation(program, 'a_visible');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.visibilityBuffer);
      gl.enableVertexAttribArray(visibleLoc);
      gl.vertexAttribPointer(visibleLoc, 1, gl.UNSIGNED_BYTE, true, 0, 0);

      gl.bindVertexArray(null);
      return vao;
    };
    this.vao = configure(this.program, this.colorBuffer);
    this.pickingVao = configure(this.pickingProgram, this.pickingColorBuffer);
  }

  // ---- data ----

  setData(n) {
    const gl = this.gl;
    this.n = n;
    this.positions = null;
    this.tween = null;
    this.hoveredIndex = null;
    this.highlightIndex = null;
    this.selectedIndex = null;
    this.userAdjustedView = false;

    // Picking colors encode index + 1 as RGB (0 = background)
    const pickingColors = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) {
      const id = i + 1;
      pickingColors[i * 4] = id & 0xff;
      pickingColors[i * 4 + 1] = (id >> 8) & 0xff;
      pickingColors[i * 4 + 2] = (id >> 16) & 0xff;
      pickingColors[i * 4 + 3] = 255;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pickingColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pickingColors, gl.STATIC_DRAW);

    this.setVisibility(null);
  }

  // `colors` is an array of CSS color strings, one per point
  setColors(colors) {
    const gl = this.gl;
    const rgba = new Uint8Array(colors.length * 4);
    const cache = {};
    for (let i = 0; i < colors.length; i++) {
      let parsed = cache[colors[i]];
      if (!parsed) {
        parsed = chroma(colors[i]).rgba();
        parsed[3] = Math.round(parsed[3] * 255);
        cache[colors[i]] = parsed;
      }
      rgba.set(parsed, i * 4);
    }
    this.pointColors = rgba;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rgba, gl.DYNAMIC_DRAW);
    this.requestRender();
  }

  // `visible` is a Uint8Array of 0/1 per point, or null for all-visible
  setVisibility(visible) {
    const gl = this.gl;
    const data = visible ?? new Uint8Array(this.n).fill(255);
    if (visible) {
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] ? 255 : 0;
      }
    }
    this.visibleMask = visible ? data : null;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.visibilityBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    this.pickingDirty = true;
    this.requestRender();
  }

  // Dim all points except the given indices; null restores full colors
  setFocus(indices) {
    const gl = this.gl;
    if (!this.pointColors) return;
    let data = this.pointColors;
    if (indices !== null) {
      data = new Uint8Array(this.pointColors);
      for (let i = 0; i < this.n; i++) {
        data[i * 4 + 3] = Math.round(data[i * 4 + 3] * 0.15);
      }
      for (const index of indices) {
        data[index * 4 + 3] = this.pointColors[index * 4 + 3];
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    this.requestRender();
  }

  // `positions` is a Float32Array [x0, y0, x1, y1, ...].
  // The first update is applied directly, subsequent ones are tweened.
  updatePositions(positions) {
    if (!this.positions || this.positions.length !== positions.length) {
      this.positions = positions;
      this.tween = null;
      this.uploadPositions();
      return;
    }
    this.tween = {
      from: this.positions.slice(),
      to: positions,
      start: performance.now(),
    };
    this.runTween();
  }

  runTween() {
    if (this.tweenRunning) return;
    this.tweenRunning = true;
    const frame = () => {
      if (this.destroyed || !this.tween) {
        this.tweenRunning = false;
        return;
      }
      const { from, to, start } = this.tween;
      const t = Math.min(1, (performance.now() - start) / POSITION_TWEEN_MS);
      const eased = t * (2 - t); // ease-out
      const positions = this.positions;
      for (let i = 0; i < positions.length; i++) {
        positions[i] = from[i] + (to[i] - from[i]) * eased;
      }
      this.uploadPositions();
      if (t >= 1) {
        this.tween = null;
        this.tweenRunning = false;
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  uploadPositions() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
    if (!this.userAdjustedView) {
      this.fitView();
    }
    this.pickingDirty = true;
    this.requestRender();
  }

  fitView() {
    if (!this.positions || this.n === 0) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < this.n; i++) {
      const x = this.positions[i * 2];
      const y = this.positions[i * 2 + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const padding = 1.1;
    this.viewScale = [2 / (spanX * padding), 2 / (spanY * padding)];
    this.viewOffset = [(-(minX + maxX) / 2 / (spanX * padding)) * 2, (-(minY + maxY) / 2 / (spanY * padding)) * 2];
  }

  // ---- rendering ----

  resize() {
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.resizePickingTarget(width, height);
      this.pickingDirty = true;
    }
  }

  resizePickingTarget(width, height) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.pickingTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickingTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  requestRender() {
    if (this.renderScheduled || this.destroyed) return;
    this.renderScheduled = true;
    requestAnimationFrame(() => {
      this.renderScheduled = false;
      if (!this.destroyed) this.render();
    });
  }

  pointSizePx() {
    return this.basePointSize * (window.devicePixelRatio || 1);
  }

  render() {
    const gl = this.gl;
    if (!this.positions || this.n === 0) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    // Premultiplied alpha
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform2fv(gl.getUniformLocation(this.program, 'u_scale'), this.viewScale);
    gl.uniform2fv(gl.getUniformLocation(this.program, 'u_offset'), this.viewOffset);
    const uPointSize = gl.getUniformLocation(this.program, 'u_pointSize');
    const uRing = gl.getUniformLocation(this.program, 'u_ring');
    gl.uniform1f(uRing, 0);
    gl.uniform1f(uPointSize, this.pointSizePx());
    gl.drawArrays(gl.POINTS, 0, this.n);

    // Emphasize the hovered point by re-drawing it larger
    if (this.highlightIndex !== null && this.highlightIndex < this.n) {
      gl.uniform1f(uPointSize, this.pointSizePx() * 1.8);
      gl.drawArrays(gl.POINTS, this.highlightIndex, 1);
    }

    // Mark the selected point: redraw it larger in its own color, then wrap it
    // in a contrasting ring so it is distinct from the emphasized neighbors
    if (this.selectedIndex !== null && this.selectedIndex < this.n) {
      gl.uniform1f(uPointSize, this.pointSizePx() * 1.5);
      gl.drawArrays(gl.POINTS, this.selectedIndex, 1);
      gl.uniform1f(uRing, 1);
      gl.uniform4fv(gl.getUniformLocation(this.program, 'u_ringColor'), this.selectedRing);
      gl.uniform1f(uPointSize, this.pointSizePx() * 2.6);
      gl.drawArrays(gl.POINTS, this.selectedIndex, 1);
      gl.uniform1f(uRing, 0);
    }
    gl.bindVertexArray(null);
  }

  setHighlight(index) {
    if (index !== this.highlightIndex) {
      this.highlightIndex = index;
      this.requestRender();
    }
  }

  // Mark a single point as selected (the clicked one). `color` is a CSS color
  // string for the ring; pass null as index to clear the marker.
  setSelected(index, color) {
    if (color) {
      const c = chroma(color).rgba();
      this.selectedRing = [c[0] / 255, c[1] / 255, c[2] / 255, c[3]];
    }
    if (index !== this.selectedIndex || color) {
      this.selectedIndex = index;
      this.requestRender();
    }
  }

  renderPicking() {
    const gl = this.gl;
    if (!this.positions || this.n === 0) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.pickingProgram);
    gl.bindVertexArray(this.pickingVao);
    gl.uniform2fv(gl.getUniformLocation(this.pickingProgram, 'u_scale'), this.viewScale);
    gl.uniform2fv(gl.getUniformLocation(this.pickingProgram, 'u_offset'), this.viewOffset);
    // Slightly larger for forgiving hit-testing
    gl.uniform1f(gl.getUniformLocation(this.pickingProgram, 'u_pointSize'), this.pointSizePx() + 4);
    gl.drawArrays(gl.POINTS, 0, this.n);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.pickingDirty = false;
  }

  pick(clientX, clientY) {
    const gl = this.gl;
    if (!this.positions || this.n === 0) return null;
    if (this.pickingDirty) {
      this.renderPicking();
    }
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = Math.floor((clientX - rect.left) * dpr);
    const y = Math.floor((rect.bottom - clientY) * dpr);
    const pixel = new Uint8Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const id = pixel[0] | (pixel[1] << 8) | (pixel[2] << 16);
    return id === 0 ? null : id - 1;
  }

  // ---- interactions ----

  clientToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const clipX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const clipY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    return [(clipX - this.viewOffset[0]) / this.viewScale[0], (clipY - this.viewOffset[1]) / this.viewScale[1]];
  }

  // Indices of visible points inside a client-space rectangle
  selectInBox({ x0, y0, x1, y1 }) {
    if (!this.positions) return [];
    const [wx0, wy0] = this.clientToWorld(x0, y0);
    const [wx1, wy1] = this.clientToWorld(x1, y1);
    const minX = Math.min(wx0, wx1);
    const maxX = Math.max(wx0, wx1);
    const minY = Math.min(wy0, wy1);
    const maxY = Math.max(wy0, wy1);
    const selected = [];
    for (let i = 0; i < this.n; i++) {
      if (this.visibleMask && !this.visibleMask[i]) continue;
      const x = this.positions[i * 2];
      const y = this.positions[i * 2 + 1];
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        selected.push(i);
      }
    }
    return selected;
  }

  attachEvents() {
    const canvas = this.canvas;
    this.dragState = null;
    this.boxState = null;

    this.handlePointerDown = (e) => {
      if (e.shiftKey && this.onBoxSelect) {
        this.boxState = { x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      this.dragState = { x: e.clientX, y: e.clientY, moved: 0 };
      canvas.setPointerCapture(e.pointerId);
    };

    this.handlePointerMove = (e) => {
      if (this.boxState) {
        this.boxState.x1 = e.clientX;
        this.boxState.y1 = e.clientY;
        if (this.onBoxRect) {
          const rect = canvas.getBoundingClientRect();
          const { x0, y0, x1, y1 } = this.boxState;
          this.onBoxRect({
            left: Math.min(x0, x1) - rect.left,
            top: Math.min(y0, y1) - rect.top,
            width: Math.abs(x1 - x0),
            height: Math.abs(y1 - y0),
          });
        }
        return;
      }
      if (this.dragState) {
        const dx = e.clientX - this.dragState.x;
        const dy = e.clientY - this.dragState.y;
        this.dragState.x = e.clientX;
        this.dragState.y = e.clientY;
        this.dragState.moved += Math.abs(dx) + Math.abs(dy);
        if (this.dragState.moved > CLICK_TOLERANCE_PX) {
          const rect = canvas.getBoundingClientRect();
          this.viewOffset[0] += (dx / rect.width) * 2;
          this.viewOffset[1] -= (dy / rect.height) * 2;
          this.userAdjustedView = true;
          this.pickingDirty = true;
          this.requestRender();
        }
        return;
      }
      const index = this.pick(e.clientX, e.clientY);
      if (index !== this.hoveredIndex) {
        this.hoveredIndex = index;
        if (this.onHover) this.onHover(index, e.clientX, e.clientY);
      } else if (index !== null && this.onHover) {
        // Same point, but let the tooltip follow the cursor
        this.onHover(index, e.clientX, e.clientY);
      }
    };

    this.handlePointerUp = (e) => {
      if (this.boxState) {
        const selected = this.selectInBox(this.boxState);
        this.boxState = null;
        if (this.onBoxRect) this.onBoxRect(null);
        if (this.onBoxSelect) this.onBoxSelect(selected);
        return;
      }
      const wasClick = this.dragState && this.dragState.moved <= CLICK_TOLERANCE_PX;
      this.dragState = null;
      if (wasClick && this.onClick) {
        // null = click on empty space (used to clear selection)
        this.onClick(this.pick(e.clientX, e.clientY));
      }
    };

    this.handlePointerLeave = () => {
      if (this.hoveredIndex !== null) {
        this.hoveredIndex = null;
        if (this.onHover) this.onHover(null, 0, 0);
      }
    };

    this.handleWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      // Cursor position in clip space
      const cx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const cy = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const factor = Math.exp(-e.deltaY * 0.002);
      for (const axis of [0, 1]) {
        const c = axis === 0 ? cx : cy;
        this.viewScale[axis] *= factor;
        this.viewOffset[axis] = c - (c - this.viewOffset[axis]) * factor;
      }
      this.userAdjustedView = true;
      this.pickingDirty = true;
      this.requestRender();
    };

    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointerleave', this.handlePointerLeave);
    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  destroy() {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    const canvas = this.canvas;
    canvas.removeEventListener('pointerdown', this.handlePointerDown);
    canvas.removeEventListener('pointermove', this.handlePointerMove);
    canvas.removeEventListener('pointerup', this.handlePointerUp);
    canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    canvas.removeEventListener('wheel', this.handleWheel);
    const gl = this.gl;
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.colorBuffer);
    gl.deleteBuffer(this.pickingColorBuffer);
    gl.deleteBuffer(this.visibilityBuffer);
    gl.deleteFramebuffer(this.pickingFramebuffer);
    gl.deleteTexture(this.pickingTexture);
    gl.deleteProgram(this.program);
    gl.deleteProgram(this.pickingProgram);
  }
}
