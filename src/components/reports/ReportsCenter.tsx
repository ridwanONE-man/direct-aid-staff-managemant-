import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const {
    employees,
    divisions,
    complianceItems,
    toggleComplianceStatus
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<'census' | 'compliance' | 'ratio' | 'payroll'>('census');

  const totalStaff = employees.length;
  const hrgCount = employees.filter(e => e.campusLocation === 'Hargeisa').length;
  const gblCount = employees.filter(e => e.campusLocation === 'Gabiley').length;
  const teachersCount = employees.filter(e => e.jobTitle === 'Teacher').length;
  const principalsCount = employees.filter(e => e.jobTitle === 'Principal' || e.jobTitle === 'Deputy Principal').length;
  const securityCount = employees.filter(e => e.jobTitle === 'Security Guard').length;
  const cleanersCount = employees.filter(e => e.jobTitle === 'Cleaner').length;
  const driversCount = employees.filter(e => e.jobTitle === 'Driver').length;

  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (e.contract.monthlyBaseSalary || 0), 0);

  const downloadReportCSV = (reportName: string) => {
    let rows: string[][] = [];

    if (reportName === 'census') {
      rows = [
        ['Division Code', 'Division Name', 'Campus City', 'Level', 'Gender Wing', 'Total Staff', 'Principal in Charge'],
        ...divisions.map(d => {
          const count = employees.filter(e => e.divisionId === d.id).length;
          return [d.code, `"${d.name}"`, d.city, d.level, d.gender, String(count), `"${d.principalName}"`];
        })
      ];
    } else if (reportName === 'payroll') {
      rows = [
        ['Employee ID', 'Full Name', 'Division', 'Job Title', 'Contract Ref', 'Monthly Base (USD)', 'Status'],
        ...employees.map(e => [
          e.id,
          `"${e.fullName}"`,
          `"${e.divisionName}"`,
          `"${e.jobTitle}"`,
          e.contract.referenceNo,
          String(e.contract.monthlyBaseSalary),
          e.employmentStatus
        ])
      ];
    } else {
      rows = [
        ['Audit Item', 'Division', 'Category', 'Severity', 'Affected Count', 'Due Date', 'Status'],
        ...complianceItems.map(c => [
          `"${c.title}"`,
          `"${c.divisionName}"`,
          c.category,
          c.severity,
          String(c.affectedCount),
          c.dueDate,
          c.status
        ])
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DirectAid_${reportName}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-[#192C21] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#147D4A]" />
              Audit &amp; Reports
            </h1>
            <span className="text-xs bg-[#EBF7EE] text-[#147D4A] font-bold px-2.5 py-0.5 rounded-full font-mono">
              DirectAid
            </span>
          </div>
          <p className="text-xs text-[#57685D] mt-1">
            Institutional compliance audits, annual census, teacher ratios, and payroll registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#192C21] bg-white hover:bg-[#F3F7F4] border border-[#E2EAE4] rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#57685D]" />
            <span>Print</span>
          </button>

          <button
            onClick={() => downloadReportCSV(selectedReport)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          { id: 'census', title: 'Staff Census', desc: 'Workforce counts across campuses', icon: <Users className="w-4 h-4 text-[#147D4A]" /> },
          { id: 'compliance', title: 'HR Compliance', desc: 'Dossier & police checks tracking', icon: <ShieldCheck className="w-4 h-4 text-amber-600" /> },
          { id: 'ratio', title: 'Teacher Ratios', desc: 'Student-to-teacher benchmarks', icon: <BarChart3 className="w-4 h-4 text-blue-600" /> },
          { id: 'payroll', title: 'Payroll Register', desc: 'Monthly compensation schedules', icon: <DollarSign className="w-4 h-4 text-emerald-600" /> }
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReport(rep.id as any)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedReport === rep.id
                ? 'bg-white border-[#147D4A] shadow-md ring-2 ring-[#147D4A]/10'
                : 'bg-white border-[#E2EAE4] hover:border-slate-300 shadow-2xs hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-xs text-[#192C21]">{rep.title}</div>
              {rep.icon}
            </div>
            <p className="text-[11px] text-[#57685D] leading-tight">{rep.desc}</p>
          </button>
        ))}
      </div>

      {/* Selected Report Content */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs space-y-5">
        {selectedReport === 'census' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#192C21]">Annual Workforce Census</h3>
                <p className="text-xs text-[#57685D]">Official distribution across Hargeisa and Gabiley divisions.</p>
              </div>
              <button
                onClick={() => downloadReportCSV('census')}
                className="text-xs font-semibold text-[#147D4A] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export Census
              </button>
            </div>

            {/* Census KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-[#57685D] text-[11px] block">Total Staff</span>
                <span className="text-xl font-black font-mono text-[#192C21]">{totalStaff}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{hrgCount} Hrg · {gblCount} Gbl</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-[#57685D] text-[11px] block">Teachers</span>
                <span className="text-xl font-black font-mono text-[#147D4A]">{teachersCount}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Secondary &amp; Primary</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-[#57685D] text-[11px] block">Principals</span>
                <span className="text-xl font-black font-mono text-[#192C21]">{principalsCount}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Division Leads</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-[#57685D] text-[11px] block">Support Staff</span>
                <span className="text-xl font-black font-mono text-[#192C21]">{securityCount + cleanersCount + driversCount}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Security, Cleaners, Drivers</span>
              </div>
            </div>

            {/* Table of Divisions */}
            <div className="border border-[#E2EAE4] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAF9] border-b border-[#E2EAE4] text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Division</th>
                    <th className="py-2.5 px-3.5">Campus</th>
                    <th className="py-2.5 px-3.5">Principal</th>
                    <th className="py-2.5 px-3.5">Staff</th>
                    <th className="py-2.5 px-3.5">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {divisions.map((d) => {
                    const count = employees.filter(e => e.divisionId === d.id).length;
                    return (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3.5 font-mono text-slate-500">{d.canonicalIndex}</td>
                        <td className="py-2.5 px-3.5 font-bold text-[#192C21]">{d.name}</td>
                        <td className="py-2.5 px-3.5 text-slate-600">{d.city}</td>
                        <td className="py-2.5 px-3.5 text-slate-700">{d.principalName}</td>
                        <td className="py-2.5 px-3.5 font-mono font-bold text-[#147D4A]">{count}</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-700">{d.studentCount || 'HQ'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'compliance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#192C21]">HR Compliance Tracker</h3>
                <p className="text-xs text-[#57685D]">
                  Click on status to toggle progress (Open → In Progress → Resolved).
                </p>
              </div>
              <button
                onClick={() => downloadReportCSV('compliance')}
                className="text-xs font-semibold text-[#147D4A] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export Audit List
              </button>
            </div>

            <div className="space-y-2.5">
              {complianceItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        item.severity === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.severity}
                      </span>
                      <span className="font-bold text-[#192C21] text-xs">{item.title}</span>
                    </div>
                    <p className="text-slate-600 text-xs">{item.description}</p>
                    <div className="text-[11px] text-slate-400">
                      Division: <strong className="text-slate-700">{item.divisionName}</strong> · Due: {item.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleComplianceStatus(item.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                        item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                        item.status === 'In Progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                        'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {item.status === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.status === 'In Progress' && <Clock className="w-3.5 h-3.5" />}
                      {item.status === 'Open' && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{item.status}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedReport === 'ratio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#192C21]">Teacher-to-Student Ratio Verification</h3>
                <p className="text-xs text-[#57685D]">
                  International NGO target benchmark: maximum 1:32 per classroom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {divisions.filter(d => d.level !== 'Central Operations').map((div) => {
                const teachers = employees.filter(e => e.divisionId === div.id && e.jobTitle === 'Teacher').length;
                const ratio = teachers > 0 ? Math.round(div.studentCount / teachers) : div.studentCount;
                const isOptimal = ratio <= 32;

                return (
                  <div key={div.id} className="p-3.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#192C21] text-xs">{div.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {div.studentCount} Students · {teachers} Teachers
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-black font-mono ${isOptimal ? 'text-[#147D4A]' : 'text-amber-700'}`}>
                        1:{ratio}
                      </span>
                      <span className={`text-[10px] block font-semibold ${isOptimal ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isOptimal ? '✓ Compliant' : '⚠️ Warning'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedReport === 'payroll' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#192C21]">Monthly Payroll Schedule</h3>
                <p className="text-xs text-[#57685D]">Compensation register for DirectAid operations.</p>
              </div>
              <button
                onClick={() => downloadReportCSV('payroll')}
                className="text-xs font-semibold text-[#147D4A] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export Schedule
              </button>
            </div>

            <div className="p-4 bg-[#EBF7EE] border border-[#C5E8D2] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#147D4A] block">Total Monthly Commitment</span>
                <span className="text-2xl font-black font-mono text-[#192C21]">${totalMonthlyPayroll.toLocaleString()} USD</span>
              </div>
              <span className="text-xs bg-white text-[#147D4A] border border-[#C5E8D2] px-3 py-1 rounded-full font-bold">
                USD
              </span>
            </div>

            <div className="border border-[#E2EAE4] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAF9] border-b border-[#E2EAE4] text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">ID</th>
                    <th className="py-2.5 px-3.5">Staff Name</th>
                    <th className="py-2.5 px-3.5">Role</th>
                    <th className="py-2.5 px-3.5">Contract Ref</th>
                    <th className="py-2.5 px-3.5">Grade</th>
                    <th className="py-2.5 px-3.5 text-right">Monthly Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5 text-[#147D4A] font-bold">{emp.id}</td>
                      <td className="py-2.5 px-3.5 font-sans font-bold text-[#192C21]">{emp.fullName}</td>
                      <td className="py-2.5 px-3.5 font-sans text-slate-700">{emp.jobTitle}</td>
                      <td className="py-2.5 px-3.5 text-slate-500">{emp.contract.referenceNo}</td>
                      <td className="py-2.5 px-3.5 font-sans text-slate-600">{emp.contract.salaryGrade}</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-[#192C21]">
                        ${emp.contract.monthlyBaseSalary}
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
  );
};
