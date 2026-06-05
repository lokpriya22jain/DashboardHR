import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [analytics] = useState({
        totalEmployees: 6,
        pendingLeaves: 2,
        approvedLeaves: 1,
        rejectedLeaves: 0
    });

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">
            {/* Minimalist Top Navigation Header */}
            <nav className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                    <span className="text-lg font-bold uppercase tracking-wider text-neutral-900">DashboardHR</span>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="text-sm text-neutral-500">
                        User: <strong className="text-neutral-900 font-medium">{user?.name || 'Pranay Gupta'}</strong> 
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-full uppercase tracking-wider font-semibold">{user?.role || 'Admin'}</span>
                    </span>
                    <button 
                        onClick={logout}
                        className="text-xs font-semibold uppercase tracking-wider text-red-600 hover:text-red-700 transition"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Dashboard Content Container */}
            <main className="max-w-7xl mx-auto px-8 py-12">
                <header className="mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Overview Metrics</h1>
                    <p className="text-sm text-neutral-500 mt-1">Real-time leave balance management logs from the EMS dataset.</p>
                </header>

                {/* Aesthetic Analytics Grid System */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Personnel', value: analytics.totalEmployees, highlight: false },
                        { label: 'Pending Reviews', value: analytics.pendingLeaves, highlight: true },
                        { label: 'Approved Windows', value: analytics.approvedLeaves, highlight: false },
                        { label: 'Archived Rejections', value: analytics.rejectedLeaves, highlight: false }
                    ].map((card, i) => (
                        <div key={i} className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
                            <p className="text-xs uppercase font-semibold tracking-wider text-neutral-400">{card.label}</p>
                            <p className={`text-4xl font-light tracking-tight mt-2 ${card.highlight ? 'text-red-600 font-normal' : 'text-neutral-900'}`}>
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content Workspace Panel */}
                <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
                    <h2 className="text-base font-bold mb-6 text-neutral-900 uppercase tracking-wider">Leave Pipelines Log</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-xs tracking-wider">
                                    <th className="pb-3 font-semibold">Employee</th>
                                    <th className="pb-3 font-semibold">Classification</th>
                                    <th className="pb-3 font-semibold">Duration</th>
                                    <th className="pb-3 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-neutral-700">
                                <tr>
                                    <td className="py-4 font-medium text-neutral-900">Amit Patel</td>
                                    <td className="py-4 text-neutral-500">Sick Leave</td>
                                    <td className="py-4 text-neutral-500">2 Days</td>
                                    <td className="py-4 text-right"><span className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded-full font-medium">Pending</span></td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-medium text-neutral-900">Neha Jain</td>
                                    <td className="py-4 text-neutral-500">Casual Leave</td>
                                    <td className="py-4 text-neutral-500">1 Day</td>
                                    <td className="py-4 text-right"><span className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-full font-medium">Approved</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}