'use client'
import Header from '@/components/Header';
import { error } from 'console';
import { div } from 'framer-motion/client';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React , { useEffect, useState } from 'react'


interface UserData {
  username: string;
  specific_color: string;
  image_url: string | null;
}

const SkeletonCard = () => {
  return (
    <div className="flex items-center p-4 rounded-xl bg-black/20 border border-white/10">
      <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse mr-4 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-white/10 animate-pulse"></div>
        <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse"></div>
      </div>
    </div>
  )
}

interface UserCardProps {
  user: Partial<UserData>
}

const UserCard = ({ user }: UserCardProps) => {
  const router = useRouter();
  const { username = '...', specific_color = '#888', image_url } = user;
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const  startChat  = async () => {
    const res = await fetch('/api/create_chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({username})
    }).then(res => res.json()).then( res =>
      router.push(`/chat/${res.data.id}`)
    );
  };

  return (
    <div
      className="group relative flex items-center p-4 rounded-xl bg-black/20 backdrop-blur-lg border border-white/10
                 transition-all duration-300 ease-in-out
                 hover:bg-white/20 hover:border-white/20 hover:-translate-y-1"
    >
      <div className="relative flex items-center w-full gap-4">
        <div className="flex-shrink-0">
          {image_url ? (
            <img
              src={image_url}
              alt={username}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20 transition-all duration-300"
              style={{ borderColor: specific_color }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl 
                         ring-2 ring-white/20 transition-all duration-300"
              style={{ backgroundColor: specific_color }}
            >
              {getInitials(username)}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-lg text-gray-100 group-hover:text-white transition-colors duration-300">
            {username}
          </h3>
          <a
            href={`/profile/${username}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-400 w-max group-hover:text-indigo-300 hover:underline transition-colors duration-300"
          >
            View Profile
          </a>
        </div>

        <button
          onClick={startChat}
          className="px-4 py-2 bg-pink-600 cursor-pointer hover:bg-violet-500 rounded-lg text-white font-semibold shadow-md transition-colors duration-500"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
};



const USERS_PER_PAGE = 10;

async function handleSearch(
  q: string,
  setUsers: (users: Partial<UserData>[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (msg: string | null) => void
) {
  const query = q.trim();
  // if (!query) return;

  setLoading(true);
  setError(null);

  try {
    const resp = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
    });

    if (!resp.ok) {
      const msg = `Search API error: ${resp.statusText}`;
      console.error(msg);
      setError(msg);
      setUsers([]);
      return;
    }

    const data = await resp.json();
    if (!data?.data?.length) {
      setError("No user was found");
    }
    setUsers(data.data || []);
    console.log(data.data);
    
  } catch (err) {
    console.error("Search request failed:", err);
    setError("Search request failed");
    setUsers([]);
  } finally {
    setLoading(false);
    // setError(null);
  }
}

interface Props {
  query: string;
  setQuery: (q: string) => void;
  setUsers: (q: Partial<UserData>[]) => void;
  setError: (q: string | null) => void;
  setLoading: (q: boolean) => void;
}
function SearchForUsers({query, setQuery, setUsers, setError, setLoading}) {
  const handleClear = () => {
    setQuery('');
    setUsers([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query.trim() || '', setUsers, setLoading, setError);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 to-violet-900/20 backdrop-blur-sm border border-purple-300/20 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-violet-600/10"></div>
          
          <div className="relative flex items-center p-2">
            <div className="flex items-center flex-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
              <Search className="ml-4 text-purple-300" size={20} />
              
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for users..."
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-purple-300/70 border-none outline-none focus:ring-0 text-lg"
              />
              
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mr-2 p-1 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="ml-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl blur opacity-20 -z-10"></div>
      </form>
    </div>
  );
}
function UserList() {
  const [users, setUsers] = useState<Partial<UserData>[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [query, setQuery] = useState<string>("");
  useEffect(() => {
    setLoading(true);


    fetch(`/api/users?page=${page}`).then(res => res.json()).then(res => {
      setLoading(false)
      if (!res.success)
          setError(res.message);
      else
      {
        if (res?.data?.users.length === 0)
            setError("No users for now")
        setUsers(res.data.users);
        setTotalPages(res.data.total_pages);
      }
    })

  }, [page]);
  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 font-sans">
      <Header />
      <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col min-h-screen">
        <header className="text-center mb-10">
          <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Explore Users
              </h1>
              <p className="text-indigo-300 mt-2">
                A list of our amazing community members.
              </p>
          </div>
          <SearchForUsers query={query} setQuery={setQuery} setUsers={setUsers} setError={setError} setLoading={setLoading}/>

        </header>
      

        {error ?
          
          <div className='mt-10 text-pink-100 p-4 border border-pink-900 rounded bg-[#c6005c3b] ounded text-md text-center '>{error}</div>
         :
         <>
         <main className="flex-grow space-y-4 mt-4">
          {loading
            ? [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
            : users?.map((user) => (
                <UserCard key={user.username} user={user} />
              ))}
        </main>

        <footer className="flex items-center justify-between mt-10 py-4">
            <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white font-semibold transition-colors duration-300
                           hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-indigo-300 font-medium">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white font-semibold transition-colors duration-300
                           hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </footer>
        </>
        }
        
      </div>
    </div>
  )
}

export default UserList