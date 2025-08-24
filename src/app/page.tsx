'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'

function page() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()


  useEffect(()=>
  {
    fetch('/api/auth/check_user', {method: 'GET'}).then(res => res.json()).then(
      res => {
        console.log(res);
        
          if (res.success)
            router.push("/chat");
      }
    )
  })
  const handleGoogleAuth = (e:any) => {
    setIsLoading(true)
    // The navigation will happen automatically via href
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-10 animate-spin-slow"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float particle-${i}`}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-10">
        <div className="max-w-sm sm:max-w-md w-full">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl transition-shadow duration-500 hover:shadow-cyan-500/25">
            
            {/* Logo/Brand area */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl mb-4 sm:mb-6 shadow-lg animate-bounce-gentle">
                <span className="text-xl sm:text-2xl font-bold text-white">M</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2 animate-gradient-x">
                Welcome to Multi
              </h1>
              
              <p className="text-white/70 text-base sm:text-lg">
                Your gateway to seamless collaboration
              </p>
            </div>

            {/* Google auth button */}
            <a 
              href="/api/auth/google" 
              onClick={handleGoogleAuth}
              className={`group relative w-full flex items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:from-white/30 hover:to-white/20 hover:border-white/50 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-1 hover:scale-105 active:scale-95 ${isLoading ? 'pointer-events-none opacity-75' : ''}`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
              
              {/* Loading spinner or Google icon */}
              {isLoading ? (
                <div className="relative z-10 p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-lg">
                  <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                </div>
              ) : (
                <div className="relative z-10 p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <FcGoogle className="text-xl sm:text-2xl" />
                </div>
              )}
              
              <span className="relative z-10 group-hover:text-cyan-300 transition-colors duration-300">
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </span>
              
              {/* Subtle arrow indicator - hidden when loading */}
              {!isLoading && (
                <div className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white/70 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </a>

            {/* Footer text */}
            <p className="text-center text-white/50 text-xs sm:text-sm mt-4 sm:mt-6">
              Secure authentication powered by Google
            </p>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.5}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float var(--duration, 4s) ease-in-out infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-shimmer {
          animation: shimmer 1s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        /* Predefined particle positions to avoid hydration mismatch */
        .particle-0 { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 4s; }
        .particle-1 { left: 80%; top: 10%; animation-delay: 0.5s; animation-duration: 5s; }
        .particle-2 { left: 30%; top: 70%; animation-delay: 1s; animation-duration: 3.5s; }
        .particle-3 { left: 90%; top: 60%; animation-delay: 1.5s; animation-duration: 4.5s; }
        .particle-4 { left: 15%; top: 40%; animation-delay: 2s; animation-duration: 6s; }
        .particle-5 { left: 70%; top: 80%; animation-delay: 0.2s; animation-duration: 3.8s; }
        .particle-6 { left: 50%; top: 15%; animation-delay: 1.2s; animation-duration: 4.2s; }
        .particle-7 { left: 25%; top: 90%; animation-delay: 0.8s; animation-duration: 5.2s; }
        .particle-8 { left: 85%; top: 35%; animation-delay: 2.5s; animation-duration: 3.2s; }
        .particle-9 { left: 40%; top: 50%; animation-delay: 0.3s; animation-duration: 4.8s; }
        .particle-10 { left: 60%; top: 25%; animation-delay: 1.8s; animation-duration: 5.5s; }
        .particle-11 { left: 20%; top: 65%; animation-delay: 0.7s; animation-duration: 3.3s; }
        .particle-12 { left: 75%; top: 45%; animation-delay: 2.2s; animation-duration: 4.7s; }
        .particle-13 { left: 35%; top: 85%; animation-delay: 1.3s; animation-duration: 6.2s; }
        .particle-14 { left: 95%; top: 75%; animation-delay: 0.9s; animation-duration: 3.9s; }
        .particle-15 { left: 45%; top: 30%; animation-delay: 2.8s; animation-duration: 4.3s; }
        .particle-16 { left: 65%; top: 55%; animation-delay: 0.4s; animation-duration: 5.8s; }
        .particle-17 { left: 5%; top: 5%; animation-delay: 1.6s; animation-duration: 3.6s; }
        .particle-18 { left: 55%; top: 95%; animation-delay: 2.3s; animation-duration: 4.9s; }
        .particle-19 { left: 78%; top: 18%; animation-delay: 0.6s; animation-duration: 5.3s; }
      `}</style>
    </div>
  )
}

export default page