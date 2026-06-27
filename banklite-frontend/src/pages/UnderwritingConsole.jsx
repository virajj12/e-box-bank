import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function UnderwritingConsole() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetch(`/api/v1/loans/${id}`, {
            headers: { 'Authorization': localStorage.getItem('token') }
        }).then(r => r.json()).then(res => setLoan(res.data));
    }, [id]);

    const handleAction = async (actionType) => {
        await fetch(`/api/v1/loans/${id}/action`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({ action: actionType, comments })
        });
        navigate('/officer');
    };

    const getScoreColor = (score) => {
        if (score >= 700) return 'text-green-400';
        if (score >= 550) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getRiskLabel = (score) => {
        if (score >= 700) return 'Safe';
        if (score >= 550) return 'Medium';
        return 'High Risk';
    };

    if (!loan) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#e06143] rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button onClick={() => navigate('/officer')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold">Back to Queue</span>
            </button>

            <div className="bg-[#1c1c1c] p-8 border border-zinc-800 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white">Underwriting Console (Application #{loan.id})</h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-[#111111] border border-zinc-800 rounded-xl">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Customer Name</span>
                        <span className="text-white font-semibold">{loan.customer_name}</span>
                    </div>
                    <div className="p-4 bg-[#111111] border border-zinc-800 rounded-xl">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Credit Score</span>
                        <span className={`font-bold text-lg ${getScoreColor(loan.credit_score)}`}>{loan.credit_score}</span>
                        <span className="text-zinc-500 text-xs ml-2">({getRiskLabel(loan.credit_score)})</span>
                    </div>
                    <div className="p-4 bg-[#111111] border border-zinc-800 rounded-xl">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Requested Amount</span>
                        <span className="text-white font-semibold">₹{loan.amount?.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-[#111111] border border-zinc-800 rounded-xl">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Monthly Income</span>
                        <span className="text-white font-semibold">₹{loan.monthly_income?.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Underwriting Commentary (Mandatory)</label>
                    <textarea
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        className="w-full bg-[#111111] border border-zinc-700 text-white p-3 rounded-xl h-32 focus:border-[#e06143] focus:ring-1 focus:ring-[#e06143] focus:outline-none transition-all placeholder-zinc-600"
                        placeholder="Enter analysis..."
                    />
                </div>

                <div className="flex gap-4">
                    <button onClick={() => handleAction('approved')} disabled={!comments}
                        className="bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        Approve Loan
                    </button>
                    <button onClick={() => handleAction('rejected')} disabled={!comments}
                        className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        Reject Loan
                    </button>
                </div>
            </div>
        </div>
    );
}