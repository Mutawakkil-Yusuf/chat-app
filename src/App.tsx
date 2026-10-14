import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/routes/LoginPage'
import { ChatPage } from '@/routes/ChatPage'
import { NotFoundPage } from '@/routes/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/chats/:conversationId" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
