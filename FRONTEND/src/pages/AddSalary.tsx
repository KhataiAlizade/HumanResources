import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import apiClient from '../api/axiosConfig'

type Employee = {
  id: number | string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
}

type SalaryFormState = {
  employeeId: string
  amount: string
  month: string
  effectiveDate: string
}

function normalizeArray(payload: unknown): Employee[] {
  if (Array.isArray(payload)) return payload as Employee[]
  if (!payload || typeof payload !== 'object') return []
  const data = payload as any
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.content)) return data.content
  return []
}

export function AddSalary() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState<SalaryFormState>({
    employeeId: '',
    amount: '',
    month: '',
    effectiveDate: '',
  })
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true)
        setError('')

        const response = await apiClient.get('/admin/employees')

        if (!isMounted) {
          return
        }

        setEmployees(normalizeArray(response.data))
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load employees.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoadingEmployees(false)
        }
      }
    }

    void fetchEmployees()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const effectiveDate = form.effectiveDate
        ? new Date(form.effectiveDate).toISOString().slice(0, 10)
        : ''

      await apiClient.post('/admin/salaries', {
        employeeId: Number(form.employeeId),
        amount: Number(form.amount),
        month: form.month,
        effectiveDate,
      })

      setForm({
        employeeId: '',
        amount: '',
        month: '',
        effectiveDate: '',
      })
      setSuccess('Salary saved successfully.')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to save salary.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Salary Management</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Assign a salary</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Select an employee and save a salary record with the effective date.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
          <div>
            <label htmlFor="employeeId" className="mb-2 block text-sm font-medium text-slate-700">
              Employee
            </label>
            <select
              id="employeeId"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoadingEmployees}
              required
            >
              <option value="">{isLoadingEmployees ? 'Loading employees...' : 'Select an employee'}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {(employee.firstName || employee.name || 'Employee') + (employee.lastName ? ` ${employee.lastName}` : '')}
                  {employee.email ? ` (${employee.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label htmlFor="month" className="mb-2 block text-sm font-medium text-slate-700">
                Month
              </label>
              <input
                id="month"
                name="month"
                type="month"
                value={form.month}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="effectiveDate" className="mb-2 block text-sm font-medium text-slate-700">
                Effective Date
              </label>
              <input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                value={form.effectiveDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingEmployees}
              className="inline-flex items-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Save Salary'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}