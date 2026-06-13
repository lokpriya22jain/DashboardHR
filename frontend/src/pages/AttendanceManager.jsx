import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AttendanceManager() {
  // Safe default fallback roster list matching your 60-person organization scaling
  const [roster, setRoster] = useState([
    { user_id: 1, name: 'Pranay Gupta', designation: 'Director', check_in: '09:15 AM', check_out: '--', status: 'Present' },
    { user_id: 2, name: 'Rahul Sharma', designation: 'Project Manager', check_in: '09:42 AM', check_out: '--', status: 'Late' },
    { user_id: 3, name: 'Priya Verma', designation: 'HR Manager', check_in: '--', check_out: '--', status: 'On Leave' },
    { user_id: 4, name: 'Amit Patel', designation: 'React Developer', check_in: '--', check_out: '--', status: 'Absent' },
    { user_id: 5, name: 'Neha Jain', designation: 'Node Developer', check_in: '08:55 AM', check_out: '06:00 PM', status: 'Present' },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Limits rules state tracking: max 10 Casual Leaves, 5 Medical Leaves
  const [leaveBalances, setLeaveBalances] = useState({
    casualLeavesTaken: 2,
    medicalLeavesTaken: 1,
    lateCounter: 0,
    calculatedAbsentsFromLate: 0
  });

  useEffect(() => {
    const fetchDailyRoster = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/attendance/roster');
        if (response.data) {
          if (Array.isArray(response.data)) {
            setRoster(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setRoster(response.data.data);
          }
        }
      } catch (error) {
        console.error("Backend response offline. Maintaining active state matrix locally.");
      } finally {
        setLoading(false);
      }
    };
    fetchDailyRoster();
  }, []);

  const handleCheckIn = (userId) => {
    setErrorMessage('');
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentHour = new Date().getHours();
    let assignedStatus = 'Present';
    
    if (currentHour >= 9) {
      assignedStatus = 'Late';
      handleLateCountingLogic();
    }

    setRoster(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map(emp => emp.user_id === userId ? { ...emp, status: assignedStatus, check_in: timeString } : emp);
    });
  };

  const handleCheckOut = (userId) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoster(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map(emp => emp.user_id === userId ? { ...emp, check_out: timeString } : emp);
    });
  };

  // Rule logic: 3 Lates count as 1 Absence
  const handleLateCountingLogic = () => {
    setLeaveBalances(prev => {
      const newLateCount = prev.lateCounter + 1;
      const additionalAbsent = newLateCount % 3 === 0 ? 1 : 0;
      return {
        ...prev,
        lateCounter: newLateCount,
        calculatedAbsentsFromLate: prev.calculatedAbsentsFromLate + additionalAbsent
      };
    });
  };

  const handleDirectStatusShift = (userId, mode) => {
    setErrorMessage('');
    
    if (mode === 'Late') {
      handleLateCountingLogic();
    }

    if (mode === 'On Leave') {
      if (leaveBalances.casualLeavesTaken >= 10) {
        setErrorMessage('⚠️ Action Blocked: Annual allowance threshold of 10 Casual Leaves exhausted!');
        return;
      }
      setLeaveBalances(prev => ({ ...prev, casualLeavesTaken: prev.casualLeavesTaken + 1 }));
    }

    if (mode === 'Medical Leave') {
      if (leaveBalances.medicalLeavesTaken >= 5) {
        setErrorMessage('⚠️ Action Blocked: Annual allowance threshold of 5 Medical Leaves exhausted!');
        return;
      }
      setLeaveBalances(prev => ({ ...prev, medicalLeavesTaken: prev.medicalLeavesTaken + 1 }));
      mode = 'On Leave';
    }

    setRoster(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map(emp => emp.user_id === userId ? { ...emp, status: mode, check_in: mode === 'Absent' ? '--' : emp.check_in } : emp);
    });
  };

  const safeRosterArray = Array.isArray(roster) ? roster : [];
  const filteredRoster = safeRosterArray.filter(emp =>
    (emp?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp?.designation || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center text-lg font-medium">Synchronizing Workspace Terminals...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Clock logs, 3-late penalty rules tracking, and annual limit audits.</p>
        </div>
        <input 
          type="text"
          placeholder="🔍 Filter employee entries..."
          className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-800 rounded-r-xl text-sm font-semibold shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* BALANCES DASHBOARD BADGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
          <span className="text-[10px] uppercase tracking-wider text-indigo-300 block mb-1">Rule Engine Counter</span>
          <h3 className="text-lg font-bold">Late Translation Metric</h3>
          <div className="grid grid-cols-2 gap-2 mt-4 text-center border-t border-indigo-900/60 pt-3">
            <div>
              <p className="text-[11px] text-slate-400">Total Lates</p>
              <p className="text-xl font-black text-amber-400">{leaveBalances.lateCounter}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Converted Absents</p>
              <p className="text-xl font-black text-rose-400">{leaveBalances.calculatedAbsentsFromLate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Casual Leave Auditing</h4>
            <div className="text-2xl font-black text-slate-900">{leaveBalances.casualLeavesTaken} <span className="text-slate-400 text-xs font-normal">/ 10 Days</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${(leaveBalances.casualLeavesTaken / 10) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medical Leave Auditing</h4>
            <div className="text-2xl font-black text-slate-900">{leaveBalances.medicalLeavesTaken} <span className="text-slate-400 text-xs font-normal">/ 5 Days</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${(leaveBalances.medicalLeavesTaken / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* MATRIX RECORDS DATATABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Status</th>
              <th className="p-4">Terminal Clocks</th>
              <th className="p-4">Trigger Actions</th>
              <th className="p-4 pr-6 text-right">Exception Overrides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredRoster.map((emp) => (
              <tr key={emp.user_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-400">#{emp.user_id}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-900">{emp.name}</div>
                  <div className="text-xs text-slate-400">{emp.designation}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${
                    emp.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    emp.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    emp.status === 'On Leave' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-slate-600">
                  <div>In: {emp.check_in || '--'}</div>
                  <div>Out: {emp.check_out || '--'}</div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCheckIn(emp.user_id)}
                      disabled={emp.check_in && emp.check_in !== '--'}
                      className="px-2.5 py-1 bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded font-bold text-xs"
                    >
                      Check In
                    </button>
                    <button 
                      onClick={() => handleCheckOut(emp.user_id)}
                      disabled={!emp.check_in || emp.check_in === '--' || (emp.check_out && emp.check_out !== '--')}
                      className="px-2.5 py-1 bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded font-bold text-xs"
                    >
                      Check Out
                    </button>
                  </div>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-1">
                    {['Late', 'On Leave', 'Medical Leave', 'Absent'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleDirectStatusShift(emp.user_id, mode)}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded border bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        {mode === 'Medical Leave' ? '+ Med' : mode}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}