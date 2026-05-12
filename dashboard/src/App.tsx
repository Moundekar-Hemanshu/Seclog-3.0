import { AuthProvider, useAuth } from '@/context/AuthContext'
import AuthPage from '@/components/auth/AuthPage'
import AppShell from '@/components/AppShell'

function AppContent() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppShell /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
