import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import LoanApplicationForm from './pages/LoanApplicationForm';
import UnderwritingConsole from './pages/UnderwritingConsole';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children, allowedRole }) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
    return children;
};

// Slim Sidebar Component
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (!token) return null;

    const isHome = location.pathname === '/customer' || location.pathname === '/officer' || location.pathname.startsWith('/underwrite');
    const isApply = location.pathname === '/apply';
    const isProfile = location.pathname === '/profile';

    return (
        <aside className="w-20 bg-[#111111] border-r border-zinc-800 flex flex-col items-center py-6 h-screen sticky top-0 shrink-0">
            {/* Logo mark - Designer Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#e06143] to-[#c94530] rounded-xl flex items-center justify-center text-white mb-10 shadow-lg shadow-[#e06143]/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 11v6M15 11v6M5 7h14" />
                </svg>
            </div>

            {/* Nav Icons */}
            <nav className="flex flex-col gap-8 w-full items-center">
                <Link to={role === 'customer' ? '/customer' : '/officer'} className={`flex flex-col items-center gap-1 transition-colors ${isHome ? 'text-[#e06143]' : 'text-zinc-500 hover:text-white'}`}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l8 6v12h-5v-7H9v7H4V9l8-6z" /></svg>
                    <span className="text-[10px] font-semibold">Home</span>
                </Link>
                {role === 'customer' && (
                    <Link to="/apply" className={`flex flex-col items-center gap-1 transition-colors ${isApply ? 'text-[#e06143]' : 'text-zinc-500 hover:text-white'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[10px] font-semibold">Apply</span>
                    </Link>
                )}
                <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isProfile ? 'text-[#e06143]' : 'text-zinc-500 hover:text-white'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span className="text-[10px] font-semibold">Profile</span>
                </Link>
            </nav>

            {/* Bottom Logout */}
            <button onClick={handleLogout} className="mt-auto text-zinc-500 hover:text-white mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </aside>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex min-h-screen bg-[#111111] text-white font-sans">
                <Sidebar />
                <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-x-hidden">
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/customer" element={<PrivateRoute allowedRole="customer"><CustomerDashboard /></PrivateRoute>} />
                        <Route path="/apply" element={<PrivateRoute allowedRole="customer"><LoanApplicationForm /></PrivateRoute>} />
                        <Route path="/officer" element={<PrivateRoute allowedRole="credit_officer"><OfficerDashboard /></PrivateRoute>} />
                        <Route path="/underwrite/:id" element={<PrivateRoute allowedRole="credit_officer"><UnderwritingConsole /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}