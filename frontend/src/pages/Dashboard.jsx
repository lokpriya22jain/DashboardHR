import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // Controls view switching: overview, list, create
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Controls detail modal window

  // Core App States
  const [metrics, setMetrics] = useState({ totalPersonnel: 6, pendingReviews: 2, approvedWindows: 1, archivedRejections: 0 });
  const [logs, setLogs] = useState([]);
  
  // Master Employee Registry Array state
  const [employees, setEmployees] = useState([
    { id: "EMP001", name: "Amit Patel", role: "Software Engineer", department: "Engineering", email: "amit@company.com", joiningDate: "2024-03-15" },
    { id: "EMP002", name: "Neha Jain", role: "UI/UX Designer", department: "Design", email: "neha@company.com", joiningDate: "2024-06-20" },
    { id: "EMP003", name: "Rahul Sharma", role: "HR Specialist", department: "Human Resources", email: "rahul@company.com", joiningDate: "2023-11-02" }
  ]);

  // Form Input Tracker State
  const [newEmp, setNewEmp] = useState({ name: '', role: '', department: '', email: '', joiningDate: '' });

  const fetchDashboardData = async () => {
    try {
      const metricsRes = await axios.get('http://localhost:5000/api/dashboard/metrics');
      const logsRes = await axios.get('http://localhost:5000/api/dashboard/logs');
      setMetrics(metricsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      setLogs([
        { _id: "1", employee: "Amit Patel", classification: "Sick Leave", duration: "2 Days", status: "Pending" },
        { _id: "2", employee: "Neha Jain", classification: "Casual Leave", duration: "1 Day", status: "Approved" },
        { _id: "3", employee: "Rahul Sharma", classification: "Maternity Leave", duration: "12 Weeks", status: "Pending" }
      ]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Action Handler to update Leave items
  const handleStatusChange = (id, newStatus) => {
    setLogs(prev => prev.map(log => log._id === id ? { ...log, status: newStatus } : log));
    setMetrics(prev => ({
      ...prev,
      pendingReviews: Math.max(0, prev.pendingReviews - 1),
      approvedWindows: newStatus === 'Approved' ? prev.approvedWindows + 1 : prev.approvedWindows,
      archivedRejections: newStatus === 'Rejected' ? prev.archivedRejections + 1 : prev.archivedRejections
    }));
  };

  // Submit Handler for Employee Creation
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    const newId = `EMP00${employees.length + 1}`;
    const addedEmployee = { id: newId, ...newEmp };
    
    // Append to register array and update overview totals counter
    setEmployees([...employees, addedEmployee]);
    setMetrics(prev => ({ ...prev, totalPersonnel: prev.totalPersonnel + 1 }));
    
    // Clear Input fields and return back to directory list view
    setNewEmp({ name: '', role: '', department: '', email: '', joiningDate: '' });
    setActiveTab('list');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Layout Navigation Pane */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">DashboardHR</div>
          <ul className="sidebar-menu">
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview Metrics</li>
            <li className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>Employee Directory</li>
            <li className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Add New Employee</li>
          </ul>
        </div>
        
        <div className="user-profile-box">
          <span className="user-name">{user?.name || 'Pranay Gupta'}</span>
          <span className="user-role">{user?.role || 'Admin'}</span>
          <button onClick={logout} className="signout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main Container Core Viewport Router Switch */}
      <main className="main-content">
        
        {/* VIEW 1: OVERVIEW INDEX METRICS PANEL */}
        {activeTab === 'overview' && (
          <>
            <header className="content-header">
              <h1>System Overview</h1>
              <p className="subtitle">Real-time leave balance management logs from the EMS database.</p>
            </header>

            <section className="metrics-grid">
              <div className="metric-card"><div className="metric-title">Total Personnel</div><div className="metric-value">{metrics.totalPersonnel}</div></div>
              <div className="metric-card"><div className="metric-title">Pending Reviews</div><div className="metric-value">{metrics.pendingReviews}</div></div>
              <div className="metric-card"><div className="metric-title">Approved Windows</div><div className="metric-value">{metrics.approvedWindows}</div></div>
              <div className="metric-card"><div className="metric-title">Archived Rejections</div><div className="metric-value">{metrics.archivedRejections}</div></div>
            </section>

            <section className="data-section">
              <h2>Leave Pipelines Log</h2>
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr><th>Employee</th><th>Classification</th><th>Duration</th><th>Status</th><th>Administrative Actions</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td><strong>{log.employee}</strong></td>
                        <td>{log.classification}</td>
                        <td>{log.duration}</td>
                        <td><span className={`badge ${log.status.toLowerCase()}`}>{log.status}</span></td>
                        <td>
                          {log.status === 'Pending' ? (
                            <div className="action-cluster">
                              <button onClick={() => handleStatusChange(log._id, 'Approved')} className="btn-action approve">Approve</button>
                              <button onClick={() => handleStatusChange(log._id, 'Rejected')} className="btn-action reject">Reject</button>
                            </div>
                          ) : <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Settled</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* VIEW 2: DISPLAY EMPLOYEE DIRECTORY */}
        {activeTab === 'list' && (
          <>
            <header className="content-header">
              <h1>Employee Directory</h1>
              <p className="subtitle">View corporate structural logs and individual registry profile details.</p>
            </header>

            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr><th>ID</th><th>Full Name</th><th>Role Designation</th><th>Department</th><th>Action View</th></tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td><strong>{emp.name}</strong></td>
                      <td>{emp.role}</td>
                      <td>{emp.department}</td>
                      <td>
                        <button className="btn-action approve" onClick={() => setSelectedEmployee(emp)}>View Complete Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* VIEW 3: CREATE NEW EMPLOYEE FORM */}
        {activeTab === 'create' && (
          <>
            <header className="content-header">
              <h1>Add New Personnel Record</h1>
              <p className="subtitle">Register new hires directly into the central data cluster matrices.</p>
            </header>

            <div className="form-container">
              <form onSubmit={handleCreateEmployee}>
                <div className="form-grid">
                  <div className="form-layout-group">
                    <label>Full Employee Name</label>
                    <input type="text" required value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="E.g., Ishaan Jain" />
                  </div>
                  <div className="form-layout-group">
                    <label>Corporate Email Address</label>
                    <input type="email" required value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} placeholder="ishaan@company.com" />
                  </div>
                  <div className="form-grid-row" style={{ display: 'contents' }}>
                    <div className="form-layout-group">
                      <label>Job Title Designation</label>
                      <input type="text" required value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} placeholder="Associate Consultant" />
                    </div>
                    <div className="form-layout-group">
                      <label>Core Department Branch</label>
                      <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} required>
                        <option value="">Select Branch...</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-layout-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Official Joining Date</label>
                  <input type="date" required value={newEmp.joiningDate} onChange={e => setNewEmp({...newEmp, joiningDate: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Commit Record to Database</button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* DETAILED INTERACTIVE ELEMENT VIEW MODAL WINDOW */}
      {selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setSelectedEmployee(null)}>×</button>
            <h2 style={{ marginTop: 0 }}>Personnel File: {selectedEmployee.id}</h2>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
            <p style={{ margin: '0.5rem 0' }}><strong>Full Name:</strong> {selectedEmployee.name}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Designated Title:</strong> {selectedEmployee.role}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Functional Department:</strong> {selectedEmployee.department}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Email Coordinates:</strong> {selectedEmployee.email}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Onboarding Commencement:</strong> {selectedEmployee.joiningDate}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;