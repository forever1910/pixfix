import { useState, useEffect } from 'react'
import { pb } from './pb'
import Landing from './Landing'
import Workspace from './Workspace'
import SubmitPage from './SubmitPage'
import TaskPage from './TaskPage'

function usePath() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path
}

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const path = usePath()

  useEffect(() => {
    if (pb.authStore.isValid) setUser(pb.authStore.model)
    pb.authStore.onChange((_, m) => setUser(m || null))
    setReady(true)
  }, [])

  if (!ready) return null

  // Public routes (no auth required)
  if (path.startsWith('/submit')) return <SubmitPage pb={pb} />
  if (path.startsWith('/task/')) {
    const id = path.split('/task/')[1]
    return <TaskPage pb={pb} taskId={id} />
  }

  // Auth gated
  if (user) return <Workspace pb={pb} user={user} />
  return <Landing pb={pb} />
}
