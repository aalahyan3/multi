import Link from 'next/link'
import React from 'react'
import { FcGoogle } from 'react-icons/fc'

function page() {
  return (
    <div className='p-10 mx-auto max-w-[800px]  mt-60 rounded text-center'>
      <h1 className='text-3xl'>Welcome to multi</h1>
      <a href="/api/auth/google" className='text-xl p-2 mt-10 border border-gray-300 bg-gray-100 flex gap-2 items-center justify-center hover:bg-gray-200 transition-all rounded' ><FcGoogle className='block'/><span className='block text-blue-950'>Authenticate via Google</span> </a>
    </div>
  )
}

export default page