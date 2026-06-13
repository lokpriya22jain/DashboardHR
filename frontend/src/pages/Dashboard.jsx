import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar} from 'recharts';
import * as XLSX from 'xlsx';
import axios from 'axios';

function Dashboard () {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState ('overview');
  const [selectedEmployee, setSelectedEmployee] = useState (null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: '', salary: '', city: '', graduation: '', experience: '', attendance: '', leavesTaken: '', progressReport: '', taskSubmissions: '' });
  const [globalSearchQuery, setGlobalSearchQuery] = useState ('');
  const [leaveTypeMapping, setLeaveTypeMapping] = useState({});
  // Status Logic Rules Matrix: Converts 3 Lates into 1 Absent automatically
  const handleStatusChange = (empId, newStatus) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp => {
        if (emp.id !== empId) return emp;

        let updatedLateCount = emp.lateCount || 0;
        let updatedStatus = newStatus;

        if (newStatus === 'L') {
          updatedLateCount += 1;
          if (updatedLateCount >= 3) {
            updatedStatus = 'A';
            updatedLateCount = 0; // Reset late counter loop
            alert(`${emp.name} reached 3 Lates. Automatically converting status to Absent.`);
          }
        } else if (emp.status === 'L' && newStatus !== 'L') {
          updatedLateCount = Math.max(0, updatedLateCount - 1);
        }

        return { ...emp, status: updatedStatus, lateCount: updatedLateCount };
      })
    );
  };

  // Remarks sync handler linking to your state objects
  const handleRemarksChange = (empId, text) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp => (emp.id === empId ? { ...emp, remarks: text } : emp))
    );
  };
  
  // Core Metrics State Engine scale-adjusted for 60 employees
  const [metrics, setMetrics] = useState ({
    deptData: [
      { name: 'Software Dev', headcount: 16 },
      { name: 'QA Testing', headcount: 6 },
      { name: 'HR', headcount: 6 },
      { name: 'Marketing', headcount: 7 },
      { name: 'Sales', headcount: 7 },
      { name: 'Support/Finance', headcount: 13 }
    ],
    salaryData: [
      { location: 'Indore', expense: 641000 },
      { location: 'Mumbai', expense: 452000 },
      { location: 'Pune', expense: 396000 },
      { location: 'Bangalore', expense: 322000 },
      { location: 'Delhi', expense: 341000 },
      { location: 'Hyderabad', expense: 144000 }
    ],
    performanceData: [
      { subject: 'Productivity', A: 85, B: 70 },
      { subject: 'Retention', A: 98, B: 85 },
      { subject: 'Attendance', A: 92, B: 90 },
      { subject: 'Hiring Speed', A: 75, B: 80 },
      { subject: 'Training Score', A: 88, B: 75 }
    ],
    totalPersonnel: 60,
    pendingReviews: 4,
    approvedWindows: 15,
    totalAssets: 3
  });

  // Data Repositories synchronized with database records
  const [logs, setLogs] = useState ([
    { _id: "1", employee: "Amit Patel", classification: "Casual Leave", duration: "3 Days", status: "Approved" },
    { _id: "2", employee: "Neha Jain", classification: "Sick Leave", duration: "2 Days", status: "Pending" },
    { _id: "3", employee: "Rohit Singh", classification: "Casual Leave", duration: "2 Days", status: "Approved" },
    { _id: "4", employee: "Anjali Gupta", classification: "Casual Leave", duration: "3 Days", status: "Pending" },
    { _id: "5", employee: "Vikas Mehta", classification: "Sick Leave", duration: "3 Days", status: "Rejected" },
    { _id: "6", employee: "Arjun Mehta", classification: "Earned Leave", duration: "5 Days", status: "Approved" },
    { _id: "7", employee: "Kavita Rao", classification: "Sick Leave", duration: "1 Day", status: "Pending" },
    { _id: "8", employee: "Rohan Joshi", classification: "Casual Leave", duration: "2 Days", status: "Pending" }
  ]);

  // Comprehensive Dataset
  const [employees, setEmployees] = useState ([
    { id: "EMP001", name: "Pranay Gupta", role: "Director", department: "Software Development", email: "pranay@isoftzone.com", address: "Indore", salary: "150000" },
    { id: "EMP002", name: "Rahul Sharma", role: "Project Manager", department: "Software Development", email: "rahul@isoftzone.com", address: "Indore", salary: "85000" },
    { id: "EMP003", name: "Priya Verma", role: "HR Manager", department: "Human Resources", email: "priya@isoftzone.com", address: "Indore", salary: "70000" },
    { id: "EMP004", name: "Amit Patel", role: "React Developer", department: "Software Development", email: "amit@isoftzone.com", address: "Indore", salary: "45000" },
    { id: "EMP005", name: "Neha Jain", role: "Node Developer", department: "Software Development", email: "neha@isoftzone.com", address: "Indore", salary: "50000" },
    { id: "EMP006", name: "Rohit Singh", role: "QA Engineer", department: "Quality Assurance", email: "rohit@isoftzone.com", address: "Indore", salary: "40000" },
    { id: "EMP007", name: "Anjali Gupta", role: "Marketing Executive", department: "Digital Marketing", email: "anjali@isoftzone.com", address: "Indore", salary: "35000" },
    { id: "EMP008", name: "Vikas Mehta", role: "Sales Executive", department: "Sales", email: "vikas@isoftzone.com", address: "Indore", salary: "38000" },
    { id: "EMP009", name: "Pooja Shah", role: "Support Engineer", department: "Technical Support", email: "pooja@isoftzone.com", address: "Indore", salary: "32000" },
    { id: "EMP010", name: "Sandeep Kumar", role: "Accountant", department: "Finance", email: "sandeep@isoftzone.com", address: "Indore", salary: "42000" },
    { id: "EMP011", name: "Aarav Sharma", role: "Frontend Engineer", department: "Software Development", email: "aarav.s@isoftzone.com", address: "Mumbai", salary: "62000" },
    { id: "EMP012", name: "Aanya Joshi", role: "QA Automation Tester", department: "Quality Assurance", email: "aanya.j@isoftzone.com", address: "Pune", salary: "48000" },
    { id: "EMP013", name: "Arjun Nair", role: "HR Generalist", department: "Human Resources", email: "arjun.n@isoftzone.com", address: "Bangalore", salary: "45000" },
    { id: "EMP014", name: "Diya Iyer", role: "Financial Analyst", department: "Finance", email: "diya.i@isoftzone.com", address: "Chennai", salary: "55000" },
    { id: "EMP015", name: "Ishaan Goel", role: "SEO Specialist", department: "Digital Marketing", email: "ishaan.g@isoftzone.com", address: "Delhi", salary: "41000" },
    { id: "EMP016", name: "Kavya Gill", role: "Account Executive", department: "Sales", email: "kavya.g@isoftzone.com", address: "Hyderabad", salary: "46000" },
    { id: "EMP017", name: "Kabir Malhotra", role: "Operations Coordinator", department: "Operations", email: "kabir.m@isoftzone.com", address: "Indore", salary: "39000" },
    { id: "EMP018", name: "Meera Kulkarni", role: "L1 Support Agent", department: "Technical Support", email: "meera.k@isoftzone.com", address: "Pune", salary: "30000" },
    { id: "EMP019", name: "Reyansh Gupta", role: "Backend Architect", department: "Software Development", email: "reyansh.g@isoftzone.com", address: "Indore", salary: "95000" },
    { id: "EMP020", name: "Riya Saxena", role: "Manual Tester", department: "Quality Assurance", email: "riya.s@isoftzone.com", address: "Noida", salary: "36000" },
    { id: "EMP021", name: "Vivaan Kapoor", role: "Talent Acquisition", department: "Human Resources", email: "vivaan.k@isoftzone.com", address: "Mumbai", salary: "47000" },
    { id: "EMP022", name: "Saisha Patel", role: "Tax Consultant", department: "Finance", email: "saisha.p@isoftzone.com", address: "Ahmedabad", salary: "53000" },
    { id: "EMP023", name: "Atharv Mishra", role: "Content Strategist", department: "Digital Marketing", email: "atharv.m@isoftzone.com", address: "Indore", salary: "38000" },
    { id: "EMP024", name: "Ananya Das", role: "Business Development", department: "Sales", email: "ananya.d@isoftzone.com", address: "Kolkata", salary: "49000" },
    { id: "EMP025", name: "Devansh Bhat", role: "Logistics Specialist", department: "Operations", email: "devansh.b@isoftzone.com", address: "Indore", salary: "42000" },
    { id: "EMP026", name: "Prisha Sen", role: "Helpdesk Engineer", department: "Technical Support", email: "prisha.sen@isoftzone.com", address: "Bangalore", salary: "33000" },
    { id: "EMP027", name: "Krishna Choudhary", role: "Full Stack Engineer", department: "Software Development", email: "krishna.c@isoftzone.com", address: "Jaipur", salary: "75000" },
    { id: "EMP028", name: "Myra Reddi", role: "Performance Marketer", department: "Digital Marketing", email: "myra.r@isoftzone.com", address: "Chennai", salary: "44000" },
    { id: "EMP029", name: "Shaurya Pandey", role: "Sales Manager", department: "Sales", email: "shaurya.p@isoftzone.com", address: "Delhi", salary: "68000" },
    { id: "EMP030", name: "Aadhya Varma", role: "Systems Administrator", department: "Technical Support", email: "aadhya.v@isoftzone.com", address: "Indore", salary: "51000" },
    { id: "EMP031", name: "Ayush Tiwari", role: "DevOps Engineer", department: "Software Development", email: "ayush.t@isoftzone.com", address: "Pune", salary: "82000" },
    { id: "EMP032", name: "Isha Deshmukh", role: "QA Lead", department: "Quality Assurance", email: "isha.d@isoftzone.com", address: "Mumbai", salary: "72000" },
    { id: "EMP033", name: "Aarush Hegde", role: "HR Generalist", department: "Human Resources", email: "aarush.h@isoftzone.com", address: "Bangalore", salary: "43000" },
    { id: "EMP034", name: "Anika Roy", role: "Payroll Specialist", department: "Finance", email: "anika.roy@isoftzone.com", address: "Kolkata", salary: "46000" },
    { id: "EMP035", name: "Rudransh Jha", role: "Social Media Manager", department: "Digital Marketing", email: "rudransh.j@isoftzone.com", address: "Noida", salary: "37000" },
    { id: "EMP036", name: "Saanvi Singh", role: "Inside Sales Agent", department: "Sales", email: "saanvi.s@isoftzone.com", address: "Indore", salary: "35000" },
    { id: "EMP037", name: "Vedant Chhabra", role: "Operations Lead", department: "Operations", email: "vedant.c@isoftzone.com", address: "Delhi", salary: "66000" },
    { id: "EMP038", name: "Siddharth Pal", role: "Desktop Support", department: "Technical Support", email: "siddharth.p@isoftzone.com", address: "Ahmedabad", salary: "34000" },
    { id: "EMP039", name: "Aditi Gole", role: "UI/UX Developer", department: "Software Development", email: "aditi.g@isoftzone.com", address: "Indore", salary: "53000" },
    { id: "EMP040", name: "Sai Yadav", role: "Security Tester", department: "Quality Assurance", email: "sai.y@isoftzone.com", address: "Hyderabad", salary: "56000" },
    { id: "EMP041", name: "Gaurav Bansal", role: "HR Specialist", department: "Human Resources", email: "gaurav.b@isoftzone.com", address: "Delhi", salary: "50000" },
    { id: "EMP042", name: "Khushi Jain", role: "Billing Clerk", department: "Finance", email: "khushi.j@isoftzone.com", address: "Indore", salary: "38000" },
    { id: "EMP043", name: "Aditya Thakur", role: "PPC Executive", department: "Digital Marketing", email: "aditya.t@isoftzone.com", address: "Chandigarh", salary: "40000" },
    { id: "EMP044", name: "Mehak Grover", role: "Regional Sales Lead", department: "Sales", email: "mehak.g@isoftzone.com", address: "Mumbai", salary: "71000" },
    { id: "EMP045", name: "Pranav Shah", role: "Inventory Manager", department: "Operations", email: "pranav.s@isoftzone.com", address: "Pune", salary: "48000" },
    { id: "EMP046", name: "Sanya Gupta", role: "IT Coordinator", department: "Technical Support", email: "sanya.g@isoftzone.com", address: "Indore", salary: "39000" },
    { id: "EMP047", name: "Darsh Verma", role: "Mobile App Developer", department: "Software Development", email: "darsh.v@isoftzone.com", address: "Bangalore", salary: "78000" },
    { id: "EMP048", name: "Avani Kadam", role: "Test Architect", department: "Quality Assurance", email: "avani.k@isoftzone.com", address: "Pune", salary: "89000" },
    { id: "EMP049", name: "Yash Singhal", role: "Compensation Manager", department: "Human Resources", email: "yash.s@isoftzone.com", address: "Delhi", salary: "64000" },
    { id: "EMP050", name: "Tanvi Somani", role: "Internal Auditor", department: "Finance", email: "tanvi.s@isoftzone.com", address: "Indore", salary: "58000" },
    { id: "EMP051", name: "Manan Dua", role: "Brand Manager", department: "Digital Marketing", email: "manan.d@isoftzone.com", address: "Mumbai", salary: "61000" },
    { id: "EMP052", name: "Shruti Hegde", role: "Enterprise Sales Chief", department: "Sales", email: "shruti.h@isoftzone.com", address: "Bangalore", salary: "92000" },
    { id: "EMP053", name: "Karan Johar", role: "Facility Supervisor", department: "Operations", email: "karan.j@isoftzone.com", address: "Mumbai", salary: "41000" },
    { id: "EMP054", name: "Nisha Pillai", role: "Technical Writer", department: "Technical Support", email: "nisha.p@headington.com", address: "Chennai", salary: "42000" },
    { id: "EMP055", name: "Arnav Goenka", role: "Data Engineer", department: "Software Development", email: "arnav.g@isoftzone.com", address: "Indore", salary: "83000" },
    { id: "EMP056", name: "Bhavana Patel", role: "Product Designer", department: "Software Development", email: "bhavana.p@isoftzone.com", address: "Pune", salary: "67000" },
    { id: "EMP057", name: "Rishabh Pant", role: "Agile Coach", department: "Operations", email: "rishabh.p@isoftzone.com", address: "Delhi", salary: "80000" },
    { id: "EMP058", name: "Sneha Reddy", role: "Recruiter", department: "Human Resources", email: "sneha.r@isoftzone.com", address: "Hyderabad", salary: "44000" },
    { id: "EMP059", name: "Alok Tripathi", role: "Financial Controller", department: "Finance", email: "alok.t@isoftzone.com", address: "Noida", salary: "90000" },
    { id: "EMP060", name: "Deepika Padukone", role: "PR Coordinator", department: "Digital Marketing", email: "deepika.p@isoftzone.com", address: "Mumbai", salary: "50000" }
  ]);


  const [assets, setAssets] = useState ([
    { id: 1, asset_code: "DEV-MAC-01", asset_name: 'MacBook Pro 14"', asset_type: "Hardware", cost: 150000, status: "Allocated", assignee: "Pranay Gupta" },
  { id: 2, asset_code: "DEV-DEL-02", asset_name: "Dell XPS 15", asset_type: "Hardware", cost: 120000, status: "Allocated", assignee: "Rahul Sharma" },
  { id: 3, asset_code: "MKT-SLS-03", asset_name: "Salesforce CRM Sandbox", asset_type: "Software License", cost: 54000, status: "Available", assignee: "None" },
  { id: 4, asset_code: "QA-LEN-04", asset_name: "Lenovo ThinkPad T14", asset_type: "Hardware", cost: 95000, status: "Allocated", assignee: "Rohit Singh" },
  { id: 5, asset_code: "HR-MAC-05", asset_name: 'MacBook Air M2', asset_type: "Hardware", cost: 110000, status: "Allocated", assignee: "Priya Verma" },
  { id: 6, asset_code: "DEV-MON-06", asset_name: 'Dual 27" Dell Monitors', asset_type: "Peripherals", cost: 35000, status: "Allocated", assignee: "Amit Patel" },
  { id: 7, asset_code: "DEV-IPD-07", asset_name: "iPad Air 256GB", asset_type: "Hardware", cost: 65000, status: "Allocated", assignee: "Neha Jain" },
  { id: 8, asset_code: "MKT-ADB-08", asset_name: "Adobe Creative Cloud", asset_type: "Software License", cost: 48000, status: "Available", assignee: "None" },
  { id: 9, asset_code: "SLS-HP-09", asset_name: "HP EliteBook 840", asset_type: "Hardware", cost: 88000, status: "Allocated", assignee: "Vikas Mehta" },
  { id: 10, asset_code: "FIN-THK-10", asset_name: "ThinkPad L15", asset_type: "Hardware", cost: 78000, status: "Allocated", assignee: "Sandeep Kumar" },
  { id: 11, asset_code: "DEV-MAC-11", asset_name: 'MacBook Pro 16"', asset_type: "Hardware", cost: 210000, status: "Allocated", assignee: "Aarav Sharma" },
  { id: 12, asset_code: "QA-MON-12", asset_name: '32" UltraWide Monitor', asset_type: "Peripherals", cost: 42000, status: "Allocated", assignee: "Aanya Joshi" },
  { id: 13, asset_code: "HR-DEL-13", asset_name: "Dell Inspiron 14", asset_type: "Hardware", cost: 60000, status: "Allocated", assignee: "Arjun Nair" },
  { id: 14, asset_code: "SUP-ASU-14", asset_name: "Asus ZenBook R9", asset_type: "Hardware", cost: 92000, status: "Allocated", assignee: "Pooja Shah" },
  { id: 15, asset_code: "MKT-CAN-15", asset_name: "Canva Pro Enterprise", asset_type: "Software License", cost: 15000, status: "Available", assignee: "None" },
  { id: 16, asset_code: "DEV-AWS-16", asset_name: "AWS Sandbox Tier 3", asset_type: "Software License", cost: 125000, status: "Allocated", assignee: "Reyansh Gupta" },
  { id: 17, asset_code: "QA-LOG-17", asset_name: "Logitech MX Master Set", asset_type: "Peripherals", cost: 18000, status: "Allocated", assignee: "Riya Saxena" },
  { id: 18, asset_code: "DEV-LEN-18", asset_name: "Lenovo Legion 5 Pro", asset_type: "Hardware", cost: 140000, status: "Allocated", assignee: "Krishna Choudhary" },
  { id: 19, asset_code: "SLS-ZOOM-19", asset_name: "Zoom Business License", asset_type: "Software License", cost: 12000, status: "Available", assignee: "None" },
  { id: 20, asset_code: "FIN-DEL-20", asset_name: "Dell Vostro 15", asset_type: "Hardware", cost: 55000, status: "Allocated", assignee: "Anika Roy" },
  { id: 21, asset_code: "DEV-MAC-21", asset_name: 'Mac Studio M2 Max', asset_type: "Hardware", cost: 280000, status: "Allocated", assignee: "Ayush Tiwari" },
  { id: 22, asset_code: "MKT-SEMR-22", asset_name: "SEMrush Guru Plan", asset_type: "Software License", cost: 36000, status: "Available", assignee: "None" },
  { id: 23, asset_code: "OPS-THK-23", asset_name: "ThinkPad E14", asset_type: "Hardware", cost: 72000, status: "Allocated", assignee: "Vedant Chhabra" },
  { id: 24, asset_code: "DEV-WAC-24", asset_name: "Wacom Intuos Pro Table", asset_type: "Peripherals", cost: 32000, status: "Allocated", assignee: "Aditi Gole" },
  { id: 25, asset_code: "QA-DEL-25", asset_name: "Dell Latitude 5420", asset_type: "Hardware", cost: 85000, status: "Allocated", assignee: "Sai Yadav" },
  { id: 26, asset_code: "DEV-JET-26", asset_name: "JetBrains All Products Pack", asset_type: "Software License", cost: 22000, status: "Allocated", assignee: "Darsh Verma" },
  { id: 27, asset_code: "SUP-MON-27", asset_name: '24" BenQ Monitor', asset_type: "Peripherals", cost: 14000, status: "Allocated", assignee: "Sanya Gupta" },
  { id: 28, asset_code: "DEV-GNR-28", asset_name: "Generative AI CoPilot License", asset_type: "Software License", cost: 19000, status: "Available", assignee: "None" },
  { id: 29, asset_code: "FIN-MAC-29", asset_name: 'MacBook Air M3', asset_type: "Hardware", cost: 125000, status: "Allocated", assignee: "Tanvi Somani" },
  { id: 30, asset_code: "OPS-APL-30", asset_name: "Apple Studio Display", asset_type: "Peripherals", cost: 160000, status: "Available", assignee: "None" }
]);

  const [notifications, setNotifications] = useState ([
    { id: 1, title: "Dataset Extended Successfully", message: "60 active personnel profiles mapped cleanly into operational view matrix repositories.", type: "system" },
    { id: 2, title: "Location Filter Active", message: "Core records tagged to regional branches including Indore, Pune, and Mumbai.", type: "system" }
  ]);

  const departmentChartData = [
    { name: 'Software Dev', Members: 16, LeavesTaken: 2 },
    { name: 'QA', Members: 6, LeavesTaken: 1 },
    { name: 'HR', Members: 6, LeavesTaken: 1 },
    { name: 'Marketing', Members: 7, LeavesTaken: 2 },
    { name: 'Sales', Members: 7, LeavesTaken: 1 },
    { name: 'Operations', Members: 5, LeavesTaken: 1 },
    { name: 'Support/Finance', Members: 13, LeavesTaken: 0 }
  ];

  const assetPieData = [
    { name: 'Pending Approvals', value: 4 },
    { name: 'Settled Requests', value: 15 }
  ];

  const COLORS = ['#f59e0b', '#10b981'];

  // Form Field Trackers
  const [newEmp, setNewEmp] = useState ({ name: '', role: '', department: '', email: '', address: 'Indore', salary: '' });
  const [newAsset, setNewAsset] = useState({ asset_code: '', asset_name: '', asset_type: '', cost: '', assignee: '' });
  const [attendanceRecord, setAttendanceRecord] = useState ({ employee: '', classification: '', duration: '' });

  // Excel Spreadsheet Exporter
  const executeDataReportExport = (reportDataset, filenameString) => {
    const workspaceSheet = XLSX.utils.json_to_sheet (reportDataset);
    const workbookInstance = XLSX.utils.book_new ();
    XLSX.utils.book_append_sheet (workbookInstance, workspaceSheet, "Audit Summary");
    XLSX.writeFile (workbookInstance, `${filenameString}_Master_2026.xlsx`);
  };

  const handleCreateEmployee = (e) => {
    e.preventDefault ();
    const newId = `EMP${String (employees.length + 1).padStart (3, '0')}`;
    const addedEmployee = { id: newId, ...newEmp };
    setEmployees ([...employees, addedEmployee]);
    setMetrics (prev => ({ ...prev, totalPersonnel: prev.totalPersonnel + 1 }));
    setNewEmp ({ name: '', role: '', department: '', email: '', address: 'Indore', salary: '' });
    setActiveTab ('list');
  };

  const handleCreateAsset = (e) => {
  e.preventDefault();
  
  // Dynamically configure status based on assignment input
  const isAssigned = newAsset.assignee && newAsset.assignee !== 'None' && newAsset.assignee !== '';
  
  const assetObj = { 
    id: assets.length + 1, 
    ...newAsset, 
    status: isAssigned ? 'Allocated' : 'Available', 
    assignee: isAssigned ? newAsset.assignee : 'None' 
  };
  
  setAssets([...assets, assetObj]);
  setNewAsset({ asset_code: '', asset_name: '', asset_type: '', cost: '', assignee: '' });
  setActiveTab('assets');
};

  const handleLogAttendance = (e) => {
    e.preventDefault ();
    const pendingLeaveRecord = {
      _id: String (logs.length + 1),
      employee: attendanceRecord.employee || user?.name || "Lokpriya Jain",
      classification: attendanceRecord.classification,
      duration: attendanceRecord.duration,
      status: 'Pending'
    };
    
    setLogs ([...logs, pendingLeaveRecord]);
    setMetrics (prev => ({ ...prev, pendingReviews: prev.pendingReviews + 1 }));
    setAttendanceRecord ({ employee: '', classification: '', duration: '' });
    setActiveTab ('overview');
  };

  const handleReturnAsset = (assetId) => {
    setAssets (prevAssets => prevAssets.map (asset => asset.id === assetId ? { ...asset, status: 'Available', assignee: 'None' } : asset));
  };

  const globalFilterInterceptor = (dataArray, matchKeys) => {
    if (!globalSearchQuery) return dataArray;
    return dataArray.filter (item =>
      matchKeys.some (key => String (item[key] || '').toLowerCase ().includes (globalSearchQuery.toLowerCase ()))
    );
  };

  const handleSaveEmployeeDetails = () => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => emp.id === editForm.id ? { ...editForm } : emp)
    );
    setSelectedEmployee(editForm);
    setIsEditing(false);
  };
  const downloadCSV = (filename, headers, rows) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
  return (
    <div className="dashboard-layout">
      { /* Sidebar Controls */ }
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">DASHBOARD</div>
          <ul className="sidebar-menu">
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab ('overview')}>Overview Metrics</li>
            <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab ('analytics')}>Advanced Analytics</li>
            <li className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab ('list')}>Employee Directory ({employees.length})</li>
            <li className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab ('create')}>Add New Employee</li>
            <li className={activeTab === 'assets' ? 'active' : ''} onClick={() => setActiveTab ('assets')}>Asset Registry</li>
            <li className={activeTab === 'addAsset' ? 'active' : ''} onClick={() => setActiveTab ('addAsset')}>Procure Asset</li>
            <li className={activeTab === 'attendanceManager' ? 'active' : ''} onClick={() => setActiveTab ('attendanceManager')}>Attendance Manager</li>
            <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab ('notifications')}>Notifications Hub</li>
            <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab ('reports')}>Reports Panel</li>
          
          </ul>
        </div>

        <div className="user-profile-box">
          <span className="user-name">{user?.name || 'Lokpriya Jain'}</span>
          <span className="user-role">{user?.role || 'Admin'}</span>
          <button onClick={logout} className="signout-btn">Sign Out</button>
        </div>
      </aside>

      { /* Main Container Viewport */ }
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder=" 🔍 Filter 60 positions by Name, Core Department, Designation, or Base City..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery (e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-action approve" onClick={() => executeDataReportExport (employees, '60_Master_Employee_Database')}>Export Employees</button>
            <button className="btn-action approve" style={{ background: '#10b981' }} onClick={() => executeDataReportExport (logs, 'Master_Leave_Logs')}>Export Leaves</button>
          </div>
        </div>

        { /* METRICS DASHBOARD VIEW */ }
        {activeTab === 'overview' && (
          <>
            <header className="content-header">
              <h1>System Overview</h1>
              <p className="subtitle">Real-time enterprise tracking for {employees.length} indexed corporate roles.</p>
            </header>
            <section className="metrics-grid">
              <div className="metric-card"><div className="metric-title">Active Roster Personnel</div><div className="metric-value">{metrics.totalPersonnel}</div></div>
              <div className="metric-card"><div className="metric-title">Pending Active Leaves</div><div className="metric-value">{metrics.pendingReviews}</div></div>
              <div className="metric-card"><div className="metric-title">Approved Clearances</div><div className="metric-value">{metrics.approvedWindows}</div></div>
              <div className="metric-card"><div className="metric-title">Hardware Asset Items</div><div className="metric-value">{metrics.totalAssets}</div></div>
            </section>
            <section className="data-section">
              <h2>Leave Pipelines Log</h2>
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr><th>Employee</th><th>Classification</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    { globalFilterInterceptor (logs, ['employee', 'classification', 'status']).map ((log) => (
                      <tr key={log._id}>
                        <td><strong>{log.employee}</strong></td>
                        <td>{log.classification}</td>
                        <td>{log.duration}</td>
                        <td><span className={`badge ${log.status.toLowerCase ()}`}>{log.status}</span></td>
                        <td>
                          {log.status === 'Pending' ? (
                            <div className="action-cluster">
                              <button onClick={() => handleStatusChange (log._id, 'Approved')} className="btn-action approve">Approve</button>
                              <button onClick={() => handleStatusChange (log._id, 'Rejected')} className="btn-action reject">Reject</button>
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

        { /* GRAPH ADVANCED ANALYTICS VIEW - ALL 4 GRAPHS ARE VISIBLE HERE ONLY */ }
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Row 1: Original 2 Graphs */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '1rem' }}>
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)' }}>
                <h3>Headcount Mix Across Corporate Structure</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={departmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Members" fill ="#3b82f6" name="Total Staff Members" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="LeavesTaken" fill ="#ef4444" name="Leaves Active" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>Pipeline State Balance Mix</h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={assetPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {assetPieData.map ((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginTop: '1rem' }}>
                  <span style={{ color: '#f59e0b' }}>● Pending Review ({assetPieData[0].value})</span>
                  <span style={{ color: '#10b981' }}>● Settled ({assetPieData[1].value})</span>
                </div>
              </div>
            </div>

            {/* Row 2: Secondary 2 Graphs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              { /* GRAPH 3: FINANCIAL EXPENDITURE AREA CHART */ }
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)' }}>
                <h3>Salary Outflow Curve by Location (₹)</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.salaryData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="expense" stroke="#10B981" fill="#D1FAE5" name="Monthly Payroll" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              { /* GRAPH 4: OPERATIONS RADAR CHART */ }
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)' }}>
                <h3>Department Efficiency Evaluation</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={metrics.performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Target Benchmarks" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                      <Radar name="Current Efficiency" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        { /* EMPLOYEE DIRECTORY LIST VIEW */ }
        {activeTab === 'list' && (
          <section className="data-section">
            <h2>Active Roster Matrix ({employees.length} total profiles)</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Designation</th><th>Department</th><th>Base Branch</th><th>Remuneration</th></tr>
                </thead>
                <tbody>
                  { globalFilterInterceptor (employees, ['name', 'role', 'department', 'address']).map ((emp) => (
                    <tr key={emp.id} onClick={() => setSelectedEmployee (emp)} style={{ cursor: 'pointer' }}>
                      <td><span className="code-label">{emp.id}</span></td>
                      <td><strong>{emp.name}</strong><br/><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.email}</span></td>
                      <td>{emp.role}</td>
                      <td>{emp.department}</td>
                      <td>{emp.address}</td>
                      <td>₹{parseInt (emp.salary).toLocaleString ()}/mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        { /* ADD NEW EMPLOYEE TAB */ }
        {activeTab === 'create' && (
          <section className="form-card">
            <h2>Provision New Corporate Position</h2>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-grid">
                <div className="form-group"><label>Full Legal Name</label><input type="text" value={newEmp.name} onChange={(e) => setNewEmp ({...newEmp, name: e.target.value})} required /></div>
                <div className="form-group"><label>Corporate Designation</label><input type="text" value={newEmp.role} onChange={(e) => setNewEmp ({...newEmp, role: e.target.value})} required /></div>
                <div className="form-group"><label>Allocated Department</label><input type="text" value={newEmp.department} onChange={(e) => setNewEmp ({...newEmp, department: e.target.value})} required /></div>
                <div className="form-group"><label>Corporate Email Endpoint</label><input type="email" value={newEmp.email} onChange={(e) => setNewEmp ({...newEmp, email: e.target.value})} required /></div>
                <div className="form-group">
                  <label>Base Operations Branch</label>
                  <select value={newEmp.address} onChange={(e) => setNewEmp ({...newEmp, address: e.target.value})}>
                    <option value="Indore">Indore Hub</option><option value="Mumbai">Mumbai Branch</option><option value="Pune">Pune Tech Center</option><option value="Bangalore">Bangalore HQ</option><option value="Delhi">Delhi Corridor</option>
                  </select>
                </div>
                <div className="form-group"><label>Monthly Base Gross Salary (₹)</label><input type="number" value={newEmp.salary} onChange={(e) => setNewEmp ({...newEmp, salary: e.target.value})} required /></div>
              </div>
              <button type="submit" className="btn-action approve" style={{ marginTop: '1.5rem', width: '100%' }}>Commit Profile to Master Database</button>
            </form>
          </section>
        )}

        { /* ASSET REGISTRY TAB */ }
        {activeTab === 'assets' && (
          <section className="data-section">
            <h2>Hardware & Cloud Registry Matrix</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr><th>Asset Tag</th><th>Descriptor</th><th>Classification</th><th>Evaluation Cost</th><th>Operational Status</th><th>Current Holder</th></tr>
                </thead>
                <tbody>
                  { globalFilterInterceptor (assets, ['asset_code', 'asset_name', 'asset_type', 'assignee']).map ((asset) => (
                    <tr key={asset.id}>
                      <td><span className="code-label">{asset.asset_code}</span></td>
                      <td><strong>{asset.asset_name}</strong></td>
                      <td>{asset.asset_type}</td>
                      <td>₹{asset.cost.toLocaleString ()}</td>
                      <td><span className={`badge ${asset.status === 'Allocated' ? 'rejected' : 'approved'}`}>{asset.status}</span></td>
                      <td>
                        {asset.status === 'Allocated' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{asset.assignee}</span>
                            <button onClick={() => handleReturnAsset (asset.id)} className="btn-action reject" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Deallocate</button>
                          </div>
                        ) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned Vault</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        { /* PROCURE ASSET TAB */ }
        {activeTab === 'addAsset' && (
          <section className="form-card">
            <h2>Inventory Procurement Request</h2>
            <form onSubmit={handleCreateAsset}>
              <div className="form-grid">
                <div className="form-group"><label>Asset Serial Code Prefix</label><input type="text" placeholder="e.g. HW-LAP-99" value={newAsset.asset_code} onChange={(e) => setNewAsset ({...newAsset, asset_code: e.target.value})} required /></div>
                <div className="form-group"><label>Asset Explicit Title</label><input type="text" placeholder="e.g. MacBook Pro M3" value={newAsset.asset_name} onChange={(e) => setNewAsset ({...newAsset, asset_name: e.target.value})} required /></div>
                <div className="form-group">
                  <label>Resource Classification</label>
                  <select value={newAsset.asset_type} onChange={(e) => setNewAsset ({...newAsset, asset_type: e.target.value})} required>
                    <option value="">Select Category...</option><option value="Workstation Hardware">Workstation Hardware</option><option value="Software License">Software License</option><option value="Infrastructure Cloud">Infrastructure Cloud</option><option value="Peripherals">Peripherals</option>
                  </select>
                </div>
                <div className="form-group"><label>Procurement Ledger Value (₹)</label><input type="number" value={newAsset.cost} onChange={(e) => setNewAsset ({...newAsset, cost: e.target.value})} required /></div>
              </div>
              <button type="submit" className="btn-action approve" style={{ marginTop: '1.5rem', width: '100%' }}>Register Asset Voucher</button>
            </form>
          </section>
        )}

        { /* ATTENDANCE MANAGER TAB */ }
        {activeTab === 'attendanceManager' && (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm p-4">
    <table className="w-full min-w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/70">
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Employee ID</th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status Dropdown</th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Metrics Counters</th>
          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Remarks Text Box</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {employees.map((emp) => {
          const statusStyles = {
            P: "bg-green-50 text-green-700 border-green-200",
            A: "bg-red-50 text-red-700 border-red-200",
            L: "bg-amber-50 text-amber-700 border-amber-200"
          }[emp.status] || "bg-gray-50 text-gray-700 border-gray-200";

          return (
            <tr key={emp.id} className="transition-colors hover:bg-gray-50/50">
              <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">{emp.id}</td>
              <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">{emp.name}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                  {emp.domain}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <select
                  value={emp.status}
                  onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold outline-none transition-all shadow-sm ${statusStyles}`}
                >
                  <option value="P" className="bg-white text-green-700 font-semibold">Present</option>
                  <option value="A" className="bg-white text-red-700 font-semibold">Absent</option>
                  <option value="L" className="bg-white text-amber-700 font-semibold">Late</option>
                </select>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex flex-col space-y-1 text-xs text-gray-500">
                  <div>
                    <span className="font-medium text-gray-700">Med:</span> 
                    <span className="ml-1 font-semibold text-gray-900">{emp.medicalLeavesLeft}</span>
                    <span className="text-gray-400">/10</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cas:</span> 
                    <span className="ml-1 font-semibold text-gray-900">{emp.casualLeavesLeft}</span>
                    <span className="text-gray-400">/5</span>
                  </div>
                  <div>
                    <span className="font-medium text-amber-600">Lates:</span> 
                    <span className="ml-1 font-semibold text-amber-700">{emp.lateCount}</span>
                    <span className="text-gray-300">/3</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  placeholder="Optional remark..."
                  value={emp.remarks || ''}
                  onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50/30 px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
        )}
        
        {activeTab === 'reports' && (
  <div className="space-y-8 p-6 max-w-7xl mx-auto animate-fade-in text-slate-800">
    
    {/* Page Header Area */}
    <div className="border-b border-gray-100 pb-5">
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Financial Compliance Reports</h2>
      <p className="text-sm text-slate-500 mt-1">Generate dynamic computational audits, statutory deductions logs, and export system arrays instantly.</p>
    </div>

    {/* Report 1, 2 & 5: Payroll & Attendance Consolidated Master Panel */}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/60">
        <div>
          <h3 className="font-bold text-slate-900 text-base">1, 2 & 5. Master Payroll Ledger & Performance Metrics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Calculated tracking parameters across organizational statutory withholdings (TDS, ESIC, PF).</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => {
              const headers = ["Employee ID", "Name", "Base Salary", "TDS Deductions (10%)", "ESIC (0.75%)", "PF (12%)", "Net Take-Home"];
              const rows = employees.map(e => ["STU0001", "STU0002"].includes(e.id) 
                ? [e.id, e.name, "45000", "4500", "337", "5400", "34763"]
                : [e.id, e.name, "35000", "3500", "262", "4200", "27038"]
              );
              const content = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
              const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
              const lnk = document.createElement('a'); lnk.href = URL.createObjectURL(blob);
              lnk.download = "Salary_TDS_PF_Compliance_Ledger.csv"; lnk.click();
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <span>📥 Export Payroll Logs</span>
          </button>
          <button 
            onClick={() => {
              const headers = ["Employee ID", "Name", "Department", "Status", "Medical Balances", "Casual Balances", "Late Incidents"];
              const rows = employees.map(e => [e.id, e.name, e.domain, e.status, e.medicalLeavesLeft, e.casualLeavesLeft, e.lateCount]);
              const content = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
              const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
              const lnk = document.createElement('a'); lnk.href = URL.createObjectURL(blob);
              lnk.download = "Global_Attendance_Audit.csv"; lnk.click();
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <span>📥 Export Attendance CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Base Gross</th>
              <th className="px-6 py-4">TDS (10%)</th>
              <th className="px-6 py-4">ESIC (0.75%)</th>
              <th className="px-6 py-4">PF (12%)</th>
              <th className="px-6 py-4">Net Paycheck</th>
              <th className="px-6 py-4">Active Roster Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {employees.slice(0, 5).map(e => {
              const isHighScale = ["STU0001", "STU0002"].includes(e.id);
              return (
                <tr key={e.id} className="transition-colors hover:bg-slate-50/40">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-400">{e.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">{e.name}</td>
                  <td className="whitespace-nowrap px-6 py-4">₹{isHighScale ? "45,000" : "35,000"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-rose-600 font-semibold">-{isHighScale ? "₹4,500" : "₹3,500"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">-{isHighScale ? "₹337" : "₹262"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">-{isHighScale ? "₹5,400" : "₹4,200"}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-extrabold text-emerald-600">₹{isHighScale ? "34,763" : "27,038"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">
                    <div className="flex space-x-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Med: {e.medicalLeavesLeft}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Cas: {e.casualLeavesLeft}</span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">Lates: {e.lateCount}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50/30 border-t border-slate-100 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          💡 Showing live table preview rows. Trigger download actions above to pull complete organization dataset.
        </div>
      </div>
    </div>

    {/* Report 3 & 4: Distribution Breakdown Double Component Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Report 3: Domain Metrics Allocation Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">3. Domain Deployment Audits</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution allocation parameters across organizational roles.</p>
            </div>
            <button 
              onClick={() => {
                const headers = ["Operating Segment", "Total Active Allocation Headcount"];
                const rows = [["Software Dev", "18"], ["QA Testing", "7"], ["HR", "6"], ["Marketing", "8"], ["Sales", "7"], ["Support/Finance", "14"]];
                const content = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
                const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                const lnk = document.createElement('a'); lnk.href = URL.createObjectURL(blob);
                lnk.download = "Domain_Allocation_Metrics.csv"; lnk.click();
              }}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Export Segments
            </button>
          </div>
          
          <div className="mt-6 space-y-4">
            {[
              { name: "Software Dev", count: 18, color: "bg-blue-500" },
              { name: "Support/Finance", count: 14, color: "bg-emerald-500" },
              { name: "Marketing", count: 8, color: "bg-purple-500" },
              { name: "QA Testing", count: 7, color: "bg-amber-500" },
              { name: "Sales", count: 7, color: "bg-pink-500" },
              { name: "HR Operations", count: 6, color: "bg-slate-400" }
            ].map(d => (
              <div key={d.name} className="flex items-center text-xs justify-between">
                <span className="text-slate-600 font-bold w-1/4">{d.name}</span>
                <div className="flex items-center space-x-3 w-3/4">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${d.color} h-full transition-all duration-500`} style={{ width: `${(d.count / 60) * 100}%` }}></div>
                  </div>
                  <span className="font-extrabold text-slate-900 w-12 text-right">{d.count} Users</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report 4: City Spatial Concentration Metrics */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">4. Regional Demographic Footprint</h3>
              <p className="text-xs text-slate-400 mt-0.5">Demographic concentrations grouped by operational hiring centers.</p>
            </div>
            <button 
              onClick={() => {
                const headers = ["Hiring Core Hub", "Headcount Capacity Registered"];
                const rows = [["Indore Core Hub", "26"], ["Mumbai Area", "14"], ["Pune Engineering", "11"], ["Bangalore Annex", "9"]];
                const content = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
                const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                const lnk = document.createElement('a'); lnk.href = URL.createObjectURL(blob);
                lnk.download = "Regional_Demographics_Audit.csv"; lnk.click();
              }}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Export Locations
            </button>
          </div>
          
          <div className="mt-5 space-y-1 divide-y divide-slate-50">
            {[
              { hub: "Indore (Corporate Headquarters Core)", population: 26, fraction: "43.3%" },
              { hub: "Mumbai (Commercial Operations Base)", population: 14, fraction: "23.3%" },
              { hub: "Pune (Technology Engineering Operations)", population: 11, fraction: "18.3%" },
              { hub: "Bangalore (Core Product Development Annex)", population: 9, fraction: "15.0%" }
            ].map(c => (
              <div key={c.hub} className="flex items-center justify-between py-3.5 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50"></span>
                  <span className="text-slate-600 font-bold">{c.hub}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900">{c.population} Allocated</span>
                  <span className="text-slate-400 font-semibold ml-2 text-[11px]">({c.fraction})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  </div>
)}
        { /* NOTIFICATIONS HUB TAB */ }
        {activeTab === 'notifications' && (
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)' }}>
            <h2>System Message Dispatch Matrix Hub</h2>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
            {notifications.map (notif => (
              <div key={notif.id} className="notification-item" style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{notif.title}</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      { /* EXPANDED SYSTEM DETAIL DRAWER */ }
      {selectedEmployee && (
  <div className="modal-overlay" style={{ zIndex: 1000 }}>
    <div className="modal-content" style={{ width: '650px', maxWidth: '90%', padding: '2rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
      <button className="close-modal" onClick={() => { setSelectedEmployee(null); setIsEditing(false); }}>×</button>
      
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Personnel File: #{selectedEmployee.id}</h2>
        {!isEditing ? (
          <button 
            onClick={() => { setIsEditing(true); setEditForm({ ...selectedEmployee }); }}
            style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleSaveEmployeeDetails}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💾 Save & Commit
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '1.5rem' }} />

      {!isEditing ? (
        /* READ-ONLY MULTI-COLUMN CARD DASHBOARD VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>FULL NAME</label><p style={{ margin: '0.25rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedEmployee.name}</p></div>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>ROLE / DESIGNATION</label><p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>{selectedEmployee.role || selectedEmployee.designation || 'N/A'}</p></div>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>SALARY (MONTHLY)</label><p style={{ margin: '0.25rem 0', color: '#0f766e', fontWeight: 'bold' }}>₹{Number(selectedEmployee.salary || 45000).toLocaleString()}</p></div>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>METRO CITY LOCATION</label><p style={{ margin: '0.25rem 0' }}>📍 {selectedEmployee.city || 'Indore'}</p></div>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>GRADUATION DEGREE</label><p style={{ margin: '0.25rem 0' }}>🎓 {selectedEmployee.graduation || 'B.Tech CS / IT'}</p></div>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>WORK EXPERIENCE</label><p style={{ margin: '0.25rem 0' }}>⏱️ {selectedEmployee.experience || '2.5 Years'}</p></div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid #e2e8f0' }}>
            <div><label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>LIVE ATTENDANCE RATE</label><p style={{ margin: '0.15rem 0', color: '#16a34a', fontWeight: 'bold' }}>{selectedEmployee.attendance || '94.2%'}</p></div>
            <div><label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>LEAVES TAKEN YTD</label><p style={{ margin: '0.15rem 0', color: '#dc2626', fontWeight: 'bold' }}>{selectedEmployee.leavesTaken || '3 Days'}</p></div>
            <div><label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>PROGRESS METRIC REPORT</label><p style={{ margin: '0.15rem 0', color: '#2563eb', fontWeight: 'bold' }}>{selectedEmployee.progressReport || 'Excellent Performance'}</p></div>
            <div><label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>TASK SUBMISSIONS RATE</label><p style={{ margin: '0.15rem 0', fontWeight: 'bold' }}>{selectedEmployee.taskSubmissions || '28 / 30 Passed'}</p></div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE DYNAMIC FORM COMMIT INPUTS */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Employee Name</label>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Designation</label>
            <input type="text" value={editForm.role || editForm.designation} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Salary (₹)</label>
            <input type="number" value={editForm.salary || 45000} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>City</label>
            <input type="text" value={editForm.city || 'Indore'} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Graduation</label>
            <input type="text" value={editForm.graduation || 'B.Tech CS / IT'} onChange={(e) => setEditForm({ ...editForm, graduation: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Work Experience</label>
            <input type="text" value={editForm.experience || '2.5 Years'} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Attendance Rate</label>
            <input type="text" value={editForm.attendance || '94.2%'} onChange={(e) => setEditForm({ ...editForm, attendance: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                   <th style={{ padding: '1rem' }}>STUDENT/EMPLOYEE</th>
                   <th style={{ padding: '1rem' }}>DOMAIN</th>
                   <th style={{ padding: '1rem' }}>STATUS</th>
                   <th style={{ padding: '1rem' }}>LEAVE TYPE (IF ABSENT)</th>
                   <th style={{ padding: '1rem' }}>LEAVES REMAINING</th>
                   <th style={{ padding: '1rem' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>

      {/* The .map loop lives directly inside the tbody tags */}
      {employees.map((emp) => (
        <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
          
          {/* 1. Name & ID */}
          <td style={{ padding: '1rem' }}>
            <div style={{ fontWeight: '600', color: '#1e293b' }}>{emp.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.id}</div>
          </td>

          {/* 2. Domain Tag */}
          <td style={{ padding: '1rem' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {emp.domain}
            </span>
          </td>

          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
  <table className="w-full min-w-full border-collapse text-left text-sm">
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50/70">
        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Employee ID</th>
        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status Dropdown</th>
        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Metrics Counters</th>
        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Remarks Text Box</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {employees.map((emp) => {
        // Dynamic status color pill styling
        const statusStyles = {
          P: "bg-green-50 text-green-700 border-green-200",
          A: "bg-red-50 text-red-700 border-red-200",
          L: "bg-amber-50 text-amber-700 border-amber-200"
        }[emp.status] || "bg-gray-50 text-gray-700 border-gray-200";

        return (
          <tr key={emp.id} className="transition-colors hover:bg-gray-50/50">
            {/* 1. Employee ID */}
            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">{emp.id}</td>
            
            {/* 2. Name */}
            <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">{emp.name}</td>
            
            {/* 3. Department */}
            <td className="whitespace-nowrap px-6 py-4">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                {emp.domain}
              </span>
            </td>
            
            {/* 4. Status Selection Dropdown */}
            <td className="whitespace-nowrap px-6 py-4">
              <select
                value={emp.status}
                onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold outline-none transition-all shadow-sm ${statusStyles}`}
              >
                <option value="P" className="bg-white text-green-700 font-semibold">Present</option>
                <option value="A" className="bg-white text-red-700 font-semibold">Absent</option>
                <option value="L" className="bg-white text-amber-700 font-semibold">Late</option>
              </select>
            </td>
            
            {/* 5. Metrics Panel */}
            <td className="whitespace-nowrap px-6 py-4">
              <div className="flex flex-col space-y-1 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">Med:</span> 
                  <span className="ml-1 font-semibold text-gray-900">{emp.medicalLeavesLeft}</span>
                  <span className="text-gray-400">/10</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cas:</span> 
                  <span className="ml-1 font-semibold text-gray-900">{emp.casualLeavesLeft}</span>
                  <span className="text-gray-400">/5</span>
                </div>
                <div>
                  <span className="font-medium text-amber-600">Lates:</span> 
                  <span className="ml-1 font-semibold text-amber-700">{emp.lateCount}</span>
                  <span className="text-gray-300">/3</span>
                </div>
              </div>
            </td>
            
            {/* 6. Remarks Input */}
            <td className="px-6 py-4">
              <input
                type="text"
                placeholder="Optional remark..."
                value={emp.remarks || ''}
                onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                className="w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50/30 px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

          {/* 5. Metrics & Counters */}
          <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#475569' }}>
            <div>Med: <strong>{emp.medicalLeavesLeft}/10</strong></div>
            <div>Cas: <strong>{emp.casualLeavesLeft}/5</strong></div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Lates: {emp.lateCount}/3</div>
          </td>

          {/* 6. Remarks Text Box */}
          <td style={{ padding: '1rem' }}>
            <input
              type="text"
              placeholder="Optional remark..."
              value={emp.remarks || ''}
              onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
            />
          </td>
        </tr>
      ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}
export default Dashboard;