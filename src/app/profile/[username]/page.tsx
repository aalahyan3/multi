'use client'
import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaTimes, FaSave, FaUser, FaPalette, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { UserData } from '../../types/UserType';

// --- Helper Functions (No changes needed) ---

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

    if (diffMin < 3) return "Online";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}

function parsePayload(data: Partial<UserData>) {
    if (!data.username) throw new Error("Username is required");
    if (data.username.length < 4 || data.username.length > 15) throw new Error("Username must be 4-15 characters");
    if (!/^[a-z0-9._-]+$/.test(data.username)) throw new Error("Username can only contain a-z, 0-9, ., _, -");
    if (!data.first_name) throw new Error("First name is required");
    if (data.first_name.length < 1 || data.first_name.length > 50) throw new Error("First name must be 1-50 characters");
    if (!data.last_name) throw new Error("Last name is required");
    if (data.last_name.length < 1 || data.last_name.length > 50) throw new Error("Last name must be 1-50 characters");
    if (data.bio && data.bio.length > 150) throw new Error("Bio must not exceed 150 characters");
    if (data.image_url && !isValidUrl(data.image_url)) throw new Error("Image URL is invalid");
}


// --- UI Components ---
const UserProfile = ({ userData, onEditClick, selfProfile }) => {
  const isOnline = new Date(userData.last_seen).getTime() > Date.now() - 3 * 60 * 1000;
  return (
      // Changed max-w-md to max-w-lg
      <div className="relative w-full max-w-lg">
        <div 
          className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 animate-pulse"
          style={{ 
            backgroundColor: userData?.specific_color,
            animationDuration: '5s'
          }}
        ></div>
        
         {/* Changed p-10 to p-12 */}
         <div className="relative bg-slate-900/70 backdrop-blur-xl rounded-3xl p-12 border border-white/5 shadow-2xl">
          {selfProfile && (
            <div className="absolute top-6 right-6">
              <button
                onClick={onEditClick}
                className="flex items-center space-x-2 px-4 py-2 cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white transition-colors border border-white/10 shadow-lg"
              >
                <FaEdit className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}

          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <img 
                  src={userData.image_url || `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=random`}
                  alt={userData.first_name}
                  className="w-28 h-28 rounded-2xl object-cover shadow-xl border-4"
                  style={{ borderColor: userData.specific_color }}
                />
              <div 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-slate-900"
                style={{ backgroundColor: userData.specific_color }}
              ></div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-1">
              {userData.first_name} {userData.last_name}
            </h1>
            
            <p className="text-purple-300 mb-4">@{userData.username}</p>
            
            <p className="text-slate-400 text-sm">{userData.email}</p>
          </div>

          <hr className="border-t border-white/10 my-8" />
          
          {userData.bio && (
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <FaUser className="w-4 h-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-200">About</h3>
              </div>
              <p className="text-slate-300 text-base leading-relaxed">
                {userData.bio}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FaPalette className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Theme Color</p>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: userData.specific_color }}
                  ></div>
                  <span className="text-white text-sm font-mono uppercase">
                    {userData.specific_color}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FaClock className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
                  <span className="text-white text-sm">{isOnline ? 'Online' : timeAgo(userData.last_seen)}</span>
                </div>
              </div>
            </div>
          </div>
      </div>
      </div>
  );
};

const LoadingSkeleton = () => (
  // Changed max-w-md to max-w-lg
  <div className="relative w-full max-w-lg">
      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-slate-600 animate-pulse"></div>
      {/* Changed p-10 to p-12 */}
      <div className="relative bg-slate-900/70 backdrop-blur-xl rounded-3xl p-12 border border-white/5 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-2xl bg-slate-800 animate-pulse"></div>
              </div>
              <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-slate-800 rounded-lg animate-pulse mb-4"></div>
              <div className="h-5 w-56 bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
          <hr className="border-t border-white/10 my-8" />
          <div className="mb-8">
              <div className="h-6 w-24 bg-slate-800 rounded-lg animate-pulse mb-4"></div>
              <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-800 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-slate-800 rounded-lg animate-pulse"></div>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-slate-800 rounded-xl animate-pulse"></div>
              <div className="h-20 bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
      </div>
  </div>
);


const EditModal = ({ show, onClose, onSave, editData, onInputChange, isLoading, changeMade, profileEditNote }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl p-8 w-full max-w-lg border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {profileEditNote && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 mb-4 text-sm">
                {profileEditNote}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input type="text" value={editData.first_name || ''} onChange={(e) => onInputChange('first_name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input type="text" value={editData.last_name || ''} onChange={(e) => onInputChange('last_name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input type="text" value={editData.username || ''} onChange={(e) => onInputChange('username', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profile Image URL</label>
                <input type="url" value={editData.image_url || ''} onChange={(e) => onInputChange('image_url', e.target.value)} placeholder="https://example.com/image.jpg" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea value={editData.bio || ''} onChange={(e) => onInputChange('bio', e.target.value)} rows={3} placeholder="Tell us about yourself..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"/>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Theme Color</label>
                <div className="flex items-center space-x-3">
                  <input type="color" value={editData.specific_color || '#d946ef'} onChange={(e) => onInputChange('specific_color', e.target.value)} className="w-12 h-12 p-1 rounded-lg border-2 border-slate-700 bg-slate-800 cursor-pointer"/>
                  <input type="text" value={editData.specific_color || ''} onChange={(e) => onInputChange('specific_color', e.target.value)} placeholder="#d946ef" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"/>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">Cancel</button>
              <button onClick={onSave} disabled={isLoading || !changeMade} className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/50">
                {isLoading ? ( <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> ) : ( <> <FaSave className="w-4 h-4" /> <span>Save Changes</span> </> )}
              </button>
            </div>
          </div>
        </div>
    );
};



const ErrorMessage = ({ message }) => (
    <div className="fixed top-5 right-5 z-50 bg-red-900/70 backdrop-blur-lg border border-red-500/50 rounded-xl p-4 text-red-200 shadow-2xl animate-slide-in max-w-sm">
        <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-red-500/30 rounded-full flex-shrink-0 mt-0.5">
                <FaExclamationTriangle className="w-4 h-4 text-red-300"/>
            </div>
            <div className="text-sm">{message}</div>
        </div>
    </div>
);

// --- Main Page Component ---

function Page({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<Partial<UserData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [selfProfile, setSelfProfile] = useState(false);
    const [profileEditNote, setProfileEditNote] = useState('');
    const [changeMadeOnEdit, setChangeMadeOnEdit] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetch("/api/last_seen", { method: "POST" }).catch(console.error);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/profile/${username}`)
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setError(res.message);
                    setUserData(null); // Clear user data on error
                } else {
                    setUserData(res.data.user);
                    setSelfProfile(res.data.self_profile);
                    setError(null); // Clear previous errors
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Failed to connect to the server.");
            })
            .finally(() => setIsLoading(false));
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
            setProfileEditNote(''); // Clear old modal errors
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setProfileEditNote(''); // Clear previous error note
        try {
            parsePayload(editData);
            const response = await fetch(`/api/profile/${username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            const result = await response.json();
            if (result.success) {
                setShowEditModal(false);
                setChangeMadeOnEdit(false);
                // If username was changed, router.push will fetch the new profile data
                if (username !== editData.username) {
                    router.push(`/profile/${editData.username}`);
                } else {
                    // Otherwise, just update the state locally for instant feedback
                    setUserData(prev => prev ? { ...prev, ...editData } as UserData : null);
                }
            } else {
                setProfileEditNote(result.message);
            }
        } catch (err) {
            setProfileEditNote(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof UserData, value: string) => {
        const newEditData = { ...editData, [field]: value };
        setEditData(newEditData);
        setChangeMadeOnEdit(
            !!userData && Object.keys(newEditData).some(key => userData[key] !== newEditData[key])
        );
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans flex items-center justify-center p-4'>
            
            {isLoading && !userData ? (
                <LoadingSkeleton />
            ) : userData ? (
                <UserProfile userData={userData} onEditClick={handleEditClick} selfProfile={selfProfile} />
            ) : (
                error && <div className="text-white text-center bg-slate-800 p-8 rounded-2xl">{error}</div>
            )}
            
            {error && <ErrorMessage message={error} />}

            {selfProfile && (
                 <EditModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSave}
                    editData={editData}
                    onInputChange={handleInputChange}
                    isLoading={isLoading}
                    changeMade={changeMadeOnEdit}
                    profileEditNote={profileEditNote}
                />
            )}
           
            <style jsx global>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out forwards;
                }
                /* Consider adding this to your globals.css or main layout instead */
                body {
                  font-family: 'Inter', sans-serif;
                }
            `}</style>
             {/* For the font, add this to your main HTML file's <head> section:
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            */}
        </div>
    );
}

export default Page;