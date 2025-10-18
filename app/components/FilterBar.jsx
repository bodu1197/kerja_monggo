export default function FilterBar({ filterSummary, onFilterClick }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#e0e0e0] sticky top-0 z-10">
      <button
        onClick={onFilterClick}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#2c3e50] text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-[#34495e]"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        필터
      </button>
      <div className="text-sm text-[#666] font-medium">{filterSummary}</div>
    </div>
  )
}
