'use client'
import React, { useEffect } from 'react'

function page() {
    useEffect(()=>
    {
        fetch('/api/auth/check_user').then(res =>
          {
              console.log(res);
          }
        )
    })
  return (
    <div>page</div>
  )
}

export default page