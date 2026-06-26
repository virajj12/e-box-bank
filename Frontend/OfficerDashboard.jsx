import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function OfficerDashboard() {
    const [pendingLoans, setPendingLoans] = useState([]);

    useEffect(() => {
        fetch('/api/v1/loans/pending', {
            headers: { 'Authorization': localStorage.getItem('token') }
        }).then(r => r.json()).then(res => setPendingLoans(res.data || []));
    }, []);

    // Risk Calculation Logic
    const riskData = [
        { name: 'Safe (700+)', value: pendingLoans.filter(l => l.credit_score >= 700).length },
        { name: 'Medium (550-699)', value: pendingLoans.filter(l => l.credit_score >= 550 && l.credit_score < 700).length },
        { name: 'High Risk (<550)', value: pendingLoans.filter(l => l.credit_score < 550).length },
    ];
    const COLORS = ['#22c55e', '#eab308', '#ef4444']; // Tailwind Green, Yellow, Red

    return (
        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 bg-white p-6 border rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Pending Underwriting Queue</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-sm">
                            <th className="pb-2">ID</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Score</th>
                            <th className="pb-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingLoans.map(loan => (
                            <tr key={loan.id} className="border-t hover:bg-gray-50">
                                <td className="py-3">#{loan.id}</td>
                                <td className="py-3">${loan.amount.toLocaleString()}</td>
                                <td className="py-3 font-semibold">{loan.credit_score}</td>
                                <td className="py-3">
                                    <Link to={`/underwrite/${loan.id}`} className="text-blue-600 font-semibold hover:underline">
                                        Review Underwriting &rarr;
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="col-span-1 bg-white p-6 border rounded-lg shadow-sm flex flex-col items-center">
                <h2 className="text-lg font-bold mb-4">Risk Distribution</h2>
                <PieChart width={250} height={250}>
                    <Pie data={riskData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    );
}