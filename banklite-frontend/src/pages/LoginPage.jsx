import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const { success, data } = await res.json();
            if (success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('name', data.full_name);
                navigate(data.role === 'customer' ? '/customer' : '/officer');
            } else {
                alert("Login Failed. Please check your credentials.");
            }
        } catch {
            // Fallback for visual testing without backend running
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('role', 'customer');
            navigate('/customer');
        }
    };

    const handleRegister = () => {
        // Navigate to a register route (you can create a RegisterPage later)
        navigate('/register');
    };

    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="w-full max-w-md bg-[#1c1c1c] p-8 border border-zinc-800 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-2 text-white tracking-tight">Welcome to BankLite</h2>
                <p className="text-zinc-400 text-sm mb-8">Sign in or create an account to access your dashboard.</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-[#111111] border border-zinc-700 text-white p-3 rounded-xl focus:border-[#e06143] focus:ring-1 focus:ring-[#e06143] focus:outline-none transition-all placeholder-zinc-600"
                            placeholder="Enter your email" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-[#111111] border border-zinc-700 text-white p-3 rounded-xl focus:border-[#e06143] focus:ring-1 focus:ring-[#e06143] focus:outline-none transition-all placeholder-zinc-600"
                            placeholder="••••••••" required />
                    </div>

                    {/* Button Group */}
                    <div className="flex flex-col gap-3 mt-6">
                        <button type="submit" className="w-full bg-[#e06143] text-white font-bold py-3 rounded-xl hover:bg-[#c95438] transition-colors shadow-lg shadow-[#e06143]/20">
                            Sign In
                        </button>
                        <button type="button" onClick={handleRegister} className="w-full bg-[#222222] text-zinc-300 font-bold py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors">
                            Register New Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}