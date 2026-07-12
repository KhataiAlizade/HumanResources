import { useEffect, useState } from 'react'

import apiClient from '../api/axiosConfig'

type EmployeeProfile = {
  name?: string
  firstName?: string
  surname?: string
  lastName?: string
  email?: string
  role?: string
  department?: string
}

function normalizeProfile(payload: unknown): EmployeeProfile {
  if (!payload || typeof payload !== 'object') {
    return {}
  }

  const data = payload as any
  return data.data ?? data.user ?? data.employee ?? data.profile ?? data
}

export function EmployeeDashboard() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get('/employee/me')

        if (!isMounted) {
          return
        }

        setProfile(normalizeProfile(response.data))
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load your profile.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const displayName = [profile?.name ?? profile?.firstName, profile?.surname ?? profile?.lastName]
    .filter(Boolean)
    .join(' ')

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Employee Home</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          View your current account details and department information.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
          <p className="font-semibold">Unable to load your profile.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Profile</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {displayName || 'Employee'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A quick view of your personal account details.
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
              {String(profile?.role ?? 'EMPLOYEE').toUpperCase()}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Name</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.name ?? profile?.firstName ?? '-'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Surname</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.surname ?? profile?.lastName ?? '-'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.email ?? '-'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Department</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.department ?? '-'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default EmployeeDashboard
