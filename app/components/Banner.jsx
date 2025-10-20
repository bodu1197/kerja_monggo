export default function Banner() {
  return (
    <div className="w-full px-5 mt-5">
      <section className="w-full max-w-[1200px] mx-auto h-[220px] bg-gradient-to-br from-[#2c3e50] to-[#34495e] flex items-center justify-center text-white relative rounded-[24px]">
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[500px] px-5 text-center">
          <h1 className="text-[28px] md:text-[32px] font-bold text-white m-0 leading-tight" style={{textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'}}>
            Temukan Pekerjaan Impian Anda
          </h1>
          <p className="text-base font-normal m-0 tracking-wide" style={{color: 'rgba(255, 255, 255, 0.9)'}}>
            Connecting talents with opportunities
          </p>
        </div>
      </section>
    </div>
  )
}
