import { Navigate } from 'react-router-dom'

export function RoleBasedRedirect() {
  const role = (localStorage.getItem('role') || '').toUpperCase()

  if (role === 'EMPLOYEE') {
    return <Navigate to="/my-dashboard" replace />
  }

  if (role === 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Navigate to="/login" replace />
}

export default RoleBasedRedirect
