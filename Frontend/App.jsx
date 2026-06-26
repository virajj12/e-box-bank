import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import LoanApplicationForm from './pages/LoanApplicationForm';
import UnderwritingConsole from './pages/UnderwritingConsole';

// Simple wrapper to check token
const PrivateRoute = ({ children, allowedRole }) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/" />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
    return children;
};

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
                <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-red-600 tracking-tight">BankLite</h1>
                </nav>
                <main className="p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
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