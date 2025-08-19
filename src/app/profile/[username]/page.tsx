'use client'
import React, { use, useEffect, useState } from 'react'
import { FcEditImage } from 'react-icons/fc';
import {FaEdit, FaTimes, FaSave} from 'react-icons/fa'
import { useRouter } from 'next/navigation';
import { UserData } from '../../types/UserType';
import Header from '@/components/Header'
import Head from 'next/head';
// type UserData = {
//   username: string,
//   email: string,
//   first_name: string,
//   last_name: string,
//   specific_color: string,
//   image_url: string | null,
//   bio: string | null
//   last_seen: Date
// }

interface PageProps {
  params: Promise<{ username: string }>;
}


function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}



function timeAgo(lastSeen: string | Date): string {
  const date = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 3) return "Online";
  if (diffMin < 60) return ` ${diffMin} minutes ago`;
  if (diffHours < 24) return ` ${diffHours} hours ago`;
  return `${diffDays} days ago`;
}



function parsePayload(data: Partial<UserData>) {
  if (!data.username) throw new Error("username is required");
  if (data.username.length < 4 || data.username.length > 15)
    throw new Error("username length must be 4-15 characters");
  if (!/^[a-z0-9._-]+$/.test(data.username))
    throw new Error("username can only contain a-z, 0-9, ., _, -");
  if (!data.first_name) throw new Error("first name is required");
  if (data.first_name.length < 1 || data.first_name.length > 50)
    throw new Error("first name length must be 1-50 characters");

  if (!data.last_name) throw new Error("last name is required");
  if (data.last_name.length < 1 || data.last_name.length > 50)
    throw new Error("last name length must be 1-50 characters");

  if (data.bio && data.bio.length > 150)
    throw new Error("bio must not exceed 150 characters")

  if (data.image_url && !isValidUrl(data.image_url))
    throw new Error("image url is invalid");
}

function page({params}: PageProps) {
  const {username} = use(params);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<UserData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selfProfile, setSelfProfile] = useState(false);
  const [profileEditNote, setProfileEditNote] = useState('');
  const [changeMadeOnEdit, setChangeMadeOnEdit] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  

  const router = useRouter();



  
  useEffect(() => {
    if (!userData?.last_seen) return;
  
    const date = new Date(userData.last_seen);
    const diffMin = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
  
    setIsOnline(diffMin < 3);
  }, [userData?.last_seen]);
  

  useEffect(() => {
    fetch("/api/last_seen", { method: "POST" }).catch(console.error);
  }, []);
  
  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then(res => res.json())
      .then(res => {
        if (!res.success) {
          setError(res.message);
        }
        setUserData(res.data && res.data.user);
        setSelfProfile(res.data &&  res.data.self_profile)
      })
  }, [username]);

  const handleEditClick = () => {
    if (userData) {
      setEditData({
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        specific_color: userData.specific_color,
        image_url: userData.image_url,
        bio: userData.bio
      });
      setShowEditModal(true);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      parsePayload(editData);
      const response = await fetch(`/api/profile/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
        
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUserData(prev => prev ? {...prev, ...editData} : null);
        setShowEditModal(false);
        setError(null);
        setChangeMadeOnEdit(false);
        // window.location.href = `/profile/${editData.username}`; //refresh page 
        router.push(`/profile/${editData.username}`); // smooth 
      } else {
        setError(result.message);
      }
    } catch (err) {
      setProfileEditNote(err.message)
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    const newEditData = {
      ...editData,
      [field]: value
    };
    
    setEditData(newEditData);
    
    setChangeMadeOnEdit(
      !!userData && (
        userData.bio !== newEditData.bio ||
        userData.username !== newEditData.username ||
        userData.first_name !== newEditData.first_name ||
        userData.last_name !== newEditData.last_name ||
        userData.image_url !== newEditData.image_url ||
        userData.specific_color !== newEditData.specific_color
      )
    );
  };

  if (!userData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 flex-col gap-4">
        {error && (
        <div className="z-50 bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4 text-red-200 shadow-2xl animate-slide-in max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-red-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-0 rounded-3xl blur-xl opacity-30 bg-slate-500"></div>
          
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-2xl bg-white/10 animate-pulse shadow-xl border-2 border-white/20"></div>
              </div>
              
              <div className="h-8 w-48 bg-white/10 rounded-xl animate-pulse mb-2"></div>
              
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-5 w-20 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 mb-6 w-full">
                <div className="h-4 w-40 bg-white/10 rounded animate-pulse mx-auto"></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="w-1 h-4 bg-white/20 rounded-full mr-3 animate-pulse"></div>
                <div className="h-5 w-12 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="pl-4 space-y-2">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="h-4 w-12 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="h-3 w-10 bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="h-4 w-12 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    );

  return (
    <div className=' min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 '>
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="relative max-w-sm w-full">
          <div 
            className="absolute inset-0 rounded-3xl blur-xl opacity-30"
            style={{ backgroundColor: userData?.specific_color }}
          ></div>
          
           <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {selfProfile &&  (<div className="absolute top-4 right-4">
              <button
                onClick={handleEditClick}
                className="p-2 cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl text-center transition-colors border border-white/20"
              >
                <FaEdit className="w-4 h-4 text-white mx-auto" />
              </button>
            </div>)}

            {userData ? (
              <>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative mb-6">
                    {userData.image_url ? (
                      <img 
                        src={userData.image_url}
                        alt={userData.first_name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-xl border-2"
                        style={{ borderColor: userData.specific_color }}
                      />
                    ) : (
                      <div 
                        className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl border-2"
                        style={{ backgroundColor: userData.specific_color, borderColor: userData.specific_color }}
                      >
                        {userData.first_name.charAt(0)}{userData.last_name.charAt(0)}
                      </div>
                    )}
                    <div 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-slate-800"
                      style={{ backgroundColor: userData.specific_color }}
                    ></div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {userData.first_name} {userData.last_name}
                  </h1>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-slate-300">@{userData.username}</span>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: userData.specific_color }}
                    ></div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 mb-6">
                    <p className="text-slate-300 text-sm">{userData.email}</p>
                  </div>
                </div>

                {userData.bio && (
                  <div className="mb-6 ">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-1 h-4 rounded-full mr-3"
                        style={{ backgroundColor: userData.specific_color }}
                      ></div>
                      <h3 className="text-white font-medium">About</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed break-words pl-4 ">
                      {userData.bio}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-slate-400 text-xs mb-1">Theme Color</p>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: userData.specific_color }}
                      ></div>
                      <span className="text-white text-sm font-mono">
                        {userData.specific_color}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-slate-400 text-xs mb-1">Last Seen</p>
                    <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} ></div>
                      <span className="text-white text-sm">{timeAgo(userData.last_seen)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-6"></div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-xl font-semibold animate-pulse">
                  Loading your profile...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && selfProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FaTimes className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            {profileEditNote &&  (<div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
              {profileEditNote}
            </div>)}

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={editData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profile Image URL</label>
                <input
                  type="url"
                  value={editData.image_url || ''}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Theme Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={editData.specific_color || '#6366f1'}
                    onChange={(e) => handleInputChange('specific_color', e.target.value)}
                    className="w-12 h-12 rounded-xl border border-slate-600 bg-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editData.specific_color || ''}
                    onChange={(e) => handleInputChange('specific_color', e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !changeMadeOnEdit}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4 text-red-200 shadow-2xl animate-slide-in max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-red-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-float {
          animation: float var(--duration, 4s) ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
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
      `}</style>
    </div>
  );
}

export default page