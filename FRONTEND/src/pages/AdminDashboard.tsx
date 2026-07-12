export function AdminDashboard() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-sky-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-8 py-14 text-center text-white shadow-2xl shadow-slate-950/30 sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(30,64,175,0.24),_transparent_32%)]" />

        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-sky-200/80">HRMS Command Center</p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">Welcome, Admin</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Manage your employees, track projects, and handle salaries from your command center.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur">
              Employees
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur">
              Projects
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur">
              Salaries
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
