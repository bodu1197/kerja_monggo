'use client'

export default function BottomTab({ onSearchClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000]" style={{borderTop: '1px solid #e0e0e0', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'}}>
      <nav className="h-[70px] bg-white max-w-[600px] mx-auto flex justify-around items-center">
        <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer transition-all text-[#666] hover:text-black active:scale-95">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="text-xs font-medium">홈</span>
        </button>

        <button
          onClick={onSearchClick}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer transition-all text-[#666] hover:text-black active:scale-95"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span className="text-xs font-medium">검색</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer transition-all text-[#2c3e50] font-semibold hover:text-black active:scale-95">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-xs font-medium">내주변</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer transition-all text-[#666] hover:text-black active:scale-95">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="text-xs font-medium">프로필</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer transition-all text-[#666] hover:text-black active:scale-95">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m5.2-13.2l-4.3 4.3m0 6l4.3 4.3M23 12h-6m-6 0H1m18.2 5.2l-4.3-4.3m0-6l4.3-4.3"></path>
          </svg>
          <span className="text-xs font-medium">설정</span>
        </button>
      </nav>
    </div>
  )
}
