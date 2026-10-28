// Hero water ripple: the photo is redrawn in a WebGL canvas, and a few rings spread from its centre,
// refracting the image like a water surface. GSAP drives the time; parameters live in RIPPLE.
// When the last ring has faded the canvas shows exactly the plain photo again, so it is removed and
// the regular <img> (with its parallax) takes over. An agreed exception to the
// "transform and opacity only" rule. Skipped without WebGL; the caller skips it for reduced motion.

import { gsap } from 'gsap'
import { RIPPLE } from './config.js'

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT = `
precision highp float;
#define RINGS __RINGS__
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform float uTime;
uniform float uInterval;
uniform float uLife;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWidth;
uniform float uShading;
varying vec2 vUv;

// object-fit: cover, centred
vec2 coverUv(vec2 uv) {
  float canvasAspect = uResolution.x / uResolution.y;
  float imageAspect = uImageSize.x / uImageSize.y;
  vec2 scale = canvasAspect > imageAspect
    ? vec2(1.0, imageAspect / canvasAspect)
    : vec2(canvasAspect / imageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  float shortSide = min(uResolution.x, uResolution.y);
  // Position from the centre, in units of the shorter side
  vec2 p = (vUv - 0.5) * uResolution / shortSide;
  float dist = length(p);
  vec2 dir = dist > 0.0001 ? p / dist : vec2(0.0);

  float displacement = 0.0;
  float light = 0.0;
  for (int i = 0; i < RINGS; i++) {
    float t = uTime - float(i) * uInterval;
    if (t < 0.0 || t > uLife) continue;
    float life = t / uLife;
    // Ring fades in quickly and dies out towards the end of its life
    float envelope = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.45, 1.0, life));
    // One crest and trough per ring: derivative of a Gaussian bump, peak normalised to 1
    float x = (dist - t * uSpeed) / uWidth;
    float bump = exp(-x * x) * envelope;
    displacement += -2.33 * x * bump;
    light += (1.0 - 2.0 * x * x) * bump;
  }

  vec2 uv = vUv - dir * displacement * uAmplitude * shortSide / uResolution;
  vec4 color = texture2D(uTexture, coverUv(uv));
  color.rgb *= 1.0 + light * uShading * 0.15;
  gl_FragColor = color;
}
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

/**
 * Prepares the ripple and returns a GSAP tween that plays it (paused), or null without WebGL.
 * @param {HTMLCanvasElement} canvas  Covers the photo layer
 * @param {HTMLImageElement} image    Decoded photo (its currentSrc is the texture)
 */
export function createRipple(canvas, image) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false })
  if (!gl || !image?.naturalWidth) return null

  let program
  try {
    program = gl.createProgram()
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT.replace('__RINGS__', String(RIPPLE.rings))))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
  } catch (error) {
    console.warn('Hero ripple disabled:', error)
    return null
  }
  gl.useProgram(program)

  // Full-screen quad
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  // Photo texture (non-power-of-two: clamp, no mipmaps)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const uniform = (name) => gl.getUniformLocation(program, name)
  const uTime = uniform('uTime')
  const uResolution = uniform('uResolution')
  gl.uniform2f(uniform('uImageSize'), image.naturalWidth, image.naturalHeight)
  gl.uniform1f(uniform('uInterval'), RIPPLE.ringInterval)
  gl.uniform1f(uniform('uLife'), RIPPLE.ringLife)
  gl.uniform1f(uniform('uSpeed'), RIPPLE.speed)
  gl.uniform1f(uniform('uAmplitude'), RIPPLE.amplitude)
  gl.uniform1f(uniform('uWidth'), RIPPLE.width)
  gl.uniform1f(uniform('uShading'), RIPPLE.shading)

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, RIPPLE.maxPixelRatio)
    canvas.width = Math.round(canvas.clientWidth * ratio)
    canvas.height = Math.round(canvas.clientHeight * ratio)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uResolution, canvas.width, canvas.height)
  }

  const state = { time: 0 }
  let sized = false
  const draw = () => {
    // Size the canvas on the first frame, whichever callback comes first
    if (!sized) {
      resize()
      sized = true
    }
    gl.uniform1f(uTime, state.time)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const cleanup = () => {
    canvas.remove()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  const total = (RIPPLE.rings - 1) * RIPPLE.ringInterval + RIPPLE.ringLife
  return gsap.to(state, {
    time: total,
    duration: total,
    ease: 'none',
    paused: true,
    onStart: draw,
    onUpdate: draw,
    onComplete: cleanup,
  })
}
