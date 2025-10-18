'use client'

export default function MainBanner() {
  return (
    <div className="w-full h-[250px] bg-dark-100 border-b border-gray-800">
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Banner Iklan 250px</p>
          <p className="text-sm text-gray-500 mt-2">PC: Full width / Mobile: Container width</p>
        </div>
      </div>
    </div>
  )
}
