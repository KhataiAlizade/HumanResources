import { useEffect, useState } from 'react'
import apiClient from '../api/axiosConfig'

type Salary = {
  id?: number | string
  employeeName?: string
  firstName?: string
  lastName?: string
  employee?: {
    name?: string
    firstName?: string
    lastName?: string
    email?: string
  }
  amount?: number | string
  month?: string
  effectiveDate?: string
}

function normalizeArray(payload: unknown): Salary[] {
  if (Array.isArray(payload)) return payload as Salary[]
  if (!payload || typeof payload !== 'object') return []
  const p = payload as any
  if (Array.isArray(p.data)) return p.data
  if (Array.isArray(p.items)) return p.items
  if (Array.isArray(p.content)) return p.content
  return []
}

function getEmployeeName(row: Salary) {
  const combinedName = [
    row.employee?.name,
    row.employee?.firstName,
    row.employee?.lastName,
    row.employeeName,
    row.firstName,
    row.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
  return combinedName || '-'
}

function formatEffectiveDate(value?: string) {
  if (!value) return { month: '-', time: '-' }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { month: '-', time: '-' }
  }

  const month = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return { month, time }
}

export function SalaryDetails() {
  const [rows, setRows] = useState<Salary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchSalary = async () => {
      try {
        setIsLoading(true)
        setError('')

        const resp = await apiClient.get('/employee/salary')
        if (!mounted) return

        setRows(normalizeArray(resp.data))
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : 'Failed to load salary data.'
        setError(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void fetchSalary()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Salary</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Salary Transactions</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Recent salary transactions for your account.</p>
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
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Employee Name</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Month</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Transaction Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.length > 0 ? (
                    rows.map((r) => (
                      <tr key={r.id ?? `${getEmployeeName(r)}-${r.effectiveDate ?? r.month ?? ''}`} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-4 text-sm text-slate-700">{getEmployeeName(r)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{r.amount ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatEffectiveDate(r.effectiveDate).month}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatEffectiveDate(r.effectiveDate).time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan={4}>
                        No salary records found.
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

export default SalaryDetails
