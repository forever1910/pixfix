import { useState } from 'react'
import { motion } from 'motion/react'

function generateId() {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  let id = ''
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export default function SubmitPage({ pb }) {
  const [link, setLink] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!link.trim()) { setError('请粘贴网盘链接'); return }
    setSubmitting(true); setError('')
    try {
      const pid = generateId()
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: link.trim(), notes: notes.trim(), public_id: pid })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.public_id)
    } catch (err) {
      setError(err.message || '提交失败，请重试')
    }
    setSubmitting(false)
  }

  if (result) {
    const url = `${window.location.origin}/task/${result}`
    return (
      <div style={containerStyle}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2 style={{ color: '#f59e0b', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>已送入片场</h2>
          <p style={{ color: '#78716c', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            狗爪正在审核你的照片<br />审核通过后 24 小时内出片
          </p>
          <div style={{
            background: '#18181b', border: '1px solid #292524', borderRadius: 14,
            padding: 16, marginBottom: 16
          }}>
            <p style={{ fontSize: 11, color: '#57534e', marginBottom: 8 }}>进度链接（收藏它）：</p>
            <a href={url} style={{
              color: '#f59e0b', fontSize: 14, wordBreak: 'break-all',
              textDecoration: 'none', fontWeight: 600
            }}>{url}</a>
          </div>
          <button onClick={() => {
            navigator.clipboard.writeText(url).catch(() => {})
            setResult(null); setLink(''); setNotes('')
          }} style={{
            padding: '12px 32px', borderRadius: 9999, border: '1px solid #f59e0b',
            background: 'transparent', color: '#f59e0b', fontSize: 14, cursor: 'pointer'
          }}>
            复制链接 & 再来一单
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b', margin: '0 0 4px', letterSpacing: 2 }}>
            片场修狗
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: 0 }}>
            把网盘链接扔进片场，狗爪帮你修
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={link} onChange={e => setLink(e.target.value)}
            type="url" placeholder="粘贴百度网盘 / 阿里云盘分享链接"
            style={inputStyle} />
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="风格要求（选填）：电影感调色 / 日系清新 / 只要磨皮…"
            rows={3} style={{ ...inputStyle, resize: 'none' }} />
          {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{
            padding: 14, borderRadius: 14, border: 'none', background: submitting ? '#78350f' : '#f59e0b',
            color: '#0a0a0a', fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            {submitting ? '送入片场…' : '送入片场'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#44403c', marginTop: 20 }}>
          试运行免费 · 正式 ¥9.9/张
        </p>
      </motion.div>
    </div>
  )
}

const containerStyle = {
  minHeight: '100vh', background: '#0a0a0a', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}

const inputStyle = {
  width: '100%', padding: '14px 16px', background: '#18181b',
  border: '1px solid #292524', borderRadius: 14, color: '#fff',
  fontSize: 14, outline: 'none', boxSizing: 'border-box'
}
