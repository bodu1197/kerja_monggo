export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl p-5 border-2 border-[#e0e0e0] cursor-pointer transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-[#2c3e50]">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="text-base font-bold text-[#2c3e50] m-0 leading-tight flex-1">
          {job.title}
        </h3>
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
          job.type === 'job' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#e3f2fd] text-[#1565c0]'
        }`}>
          {job.type === 'job' ? '구직' : '구인'}
        </span>
      </div>

      <div className="inline-block bg-[#f5f5f5] text-[#666] px-2.5 py-1 rounded-md text-xs font-semibold mb-2.5">
        {job.category}
      </div>

      <p className="text-[13px] text-[#666] m-0 mb-2.5">
        {job.region}
      </p>

      <p className="text-sm text-[#333] leading-relaxed m-0 mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex justify-between items-center pt-3 border-t border-[#f0f0f0]">
        <span className="text-xs text-[#999]">{job.days}일 전</span>
        <button className="bg-[#2c3e50] text-white border-none px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-[#34495e]">
          자세히 보기
        </button>
      </div>
    </div>
  )
}
