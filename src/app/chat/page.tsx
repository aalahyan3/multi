'use client'
import { error } from 'console';
import { div } from 'framer-motion/client';
import React , { useEffect, useState } from 'react'

// Define the UserData type
interface UserData {
  username: string;
  specific_color: string;
  image_url: string | null;
}

// --- Helper Component: SkeletonCard ---
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

// --- Helper Component: UserCard ---
interface UserCardProps {
  user: Partial<UserData>
}

const UserCard = ({ user }: UserCardProps) => {
  const { username = '...', specific_color = '#888', image_url } = user
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

  return (
    <div
      className="group relative flex items-center p-4 rounded-xl bg-black/20 backdrop-blur-lg border border-white/10
                 transition-all duration-300 ease-in-out
                 hover:bg-white/20 hover:border-white/20 hover:-translate-y-1"
    >
      {/* Background link for the entire card */}
      <a href="#" className="absolute inset-0 z-0 rounded-xl" aria-label={`View details for ${username}`}></a>

      {/* Content container, sits on top of the background link */}
      <div className="relative z-10 flex items-center w-full">
        <div className="flex-shrink-0 mr-4">
          {image_url ? (
            <img
              src={image_url}
              alt={username}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20 transition-all duration-300"
              style={{borderColor: specific_color}}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl 
                         ring-2 ring-white/20 group-hover:ring-current transition-all duration-300"
              style={{ 
                backgroundColor: specific_color,
                color: specific_color,
              }}
            >
              <span className="text-white">{getInitials(username)}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-100 group-hover:text-white transition-colors duration-300">
            {username}
          </h3>
          {/* Specific link for "View Profile" */}
          <a
            href={`/profile/${username}`}
            onClick={(e) => e.stopPropagation()} // Prevents the background link from firing
            className="relative z-20 text-sm text-gray-400 group-hover:text-indigo-300 transition-colors duration-300 hover:underline"
          >
            View Profile
          </a>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}



const USERS_PER_PAGE = 10;

async function handleSearch(
  q: string,
  setUsers: (users: Partial<UserData>[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (msg: string | null) => void
) {
  const query = q.trim();
  if (!query) return;

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
function SearchForUsers({query, setQuery, setUsers, setError, setLoading}:Props)
{
  return(
    <div className="p-4 mt-10 bg-purple-950 rounded-xl shadow-lg flex items-center gap-2 max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="flex-1 p-2 rounded-lg border border-purple-900 focus:outline-none focus:ring-2 focus:ring-violet-400 text-white bg-purple-800 opacity-80 placeholder-violet-300"
      />
      <button
        onClick={() => handleSearch(query, setUsers, setLoading, setError)}
        className="px-4  cursor-pointer py-2 bg-purple-700 hover:bg-violet-500 rounded-lg text-white font-semibold shadow-md transition-colors duration-200"
      >
        Search
      </button>
</div>

  )
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