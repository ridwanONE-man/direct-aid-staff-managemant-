import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EmploymentType } from '../../types';
import { X, FileText, CheckCircle2 } from 'lucide-react';

export const RenewContractModal: React.FC = () => {
  const {
    isRenewContractOpen,
    setIsRenewContractOpen,
    contractRenewalTarget,
    setContractRenewalTarget,
    renewContract
  } = useApp();

  const employee = contractRenewalTarget;

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationYears, setDurationYears] = useState(2);
  const [contractType, setContractType] = useState<EmploymentType>('Fixed-Term Contract');
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState(600);
  const [salaryGrade, setSalaryGrade] = useState('Grade T-2 (Senior Secondary Teacher)');
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);

  useEffect(() => {
    if (employee) {
      setMonthlyBaseSalary(employee.contract.monthlyBaseSalary || 600);
      setSalaryGrade(employee.contract.salaryGrade || 'Grade T-2');
      setContractType(employee.contract.contractType || 'Fixed-Term Contract');
    }
  }, [employee]);

  if (!isRenewContractOpen || !employee) return null;

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();

    const endDate = new Date(new Date(startDate).getTime() + durationYears * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newRef = `CTR-RNW-${employee.campusLocation === 'Gabiley' ? 'GBL' : 'HRG'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    renewContract(employee.id, {
      referenceNo: newRef,
      startDate,
      endDate,
      contractType,
      monthlyBaseSalary: Number(monthlyBaseSalary),
      salaryGrade,
      noticePeriodDays: Number(noticePeriodDays)
    });

    setIsRenewContractOpen(false);
    setContractRenewalTarget(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2EAE4] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#192C21]">Renew Employment Contract</h3>
              <p className="text-[11px] text-[#57685D]">{employee.fullName} ({employee.id})</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsRenewContractOpen(false);
              setContractRenewalTarget(null);
            }}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRenew} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-[#F8FAF9] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Expiry</span>
              <span className="font-mono font-bold text-amber-800">{employee.contract.endDate}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Salary</span>
              <span className="font-mono font-bold text-slate-800">${employee.contract.monthlyBaseSalary} USD</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Renewal Term Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contract Extension</label>
              <select
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value={1}>1 Academic Year (12 Months)</option>
                <option value={2}>2 Academic Years (24 Months)</option>
                <option value={3}>3 Academic Years</option>
                <option value={5}>5 Years (Permanent Conversion)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contract Type</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="Fixed-Term Contract">Fixed-Term Contract</option>
                <option value="Permanent">Permanent (Tenured)</option>
                <option value="Part-Time">Part-Time Instructor</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Revised Monthly Salary (USD)</label>
              <input
                type="number"
                value={monthlyBaseSalary}
                onChange={(e) => setMonthlyBaseSalary(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Revised Salary Grade</label>
            <input
              type="text"
              value={salaryGrade}
              onChange={(e) => setSalaryGrade(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#E2EAE4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRenewContractOpen(false);
                setContractRenewalTarget(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm &amp; Issue Renewal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
