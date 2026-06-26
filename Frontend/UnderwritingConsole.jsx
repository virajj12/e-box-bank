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

    if (!loan) return <div>Loading metadata...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Underwriting Console (Application #{loan.id})</h2>

            <div className="grid grid-cols-2 gap-4 mb-8 text-gray-700">
                <div className="p-4 bg-gray-50 border rounded"><span className="block text-xs font-bold text-gray-400 uppercase">Customer Name</span> {loan.customer_name}</div>
                <div className="p-4 bg-gray-50 border rounded"><span className="block text-xs font-bold text-gray-400 uppercase">Credit Score</span> {loan.credit_score}</div>
                <div className="p-4 bg-gray-50 border rounded"><span className="block text-xs font-bold text-gray-400 uppercase">Requested Amount</span> ${loan.amount}</div>
                <div className="p-4 bg-gray-50 border rounded"><span className="block text-xs font-bold text-gray-400 uppercase">Monthly Income</span> ${loan.monthly_income}</div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Underwriting Commentary (Mandatory)</label>
                <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full border rounded p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter analysis..."
                />
            </div>

            <div className="flex gap-4">
                <button onClick={() => handleAction('approved')} disabled={!comments} className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 disabled:opacity-50">
                    Approve Loan
                </button>
                <button onClick={() => handleAction('rejected')} disabled={!comments} className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 disabled:opacity-50">
                    Reject Loan
                </button>
            </div>
        </div>
    );
}