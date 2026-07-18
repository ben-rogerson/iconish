'use client'

import { useEffect, useRef } from 'react'

// 24x24 stroke icon paths (feather-style): star, heart, zap, bell, sun, camera
const ICONS = [
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
]

// The Iconish eye logo (61x40 viewBox) from src/lib/icons.tsx
const LOGO = [
  'M2.298 24.182C17.494 8.736 32.311-.645 58.787 23.06c-8.242 13.064-31.492 25.866-56.489 1.122Z',
  'M2.298 24.154C27 12.5 31.5 12 58.786 23.032',
  'M42.901 17.149a13.7 13.7 0 0 1 1.826 6.578c.15 7.582-5.873 13.85-13.454 14s-13.85-5.873-14-13.454a13.67 13.67 0 0 1 1.89-7.233',
  'M36.354 24a5.354 5.354 0 1 1-10.708 0 5.354 5.354 0 0 1 10.708 0Z',
  'M7.757 18.5 3 15m49 2.5 4.5-4.5M15 13 9 7m16 2-2-8m11 8 1-8m8 11 4-8',
]
const LOGO_W = 61
const LOGO_H = 40

const DWELL_MS = 900
const MOVE_MS = 750
const CYCLE_MS = DWELL_MS + MOVE_MS
const LIGHT_RAMP_MS = 150

// Deterministic pseudo-random so each icon keeps its own "roughness"
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  size: number
}

type Palette = {
  text: string
  muted: string
  border: string
  bg: string
  bgAlt: string
  warn: string
}

const readPalette = (): Palette => {
  const s = getComputedStyle(document.documentElement)
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback
  return {
    text: v('--text-normal', '#ccc'),
    muted: v('--text-muted', '#778'),
    border: v('--page-border', '#445'),
    bg: v('--page-bg', '#111'),
    bgAlt: v('--page-bg-alt', '#0e1015'),
    warn: v('--text-warning', '#fc0'),
  }
}

const drawSparkle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  color: string
) => {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.quadraticCurveTo(x, y, x, y + r)
  ctx.quadraticCurveTo(x, y, x - r, y)
  ctx.quadraticCurveTo(x, y, x, y - r)
  ctx.fill()
  ctx.restore()
}

