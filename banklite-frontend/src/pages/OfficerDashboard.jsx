import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function OfficerDashboard() {
    const [pendingLoans, setPendingLoans] = useState([]);
    const [historyLoans, setHistoryLoans] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/v1/loans/pending', { headers: { 'Authorization': token } })
            .then(r => r.json()).then(res => setPendingLoans(res.data || []));
        fetch('/api/v1/loans/history', { headers: { 'Authorization': token } })
            .then(r => r.json()).then(res => setHistoryLoans(res.data || []));
    }, []);

    const riskData = [
        { name: 'Safe (700+)', value: pendingLoans.filter(l => l.credit_score >= 700).length },
        { name: 'Medium (550-699)', value: pendingLoans.filter(l => l.credit_score >= 550 && l.credit_score < 700).length },
        { name: 'High Risk (<550)', value: pendingLoans.filter(l => l.credit_score < 550).length },
    ];
    const COLORS = ['#22c55e', '#eab308', '#ef4444'];

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

    return (
        <div className="space-y-8">
            {/* Top Row: Pending Queue + Risk Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#1c1c1c] p-6 border border-zinc-800 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6 text-white border-b border-zinc-800 pb-3">Pending Underwriting Queue</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-zinc-500 text-sm">
                                <th className="pb-3">ID</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Credit Score</th>
                                <th className="pb-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingLoans.map(loan => (
                                <tr key={loan.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="py-3 text-zinc-300">#{loan.id}</td>
                                    <td className="py-3 text-zinc-300">₹{loan.amount.toLocaleString()}</td>
                                    <td className={`py-3 font-bold ${getScoreColor(loan.credit_score)}`}>{loan.credit_score}</td>
                                    <td className="py-3">
                                        <Link to={`/underwrite/${loan.id}`} className="text-[#e06143] font-semibold hover:underline">
                                            Review Underwriting &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {pendingLoans.length === 0 && (
                                <tr><td colSpan="4" className="py-6 text-center text-zinc-500">No pending applications.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="lg:col-span-1 bg-[#1c1c1c] p-6 border border-zinc-800 rounded-2xl flex flex-col items-center">
                    <h2 className="text-lg font-bold mb-4 text-white">Risk Distribution</h2>
                    <PieChart width={250} height={250}>
                        <Pie data={riskData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                            {riskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                        <Legend wrapperStyle={{ color: '#aaa' }} />
                    </PieChart>
                </div>
            </div>

            {/* Decision History Section */}
            <div className="bg-[#1c1c1c] p-6 border border-zinc-800 rounded-2xl">
                <h2 className="text-xl font-bold mb-6 text-white border-b border-zinc-800 pb-3">Decision History</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-zinc-500 text-sm">
                            <th className="pb-3">ID</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Credit Score</th>
                            <th className="pb-3">Decision</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyLoans.map(loan => (
                            <tr key={loan.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                                <td className="py-3 text-zinc-300">#{loan.id}</td>
                                <td className="py-3 text-zinc-300">{loan.customer_name}</td>
                                <td className="py-3 text-zinc-300">₹{loan.amount.toLocaleString()}</td>
                                <td className={`py-3 font-bold ${getScoreColor(loan.credit_score)}`}>{loan.credit_score}</td>
                                <td className="py-3">
                                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                                        loan.status === 'approved'
                                            ? 'bg-green-900/30 text-green-400 border-green-800'
                                            : 'bg-red-900/30 text-red-400 border-red-800'
                                    }`}>
                                        {loan.status}
                                    </span>
                                </td>
                                <td className="py-3 text-zinc-500 text-sm">{new Date(loan.created_at).toLocaleDateString()}</td>
                                <td className="py-3">
                                    <button onClick={() => setSelectedHistory(loan)}
                                        className="text-[#e06143] font-semibold text-sm hover:underline cursor-pointer">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {historyLoans.length === 0 && (
                            <tr><td colSpan="7" className="py-6 text-center text-zinc-500">No decisions made yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── History Detail Modal ────────────────────────────────────── */}
            {selectedHistory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedHistory(null)}>
                    <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold">Application #{selectedHistory.id}</h3>
                                <p className="text-zinc-400 text-sm mt-1">{selectedHistory.purpose}</p>
                            </div>
                            <button onClick={() => setSelectedHistory(null)}
                                className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Customer</span>
                                <span className="text-white font-semibold">{selectedHistory.customer_name}</span>
                            </div>
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Amount</span>
                                <span className="text-white font-semibold">₹{selectedHistory.amount.toLocaleString()}</span>
                            </div>
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Monthly Income</span>
                                <span className="text-white font-semibold">₹{selectedHistory.monthly_income?.toLocaleString() ?? '—'}</span>
                            </div>
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
                                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Credit Score</span>
                                <span className={`font-bold text-lg ${getScoreColor(selectedHistory.credit_score)}`}>{selectedHistory.credit_score}</span>
                                <span className="text-zinc-500 text-xs ml-2">({getRiskLabel(selectedHistory.credit_score)})</span>
                            </div>
                        </div>

                        {/* Underwriting Decision */}
                        {selectedHistory.audit ? (
                            <div className="border border-zinc-800 rounded-xl overflow-hidden mb-6">
                                <div className="bg-zinc-800/50 px-4 py-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm font-bold text-white">Underwriting Decision</span>
                                </div>
                                <div className="bg-[#111111] p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Reviewed By</span>
                                        <span className="text-sm text-white font-semibold">{selectedHistory.audit.officer_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Decision</span>
                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                                            selectedHistory.audit.action === 'approved'
                                                ? 'bg-green-900/30 text-green-400 border-green-800'
                                                : 'bg-red-900/30 text-red-400 border-red-800'
                                        }`}>
                                            {selectedHistory.audit.action}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Reviewed On</span>
                                        <span className="text-sm text-zinc-300">{new Date(selectedHistory.audit.timestamp).toLocaleString()}</span>
                                    </div>
                                    {selectedHistory.audit.comments && (
                                        <div className="pt-2 border-t border-zinc-800">
                                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Officer Commentary</span>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{selectedHistory.audit.comments}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 mb-6 text-center">
                                <span className="text-zinc-500 text-sm">No audit record found.</span>
                            </div>
                        )}

                        <button onClick={() => setSelectedHistory(null)}
                            className="w-full bg-[#222222] text-zinc-300 font-bold py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}