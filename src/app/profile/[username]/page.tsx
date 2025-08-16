'use client'
import React, { use, useEffect, useState } from 'react'
import { FcEditImage } from 'react-icons/fc';
import {FaEdit, FaTimes, FaSave} from 'react-icons/fa'

type UserData = {
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  specific_color: string,
  image_url: string | null,
  bio: string | null
}

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
  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then(res => res.json())
      .then(res => {
        if (!res.success) {
          setError(res.message);
        }
        setUserData(res.data && res.data.user);
        setSelfProfile(res.data &&  res.data.self_profile)
        console.log(res);
        
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
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-red-200">
          {error}
        </div>
      </div>
    );

  if (!userData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="relative max-w-sm w-full">
          <div 
            className="absolute inset-0 rounded-3xl blur-xl opacity-30"
            style={{ backgroundColor: userData.specific_color }}
          ></div>
          
           <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {selfProfile &&  (<div className="absolute top-4 right-4">
              <button
                onClick={handleEditClick}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
              >
                <FaEdit className="w-4 h-4 text-white" />
              </button>
            </div>)}

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
                <p className="text-slate-400 text-xs mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Online</span>
                </div>
              </div>
            </div>
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
            
            {profileEditNote &&  (<div className="bg-red-500/20 border border-red-500/50 rounded-xl p-2 text-red-200">
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
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
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
    </>
  );
}

export default page