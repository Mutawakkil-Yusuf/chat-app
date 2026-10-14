import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MarketingLayout } from '@/components/landing/MarketingLayout'
import { LandingPage } from '@/routes/LandingPage'
import { FeaturesPage } from '@/routes/FeaturesPage'
import { AboutPage } from '@/routes/AboutPage'
import { LoginPage } from '@/routes/LoginPage'
import { ChatPage } from '@/routes/ChatPage'
import { NotFoundPage } from '@/routes/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/chats/:conversationId" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
