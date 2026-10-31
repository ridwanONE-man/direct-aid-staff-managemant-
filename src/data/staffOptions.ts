import { JobRole } from '../types';

// Choices offered when registering or editing staff
export const JOB_ROLES: { value: JobRole; label: string }[] = [
  { value: 'Principal', label: 'Principal / Headmaster' },
  { value: 'Deputy Principal', label: 'Deputy Principal' },
  { value: 'Teacher', label: 'Teacher / Instructor' },
  { value: 'Security Guard', label: 'Security Guard' },
  { value: 'Cleaner', label: 'Cleaner' },
  { value: 'Driver', label: 'Bus Driver' },
  { value: 'Secretary', label: 'Secretary' },
  { value: 'Finance Officer', label: 'Finance Officer' },
  { value: 'IT Support Officer', label: 'IT Support Officer' },
  { value: 'Administrative Officer', label: 'Administrative Officer' }
];

export const EMPLOYMENT_TYPES = [
  { value: 'Fixed-Term Contract', label: 'Fixed-Term Contract' },
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Probationary', label: 'Probationary (3 Months)' },
  { value: 'Part-Time', label: 'Part-Time' }
];

export const TEACHING_SUBJECTS = [
  { value: 'Pure Mathematics & Calculus', label: 'Pure Mathematics' },
  { value: 'Physics & Physical Sciences', label: 'Physics' },
  { value: 'Chemistry & Laboratory', label: 'Chemistry' },
  { value: 'Biology & Life Sciences', label: 'Biology' },
  { value: 'Arabic Language & Grammar', label: 'Arabic Language' },
  { value: 'Islamic Studies & Sharia', label: 'Islamic Studies' },
  { value: 'Somali Literature & History', label: 'Somali Literature' },
  { value: 'English Language & Composition', label: 'English Language' },
  { value: 'Primary Numeracy & Literacy', label: 'Primary Numeracy & Literacy' },
  { value: 'ICT & Computer Science', label: 'ICT' }
];

export const CONTRACT_DURATIONS = [
  { value: '1', label: '1 Year' },
  { value: '2', label: '2 Years' },
  { value: '3', label: '3 Years' }
];

export const SHIFT_SCHEDULES = [
  { value: 'Morning Shift (07:00 - 13:00)', label: 'Morning Shift (07:00 - 13:00)' },
  { value: 'Afternoon Shift (13:00 - 18:00)', label: 'Afternoon Shift (13:00 - 18:00)' },
  { value: 'Full Day (07:00 - 16:00)', label: 'Full Day (07:00 - 16:00)' },
  { value: 'Night Shift (18:00 - 06:00)', label: 'Night Shift (18:00 - 06:00)' }
];

export const PAYMENT_METHODS = [
  { value: 'ZAAD (Telesom)', label: 'ZAAD (Telesom)' },
  { value: 'e-Dahab', label: 'e-Dahab' },
  { value: 'Dahabshiil Bank', label: 'Dahabshiil Bank' },
  { value: 'Premier Bank', label: 'Premier Bank' }
];
