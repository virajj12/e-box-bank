import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
    const [loans, setLoans] = useState([]);
    const userName = localStorage.getItem('name');

    useEffect(() => {
        // Mock data fallback if backend isn't connected yet, otherwise fetch
        fetch('/api/v1/loans/my-applications', {
            headers: { 'Authorization': localStorage.getItem('token') }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) setLoans(res.data);
            }).catch(() => {
                // Fallback for visual testing
                setLoans([{ id: 101, amount: 25000, purpose: 'Home Loan', status: 'approved' }, { id: 102, amount: 5000, purpose: 'Personal Expense', status: 'pending' }])
            });
    }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight">Loan Dashboard</h2>
            </div>

            <h3 className="text-xl font-bold mb-6 tracking-wide">My Applications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.length === 0 ? (
                    <p className="text-zinc-500">You have no loan applications yet.</p>
                ) : (
                    loans.map(loan => (
                        <div key={loan.id} className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                            {/* Left Accent Bar matching the DSA sheets */}
                            <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#e06143] rounded-r-md"></div>

                            <div className="ml-3">
                                <h4 className="font-bold text-lg mb-1">{loan.purpose}</h4>
                                <p className="text-sm text-zinc-400 mb-6">Application #{loan.id} • ${loan.amount.toLocaleString()}</p>

                                <div className="flex gap-3 mt-auto">
                                    <div className="flex-1 bg-[#36221c] text-[#d46b53] rounded-lg py-2 text-center text-sm font-semibold border border-[#4a2e26]">
                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                    </div>
                                    <Link to={`/apply`} className="flex-1 bg-[#222222] text-zinc-300 rounded-lg py-2 text-center text-sm font-semibold border border-zinc-700 hover:bg-zinc-800 transition-colors">
                                        Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}