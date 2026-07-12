import { useEffect, useState } from 'react'
import apiClient from '../api/axiosConfig'

type Project = {
  id: number | string
  name: string
  description?: string
  startDate?: string | null
  endDate?: string | null
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

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingIds, setProcessingIds] = useState<(number | string)[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get('/admin/projects')

        if (!isMounted) return

        const normalized = normalizeArray(response.data)
        setProjects(normalized)
      } catch (err) {
        if (!isMounted) return
        const message = err instanceof Error ? err.message : 'Failed to load projects.'
        setError(message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void fetchProjects()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Projects</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Project list</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Browse projects managed in the system.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
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
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {projects?.length > 0 ? (
                    projects.map((project) => (
                      <tr key={project.id} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{project.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{project.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{project.description ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <button
                            type="button"
                            onClick={async () => {
                              const id = project.id

                              try {
                                setProcessingIds((current) => [...current, id])
                                await apiClient.delete(`/admin/projects/${id}`)
                                setProjects((current) => current.filter((item) => item.id !== id))
                              } catch (deleteError) {
                                const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete project.'
                                setError(message)
                              } finally {
                                setProcessingIds((current) => current.filter((item) => item !== id))
                              }
                            }}
                            disabled={processingIds.includes(project.id)}
                            className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan={6}>
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

export default ProjectsList
