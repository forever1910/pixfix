import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

const PB_URL = 'https://pb.jimshang.com'

const statusMap = {
  pending_review: { label: '🐾 狗爪审核中', color: '#78716c', desc: '片场修狗正在审阅你的照片…' },
  rejected: { label: '❌ 未通过', color: '#ef4444', desc: '' },
  approved: { label: '✅ 已通过', color: '#f59e0b', desc: '审核通过，正在修图中…' },
  pending: { label: '⏳ 排队中', color: '#78716c', desc: '已通过审核，等待处理' },
  processing: { label: '🎨 修图中', color: '#3b82f6', desc: '狗爪正在调色…' },
  done: { label: '🎬 已出片', color: '#10b981', desc: '修图完成！' },
}

export default function TaskPage({ pb, taskId }) {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isLoggedIn = pb.authStore.isValid

  useEffect(() => {
    const fetch = async () => {
      try {
        if (pb.authStore.isValid) {
          const r = await pb.collection('pixfix_tasks').getFirstListItem(`public_id="${taskId}"`)
          setTask(r)
        } else {
          const res = await fetch(`/api/task/${taskId}`)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          setTask(data)
        }
      } catch {
        setError('找不到这个任务。链接可能已过期或输入有误。')
      }
      setLoading(false)
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [taskId])

  if (loading) {
    return <div style={container}><div style={{ textAlign:'center', color:'#57534e', fontSize:14 }}>加载中…</div></div>
  }

  if (error) {
    return (
      <div style={container}>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:'center', maxWidth:400 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🎬</div>
          <h2 style={{ color:'#fff', fontSize:18, marginBottom:8 }}>片场修狗</h2>
          <p style={{ color:'#78716c', fontSize:13, lineHeight:1.6 }}>{error}</p>
          <a href="/submit" style={{ color:'#f59e0b', fontSize:13, marginTop:16, display:'inline-block' }}>← 重新提交</a>
        </motion.div>
      </div>
    )
  }

  const s = statusMap[task.review_status === 'rejected' ? 'rejected' :
    task.review_status === 'approved' ? (task.status === 'done' ? 'done' : task.status === 'processing' ? 'processing' : 'pending') :
    'pending_review']

  const showResult = isLoggedIn && task.status === 'done' && task.result_url

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fff',
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        style={{ maxWidth:440, width:'100%' }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#f59e0b', margin:'0 0 4px', letterSpacing:2 }}>片场修狗</h1>
          <p style={{ fontSize:12, color:'#57534e', margin:0 }}>任务进度</p>
        </div>

        {/* Status */}
        <div style={{ background:'#18181b', border:'1px solid #292524', borderRadius:16, padding:24, marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>
            {task.review_status === 'rejected' ? '😞' : task.status === 'done' ? '🎬' : task.status === 'processing' ? '🎨' : '🐾'}
          </div>
          <h3 style={{ color:s.color, fontSize:18, fontWeight:600, margin:'0 0 6px' }}>{s.label}</h3>
          <p style={{ color:'#78716c', fontSize:13, margin:0, lineHeight:1.6 }}>
            {task.review_status === 'rejected' ? (task.review_reason || '照片不符合出片标准') : s.desc}
          </p>
        </div>

        {/* Result — only for logged-in users */}
        {task.status === 'done' && !isLoggedIn && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.12)',
              borderRadius:16, padding:24, marginBottom:16, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🔒</div>
            <h4 style={{ color:'#f59e0b', fontSize:15, fontWeight:600, margin:'0 0 6px' }}>成片已就绪</h4>
            <p style={{ color:'#78716c', fontSize:12, margin:'0 0 14px', lineHeight:1.6 }}>
              注册片场修狗账号即可查看和下载成片
            </p>
            <a href="/" style={{
              display:'inline-block', padding:'10px 32px', borderRadius:9999,
              background:'#f59e0b', color:'#0a0a0a', fontSize:14, fontWeight:600, textDecoration:'none'
            }}>注册 / 登录</a>
          </motion.div>
        )}

        {showResult && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.12)',
              borderRadius:16, padding:24, marginBottom:16, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🎬</div>
            <h4 style={{ color:'#10b981', fontSize:15, fontWeight:600, margin:'0 0 4px' }}>成片下载</h4>
            <a href={task.result_url} target="_blank" rel="noopener" style={{
              color:'#f59e0b', fontSize:13, wordBreak:'break-all', textDecoration:'underline'
            }}>{task.result_url}</a>
          </motion.div>
        )}

        {/* Details */}
        <div style={{ background:'#18181b', border:'1px solid #27272a', borderRadius:16, padding:16 }}>
          <div style={{ fontSize:11, color:'#57534e', marginBottom:8 }}>任务详情</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
            <span style={{ color:'#78716c' }}>任务 ID</span>
            <span style={{ color:'#a8a29e', fontFamily:'monospace' }}>{task.public_id || task.id.slice(0,8)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
            <span style={{ color:'#78716c' }}>提交时间</span>
            <span style={{ color:'#a8a29e' }}>{new Date(task.created).toLocaleString('zh-CN')}</span>
          </div>
          {task.notes && (
            <div style={{ fontSize:12, marginTop:8 }}>
              <span style={{ color:'#78716c' }}>风格要求：</span>
              <span style={{ color:'#a8a29e' }}>{task.notes}</span>
            </div>
          )}
          {task.images && task.images.length > 0 && (
            <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
              {task.images.map((img,i) => (
                <img key={i} src={`${PB_URL}/api/files/pixfix_tasks/${task.id}/${img}`} alt=""
                  style={{ width:48, height:48, objectFit:'cover', borderRadius:6, border:'1px solid #292524' }} />
              ))}
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:10, color:'#44403c', marginTop:20 }}>
          每 30 秒自动刷新 · 片场修狗
        </p>
      </motion.div>
    </div>
  )
}

const container = {
  minHeight:'100vh', background:'#0a0a0a', color:'#fff',
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:24, fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}
