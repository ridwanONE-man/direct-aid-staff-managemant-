import { EmployeeContract, EmployeeRecord } from '../types';

// Contracts ending within this many days are flagged for renewal
export const RENEWAL_WINDOW_DAYS = 60;

export const daysUntil = (isoDate: string) => {
  const end = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

// Status worked out from today's date, so it stays correct as time passes
export const liveRenewalStatus = (contract: EmployeeContract): EmployeeContract['renewalStatus'] => {
  if (!contract.endDate) return contract.renewalStatus;
  const days = daysUntil(contract.endDate);
  if (Number.isNaN(days)) return contract.renewalStatus;
  if (days < 0) return 'Expired';
  if (days <= RENEWAL_WINDOW_DAYS) {
    return contract.renewalStatus === 'Renewal Pending Sign-off' ? 'Renewal Pending Sign-off' : 'Approaching Renewal';
  }
  return contract.renewalStatus === 'Renewed' ? 'Renewed' : 'Not Due';
};

export const withLiveContractStatus = (emp: EmployeeRecord): EmployeeRecord => {
  const status = liveRenewalStatus(emp.contract);
  return status === emp.contract.renewalStatus ? emp : { ...emp, contract: { ...emp.contract, renewalStatus: status } };
};

export const needsRenewal = (emp: EmployeeRecord) =>
  emp.contract.renewalStatus === 'Approaching Renewal' ||
  emp.contract.renewalStatus === 'Renewal Pending Sign-off' ||
  emp.contract.renewalStatus === 'Expired';
