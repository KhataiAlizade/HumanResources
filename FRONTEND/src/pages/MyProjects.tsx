import { useEffect, useState } from 'react'
import apiClient from '../api/axiosConfig'

type Project = {
  id?: number | string
  name?: string
  projectName?: string
  description?: string
  projectDescription?: string
  startDate?: string
  projectStartDate?: string
  endDate?: string
  projectEndDate?: string
}

function normalizeArray(payload: unknown): Project[] {
  if (Array.isArray(payload)) return payload as Project[]
  if (!payload || typeof payload !== 'object') return []
  const p = payload as any
  if (Array.isArray(p.data)) return p.data
  if (Array.isArray(p.items)) return p.items
  if (Array.isArray(p.content)) return p.content
  return []
}

function getProjectName(project: Project) {
  return project?.name ?? project?.projectName ?? '-'
}

function getProjectDescription(project: Project) {
  return project?.description ?? project?.projectDescription ?? '-'
}

function formatProjectDate(value?: string) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString()
}

export function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setError('')

        const resp = await apiClient.get('/employee/my-projects')
        if (!mounted) return

        setProjects(normalizeArray(resp.data))
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : 'Failed to load your projects.'
        setError(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void fetchProjects()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">My Projects</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Projects assigned to you</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">A list of projects currently assigned to you.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Project Name</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Start Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {projects.length > 0 ? (
                    projects.map((p) => (
                      <tr key={p?.id} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{p?.id ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{getProjectName(p)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{getProjectDescription(p)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatProjectDate(p?.startDate ?? p?.projectStartDate)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatProjectDate(p?.endDate ?? p?.projectEndDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan={5}>
                        No projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MyProjects
