import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  ScrollText,
  Bell,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardView from '@/components/dashboard/DashboardView'
import AlertsView from '@/components/alerts/AlertsView'
import LogsView from '@/components/logs/LogsView'

type Tab = 'dashboard' | 'alerts' | 'logs'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'logs', label: 'Logs', icon: <ScrollText className="h-4 w-4" /> },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background" id="app-shell">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">SecLog</span>
              <span className="text-[9px] font-medium tracking-widest uppercase text-muted-foreground mt-px">SIEM</span>
            </div>

            {/* Desktop nav tabs */}
            <nav className="hidden md:flex items-center gap-1" id="main-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                    activeTab === tab.id
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  id={`nav-${tab.id}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150" id="notifications-btn">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
              <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.organization}</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={logout} id="logout-btn">
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'logs' && <LogsView />}
      </main>
    </div>
  )
}
