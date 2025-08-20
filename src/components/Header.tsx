import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className='p-6 flex justify-between max-w-[1000px] mx-auto items-center'>
      <div><a href="/" className='text-3xl text-purple-200 font-bold'>multi</a></div>
      <div>
        <ul className='flex gap-10'>
          <li>
            <Link href={"/home"} className='block px-4 py-2 text-xl text-gray-200'>Home</Link>
          </li>
          <li>
            <Link href={"/home"} className='block px-4 py-2 text-xl text-gray-200'>Active chats</Link>
          </li>
          <li>
            <Link href={"/home"} className='block px-4 py-2 text-xl text-gray-200'>New Chat</Link>
          </li>
        </ul>
      </div>
      <div className='flex'>
        <Link href={"profile"}>profile</Link>
        <Link href={"profile"}>Logout</Link>
      </div>
    </div>
  )
}

export default Header