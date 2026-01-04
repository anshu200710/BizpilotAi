import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Topbar({
  heightDesktop = 52,
  heightMobile = 52,
}) {
  const { user } = useContext(AuthContext)

  // 🎨 Business theming
  const primary = user?.themeColor || '#dc2626'   // red
  const secondary = user?.secondaryColor || '#f5f0e6' // cream

  return (
    <header className="relative w-full overflow-hidden">

      {/* DROP ANIMATION */}
      <div className="animate-awningDrop">

        {/* STRIPES */}
        <div
          className="relative flex overflow-hidden transition-all duration-300"
          style={{
            height: `clamp(${heightMobile}px, 20vw, ${heightDesktop}px)`
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1 hidden md:block"
              style={{
                backgroundColor: i % 2 === 0 ? primary : secondary
              }}
            />
          ))}

          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex-1 md:hidden block"
              style={{
                backgroundColor: i % 2 === 0 ? primary : secondary
              }}
            />
          ))}

          {/* CENTER BOARD */}

          {/* <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative bg-white border border-black px-6 md:px-10 py-2 md:py-3 shadow-md">

              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-12 h-12 rounded-full bg-white border border-black flex items-center justify-center text-xs font-bold">
                  {user?.businessName?.[0] || 'B'}
                </div>
              </div>

              <h1 className="text-base md:text-xl font-mono text-black text-center">
                Welcome to {user?.businessName || 'Bizpilot'}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-600 text-center mt-1">
                {user?.email}
              </p>
            </div>
          </div> */}

        </div>

        {/* SCALLOPED BOTTOM */}
        <div className="flex w-full overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-b-full hidden md:block"
              style={{
                height: 'clamp(20px, 5vw, 48px)',
                backgroundColor: i % 2 === 0 ? primary : secondary
              }}
            />
          ))}
        </div>
        <div className="flex w-full overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-b-full md:hidden block"
              style={{
                height: 'clamp(20px, 5vw, 48px)',
                backgroundColor: i % 2 === 0 ? primary : secondary
              }}
            />
          ))}
        </div>

      </div>
    </header>
  )
}





