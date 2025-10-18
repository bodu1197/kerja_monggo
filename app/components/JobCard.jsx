'use client'

import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function JobCard({ job }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Nego'
    if (min && max) {
      return `${(min / 1000000).toFixed(0)}-${(max / 1000000).toFixed(0)} Juta`
    }
    if (min) return `${(min / 1000000).toFixed(0)}+ Juta`
    return 'Nego'
  }

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Full-time',
      part_time: 'Part-time',
      contract: 'Kontrak',
      freelance: 'Freelance',
      internship: 'Magang'
    }
    return labels[type] || type
  }

  const timeAgo = job.created_at
    ? formatDistanceToNow(new Date(job.created_at), {
        addSuffix: true,
        locale: idLocale
      })
    : ''

  return (
    <a
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
    >
      <div className="flex gap-3">
        {/* Company Logo */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
          {job.companies?.logo_url ? (
            <img
              src={job.companies.logo_url}
              alt={job.companies.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 truncate">
            {job.companies?.name || 'Perusahaan'}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {job.regencies?.name && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full">
                {job.regencies.name}
              </span>
            )}
            {job.employment_type && (
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {getEmploymentTypeLabel(job.employment_type)}
              </span>
            )}
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>

          {timeAgo && (
            <p className="text-xs text-gray-500 mt-2">{timeAgo}</p>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.preventDefault()
            // TODO: Implement bookmark functionality
          }}
          className="text-gray-400 hover:text-primary transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </a>
  )
}
