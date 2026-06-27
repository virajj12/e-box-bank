import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetch('/api/v1/auth/profile', {
            headers: { 'Authorization': localStorage.getItem('token') }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) setProfile(res.data);
            })
            .catch(() => {
                setProfile({
                    id: 1,
                    full_name: localStorage.getItem('name') || 'User',
                    email: 'user@banklite.com',
                    role: role || 'customer',
                });
            });
    }, [role]);

    if (!profile) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#e06143] rounded-full animate-spin"></div>
        </div>
    );

    const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="max-w-2xl mx-auto mt-6">
            {/* Back Button */}
            <button onClick={() => navigate(role === 'customer' ? '/customer' : '/officer')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold">Back to Dashboard</span>
            </button>

            <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl p-8">
                {/* Avatar + Name Header */}
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-zinc-800">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e06143] to-[#c94530] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#e06143]/20">
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{profile.full_name}</h2>
                        <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#e06143]/15 text-[#e06143] border border-[#e06143]/30">
                            {profile.role === 'credit_officer' ? 'Credit Officer' : 'Customer'}
                        </span>
                    </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-5">
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">User ID</span>
                        <span className="text-white font-semibold">#{profile.id}</span>
                    </div>
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name</span>
                        <span className="text-white font-semibold">{profile.full_name}</span>
                    </div>
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address</span>
                        <span className="text-white font-semibold">{profile.email}</span>
                    </div>
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Account Role</span>
                        <span className="text-white font-semibold">{profile.role === 'credit_officer' ? 'Credit Officer' : 'Customer'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
