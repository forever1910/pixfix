import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ── Film set background: warm spotlight particles ──
function FilmSetBg() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    let w, h
    const resize = () => {
      w = c.width = window.innerWidth; h = c.height = window.innerHeight
      particlesRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.15 - Math.random() * 0.3,
        r: Math.random() * 1.5 + 0.5, life: Math.random(), speed: 0.003 + Math.random() * 0.005
      }))
    }
    resize(); window.addEventListener('resize', resize)
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 0, w, h)
      for (const p of particlesRef.current) {
        p.life += p.speed
        if (p.life > 1) { p.x = Math.random() * w; p.y = h + 10; p.life = 0 }
        p.x += p.vx; p.y += p.vy
        const alpha = p.life < 0.3 ? p.life / 0.3 : p.life > 0.7 ? (1 - p.life) / 0.3 : 1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,158,11,${alpha * 0.25})`
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
}

// ── Film grain ──
function FilmGrain() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
    }} />
  )
}

// ── Letterbox bars with reel sprockets ──
function Letterbox() {
  return (
    <>
      <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 'clamp(36px, 7vh, 72px)', background: '#000', zIndex: 2, transformOrigin: 'top' }} />
      <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 'clamp(36px, 7vh, 72px)', background: '#000', zIndex: 2, transformOrigin: 'bottom' }} />
    </>
  )
}

// ── Sprocket holes ──
function Sprockets() {
  return (
    <>
      {/* Left sprocket strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 0.6 }}
        style={{ position: 'fixed', left: 12, top: 0, bottom: 0, width: 8, zIndex: 2, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(245,158,11,0.6) 0, rgba(245,158,11,0.6) 6px, transparent 6px, transparent 14px)' }} />
      {/* Right sprocket strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 0.6 }}
        style={{ position: 'fixed', right: 12, top: 0, bottom: 0, width: 8, zIndex: 2, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(245,158,11,0.6) 0, rgba(245,158,11,0.6) 6px, transparent 6px, transparent 14px)' }} />
    </>
  )
}

// ── Brand ──
function Brand() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{ textAlign: 'center', marginBottom: 12, whiteSpace: 'nowrap' }}
    >
      <motion.span
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{
          fontSize: 'clamp(44px, 8vw, 64px)', fontWeight: 300,
          color: '#a3a3a3', letterSpacing: '0.15em'
        }}
      >片场</motion.span>
      <motion.span
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <motion.span
          animate={{ textShadow: [
            '0 0 40px rgba(245,158,11,0.3)',
            '0 0 80px rgba(245,158,11,0.6)',
            '0 0 40px rgba(245,158,11,0.3)'
          ] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: 'clamp(64px, 12vw, 96px)', fontWeight: 900,
            color: '#f59e0b', letterSpacing: '-2px', lineHeight: 1,
            display: 'inline-block'
          }}
        >修狗</motion.span>
        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
          pointerEvents: 'none'
        }} />
      </motion.span>
    </motion.div>
  )
}

// ── Frame counter (top right of letterbox) ──
function FrameCounter() {
  const [n, setN] = useState(1)
  useEffect(() => { const i = setInterval(() => setN(c => c >= 999 ? 1 : c + 1), 60); return () => clearInterval(i) }, [])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
      style={{ position: 'fixed', top: 'clamp(44px, 8vh, 80px)', right: 20, zIndex: 3,
        fontFamily: "'Courier New', monospace", fontSize: 11, color: 'rgba(245,158,11,0.45)', letterSpacing: 3 }}>
      TAKE {String(n).padStart(3, '0')}
    </motion.div>
  )
}

// ── Auth modal ──
function AuthModal({ pb, mode, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      if (isSignup) {
        await pb.collection('users').create({ email, password, passwordConfirm: password })
        await pb.collection('users').authWithPassword(email, password)
      } else {
        await pb.collection('users').authWithPassword(email, password)
      }
    } catch (err) {
      const msg = err?.response?.message || err?.message || '操作失败'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
    setBusy(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          background: '#0d0d0d', border: '1px solid #222', borderRadius: 24,
          padding: '40px 32px 32px', width: '100%', maxWidth: 400
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 13, color: '#78716c', letterSpacing: 4, textTransform: 'uppercase' }}>片场修狗</span>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '6px 0 0' }}>
            {isSignup ? '进片场' : '回片场'}
          </h2>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" required placeholder="邮箱" autoComplete="email"
            style={inputStyle} />
          <input value={password} onChange={e => setPassword(e.target.value)}
            type="password" required placeholder="密码（至少8位）" minLength={8}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            style={inputStyle} />
          {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{error}</p>}
          <button type="submit" disabled={busy} style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            background: busy ? '#78350f' : '#f59e0b', color: '#0a0a0a',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8
          }}>
            {busy ? '…' : isSignup ? '进片场' : '回片场'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

const inputStyle = {
  width: '100%', padding: '14px 16px', background: '#1a1a1a',
  border: '1px solid #2a2a2a', borderRadius: 14, color: '#fff',
  fontSize: 15, outline: 'none', boxSizing: 'border-box'
}

// ── Landing ──
export default function Landing({ pb }) {
  const [authMode, setAuthMode] = useState(null)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#000', position: 'relative', overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <FilmSetBg />
      <FilmGrain />
      <Letterbox />
      <Sprockets />
      <FrameCounter />

      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: 24 }}>
        <Brand />

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{ fontSize: 14, color: '#57534e', letterSpacing: '0.15em', margin: '0 0 40px' }}
        >
          你的每张照片，都是一个片场
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setAuthMode('signup')} style={{
              padding: '14px 40px', borderRadius: 9999, fontSize: 15, fontWeight: 600,
              background: 'transparent', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.5)',
              cursor: 'pointer', transition: 'all .2s', letterSpacing: 1
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(245,158,11,0.08)'; e.target.style.borderColor = '#f59e0b' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(245,158,11,0.5)' }}>
              进片场
            </button>
            <button onClick={() => setAuthMode('login')} style={{
              padding: '14px 40px', borderRadius: 9999, fontSize: 15, fontWeight: 500,
              background: 'transparent', color: '#57534e', border: '1px solid #1c1c1c',
              cursor: 'pointer', transition: 'all .2s'
            }}
            onMouseEnter={e => { e.target.style.color = '#a8a29e'; e.target.style.borderColor = '#292524' }}
            onMouseLeave={e => { e.target.style.color = '#57534e'; e.target.style.borderColor = '#1c1c1c' }}>
              已有账号
            </button>
          </div>
          <motion.a href="/submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            style={{
              fontSize: 12, color: '#57534e', textDecoration: 'none',
              borderBottom: '1px dashed #292524', paddingBottom: 2
            }}>
            从小红书来的？不用注册，直接提交 →
          </motion.a>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        style={{ position: 'fixed', bottom: 28, left: 28, right: 28, display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: '#292524', zIndex: 3 }}>
        <span style={{ letterSpacing: 3 }}>片场修狗</span>
        <span>试运行免费 · 正式 ¥9.9/张</span>
      </motion.div>

      <AnimatePresence>
        {authMode && <AuthModal pb={pb} mode={authMode} onClose={() => setAuthMode(null)} />}
      </AnimatePresence>
    </div>
  )
}
