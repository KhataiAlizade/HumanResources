import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import apiClient from '../api/axiosConfig'

type LeaveRecord = {
  id?: number | string
  reason?: string
  status?: string
  startDate?: string
  endDate?: string
  leaveStartDate?: string
  leaveEndDate?: string
}

type LeaveFormState = {
  startDate: string
  endDate: string
  reason: string
}

function normalizeArray(payload: unknown): LeaveRecord[] {
  if (Array.isArray(payload)) return payload as LeaveRecord[]
  if (!payload || typeof payload !== 'object') return []
  const p = payload as any
  if (Array.isArray(p.data)) return p.data
  if (Array.isArray(p.items)) return p.items
  if (Array.isArray(p.content)) return p.content
  return []
}

function formatDateInput(value: string) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(value?: string) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString()
}

export function LeaveManagement() {
  const [form, setForm] = useState<LeaveFormState>({
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [history, setHistory] = useState<LeaveRecord[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchHistory = async () => {
      try {
        setIsHistoryLoading(true)
        setError('')

        const response = await apiClient.get('/employee/leave')

        if (!isMounted) return

        setHistory(normalizeArray(response.data))
      } catch (fetchError) {
        if (!isMounted) return

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load leave history.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false)
        }
      }
    }

    void fetchHistory()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.post('/employee/leave', {
        startDate: formatDateInput(form.startDate),
        endDate: formatDateInput(form.endDate),
        reason: form.reason,
      })

      setForm({
        startDate: '',
        endDate: '',
        reason: '',
      })
      setSuccess('Leave request submitted successfully.')

      const refreshed = await apiClient.get('/employee/leave')
      setHistory(normalizeArray(refreshed.data))
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to submit leave request.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Leave Management</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Request time off</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Submit a leave request and review your leave history below.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">New Request</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Submit leave</h2>
          </div>

          {success ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-slate-700">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-slate-700">
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="mb-2 block text-sm font-medium text-slate-700">
                Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={5}
                value={form.reason}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Briefly explain why you need leave"
                required
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">History</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Leave history</h2>
          </div>

          {isHistoryLoading ? (
            <div className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Dates</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Reason</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {history.length > 0 ? (
                      history.map((leave) => (
                        <tr key={leave?.id} className="transition hover:bg-slate-50/80">
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {formatDisplayDate(leave?.startDate ?? leave?.leaveStartDate)}
                            {' '}–{' '}
                            {formatDisplayDate(leave?.endDate ?? leave?.leaveEndDate)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{leave?.reason ?? '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                              {leave?.status ?? 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-8 text-sm text-slate-500" colSpan={3}>
                          No leave requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default LeaveManagement
