import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

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

type Props = {
  allowedRoles: string[]
  children: ReactNode
}

export default function RequireRole({ allowedRoles, children }: Props) {
  const roleRaw = localStorage.getItem('role')
  const role = roleRaw ? String(roleRaw).toUpperCase() : null

  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  let resolvedRole = role
  if (!resolvedRole && token) {
    try {
      const payload: any = parseJwtPayload(token)
      const possible = [payload?.role, payload?.roles, payload?.authorities, payload?.authority, payload?.realm_access?.roles]
      for (const p of possible) {
        if (!p) continue
        if (typeof p === 'string') {
          resolvedRole = p.toUpperCase()
          break
        }
        if (Array.isArray(p) && p.length > 0) {
          const match = p.find((x: string) => typeof x === 'string' && (x.toUpperCase() === 'ADMIN' || x.toUpperCase() === 'EMPLOYEE'))
          if (match) {
            resolvedRole = String(match).toUpperCase()
            break
          }
          resolvedRole = String(p[0]).toUpperCase()
          break
        }
      }
    } catch (e) {
    }
  }

  if (!resolvedRole || !allowedRoles.map((r) => r.toUpperCase()).includes(resolvedRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
