/**
 * A WebGL2 particle field that assembles into text.
 *
 * Every particle knows its target pixel in the text and a random seed. All of
 * the motion (the assembly, the idle drift, the cursor push and the scatter on
 * scroll) is computed on the GPU in the vertex shader, so the CPU only updates
 * a handful of uniforms per frame.
 */

const VERTEX = /* glsl */ `#version 300 es
in vec2 aTarget;
in vec3 aSeed;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntro;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uScatter;
uniform float uDpr;
uniform float uSize;

out float vAlpha;
out float vHue;
out float vHeat;

float expoOut(float t) {
  return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

void main() {
  float delay = aSeed.x * 0.5;
  float t = clamp((uIntro - delay) / 0.5, 0.0, 1.0);
  float e = expoOut(t);

  float angle = aSeed.y * 6.28318;
  float reach = (0.55 + aSeed.z * 0.8) * max(uResolution.x, uResolution.y);
  vec2 origin = uResolution * 0.5 + vec2(cos(angle), sin(angle)) * reach;
  vec2 pos = mix(origin, aTarget, e);

  // Breathing: each particle drifts on its own small loop.
  pos += vec2(
    sin(uTime * 0.7 + aSeed.x * 50.0),
    cos(uTime * 0.6 + aSeed.y * 50.0)
  ) * 1.4 * uDpr;

  // The cursor pushes particles out of the way; they fall back as it leaves.
  vec2 away = pos - uPointer;
  float distance = length(away);
  float radius = 150.0 * uDpr;
  float heat = smoothstep(radius, 0.0, distance) * uPointerStrength;
  pos += normalize(away + 0.0001) * heat * 70.0 * uDpr;

  // Scroll blows the name apart and lifts it away.
  vec2 drift = vec2(cos(angle * 1.7), sin(angle * 1.3) - 0.6);
  pos += drift * uScatter * (180.0 + aSeed.z * 1100.0) * uDpr;

  vec2 clip = (pos / uResolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uSize * uDpr * (0.7 + aSeed.z * 0.6) * (1.0 + heat * 1.2);

  vAlpha = (0.1 + 0.9 * e) * (0.55 + aSeed.x * 0.45) * (1.0 - smoothstep(0.0, 0.85, uScatter));
  vHue = aTarget.x / uResolution.x;
  vHeat = heat;
}
`;

const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in float vAlpha;
in float vHue;
in float vHeat;
out vec4 outColor;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.3, d);

  vec3 bone = vec3(0.93, 0.925, 0.905);
  vec3 rose = vec3(1.0, 0.52, 0.6);
  vec3 ember = vec3(1.0, 0.45, 0.16);
  vec3 mint = vec3(0.24, 0.9, 0.62);
  vec3 spectrum = mix(mix(rose, ember, smoothstep(0.0, 0.55, vHue)), mint, smoothstep(0.45, 1.0, vHue));

  vec3 color = mix(bone, spectrum, clamp(vHeat * 1.6, 0.0, 1.0));
  outColor = vec4(color, soft * vAlpha);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader failed to compile: ${log}`);
  }
  return shader;
}

export interface TextLayout {
  lines: string[];
  fontFamily: string;
  fontWeight: number;
}

/**
 * Draws the text off-screen and returns one target point (in device pixels) per
 * sampled pixel. Sampling happens in CSS pixels, so density is the same on every screen.
 */
function sampleText(layout: TextLayout, width: number, height: number, dpr: number): Float32Array {
  const scale = 1 / dpr;
  const w = Math.max(1, Math.floor(width * scale));
  const h = Math.max(1, Math.floor(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array();

  const mobile = width / dpr < 700;
  const padX = w * (mobile ? 0.045 : 0.045);
  const maxWidth = w - padX * 2;

  // Tight tracking, like the display type elsewhere on the site.
  const track = (fontSize: number) => {
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${-0.035 * fontSize}px`;
  };

  // Find the font size where the widest line fills the available width.
  let size = 100;
  ctx.font = `${layout.fontWeight} ${size}px ${layout.fontFamily}`;
  track(size);
  const widest = Math.max(...layout.lines.map((line) => ctx.measureText(line).width));
  size = Math.min((size * maxWidth) / widest, h * (mobile ? 0.2 : 0.36));
  ctx.font = `${layout.fontWeight} ${size}px ${layout.fontFamily}`;
  track(size);

  const lineHeight = size * 0.92;
  const blockHeight = lineHeight * layout.lines.length;
  const top = h * (mobile ? 0.34 : 0.47) - blockHeight / 2;

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  layout.lines.forEach((line, index) => {
    ctx.fillText(line, padX, top + index * lineHeight);
  });

  const { data } = ctx.getImageData(0, 0, w, h);
  const gap = mobile ? 2 : 3;
  const points: number[] = [];
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (data[(y * w + x) * 4 + 3] > 140) {
        points.push(x / scale, y / scale);
      }
    }
  }
  return new Float32Array(points);
}

export class ParticleField {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject | null = null;
  private buffers: WebGLBuffer[] = [];
  private count = 0;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};

  intro = 0;
  scatter = 0;
  pointer = { x: -9999, y: -9999 };
  pointerStrength = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program failed to link: ${gl.getProgramInfoLog(program)}`);
    }
    this.program = program;

    for (const name of [
      "uResolution",
      "uTime",
      "uIntro",
      "uPointer",
      "uPointerStrength",
      "uScatter",
      "uDpr",
      "uSize",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
  }

  get particleCount() {
    return this.count;
  }

  /** Rebuilds the particles for the canvas's current size. */
  layout(text: TextLayout, dpr: number) {
    const { gl, canvas } = this;
    const targets = sampleText(text, canvas.width, canvas.height, dpr);
    this.count = targets.length / 2;

    const seeds = new Float32Array(this.count * 3);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();

    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    if (this.vao) gl.deleteVertexArray(this.vao);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.buffers = [
      this.attribute("aTarget", targets, 2),
      this.attribute("aSeed", seeds, 3),
    ];
    gl.bindVertexArray(null);
  }

  private attribute(name: string, data: Float32Array, size: number): WebGLBuffer {
    const { gl } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(this.program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  }

  render(time: number, dpr: number) {
    const { gl, canvas, uniforms: u } = this;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.vao || this.count === 0) return;

    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.uniform2f(u.uResolution, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uIntro, this.intro);
    gl.uniform2f(u.uPointer, this.pointer.x * dpr, this.pointer.y * dpr);
    gl.uniform1f(u.uPointerStrength, this.pointerStrength);
    gl.uniform1f(u.uScatter, this.scatter);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uSize, canvas.width / dpr < 700 ? 1.6 : 2.4);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }

  dispose() {
    const { gl } = this;
    this.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    if (this.vao) gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }
}
