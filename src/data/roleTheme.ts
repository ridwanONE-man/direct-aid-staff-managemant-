import React from 'react';
import { Award, BookOpen, Briefcase, Car, Crown, FlaskConical, Shield, Sparkles, UserRound, Wrench } from 'lucide-react';
import { EmployeeRecord } from '../types';

// Colour band and icon for each kind of staff, built around the DirectAid greens
export interface RoleTheme {
  group: string;
  icon: React.ElementType;
  band: string;      // gradient classes for the card's top band
  text: string;      // role text colour
  tint: string;      // soft chip background
}

const LEADERSHIP: RoleTheme = {
  group: 'Leadership',
  icon: Crown,
  band: 'from-[#0B4F2E] via-[#0E6139] to-[#147D4A]',
  text: 'text-[#0E6139]',
  tint: 'bg-[#E3F3E8]'
};

const THEMES: Record<string, RoleTheme> = {
  Principal: LEADERSHIP,
  'General Director': LEADERSHIP,
  'Deputy Principal': { ...LEADERSHIP, icon: Award, band: 'from-[#0E6139] via-[#147D4A] to-[#2D9A48]' },
  'Head Teacher': { ...LEADERSHIP, icon: Award, band: 'from-[#0E6139] via-[#147D4A] to-[#2D9A48]' },
  Teacher: {
    group: 'Teaching',
    icon: BookOpen,
    band: 'from-[#147D4A] via-[#2D9A48] to-[#35B86B]',
    text: 'text-[#147D4A]',
    tint: 'bg-[#EBF7EE]'
  },
  'Lab Technician': {
    group: 'Teaching',
    icon: FlaskConical,
    band: 'from-[#1C7A55] via-[#239366] to-[#3BAE7E]',
    text: 'text-[#1C7A55]',
    tint: 'bg-[#E6F5EE]'
  },
  'Security Guard': {
    group: 'Security',
    icon: Shield,
    band: 'from-[#1D4D4A] via-[#256663] to-[#33827D]',
    text: 'text-[#256663]',
    tint: 'bg-[#E4F1F0]'
  },
  Cleaner: {
    group: 'Facilities',
    icon: Sparkles,
    band: 'from-[#0F6A73] via-[#13838C] to-[#1FA2A8]',
    text: 'text-[#13838C]',
    tint: 'bg-[#E2F4F5]'
  },
  'Maintenance Worker': {
    group: 'Facilities',
    icon: Wrench,
    band: 'from-[#0F6A73] via-[#13838C] to-[#1FA2A8]',
    text: 'text-[#13838C]',
    tint: 'bg-[#E2F4F5]'
  },
  Driver: {
    group: 'Transport',
    icon: Car,
    band: 'from-[#9A6412] via-[#B7791F] to-[#D69E2E]',
    text: 'text-[#9A6412]',
    tint: 'bg-[#FBF1DE]'
  }
};

const OFFICE: RoleTheme = {
  group: 'Office',
  icon: Briefcase,
  band: 'from-[#2F4F6F] via-[#3B6386] to-[#4F7CA3]',
  text: 'text-[#3B6386]',
  tint: 'bg-[#E8EFF6]'
};
['Secretary', 'Administrative Officer', 'Human Resources Officer', 'Finance Officer', 'IT Support Officer'].forEach(r => {
  THEMES[r] = OFFICE;
});

const OTHER: RoleTheme = {
  group: 'Other',
  icon: UserRound,
  band: 'from-[#4A5A50] via-[#5E7065] to-[#798C80]',
  text: 'text-[#4A5A50]',
  tint: 'bg-[#EEF2EF]'
};

export const roleTheme = (emp: EmployeeRecord): RoleTheme => THEMES[emp.jobTitle] ?? OTHER;

export const roleName = (emp: EmployeeRecord) =>
  emp.jobTitle === 'Other' && emp.customJobTitle ? emp.customJobTitle : emp.jobTitle;
