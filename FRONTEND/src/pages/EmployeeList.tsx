import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import apiClient from '../api/axiosConfig'

type Employee = {
  id: number | string
  firstName: string
  lastName: string
  email: string
  role: string
  isApproved: boolean | string
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingIds, setProcessingIds] = useState<(number | string)[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await apiClient.get<Employee[]>('/admin/employees')

        if (!isMounted) {
          return
        }

        setEmployees(Array.isArray(response.data) ? response.data : [])
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load employees.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchEmployees()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Employees</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Employee directory</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          View employee records in a clean, responsive table.
        </p>
      </div>

      <div className="flex justify-end">
        <Link
          to="/add-employee"
          className="inline-flex items-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
        >
          Add Employee
        </Link>
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
          <p className="font-semibold">Unable to load employees.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees?.length > 0 ? (
                  employees?.map((employee) => (
                    <tr key={employee.id} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{employee.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {employee.firstName} {employee.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{employee.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{employee.role}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            employee.isApproved === true || employee.isApproved === 'true'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {employee.isApproved === true || employee.isApproved === 'true' ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          {!(employee.isApproved === true || employee.isApproved === 'true') && (
                            <button
                              onClick={async () => {
                                const id = employee.id
                                try {
                                  setProcessingIds((p) => [...p, id])
                                  await apiClient.post(`/admin/employees/${id}/approve`)
                                  setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, isApproved: true } : e)))
                                } catch (err) {
                                } finally {
                                  setProcessingIds((p) => p.filter((x) => x !== id))
                                }
                              }}
                              disabled={processingIds.includes(employee.id)}
                              className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={async () => {
                              const id = employee.id
                              try {
                                setProcessingIds((p) => [...p, id])
                                await apiClient.delete(`/admin/employees/${id}`)
                                setEmployees((prev) => prev.filter((e) => e.id !== id))
                              } catch (err) {
                              } finally {
                                setProcessingIds((p) => p.filter((x) => x !== id))
                              }
                            }}
                            disabled={processingIds.includes(employee.id)}
                            className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500" colSpan={5}>
                      No employees found.
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