import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoanApplicationForm() {
    const [amount, setAmount] = useState('');
    const [income, setIncome] = useState('');
    const [purpose, setPurpose] = useState('Home Loan');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/v1/loans/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({
                amount: Number(amount),
                monthly_income: Number(income),
                purpose: purpose
            })
        });

        if (res.ok) {
            navigate('/customer');
        } else {
            alert("Failed to submit application");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-6">
            {/* Back Button */}
            <button onClick={() => navigate('/customer')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold">Back to Dashboard</span>
            </button>

            <div className="bg-[#1c1c1c] p-8 border border-zinc-800 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Request New Loan</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Requested Amount (₹)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full bg-[#111111] border border-zinc-700 text-white p-3 rounded-xl focus:border-[#e06143] focus:ring-1 focus:ring-[#e06143] focus:outline-none transition-all placeholder-zinc-600"
                            placeholder="e.g. 50000" required min="100" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Monthly Income (₹)</label>
                        <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                            className="w-full bg-[#111111] border border-zinc-700 text-white p-3 rounded-xl focus:border-[#e06143] focus:ring-1 focus:ring-[#e06143] focus:outline-none transition-all placeholder-zinc-600"
                            placeholder="e.g. 7000" required min="0" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Loan Purpose</label>
                        <select value={purpose} onChange={e => setPurpose(e.target.value)}
                            className="w-full bg-[#111111] border border-zinc-700 text-white p-3 rounded-xl focus:border-[#e06143] focus:ring-1 focus:ring-[#e06143] focus:outline-none transition-all appearance-none">
                            <option>Home Loan</option>
                            <option>Auto Loan</option>
                            <option>Personal Expense</option>
                            <option>Business Capital</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-[#e06143] text-white font-bold py-3 mt-4 rounded-xl hover:bg-[#c95438] transition-colors shadow-lg shadow-[#e06143]/20">
                        Submit Application
                    </button>
                </form>
            </div>
        </div>
    );
}