export function HeroConveyor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const paths = ICONS.map(d => new Path2D(d))
    const logoPaths = LOGO.map(d => new Path2D(d))
    let palette = readPalette()
    let w = 0
    let h = 0
    let raf = 0
    let lastBurst = -1
    const particles: Particle[] = []
    const start = performance.now()
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawIconShadow = (x: number, y: number, r: number, alpha: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1, 0.24)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      g.addColorStop(0, `rgb(0 0 0 / ${alpha})`)
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const drawIcon = (
      x: number,
      y: number,
      size: number,
      id: number,
      rough: boolean,
      t: number,
      angle: number
    ) => {
      const path = paths[((id % paths.length) + paths.length) % paths.length]
      const s = size / 24
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (rough) {
        const r1 = rand(id)
        const r2 = rand(id + 1)
        const r3 = rand(id + 2)
        const r4 = rand(id + 3)
        ctx.rotate((r1 - 0.5) * 0.5)
        ctx.scale(s * (1 + (r2 - 0.5) * 0.24), s * (1 + (r3 - 0.5) * 0.24))
        ctx.translate(-12, -12)
        ctx.strokeStyle = palette.muted
        ctx.lineWidth = 2
        // ghost pass: misregistered copy for a messy, smudged look
        ctx.globalAlpha = 0.3
        ctx.save()
        ctx.translate((r4 - 0.5) * 3, (r1 - 0.5) * 3)
        ctx.stroke(path)
        ctx.restore()
        // main pass: uneven dashes read as broken/unoptimised paths
        ctx.globalAlpha = 0.85
        ctx.setLineDash([5 + r2 * 6, 1.5 + r3 * 2.5])
        ctx.lineDashOffset = r4 * 10
        ctx.stroke(path)
      } else {
        ctx.scale(s, s)
        ctx.translate(-12, -12)
        ctx.strokeStyle = palette.text
        ctx.lineWidth = 2
        ctx.stroke(path)
        // twinkling sparkles around the polished icon
        for (let i = 0; i < 3; i++) {
          const sr = rand(id * 7 + i * 13)
          const sx = 2 + sr * 20
          const sy = 2 + rand(id * 11 + i * 17) * 20
          const tw = Math.sin(t / 260 + sr * Math.PI * 2 + i) // -1..1
          drawSparkle(
            ctx,
            sx,
            sy,
            2.8 + sr * 2,
            Math.max(0, tw) * 0.9,
            palette.warn
          )
        }
      }
      ctx.restore()
    }

    const drawMachine = (
      cx: number,
      cy: number,
      mw: number,
      mh: number,
      lightOn: number,
      t: number
    ) => {
      ctx.save()
      ctx.translate(cx, cy)

      const body = new Path2D()
      body.roundRect(-mw / 2, -mh / 2, mw, mh, 16)

      // feet, tucked under the body
      ctx.fillStyle = palette.border
      const footW = mw * 0.14
      ctx.beginPath()
      ctx.roundRect(-mw * 0.36, mh / 2 - 2, footW, 8, 3)
      ctx.roundRect(mw * 0.36 - footW, mh / 2 - 2, footW, 8, 3)
      ctx.fill()

      // opaque body (hides icons passing "through") with a soft drop shadow
      ctx.save()
      ctx.shadowColor = 'rgb(0 0 0 / 0.45)'
      ctx.shadowBlur = 18
      ctx.shadowOffsetY = 10
      ctx.fillStyle = palette.bg
      ctx.fill(body)
      ctx.restore()
      ctx.fillStyle = palette.bgAlt
      ctx.fill(body)

      // machined shading: light catches the top, base falls into shade
      const shade = ctx.createLinearGradient(0, -mh / 2, 0, mh / 2)
      shade.addColorStop(0, 'rgb(255 255 255 / 0.1)')
      shade.addColorStop(0.25, 'rgb(255 255 255 / 0.02)')
      shade.addColorStop(0.7, 'rgb(0 0 0 / 0.05)')
      shade.addColorStop(1, 'rgb(0 0 0 / 0.24)')
      ctx.fillStyle = shade
      ctx.fill(body)
      ctx.strokeStyle = palette.border
      ctx.lineWidth = 1.5
      ctx.stroke(body)

      // corner rivets
      ctx.fillStyle = palette.muted
      ctx.globalAlpha = 0.7
      for (const [rx, ry] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        ctx.beginPath()
        ctx.arc(rx * (mw / 2 - 9), ry * (mh / 2 - 9), 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // entry/exit slots at belt height
      ctx.fillStyle = palette.border
      ctx.globalAlpha = 0.55
      const slotH = mh * 0.22
      ctx.fillRect(-mw / 2 + 4, -slotH / 2, 3, slotH)
      ctx.fillRect(mw / 2 - 7, -slotH / 2, 3, slotH)
      ctx.globalAlpha = 1

      // the Iconish eye, centred on the face; wakes up while processing
      const eyeW = mw * 0.54
      const es = eyeW / LOGO_W
      ctx.save()
      ctx.translate(0, 4)
      ctx.scale(es, es)
      ctx.translate(-LOGO_W / 2, -LOGO_H / 2)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2.25
      ctx.strokeStyle = palette.text
      ctx.globalAlpha = 0.7
      for (const p of logoPaths) ctx.stroke(p)
      if (lightOn > 0) {
        ctx.strokeStyle = palette.warn
        ctx.globalAlpha = 0.9 * lightOn
        for (const p of logoPaths) ctx.stroke(p)
      }
      ctx.restore()

      // small vent grille under the eye
      ctx.strokeStyle = palette.muted
      ctx.globalAlpha = 0.45
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(-mw * 0.12, mh / 2 - 15 + i * 4.5)
        ctx.lineTo(mw * 0.12, mh / 2 - 15 + i * 4.5)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // indicator light in a small housing
      const ly = -mh / 2 + 13
      ctx.fillStyle = palette.border
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.roundRect(-9, ly - 6, 18, 12, 4)
      ctx.fill()
      ctx.globalAlpha = 1
      if (lightOn > 0) {
        const pulse = 1 + Math.sin(t / 90) * 0.12
        const glow = ctx.createRadialGradient(0, ly, 0, 0, ly, 30 * pulse)
        glow.addColorStop(0, palette.warn)
        glow.addColorStop(1, 'transparent')
        ctx.globalAlpha = 0.75 * lightOn
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, ly, 30 * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      ctx.beginPath()
      ctx.arc(0, ly, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = lightOn > 0 ? palette.warn : palette.border
      ctx.globalAlpha = lightOn > 0 ? 0.4 + 0.6 * lightOn : 1
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.restore()
    }

    const draw = (now: number) => {
      const t = now - start
      ctx.clearRect(0, 0, w, h)

      const beltY = h * 0.34
      const iconSize = h >= 200 ? 40 : 32
      const spacing = Math.max(120, Math.min(190, w / 7))
      const mw = iconSize * 2.7
      const mh = iconSize * 2.7
      const centreX = w / 2

      // belt curve: flat through the machine, arcing down towards each edge
      const drop = h * 0.42
      const flatHalf = Math.min(0.85, (mw / 2 + iconSize) / (w / 2))
      const curveT = (x: number) => {
        const nx = Math.abs(x - centreX) / (w / 2)
        return Math.max(0, (nx - flatHalf) / (1 - flatHalf))
      }
      const beltYAt = (x: number) => {
        const ct = curveT(x)
        return beltY + ct * ct * drop
      }
      const beltAngleAt = (x: number) => {
        const slope =
          ((2 * curveT(x) * drop) / ((1 - flatHalf) * (w / 2))) *
          Math.sign(x - centreX)
        return Math.atan(slope)
      }

      const cycle = Math.floor(t / CYCLE_MS)
      const frac = t % CYCLE_MS
      const dwelling = frac < DWELL_MS
      const phase = dwelling ? 0 : easeInOutCubic((frac - DWELL_MS) / MOVE_MS)
      const progress = cycle + phase

      // belt of icons, shadows tightening as the belt descends towards the ground
      const span = Math.ceil(w / spacing / 2) + 2
      for (let m = cycle - span; m <= cycle + span; m++) {
        const x = centreX + (progress - m) * spacing
        if (x < -iconSize || x > w + iconSize) continue
        const y = beltYAt(x)
        const ct = curveT(x)
        const prox = ct * ct // 0 on the flat, 1 at the lowest point
        const gap = iconSize * (0.62 + (1 - prox) * 0.55)
        drawIconShadow(
          x,
          y + gap,
          iconSize * (0.55 - prox * 0.2),
          0.16 + prox * 0.24
        )
        drawIcon(x, y, iconSize, m, x < centreX, t, beltAngleAt(x))
      }

      // sparkle burst as a fresh icon clears the machine's exit
      if (!dwelling && lastBurst !== cycle) {
        const exitingX = centreX + phase * spacing
        if (exitingX > centreX + mw / 2 + iconSize / 2) {
          lastBurst = cycle
          for (let i = 0; i < 9; i++) {
            const a = (Math.random() - 0.5) * Math.PI * 0.9
            const sp = 0.03 + Math.random() * 0.07
            particles.push({
              x: centreX + mw / 2,
              y: beltY + (Math.random() - 0.5) * mh * 0.3,
              vx: Math.cos(a) * sp,
              vy: Math.sin(a) * sp - 0.02,
              born: now,
              life: 500 + Math.random() * 350,
              size: 3 + Math.random() * 4,
            })
          }
        }
      }

      // machine: light ramps on, then it rumbles while processing
      let lightOn = 0
      let shakeX = 0
      let shakeY = 0
      if (dwelling) {
        lightOn = Math.min(1, frac / LIGHT_RAMP_MS)
        if (frac > LIGHT_RAMP_MS) {
          const amp = Math.sin(
            (Math.PI * (frac - LIGHT_RAMP_MS)) / (DWELL_MS - LIGHT_RAMP_MS)
          )
          shakeX = (Math.random() - 0.5) * 3.2 * amp
          shakeY = (Math.random() - 0.5) * 3.2 * amp
        }
      }
      // ground shadow stays planted while the machine rumbles above it
      ctx.save()
      ctx.translate(centreX, beltY + mh / 2 + 7)
      ctx.scale(1, 0.2)
      const ground = ctx.createRadialGradient(0, 0, 0, 0, 0, mw * 0.62)
      ground.addColorStop(0, 'rgb(0 0 0 / 0.4)')
      ground.addColorStop(1, 'transparent')
      ctx.fillStyle = ground
      ctx.beginPath()
      ctx.arc(0, 0, mw * 0.62, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      drawMachine(centreX + shakeX, beltY + shakeY, mw, mh, lightOn, t)

      // particles on top
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        const age = now - p.born
        if (age > p.life) {
          particles.splice(i, 1)
          continue
        }
        const fade = 1 - age / p.life
        drawSparkle(
          ctx,
          p.x + p.vx * age,
          p.y + p.vy * age,
          p.size * fade,
          fade,
          palette.warn
        )
      }
    }

    const loop = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(loop)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw(start + DWELL_MS + MOVE_MS * 0.99)
    })
    ro.observe(canvas)

    const mo = new MutationObserver(() => {
      palette = readPalette()
      if (reduceMotion) draw(start + DWELL_MS + MOVE_MS * 0.99)
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    if (reduceMotion) {
      // single static frame: rough icons left, machine idle, clean icons right
      draw(start + DWELL_MS + MOVE_MS * 0.99)
    } else {
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="h-[200px] w-full [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] md:h-[260px]"
    />
  )
}
