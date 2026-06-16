import { PricingTable } from '@clerk/nextjs'
import React from 'react'
import Header from '../_components/Header'

function Pricing() {
  return (
    <div>
      <Header/>
    <main className=''>
    <div className="relative flex flex-col items-center justify-center w-full min-h-[calc(100dvh-4rem)] lg:min-h-[70vh] px-4 sm:px-6 py-8 sm:py-12 text-center">

    {/* Background Gradient */}
    <div className="absolute -top-32 sm:-top-48 lg:-top-60 left-1/2 -translate-x-1/2 h-[320px] w-[320px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px] rounded-full bg-blue-500 opacity-20 blur-3xl -z-10 pointer-events-none" />

    {/* Bottom left blob */}
    <div className="absolute -bottom-20 -left-20 sm:bottom-0 sm:left-10 lg:left-20 h-[240px] w-[240px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] rounded-full bg-purple-500 opacity-20 blur-3xl -z-10 pointer-events-none" />

      <h2 className='font-bold text-xl md:text-xl lg:text-3xl my-5'>Plans</h2>
      <div className="w-full max-w-5xl mx-auto px-2 gap-3 sm:px-4">
  <PricingTable />
</div>
    </div>
    </main>
    </div>
  )
}

export default Pricing