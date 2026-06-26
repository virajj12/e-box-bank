import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
    const [loans, setLoans] = useState([]);
    const userName = localStorage.getItem('name');

    useEffect(() => {
        fetch('/api/v1/loans/my-applications', {
            headers: { 'Authorization': localStorage.getItem('token') }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) setLoans(res.data);
            });
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {userName}</h2>
                <Link to="/apply" className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition shadow-sm">
                    + Apply for New Loan
                </Link>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">My Applications</h3>
                {loans.length === 0 ? (
                    <p className="text-gray-500 py-4">You have no loan applications yet.</p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-sm uppercase">
                                <th className="pb-2">ID</th>
                                <th className="pb-2">Amount</th>
                                <th className="pb-2">Purpose</th>
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map(loan => (
                                <tr key={loan.id} className="border-t hover:bg-gray-50 text-gray-700">
                                    <td className="py-3">#{loan.id}</td>
                                    <td className="py-3 font-semibold">${loan.amount.toLocaleString()}</td>
                                    <td className="py-3">{loan.purpose}</td>
                                    <td className="py-3">{new Date(loan.created_at).toLocaleDateString()}</td>
                                    <td className="py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                loan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {loan.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}