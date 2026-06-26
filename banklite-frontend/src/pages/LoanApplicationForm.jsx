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
        <div className="max-w-lg mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Request New Loan</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Requested Amount ($)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50" required min="100" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Monthly Income ($)</label>
                    <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50" required min="0" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Loan Purpose</label>
                    <select value={purpose} onChange={e => setPurpose(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50">
                        <option>Home Loan</option>
                        <option>Auto Loan</option>
                        <option>Personal Expense</option>
                        <option>Business Capital</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 mt-4 rounded hover:bg-red-700 transition">
                    Submit Application
                </button>
            </form>
        </div>
    );
}