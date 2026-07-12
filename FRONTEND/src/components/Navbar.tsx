import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

type NavItem = {
  label: string
  to: string
}

const linkClassName =
  'rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950'

const activeLinkClassName = 'bg-slate-900 text-white shadow-sm hover:bg-slate-900 hover:text-white'

export function Navbar() {
  const navigate = useNavigate()
  const [role, setRole] = useState<string | null>(() =>
    localStorage.getItem('role') ? localStorage.getItem('role')!.toUpperCase() : (() => {
      const token = localStorage.getItem('token')
      if (!token) return null
      try {
        const payload: any = parseJwtPayload(token)
        const possible = [payload?.role, payload?.roles, payload?.authorities, payload?.authority, payload?.realm_access?.roles]
        for (const p of possible) {
          if (!p) continue
          if (typeof p === 'string') return p.toUpperCase()
          if (Array.isArray(p) && p.length > 0) return String(p[0]).toUpperCase()
        }
      } catch (e) {
      }
      return null
    })()
  )

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'role') {
        setRole(e.newValue ? String(e.newValue).toUpperCase() : null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setRole(null)
    navigate('/login', { replace: true })
  }

  let navItems: NavItem[] = []
  const r = role ? role.toUpperCase() : null
  if (r === 'ADMIN') {
    navItems = [
      { label: 'Home', to: '/' },
      { label: 'Employees', to: '/employees' },
      { label: 'Projects', to: '/admin/projects' },
      { label: 'Leave Requests', to: '/admin/leaves' },
      { label: 'Add Employee', to: '/add-employee' },
      { label: 'Add Project', to: '/add-project' },
      { label: 'Add Salary', to: '/add-salary' },
      { label: 'Assign Project', to: '/assign-project' },
    ]
  } else if (r === 'EMPLOYEE') {
    navItems = [
      { label: 'Home', to: '/my-dashboard' },
      { label: 'Salary Details', to: '/salary-details' },
      { label: 'My Projects', to: '/my-projects' },
      { label: 'Leave', to: '/leave' },
    ]
  } else {
    navItems = [{ label: 'Dashboard', to: '/' }]
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3 self-start">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-300/60">
            HR
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">HRMS</span>
            <span className="block text-lg font-semibold text-slate-950">Human Resources</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `${linkClassName} ${isActive ? activeLinkClassName : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </header>
  )
}