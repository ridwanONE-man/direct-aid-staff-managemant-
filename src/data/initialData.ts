import { SchoolDivisionCategory, EmployeeRecord, HRAlertNotification, ComplianceAuditItem } from '../types';

export const CANONICAL_DIVISIONS: SchoolDivisionCategory[] = [
  {
    id: 'div-sec-boys-hrg',
    canonicalIndex: 1,
    name: 'Boys Secondary Staff — Hargeisa',
    level: 'Secondary',
    gender: 'Boys',
    city: 'Hargeisa',
    code: 'HRG-SEC-B',
    principalName: 'Ustadh Mahad Jama Warsame',
    principalAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4421098',
    studentCount: 640,
    description: 'Secondary education academy preparing male students for Somaliland national examinations and university matriculation.',
    campusAddress: 'DirectAid Education Complex, 150th Street, 26 June District, Hargeisa'
  },
  {
    id: 'div-sec-girls-hrg',
    canonicalIndex: 2,
    name: 'Girls Secondary Staff — Hargeisa',
    level: 'Secondary',
    gender: 'Girls',
    city: 'Hargeisa',
    code: 'HRG-SEC-G',
    principalName: 'Ustadha Sahra Ahmed Nuur',
    principalAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4482215',
    studentCount: 580,
    description: 'Premier female secondary school campus emphasizing science, mathematics, technology, and Islamic studies.',
    campusAddress: 'DirectAid Girls Complex, Jigjiga Yar, Behind Ministry of Education, Hargeisa'
  },
  {
    id: 'div-sec-boys-gbl',
    canonicalIndex: 3,
    name: 'Boys Secondary Staff — Gabiley',
    level: 'Secondary',
    gender: 'Boys',
    city: 'Gabiley',
    code: 'GBL-SEC-B',
    principalName: 'Sheikh Hassan Abdillahi Ali',
    principalAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4419904',
    studentCount: 420,
    description: 'Regional secondary hub providing rigorous academic instruction and vocational training in Gabiley region.',
    campusAddress: 'DirectAid Gabiley Regional Campus, Main Borama Highway, Gabiley Central'
  },
  {
    id: 'div-sec-girls-gbl',
    canonicalIndex: 4,
    name: 'Girls Secondary Staff — Gabiley',
    level: 'Secondary',
    gender: 'Girls',
    city: 'Gabiley',
    code: 'GBL-SEC-G',
    principalName: 'Ustadha Maryan Farah Duale',
    principalAvatar: 'https://images.unsplash.com/photo-1580894732454-defa1bc7e163?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4438812',
    studentCount: 390,
    description: 'Gabiley female secondary academy providing safe boarding, quality curriculum, and leadership preparation.',
    campusAddress: 'DirectAid Gabiley Girls Academy, North Campus Way, Gabiley'
  },
  {
    id: 'div-pri-boys-hrg',
    canonicalIndex: 5,
    name: 'Boys Primary Staff — Hargeisa',
    level: 'Primary',
    gender: 'Boys',
    city: 'Hargeisa',
    code: 'HRG-PRI-B',
    principalName: 'Ustadh Abdirahman Muse Elmi',
    principalAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4467721',
    studentCount: 750,
    description: 'Foundational elementary and intermediate schooling fostering numeracy, Arabic, Quranic memorization, and literacy.',
    campusAddress: 'DirectAid Primary Education Center, New Hargeisa Sector 4, Hargeisa'
  },
  {
    id: 'div-pri-girls-hrg',
    canonicalIndex: 6,
    name: 'Girls Primary Staff — Hargeisa',
    level: 'Primary',
    gender: 'Girls',
    city: 'Hargeisa',
    code: 'HRG-PRI-G',
    principalName: 'Ustadha Nimco Mohamed Abdi',
    principalAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4490145',
    studentCount: 710,
    description: 'High-performing primary school for young girls focused on holistic education, arts, languages, and sciences.',
    campusAddress: 'DirectAid Primary Girls Campus, Bada Cas Area, Hargeisa'
  },
  {
    id: 'div-pri-boys-gbl',
    canonicalIndex: 7,
    name: 'Boys Primary Staff — Gabiley',
    level: 'Primary',
    gender: 'Boys',
    city: 'Gabiley',
    code: 'GBL-PRI-B',
    principalName: 'Ustadh Fuad Daud Guelleh',
    principalAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4453390',
    studentCount: 460,
    description: 'Community primary school delivering foundational education to Gabiley and surrounding agricultural communities.',
    campusAddress: 'DirectAid Community School, Agricultural Station Road, Gabiley'
  },
  {
    id: 'div-pri-girls-gbl',
    canonicalIndex: 8,
    name: 'Girls Primary Staff — Gabiley',
    level: 'Primary',
    gender: 'Girls',
    city: 'Gabiley',
    code: 'GBL-PRI-G',
    principalName: 'Ustadha Asma Ismail Keyse',
    principalAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4478832',
    studentCount: 440,
    description: 'Nurturing primary learning environment providing female youth with scholarships, books, and educational foundation.',
    campusAddress: 'DirectAid Gabiley East Girls School, Old Hospital Street, Gabiley'
  },
  {
    id: 'div-hq-admin-hrg',
    canonicalIndex: 9,
    name: 'Central Operations & Regional HQ — Hargeisa',
    level: 'Central Operations',
    gender: 'Operations',
    city: 'Hargeisa',
    code: 'HRG-HQ-OPS',
    principalName: 'Dr. Fathia Omar (Regional HR Director)',
    principalAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    principalPhone: '+252 63 4400010',
    studentCount: 0,
    description: 'Central administrative headquarters managing human resources, procurement, payroll, compliance, and school oversight.',
    campusAddress: 'DirectAid Country Office, Diplomatic Quarter, Airport Road, Hargeisa'
  }
];

export const INITIAL_EMPLOYEES: EmployeeRecord[] = [];

export const INITIAL_NOTIFICATIONS: HRAlertNotification[] = [];

export const INITIAL_COMPLIANCE_ITEMS: ComplianceAuditItem[] = [];
