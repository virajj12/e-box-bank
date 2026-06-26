import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import LoanApplicationForm from './pages/LoanApplicationForm';
import UnderwritingConsole from './pages/UnderwritingConsole';

const PrivateRoute = ({ children, allowedRole }) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
    return children;
};

// Slim Sidebar Component mimicking TUF
const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (!role) return null; // Don't show sidebar on login page

    return (
        <aside className="w-20 bg-[#111111] border-r border-zinc-800 flex flex-col items-center py-6 h-screen sticky top-0 shrink-0">
            {/* Logo mark */}
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-xl text-white mb-10">
                B
            </div>

            {/* Nav Icons */}
            <nav className="flex flex-col gap-8 w-full items-center">
                <Link to={role === 'customer' ? '/customer' : '/officer'} className="flex flex-col items-center gap-1 text-[#e06143]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l8 6v12h-5v-7H9v7H4V9l8-6z" /></svg>
                    <span className="text-[10px] font-semibold">Home</span>
                </Link>
                <Link to={role === 'customer' ? '/apply' : '#'} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] font-semibold">Apply</span>
                </Link>
            </nav>

            {/* Bottom Profile/Logout */}
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
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}