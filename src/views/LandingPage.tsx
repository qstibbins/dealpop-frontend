export default function LandingPage() {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-500 text-white overflow-x-hidden">
      <div className="text-center max-w-4xl px-5 py-10 relative">
        <h1 className="text-6xl md:text-8xl font-black mb-5 tracking-tight drop-shadow-lg">
          DealPop
        </h1>
        <div className="text-2xl md:text-4xl font-bold text-green-400 mb-8 drop-shadow-md">
          Launching Fall 2025!
        </div>
        <p className="text-lg md:text-xl font-normal mb-5 opacity-95 leading-relaxed">
          If you love a deal, we'd love to connect!
        </p>
        <a 
          href="mailto:hello@dealpop.co?subject=Hello from DealPop Landing Page"
          className="inline-block text-xl md:text-2xl font-semibold text-white underline decoration-2 underline-offset-2 mb-10 transition-all duration-300 hover:text-yellow-300 hover:decoration-yellow-300 hover:-translate-y-0.5 cursor-pointer"
        >
          Introduce yourself here.
        </a>
        <p className="text-xl md:text-3xl font-bold drop-shadow-md mb-8">
          We're excited to meet you!
        </p>
        
        {/* Decorative arrow */}
        <svg className="absolute right-10 top-1/2 transform -translate-y-1/2 w-20 h-20 opacity-80 hidden md:block" viewBox="0 0 100 100">
          <path 
            className="stroke-red-500 stroke-2 fill-none stroke-dasharray-5 stroke-dashoffset-0 animate-pulse" 
            d="M20,60 Q40,40 60,60 Q80,80 85,75" 
          />
          <polygon className="fill-red-500" points="85,75 90,70 90,80" />
        </svg>
      </div>
    </div>
  );
}
