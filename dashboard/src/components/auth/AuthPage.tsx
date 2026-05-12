import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [regName, setRegName] = useState('')
  const [regOrg, setRegOrg] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
    } catch {
      setError('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!regName || !regOrg || !regEmail || !regPassword) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await register(regName, regOrg, regEmail, regPassword)
    } catch {
      setError('Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" id="auth-page">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 bg-[#212A31] text-[#D3D9D4]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Shield className="h-7 w-7 text-[#f59e0b]" />
            <span className="text-xl font-semibold tracking-tight text-white">SecLog</span>
            <span className="text-xs font-medium tracking-widest uppercase text-[#748D92] mt-0.5">SIEM</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-2xl font-medium leading-snug text-white/90 max-w-sm">
            Real-time threat visibility for modern infrastructure.
          </p>
          <p className="text-sm text-[#748D92] max-w-xs leading-relaxed">
            Monitor, detect, and respond to security events across your entire environment from a unified platform.
          </p>
        </div>

        <div className="text-xs text-[#748D92]">
          SecLog SIEM &copy; 2026
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield className="h-6 w-6 text-[#f59e0b]" />
            <span className="text-lg font-semibold text-foreground">SecLog</span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mt-0.5">SIEM</span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              {activeTab === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'login'
                ? 'Enter your credentials to access the dashboard.'
                : 'Get started with SecLog SIEM.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted mb-6" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all duration-150 ${
                activeTab === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setActiveTab('login'); setError('') }}
              id="tab-login"
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'register'}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all duration-150 ${
                activeTab === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setActiveTab('register'); setError('') }}
              id="tab-register"
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4" id="login-form">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="analyst@company.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} id="btn-sign-in">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
              <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-150" id="link-forgot-password">
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" id="register-form">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Alex Morgan"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-org">Organization</Label>
                <Input
                  id="reg-org"
                  type="text"
                  placeholder="Cybercore Inc."
                  value={regOrg}
                  onChange={e => setRegOrg(e.target.value)}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="analyst@company.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} id="btn-create-account">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground text-center mt-8 lg:hidden">
            SecLog SIEM &copy; 2026
          </p>
        </div>
      </div>
    </div>
  )
}
