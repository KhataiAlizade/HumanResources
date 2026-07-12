import { useEffect, useState } from 'react'

import apiClient from '../api/axiosConfig'

type Report = {
  id: number | string
  employeeName?: string
  projectName?: string
  reportDetails?: string
  details?: string
  date?: string
  createdAt?: string
}

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchReports = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get<Report[]>('/admin/reports')

        if (!isMounted) {
          return
        }

        setReports(Array.isArray(response.data) ? response.data : [])
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load reports.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchReports()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Reports</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Project reports</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Track employee project updates in a clean, readable dashboard table.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
          <p className="font-semibold">Unable to load reports.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Employee Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Project Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Report Details</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reports.length > 0 ? (
                  reports.map((report, index) => {
                    const reportDate = report.date ?? report.createdAt ?? ''

                    return (
                      <tr key={report.id ?? index} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{report.employeeName ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{report.projectName ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{report.reportDetails ?? report.details ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {reportDate ? new Date(reportDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500" colSpan={4}>
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}