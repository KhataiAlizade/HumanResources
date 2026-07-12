import { useEffect, useState } from 'react'

import apiClient from '../api/axiosConfig'

type EmployeeNameSource = {
  name?: string
  firstName?: string
  lastName?: string
}

type LeaveRequest = {
  id?: number | string
  leaveId?: number | string
  status?: string
  reason?: string
  startDate?: string
  endDate?: string
  leaveStartDate?: string
  leaveEndDate?: string
  employeeName?: string
  employee?: EmployeeNameSource
  firstName?: string
  lastName?: string
}

function normalizeArray(payload: unknown): LeaveRequest[] {
  if (Array.isArray(payload)) return payload as LeaveRequest[]
  if (!payload || typeof payload !== 'object') return []

  const data = payload as any
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.content)) return data.content
  return []
}

function getEmployeeName(request: LeaveRequest) {
  const nestedName = request?.employee?.name
  const nestedFirstName = request?.employee?.firstName
  const nestedLastName = request?.employee?.lastName

  const combinedNestedName = [nestedFirstName, nestedLastName].filter(Boolean).join(' ').trim()

  if (nestedName) return nestedName
  if (combinedNestedName) return combinedNestedName
  if (request?.employeeName) return request.employeeName
  if (request?.firstName) return request.firstName
  if (request?.lastName) return request.lastName

  return '-'
}

function getLeaveId(request: LeaveRequest) {
  return request?.id ?? request?.leaveId
}

function formatLeaveDates(request: LeaveRequest) {
  const start = request?.startDate ?? request?.leaveStartDate
  const end = request?.endDate ?? request?.leaveEndDate

  const format = (value?: string) => {
    if (!value) return '—'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString()
  }

  return `${format(start)} – ${format(end)}`
}

export function LeaveApprovals() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingIds, setProcessingIds] = useState<(number | string)[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get('/admin/leaves')

        if (!isMounted) return

        setRequests(normalizeArray(response.data))
      } catch (fetchError) {
        if (!isMounted) return

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load leave requests.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchRequests()

    return () => {
      isMounted = false
    }
  }, [])

  const updateLeaveStatus = async (leave: LeaveRequest, nextStatus: 'APPROVED' | 'REJECTED') => {
    const leaveId = getLeaveId(leave)

    if (leaveId === undefined || leaveId === null) {
      setError('Unable to update leave status: missing leave ID.')
      return
    }

    try {
      setProcessingIds((current) => [...current, leaveId])
      const payload = { status: nextStatus }
      await apiClient.put(`/admin/leaves/${leaveId}/status`, payload)
      setRequests((current) =>
        current.map((request) => (getLeaveId(request) === leaveId ? { ...request, status: nextStatus } : request))
      )
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : 'Failed to update leave status.'
      setError(message)
    } finally {
      setProcessingIds((current) => current.filter((item) => item !== leaveId))
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Leave Approvals</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Review leave requests</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Approve or reject employee leave requests from the admin command center.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
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
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Employee Name</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Start Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">End Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Reason</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {requests.length > 0 ? (
                    requests.map((request) => {
                      const isPending = String(request?.status ?? '').toUpperCase() === 'PENDING'
                      const leaveId = getLeaveId(request)
                      const isProcessing = processingIds.includes(leaveId as number | string)

                      return (
                        <tr key={leaveId ?? `${request?.reason ?? 'leave'}-${request?.startDate ?? request?.leaveStartDate ?? ''}`} className="transition hover:bg-slate-50/80">
                          <td className="px-6 py-4 text-sm text-slate-700">{getEmployeeName(request)}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{request?.startDate ?? request?.leaveStartDate ? formatLeaveDates(request).split(' – ')[0] : '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{request?.endDate ?? request?.leaveEndDate ? formatLeaveDates(request).split(' – ')[1] : '—'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{request?.reason ?? '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                String(request?.status ?? '').toUpperCase() === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : String(request?.status ?? '').toUpperCase() === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {request?.status ?? 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {isPending ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => updateLeaveStatus(request, 'APPROVED')}
                                  className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => updateLeaveStatus(request, 'REJECTED')}
                                  className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">No actions</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td className="px-6 py-8 text-sm text-slate-500" colSpan={6}>
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
    </section>
  )
}

export default LeaveApprovals
