import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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

            if (data.role === 'customer') navigate('/customer');
            else navigate('/officer');
        } else {
            alert("Login Failed");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" required />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">
                    Log In
                </button>
            </form>
        </div>
    );
}