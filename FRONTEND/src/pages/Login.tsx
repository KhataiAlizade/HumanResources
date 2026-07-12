import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/axiosConfig'

type LoginFormState = {
  email: string
  password: string
}

export function Login() {
  const [form, setForm] = useState<LoginFormState>({
    email: 'admin@hrms.com',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post('/auth/login', {
        email: form.email,
        password: form.password,
      })

      const token = response.data?.token
      if (token) {
        localStorage.setItem('token', token)

        const roleFromResp = response.data?.role ?? response.data?.user?.role ?? response.data?.roles ?? response.data?.user?.roles
        let resolvedRole: string | null = null
        if (roleFromResp) {
          if (typeof roleFromResp === 'string') resolvedRole = roleFromResp
          else if (Array.isArray(roleFromResp) && roleFromResp.length) {
            const match = roleFromResp.find((r: any) => typeof r === 'string' && (r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'EMPLOYEE'))
            resolvedRole = match ?? String(roleFromResp[0])
          }
        }

        const parseJwtPayload = (tkn: string) => {
          try {
            const parts = tkn.split('.')
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

        if (!resolvedRole) {
          const payload: any = parseJwtPayload(token)
          const possible = [payload?.role, payload?.roles, payload?.authorities, payload?.authority, payload?.realm_access?.roles, payload?.user?.role]
          for (const p of possible) {
            if (!p) continue
            if (typeof p === 'string') {
              resolvedRole = p
              break
            }
            if (Array.isArray(p) && p.length > 0) {
              const match = p.find((x: string) => typeof x === 'string' && (x.toUpperCase() === 'ADMIN' || x.toUpperCase() === 'EMPLOYEE'))
              resolvedRole = match ?? String(p[0])
              break
            }
          }
        }

        if (resolvedRole) {
          localStorage.setItem('role', String(resolvedRole).toUpperCase())
        }

        const normalizedRole = String(resolvedRole ?? '').toUpperCase()
        if (normalizedRole === 'EMPLOYEE') {
          navigate('/my-dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } else {
        setError('Login failed: No token received from server.')
      }
    } catch (err: any) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-14 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_30%)]" />
          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-sky-200/80">HRMS</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Sign in to manage people, payroll, and projects.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              A clean login experience for administrators and employees with a polished form shell.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-100 px-6 py-14 sm:px-10 lg:px-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-300/60">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Login to your account</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Enter your HRMS credentials to continue.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  placeholder="you@company.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}