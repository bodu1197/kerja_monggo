'use client'

import Link from 'next/link'

export default function ProductCard({ job }) {
  const {
    id,
    title,
    description,
    province_name,
    regency_name,
    category_name,
    subcategory_name,
    contact,
    created_at
  } = job

  // Determine if it's a job post or job seeker post
  const isJobPost = job.hasOwnProperty('company_name')
  const detailUrl = isJobPost ? `/jobs/hiring/${id}` : `/jobs/seeking/${id}`

  return (
    <Link href={detailUrl}>
      <div className="bg-dark-100 border border-gray-800 rounded-lg p-4 hover:border-primary transition cursor-pointer">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-dark-200 text-primary text-xs rounded">
          {category_name}
        </span>
        {subcategory_name && (
          <span className="px-2 py-1 bg-dark-200 text-gray-300 text-xs rounded">
            {subcategory_name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {province_name}, {regency_name}
        </span>
        {contact && (
          <span className="text-primary">{contact}</span>
        )}
      </div>

      {created_at && (
        <div className="mt-2 text-xs text-gray-500">
          {new Date(created_at).toLocaleDateString('id-ID')}
        </div>
      )}
      </div>
    </Link>
  )
}
