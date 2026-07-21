import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const PB_URL = 'https://pb.jimshang.com'

export default function Workspace({ pb, user }) {
  const [tasks, setTasks] = useState([])
  const [files, setFiles] = useState([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const loadTasks = useCallback(async () => {
    try {
      const r = await pb.collection('pixfix_tasks').getList(1, 50, {
        sort: '-created', filter: `user_id="${user.id}"`
      })
      setTasks(r.items)
    } catch { /* empty */ }
    setLoading(false)
  }, [pb, user])

  useEffect(() => { loadTasks() }, [loadTasks])

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
    if (files.length + arr.length > 10) { showToast('最多 10 张', 'error'); return }
    setFiles([...files, ...arr])
  }

  const removeFile = (i) => setFiles(files.filter((_, j) => j !== i))

  const submit = async () => {
    if (!files.length) { showToast('上传照片到片场', 'error'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('images', f))
      fd.append('notes', notes)
      fd.append('status', 'pending')
      fd.append('user_id', user.id)
      await pb.collection('pixfix_tasks').create(fd)
      setFiles([]); setNotes('')
      showToast('已送入片场，24h 内出片 ✨', 'success')
      loadTasks()
    } catch (err) {
      showToast(err.message || '提交失败', 'error')
    }
    setSubmitting(false)
  }

  const statusLabel = { pending: '待处理', processing: '处理中', done: '已出片' }
  const reviewLabel = { pending_review: '🐾 审核中', approved: '✅ 通过', rejected: '❌ 未通过' }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 2 }}>片场修狗</h1>
            <span style={{ fontSize: 11, color: '#78716c', letterSpacing: 1 }}>你的每张照片，都是一个片场</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: '#78716c' }}>{user.email}</span>
            <br />
            <button onClick={() => pb.authStore.clear()} style={{
              background: 'none', border: 'none', color: '#44403c', fontSize: 11, cursor: 'pointer'
            }}>离开片场</button>
          </div>
        </div>

        {/* Free trial */}
        <div style={{
          padding: '14px 16px', background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.12)', borderRadius: 14,
          marginBottom: 24, fontSize: 12, color: '#d97706', lineHeight: 1.7
        }}>
          <strong>🎬 试运行免费</strong> — 片场开放中。正式上线 ¥9.9/张。
        </div>

        {/* Upload */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
          style={{
            border: '2px dashed #292524', borderRadius: 16, padding: '36px 20px',
            textAlign: 'center', cursor: 'pointer', marginBottom: 12,
            transition: 'all .2s',
            background: files.length ? 'rgba(245,158,11,0.03)' : 'transparent'
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>{files.length ? '🎞️' : '🎬'}</div>
          <div style={{ fontSize: 14, color: '#a8a29e' }}>
            {files.length ? `${files.length} 张照片就绪` : '把照片拖进片场'}
          </div>
          <div style={{ fontSize: 12, color: '#57534e', marginTop: 4 }}>JPG / PNG / HEIC · 最多 10 张</div>
          <input id="file-input" type="file" multiple accept="image/*" style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)} />
        </div>

        {/* Preview */}
        {files.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8, marginBottom: 12
          }}>
            {files.map((f, i) => (
              <div key={i} style={{
                position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #292524'
              }}>
                <img src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removeFile(i)} style={{
                  position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', color: '#ef4444', border: 'none', fontSize: 11, cursor: 'pointer'
                }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="描述你要的风格：电影感调色 / 日系清新 / 复古胶片…"
          rows={3} style={{
            width: '100%', padding: '14px 16px', background: '#18181b',
            border: '1px solid #292524', borderRadius: 14, color: '#fff',
            fontSize: 14, resize: 'none', outline: 'none', marginBottom: 12
          }} />

        <button onClick={submit} disabled={submitting} style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: submitting ? '#78350f' : '#f59e0b', color: '#0a0a0a',
          fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 36
        }}>
          {submitting ? '送入片场…' : '送入片场'}
        </button>

        {/* Tasks */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#78716c', marginBottom: 14, letterSpacing: 2 }}>
          已出片 / 待出片
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#57534e', fontSize: 13, padding: 40 }}>加载中…</div>
        ) : !tasks.length ? (
          <div style={{ textAlign: 'center', color: '#57534e', fontSize: 13, padding: 40, lineHeight: 2 }}>
            片场空空<br />把照片拖进来，狗爪开始修 🐾
          </div>
        ) : tasks.map(t => (
          <div key={t.id} style={{
            padding: 16, background: '#18181b', border: '1px solid #27272a', borderRadius: 14, marginBottom: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {t.review_status && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 500,
                    background: t.review_status === 'rejected' ? 'rgba(239,68,68,0.1)' : t.review_status === 'approved' ? 'rgba(245,158,11,0.1)' : 'rgba(120,113,108,0.1)',
                    color: t.review_status === 'rejected' ? '#ef4444' : t.review_status === 'approved' ? '#f59e0b' : '#78716c'
                  }}>{reviewLabel[t.review_status]}</span>
                )}
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 500,
                  background: t.status === 'done' ? 'rgba(245,158,11,0.1)' : t.status === 'processing' ? 'rgba(59,130,246,0.1)' : 'rgba(120,113,108,0.1)',
                  color: t.status === 'done' ? '#f59e0b' : t.status === 'processing' ? '#3b82f6' : '#78716c'
                }}>{statusLabel[t.status] || t.status}</span>
              </div>
              <span style={{ fontSize: 11, color: '#44403c' }}>{new Date(t.created).toLocaleDateString('zh-CN')}</span>
            </div>
            {t.review_reason && <p style={{ fontSize: 11, color: '#ef4444', margin: '0 0 6px', lineHeight: 1.5 }}>{t.review_reason}</p>}
            {t.source === 'xiaohongshu' && t.public_id && (
              <p style={{ fontSize: 10, color: '#57534e', margin: '0 0 6px' }}>
                小红书任务 · ID: {t.public_id}
              </p>
            )}
            {t.notes && <p style={{ fontSize: 13, color: '#a8a29e', lineHeight: 1.5, margin: 0 }}>{t.notes}</p>}
            {t.images && t.images.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {t.images.map((img, i) => (
                  <img key={i} src={`${PB_URL}/api/files/pixfix_tasks/${t.id}/${img}`} alt=""
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #292524' }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: '#18181b', border: toast.type === 'error' ? '1px solid rgba(239,68,68,0.25)' : '1px solid #292524',
              padding: '14px 24px', borderRadius: 16, fontSize: 13, zIndex: 200,
              color: toast.type === 'error' ? '#ef4444' : '#f59e0b',
              maxWidth: '90vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
