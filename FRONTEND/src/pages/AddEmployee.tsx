import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import apiClient from '../api/axiosConfig'

type Department = {
  id: number | string
  name?: string
  departmentName?: string
}

type EmployeeFormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  departmentId: string
  skills: string
}

export function AddEmployee() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [form, setForm] = useState<EmployeeFormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    departmentId: '',
    skills: '',
  })
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true)
        setError('')

        const response = await apiClient.get<Department[]>('/admin/departments')

        if (!isMounted) {
          return
        }

        setDepartments(Array.isArray(response.data) ? response.data : [])
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load departments.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoadingDepartments(false)
        }
      }
    }

    void fetchDepartments()

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
      await apiClient.post('/admin/employees', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        departmentId: form.departmentId,
        skills: form.skills,
      })

      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        departmentId: '',
        skills: '',
      })
      setSuccess('Employee created successfully.')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to create employee.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Employee Management</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Create a new employee</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Add a new employee record and assign a department from the dropdown below.
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
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="mb-2 block text-sm font-medium text-slate-700">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              value={form.skills}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              placeholder="Java, React, SQL"
            />
          </div>

          <div>
            <label htmlFor="departmentId" className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoadingDepartments}
              required
            >
              <option value="">{isLoadingDepartments ? 'Loading departments...' : 'Select a department'}</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name ?? department.departmentName ?? 'Unnamed Department'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingDepartments}
              className="inline-flex items-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}