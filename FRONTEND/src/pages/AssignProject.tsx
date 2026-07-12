import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import apiClient from '../api/axiosConfig'

type Employee = {
  id: number | string
  firstName: string
  lastName: string
  email?: string
  skills?: string
}

type Project = {
  id: number | string
  name: string
}

type AssignmentFormState = {
  employeeId: string
  projectId: string
}

function getEmployeeLabel(employee: Employee) {
  const fullName = `${employee.firstName} ${employee.lastName}`.trim()
  const skills = employee.skills?.trim()

  if (skills) {
    return `${fullName} - Skills: ${skills}`
  }

  return `${fullName} - Skills: None listed`
}

function matchesSkillFilter(employee: Employee, filterValue: string) {
  const trimmedFilter = filterValue.trim().toLowerCase()
  if (!trimmedFilter) return true

  return employee.skills?.toLowerCase().includes(trimmedFilter) ?? false
}

export function AssignProject() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [skillFilter, setSkillFilter] = useState('')
  const [form, setForm] = useState<AssignmentFormState>({
    employeeId: '',
    projectId: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [employeesResponse, projectsResponse] = await Promise.all([
          apiClient.get<Employee[]>('/admin/employees'),
          apiClient.get<Project[]>('/admin/projects'),
        ])

        if (!isMounted) {
          return
        }

        setEmployees(Array.isArray(employeesResponse.data) ? employeesResponse.data : [])
        setProjects(Array.isArray(projectsResponse.data) ? projectsResponse.data : [])
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load assignment data.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchData()

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
      const payload = {
        employeeId: form.employeeId && !isNaN(Number(form.employeeId)) ? Number(form.employeeId) : form.employeeId,
        projectId: form.projectId && !isNaN(Number(form.projectId)) ? Number(form.projectId) : form.projectId,
      }

      const resp = await apiClient.post('/admin/project-assignments', payload)

      if (resp && (resp.status < 200 || resp.status >= 300)) {
        throw new Error('Failed to save project assignment')
      }

      setForm({
        employeeId: '',
        projectId: '',
      })
      setSuccess('Project assignment saved successfully.')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to save project assignment.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredEmployees = employees.filter((employee) => matchesSkillFilter(employee, skillFilter))

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">Project Assignment</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Assign employee to project</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Select an employee and a project to create a new assignment.
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
              <label htmlFor="skillFilter" className="mb-2 block text-sm font-medium text-slate-700">
                Filter by Skill
              </label>
              <input
                id="skillFilter"
                name="skillFilter"
                type="text"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder="Type a skill like Java or React"
              />
            </div>

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
                disabled={isLoading}
                required
              >
                <option value="">{isLoading ? 'Loading employees...' : 'Select an employee'}</option>
                {filteredEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {getEmployeeLabel(employee)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="projectId" className="mb-2 block text-sm font-medium text-slate-700">
                Project
              </label>
              <select
                id="projectId"
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                required
              >
                <option value="">{isLoading ? 'Loading projects...' : 'Select a project'}</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="inline-flex items-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Assign Project'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}