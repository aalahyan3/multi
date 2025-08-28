'use client'
import Cookies from 'js-cookie'
import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import { User, LogOut, MessageSquare, Menu, X } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';

function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);

  async function logOut() {
    const res = await fetch("/api/auth/logout", { method: 'POST' });
    router.push("/");
    setIsMenuOpen(false);
  }

  useEffect(() => {
    setUser(Cookies.get("username") || null)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 z-50" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="sm:hidden bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="hidden sm:flex bg-white border border-purple-200 rounded-lg shadow-lg overflow-hidden">
        <Link 
          href="/chat"
          className={`flex items-center space-x-2 px-4 py-3 transition-colors border-r border-purple-100 ${
            pathname === '/chat' 
              ? 'bg-purple-100 text-purple-700 font-semibold' 
              : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <MessageSquare size={18} />
          <span className="font-medium">Chat</span>
        </Link>
        
        <Link 
          href={`/profile/${user}`}
          className={`flex items-center space-x-2 px-4 py-3 transition-colors border-r border-purple-100 ${
            pathname === `/profile/${user}` 
              ? 'bg-purple-100 text-purple-700 font-semibold' 
              : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <User size={18} />
          <span className="font-medium">Profile</span>
        </Link>
        
        <button 
          onClick={logOut}
          className="flex items-center space-x-2 px-4 py-3 hover:bg-red-50 transition-colors text-gray-700 hover:text-red-700"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden absolute top-12 right-0 bg-white border border-purple-200 rounded-lg shadow-xl min-w-48 overflow-hidden">
          <div className="py-2">
            <Link 
              href="/chat"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                pathname === '/chat' 
                  ? 'bg-purple-100 text-purple-700 font-semibold' 
                  : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <MessageSquare size={18} />
              <span className="font-medium">Chat</span>
            </Link>
            
            <Link 
              href={`/profile/${user}`}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                pathname === `/profile/${user}` 
                  ? 'bg-purple-100 text-purple-700 font-semibold' 
                  : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <User size={18} />
              <span className="font-medium">Profile</span>
            </Link>
            
            <div className="border-t border-purple-100 my-1"></div>
            
            <button 
              onClick={logOut}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-gray-700 hover:text-red-700 text-left"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header