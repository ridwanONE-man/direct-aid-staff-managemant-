import { JobRole, SchoolDivisionCategory, SchoolLevel } from '../types';

// A division is either a school (headed by a Principal) or the headquarters (headed by a General Director).
// The head is stored in the division's principal* fields either way.
export const HQ_LEVEL: SchoolLevel = 'Central Operations';

export const isHeadquartersLevel = (level: SchoolLevel) => level === HQ_LEVEL;
export const isHeadquarters = (div: Pick<SchoolDivisionCategory, 'level'>) => isHeadquartersLevel(div.level);

export const leaderRoleFor = (level: SchoolLevel): JobRole => (isHeadquartersLevel(level) ? 'General Director' : 'Principal');
export const leaderTitleFor = (level: SchoolLevel) => (isHeadquartersLevel(level) ? 'General Director' : 'Principal');
