'use client'
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useState } from "react";

export default function Home() {
    const [name, sName] = useState('');
    const [user,sUser]= useState('')
  const router = useRouter();

  
    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
      e.preventDefault();
      if (!/^[a-zA-Z0-9_]+$/.test(name.trim()))
          return ;
      if (!/^[a-zA-Z0-9]+$/.test(user.trim())) return;
      router.push(`/room/${name.trim()}?user=${user.trim()}`);
    }
  return (
    <div className="p-10">
      <div className="m-auto w-1/2 text-center mt-50">
        <h1 className="text-3xl">Create or join room</h1>
        <form onSubmit={(e)=> {handleSubmit(e)}} className="mt-10 flex gap-1" >
          <input onChange={(e)=>{sName(e.target.value)}} type="text" placeholder="identfier..." className="border px-2  py-1 rounded text-gray-600" required/>
            <input onChange={(e)=>{sUser(e.target.value)}} type="text" placeholder="username..." className="border px-2  py-1 rounded text-gray-600" required/>
            <button type="submit" className="bg-green-600 text-white p-1 rounded border border-green-900
            cursor-pointer">Create</button>
        </form>
      </div>
    </div>
  );
}
