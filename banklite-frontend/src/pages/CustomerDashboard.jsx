import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
    const [loans, setLoans] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);

    useEffect(() => {
        fetch('/api/v1/loans/my-applications', {
            headers: { 'Authorization': localStorage.getItem('token') }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) setLoans(res.data);
            }).catch(() => {
                setLoans([
                    { id: 101, amount: 25000, purpose: 'Home Loan', status: 'approved', credit_score: 740, monthly_income: 6500, created_at: '2026-06-20T10:00:00', audit: { officer_name: 'Bob Officer', action: 'approved', comments: 'Income verified. Good credit score.', timestamp: '2026-06-21T09:00:00' } },
                    { id: 102, amount: 5000, purpose: 'Personal Expense', status: 'pending', credit_score: 520, monthly_income: 3200, created_at: '2026-06-25T14:30:00' }
                ]);
            });
    }, []);

    const getRiskBadge = (score) => {
        if (score >= 700) return { label: 'Safe', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800' };
        if (score >= 550) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800' };
        return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-900/30 border-red-800' };
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-900/30 text-green-400 border-green-800';
            case 'rejected': return 'bg-red-900/30 text-red-400 border-red-800';
            default: return 'bg-[#36221c] text-[#d46b53] border-[#4a2e26]';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-400';
            case 'rejected': return 'text-red-400';
            default: return 'text-[#d46b53]';
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight">Loan Dashboard</h2>
                <Link to="/apply"
                    className="bg-[#e06143] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#c95438] transition-colors shadow-lg shadow-[#e06143]/20 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Apply for New Loan
                </Link>
            </div>

            <h3 className="text-xl font-bold mb-6 tracking-wide">My Applications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.length === 0 ? (
                    <p className="text-zinc-500">You have no loan applications yet.</p>
                ) : (
                    loans.map(loan => {
                        const risk = getRiskBadge(loan.credit_score);
                        return (
                            <div key={loan.id} className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                                <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#e06143] rounded-r-md"></div>
                                <div className="ml-3">
                                    <h4 className="font-bold text-lg mb-1">{loan.purpose}</h4>
                                    <p className="text-sm text-zinc-400 mb-2">Application #{loan.id} • ₹{loan.amount.toLocaleString()}</p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs text-zinc-500">Credit Score:</span>
                                        <span className={`text-sm font-bold ${risk.color}`}>{loan.credit_score}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${risk.bg} ${risk.color}`}>{risk.label}</span>
                                    </div>
                                    <div className="flex gap-3 mt-auto">
                                        <div className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold border ${getStatusStyle(loan.status)}`}>
                                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                        </div>
                                        <button onClick={() => setSelectedLoan(loan)}
                                            className="flex-1 bg-[#222222] text-zinc-300 rounded-lg py-2 text-center text-sm font-semibold border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Loan Details Modal ──────────────────────────────────────── */}
            {selectedLoan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedLoan(null)}>
                    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold">Application #{selectedLoan.id}</h3>
                                <p className="text-zinc-400 text-sm mt-1">{selectedLoan.purpose}</p>
                            </div>
                            <button onClick={() => setSelectedLoan(null)}
                                className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Requested Amount</span>
                                <span className="text-xl font-bold text-white">₹{selectedLoan.amount.toLocaleString()}</span>
                            </div>
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Monthly Income</span>
                                <span className="text-xl font-bold text-white">₹{selectedLoan.monthly_income?.toLocaleString() ?? '—'}</span>
                            </div>
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Credit Score</span>
                                <span className={`text-xl font-bold ${getRiskBadge(selectedLoan.credit_score).color}`}>
                                    {selectedLoan.credit_score}
                                </span>
                                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getRiskBadge(selectedLoan.credit_score).bg} ${getRiskBadge(selectedLoan.credit_score).color}`}>
                                    {getRiskBadge(selectedLoan.credit_score).label}
                                </span>
                            </div>
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status</span>
                                <span className={`text-xl font-bold ${getStatusTextColor(selectedLoan.status)}`}>
                                    {selectedLoan.status.charAt(0).toUpperCase() + selectedLoan.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 mb-4">
                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Applied On</span>
                            <span className="text-sm text-zinc-300">
                                {selectedLoan.created_at ? new Date(selectedLoan.created_at).toLocaleString() : '—'}
                            </span>
                        </div>

                        {/* ── Underwriting Decision Section ─────────────────── */}
                        {selectedLoan.audit ? (
                            <div className="border border-zinc-800 rounded-xl overflow-hidden mb-6">
                                <div className="bg-zinc-800/50 px-4 py-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm font-bold text-white">Underwriting Decision</span>
                                </div>
                                <div className="bg-[#111111] p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Officer</span>
                                        <span className="text-sm text-white font-semibold">{selectedLoan.audit.officer_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Decision</span>
                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                                            selectedLoan.audit.action === 'approved'
                                                ? 'bg-green-900/30 text-green-400 border-green-800'
                                                : 'bg-red-900/30 text-red-400 border-red-800'
                                        }`}>
                                            {selectedLoan.audit.action}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Date</span>
                                        <span className="text-sm text-zinc-300">{new Date(selectedLoan.audit.timestamp).toLocaleString()}</span>
                                    </div>
                                    {selectedLoan.audit.comments && (
                                        <div className="pt-2 border-t border-zinc-800">
                                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Officer Commentary</span>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{selectedLoan.audit.comments}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : selectedLoan.status === 'pending' ? (
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 mb-6 text-center">
                                <span className="text-zinc-500 text-sm">Awaiting underwriting review…</span>
                            </div>
                        ) : null}

                        <button onClick={() => setSelectedLoan(null)}
                            className="w-full bg-[#222222] text-zinc-300 font-bold py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}