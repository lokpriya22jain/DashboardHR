import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import axios from 'axios';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Core Metrics State Configuration
  const [metrics, setMetrics] = useState({
    totalPersonnel: 6,
    pendingReviews: 2,
    approvedWindows: 1,
    archivedRejections: 0,
    totalAssets: 15,
    allocatedAssets: 9
  });

  // Data State Repositories
  const [logs, setLogs] = useState([
    { _id: "1", employee: "Amit Patel", classification: "Sick Leave", duration: "2 Days", status: "Pending" },
    { _id: "2", employee: "Neha Jain", classification: "Casual Leave", duration: "1 Day", status: "Approved" },
    { _id: "3", employee: "Rahul Sharma", classification: "Maternity Leave", duration: "12 Weeks", status: "Pending" }
  ]);

  const [employees, setEmployees] = useState([
    { id: "EMP001", name: "Amit Patel", role: "Software Engineer", department: "Engineering", email: "amit@company.com", joiningDate: "2024-03-15" },
    { id: "EMP002", name: "Neha Jain", role: "UI/UX Designer", department: "Design", email: "neha@company.com", joiningDate: "2024-06-20" },
    { id: "EMP003", name: "Rahul Sharma", role: "HR Specialist", department: "Human Resources", email: "rahul@company.com", joiningDate: "2023-11-02" }
  ]);

  const [assets, setAssets] = useState([
    { id: 1, asset_code: "LAP-2026-01", asset_name: "MacBook Pro M3", asset_type: "Laptop", cost: 150000, status: "Allocated", assignee: "Amit Patel" },
    { id: 2, asset_code: "MON-2026-04", asset_name: "Dell UltraSharp 27", asset_type: "Monitor", cost: 35000, status: "Allocated", assignee: "Neha Jain" },
    { id: 3, asset_code: "ID-2026-09", asset_name: "Standard Smart ID Access Card", asset_type: "ID Card", cost: 500, status: "Available", assignee: "None" }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Leave Approved", message: "Amit Patel's Leave Has Been Approved successfully.", type: "system" },
    { id: 2, title: "Asset Assigned Successfully", message: "Laptop MacBook Pro M3 assigned to Amit Patel.", type: "asset" }
  ]);

  // Analytics Sample Metrics Generation Dataset
  const departmentChartData = [
    { name: 'Engineering', Members: 12, AssetsAllocated: 8 },
    { name: 'Design', Members: 5, AssetsAllocated: 4 },
    { name: 'Human Resources', Members: 3, AssetsAllocated: 2 },
    { name: 'Operations', Members: 6, AssetsAllocated: 5 }
  ];

  const assetPieData = [
    { name: 'Available Assets', value: 6 },
    { name: 'Allocated Assets', value: 9 }
  ];
  const COLORS = ['#10b981', '#3b82f6'];

  // Form Trackers
  const [newEmp, setNewEmp] = useState({ name: '', role: '', department: '', email: '', joiningDate: '' });
  const [newAsset, setNewAsset] = useState({ asset_code: '', asset_name: '', asset_type: '', cost: '' });
  const [leaveApplication, setLeaveApplication] = useState({ employee: '', classification: '', duration: '' });

  // Excel/CSV Spreadsheet Generation Pipeline Engine
  const executeDataReportExport = (reportDataset, filenameString) => {
    const workspaceSheet = XLSX.utils.json_to_sheet(reportDataset);
    const workbookInstance = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbookInstance, workspaceSheet, "Audit Summary Report");
    XLSX.writeFile(workbookInstance, `${filenameString}_Export_2026.xlsx`);
  };

  // Submit Handler Methods
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    const newId = `EMP00${employees.length + 1}`;
    const addedEmployee = { id: newId, ...newEmp };
    setEmployees([...employees, addedEmployee]);
    setMetrics(prev => ({ ...prev, totalPersonnel: prev.totalPersonnel + 1 }));
    setNewEmp({ name: '', role: '', department: '', email: '', joiningDate: '' });
    setActiveTab('list');
  };

  const handleCreateAsset = (e) => {
    e.preventDefault();
    const assetObj = { id: assets.length + 1, ...newAsset, status: 'Available', assignee: 'None' };
    setAssets([...assets, assetObj]);
    setMetrics(prev => ({ ...prev, totalAssets: prev.totalAssets + 1 }));
    
    setNotifications([
      { id: Date.now(), title: "Asset Cataloged", message: `New hardware item ${newAsset.asset_code} initialized into master records.`, type: 'asset' },
      ...notifications
    ]);

    setNewAsset({ asset_code: '', asset_name: '', asset_type: '', cost: '' });
    setActiveTab('assets');
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    const pendingLeaveRecord = {
      _id: String(logs.length + 1),
      employee: leaveApplication.employee || user?.name || "Pranay Gupta",
      classification: leaveApplication.classification,
      duration: leaveApplication.duration,
      status: 'Pending'
    };
    setLogs([...logs, pendingLeaveRecord]);
    setMetrics(prev => ({ ...prev, pendingReviews: prev.pendingReviews + 1 }));
    setLeaveApplication({ employee: '', classification: '', duration: '' });
    setActiveTab('overview');
  };

  const handleStatusChange = (id, newStatus) => {
    setLogs(prev => prev.map(log => log._id === id ? { ...log, status: newStatus } : log));
    const structuralTargetLog = logs.find(item => item._id === id);
    
    setMetrics(prev => ({
      ...prev,
      pendingReviews: Math.max(0, prev.pendingReviews - 1),
      approvedWindows: newStatus === 'Approved' ? prev.approvedWindows + 1 : prev.approvedWindows,
      archivedRejections: newStatus === 'Rejected' ? prev.archivedRejections + 1 : prev.archivedRejections
    }));

    setNotifications([
  { id: Date.now(), title: `Leave ${newStatus}`, message: `The request for ${structuralTargetLog?.employee} was marked ${newStatus}.`, type: 'system' },
  ...notifications // <-- Added a comma before it, keeping it safely inside the array wrapper!
]);
  };

  // Handler to Return / Release Corporate Hardware
  const handleReturnAsset = (assetId) => {
    setAssets(prevAssets => prevAssets.map(asset => {
      if (asset.id === assetId) {
        setNotifications([
          { id: Date.now(), title: "Asset Returned", message: `Device ${asset.asset_code} has been checked back into standard inventory.`, type: 'asset' },
          ...notifications
        ]);
        return { ...asset, status: 'Available', assignee: 'None' };
      }
      return asset;
    }));
    setMetrics(prev => ({ ...prev, allocatedAssets: Math.max(0, prev.allocatedAssets - 1) }));
  };

  // Global Engine Search Filter Interceptor Function
  const globalFilterInterceptor = (dataArray, matchKeys) => {
    if (!globalSearchQuery) return dataArray;
    return dataArray.filter(item => 
      matchKeys.some(key => String(item[key] || '').toLowerCase().includes(globalSearchQuery.toLowerCase()))
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Enterprise Architecture Left Sidebar Grid */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">Enterprise ERP</div>
          <ul className="sidebar-menu">
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview Metrics</li>
            <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Advanced Analytics</li>
            <li className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>Employee Directory</li>
            <li className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Add New Employee</li>
            <li className={activeTab === 'assets' ? 'active' : ''} onClick={() => setActiveTab('assets')}>Asset Management</li>
            <li className={activeTab === 'addAsset' ? 'active' : ''} onClick={() => setActiveTab('addAsset')}>Procure New Asset</li>
            <li className={activeTab === 'applyLeave' ? 'active' : ''} onClick={() => setActiveTab('applyLeave')}>Apply for Leave</li>
            <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
              Notifications Hub ({notifications.length})
            </li>
          </ul>
        </div>
        
        <div className="user-profile-box">
          <span className="user-name">{user?.name || 'Lokpriya Jain'}</span>
          <span className="user-role">{user?.role || 'Admin'}</span>
          <button onClick={logout} className="signout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main Stream Execution Window Viewport Router */}
      <main className="main-content">
        
        {/* Central Enterprise Navigation Bar with Global Search Integration */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="🔍 Global Search Core Array (Filter employees, metrics, locations, assets...)" 
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-action approve" onClick={() => executeDataReportExport(employees, 'Master_Employee_Database')}>Export Employees</button>
            <button className="btn-action approve" onClick={() => executeDataReportExport(assets, 'Asset_Log_Inventory')}>Export Assets</button>
            <button className="btn-action approve" style={{ background: '#10b981' }} onClick={() => executeDataReportExport(logs, 'Leave_Applications_Report')}>Export Leaves</button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW INDEX METRICS PANEL */}
        {activeTab === 'overview' && (
          <>
            <header className="content-header">
              <h1>System Overview</h1>
              <p className="subtitle">Real-time enterprise orchestration log matrix data tracks.</p>
            </header>

            <section className="metrics-grid">
              <div className="metric-card"><div className="metric-title">Total Personnel</div><div className="metric-value">{metrics.totalPersonnel}</div></div>
              <div className="metric-card"><div className="metric-title">Pending Reviews</div><div className="metric-value">{metrics.pendingReviews}</div></div>
              <div className="metric-card"><div className="metric-title">Asset Inventory</div><div className="metric-value">{metrics.totalAssets} Items</div></div>
              <div className="metric-card"><div className="metric-title">Allocated Rate</div><div className="metric-value">{metrics.allocatedAssets} deployed</div></div>
            </section>

            <section className="data-section">
              <h2>Leave Pipelines Log</h2>
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr><th>Employee</th><th>Classification</th><th>Duration</th><th>Status</th><th>Administrative Actions</th></tr>
                  </thead>
                  <tbody>
                    {globalFilterInterceptor(logs, ['employee', 'classification', 'status']).map((log) => (
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

        {/* TAB 2: ADVANCED ENTERPRISE ANALYTICS RENDERING VISUALS */}
        {activeTab === 'analytics' && (
          <>
            <header className="content-header">
              <h1>Charts & Analytics Dashboard</h1>
              <p className="subtitle">Department-wise resource distribution and allocation trends.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)' }}>
                <h3>Corporate Structure Profile vs Allocations</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={departmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="AssetsAllocated" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>Asset Allocation Mix</h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={assetPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {assetPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginTop: '1rem' }}>
                  <span style={{ color: '#10b981' }}>● Available ({assetPieData[0].value})</span>
                  <span style={{ color: '#3b82f6' }}>● Allocated ({assetPieData[1].value})</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: DISPLAY EMPLOYEE DIRECTORY */}
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
                  {globalFilterInterceptor(employees, ['id', 'name', 'role', 'department']).map((emp) => (
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

        {/* TAB 4: ADD NEW EMPLOYEE */}
        {activeTab === 'create' && (
          <>
            <header className="content-header">
              <h1>Add New Personnel Record</h1>
              <p className="subtitle">Register new hires directly into the system database.</p>
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
                  <div style={{ display: 'contents' }}>
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

        {/* TAB 5: ASSET MANAGEMENT TRACKING WORKFLOW */}
        {activeTab === 'assets' && (
          <>
            <header className="content-header">
              <h1>Asset Ledger System</h1>
              <p className="subtitle">Corporate physical infrastructure allocation registers.</p>
            </header>

            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr><th>Code</th><th>Asset Item Name</th><th>Type Category</th><th>Price Cost</th><th>Deployment Status</th><th>Assigned Custody</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {globalFilterInterceptor(assets, ['asset_code', 'asset_name', 'asset_type', 'assignee', 'status']).map((asset) => (
                    <tr key={asset.id}>
                      <td><code>{asset.asset_code}</code></td>
                      <td><strong>{asset.asset_name}</strong></td>
                      <td>{asset.asset_type}</td>
                      <td>₹{asset.cost.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${asset.status === 'Available' ? 'approved' : 'pending'}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td>{asset.assignee}</td>
                      <td>
                        {asset.status === 'Allocated' ? (
                          <button onClick={() => handleReturnAsset(asset.id)} className="btn-action reject" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                            Mark Returned
                          </button>
                        ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>In Stock</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 6: PROCURE NEW ASSET RECORD ENTRY */}
        {activeTab === 'addAsset' && (
          <>
            <header className="content-header">
              <h1>Asset Procurement Portal</h1>
              <p className="subtitle">Catalog corporate hardware items, monitors, items, and accessories.</p>
            </header>

            <div className="form-container">
              <form onSubmit={handleCreateAsset}>
                <div className="form-grid">
                  <div className="form-layout-group">
                    <label>Unique Asset Serial Code</label>
                    <input type="text" required value={newAsset.asset_code} onChange={e => setNewAsset({...newAsset, asset_code: e.target.value})} placeholder="E.g., LAP-2026-99" />
                  </div>
                  <div className="form-layout-group">
                    <label>Hardware Core Model Name</label>
                    <input type="text" required value={newAsset.asset_name} onChange={e => setNewAsset({...newAsset, asset_name: e.target.value})} placeholder="E.g., Apple iPad Pro" />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-layout-group">
                    <label>Classification Group</label>
                    <select value={newAsset.asset_type} onChange={e => setNewAsset({...newAsset, asset_type: e.target.value})} required>
                      <option value="">Select Resource Class...</option>
                      <option value="Laptop">Laptop / Mobile Workstation</option>
                      <option value="Monitor">High-Res Screen Monitor</option>
                      <option value="ID Card">Corporate ID Smart Access Card</option>
                      <option value="Peripherals">Input Mouse / Keyboards</option>
                    </select>
                  </div>
                  <div className="form-layout-group">
                    <label>Purchase Valuation Cost (INR)</label>
                    <input type="number" required value={newAsset.cost} onChange={e => setNewAsset({...newAsset, cost: Number(e.target.value)})} placeholder="45000" />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Commit Asset Item Entry</button>
              </form>
            </div>
          </>
        )}

        {/* TAB 7: LEAVE REQUEST SUBMISSION FORM */}
        {activeTab === 'applyLeave' && (
          <>
            <header className="content-header">
              <h1>Apply for Leave</h1>
              <p className="subtitle">Submit a leaf request pipeline directly to the administrative review boards.</p>
            </header>

            <div className="form-container">
              <form onSubmit={handleApplyLeave}>
                <div className="form-grid">
                  <div className="form-layout-group">
                    <label>Your Full Name</label>
                    <input type="text" required value={leaveApplication.employee} onChange={e => setLeaveApplication({...leaveApplication, employee: e.target.value})} placeholder="E.g., Amit Patel" />
                  </div>
                  <div className="form-layout-group">
                    <label>Leave Classification</label>
                    <select value={leaveApplication.classification} onChange={e => setLeaveApplication({...leaveApplication, classification: e.target.value})} required>
                      <option value="">Select Type...</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Paternity Leave">Paternity Leave</option>
                    </select>
                  </div>
                </div>
                <div className="form-layout-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Duration / Period</label>
                  <input type="text" required value={leaveApplication.duration} onChange={e => setLeaveApplication({...leaveApplication, duration: e.target.value})} placeholder="E.g., 3 Days, 1 Week" />
                </div>
                <button type="submit" className="btn-primary">Submit Leave Application</button>
              </form>
            </div>
          </>
        )}

        {/* TAB 8: NOTIFICATIONS HUB LIVE MESSAGE MATRIX */}
        {activeTab === 'notifications' && (
          <>
            <header className="content-header">
              <h1>Notifications Engine</h1>
              <p className="subtitle">Event-driven workflow status channels log updates.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {notifications.map((notif) => (
                <div key={notif.id} style={{ padding: '1.25rem', borderRadius: '0.5rem', background: '#ffffff', borderLeft: notif.type === 'asset' ? '4px solid #f59e0b' : '4px solid #10b981', boxShadow: 'var(--card-shadow)' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{notif.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{notif.message}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* DETAIL DRAWER OVERLAY MODAL WINDOW */}
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