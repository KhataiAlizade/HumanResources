import { Link } from 'react-router-dom'

export function Unauthorized() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-rose-700 shadow-sm">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm">You do not have permission to view this page.</p>
        <div className="mt-4">
          <Link to="/" className="text-sm font-medium text-sky-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Unauthorized
