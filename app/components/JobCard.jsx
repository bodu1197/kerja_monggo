'use client'

import Link from 'next/link'
import { IoLocationSharp, IoBriefcase, IoCalendar, IoBusinessSharp, IoPerson, IoCall, IoMail } from 'react-icons/io5'

export default function ProductCard({ job }) {
  const {
    id,
    title,
    description,
    province_name,
    regency_name,
    category_name,
    subcategory_name,
    company_name,
    contact_person,
    phone,
    email,
    deadline,
    created_at
  } = job

  // Determine if it's a job post or job seeker post
  const isJobPost = job.hasOwnProperty('company_name')
  const detailUrl = isJobPost ? `/jobs/hiring/${id}` : `/jobs/seeking/${id}`

  // Calculate days remaining if deadline exists
  const daysRemaining = deadline ? Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null

  return (
    <Link href={detailUrl}>
      <div className="bg-dark-100 border border-gray-800 rounded-lg p-5 hover:border-primary transition cursor-pointer h-full flex flex-col">
        {/* 제목 */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{title}</h3>

        {/* 회사명 (구인 공고인 경우) */}
        {isJobPost && company_name && (
          <div className="flex items-center text-sm text-gray-300 mb-2">
            <IoBusinessSharp className="mr-2 text-primary flex-shrink-0" />
            <span className="font-medium">{company_name}</span>
          </div>
        )}

        {/* 설명 */}
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{description}</p>

        {/* 직종 태그 */}
        <div className="flex items-start mb-3">
          <IoBriefcase className="mr-2 mt-1 text-primary flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-dark-200 text-primary text-xs rounded font-medium">
              {category_name}
            </span>
            {subcategory_name && (
              <span className="px-2 py-1 bg-dark-200 text-gray-300 text-xs rounded">
                {subcategory_name}
              </span>
            )}
          </div>
        </div>

        {/* 위치 */}
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <IoLocationSharp className="mr-2 text-primary flex-shrink-0" />
          <span>{province_name}, {regency_name}</span>
        </div>

        {/* 마감일 (있는 경우) */}
        {deadline && (
          <div className="flex items-center text-sm mb-2">
            <IoCalendar className="mr-2 flex-shrink-0" style={{ color: daysRemaining <= 7 ? '#ef4444' : '#10b981' }} />
            <span className={daysRemaining <= 7 ? 'text-red-400 font-semibold' : 'text-green-400 font-medium'}>
              마감: {new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              {daysRemaining > 0 && ` (D-${daysRemaining})`}
              {daysRemaining === 0 && ' (오늘 마감)'}
              {daysRemaining < 0 && ' (마감됨)'}
            </span>
          </div>
        )}

        {/* 담당자 정보 (구인 공고인 경우) */}
        {isJobPost && (contact_person || phone || email) && (
          <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
            {contact_person && (
              <div className="flex items-center text-xs text-gray-400">
                <IoPerson className="mr-2 text-primary flex-shrink-0" />
                <span className="font-medium">담당자: {contact_person}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center text-xs text-gray-400">
                <IoCall className="mr-2 text-primary flex-shrink-0" />
                <span>연락처: {phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center text-xs text-gray-400">
                <IoMail className="mr-2 text-primary flex-shrink-0" />
                <span className="truncate">이메일: {email}</span>
              </div>
            )}
          </div>
        )}

        {/* 등록일 */}
        {created_at && (
          <div className="flex items-center text-xs text-gray-500 mt-auto pt-2 border-t border-gray-800">
            <IoCalendar className="mr-1 flex-shrink-0" />
            <span>등록: {new Date(created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
