export type EducationLevel =
  | 'Honours / Bachelor'
  | 'HSC / A-Level / Alim / Diploma'
  | 'SSC / O-Level / Dakhil'
  | 'Masters'
  | 'PhD'
  | 'Other';

export interface EducationItem {
  id: string;
  level: EducationLevel;
  degreeTitle?: string; // Specific degree selected: 'Honours' | 'Bachelor' | 'HSC' | 'A-Level' | 'Alim' | 'Diploma' | 'SSC' | 'O-Level' | 'Dakhil' | 'Masters' | 'PhD' | string;
  institution: string;
  board?: string; // Only for SSC/HSC levels
  group?: string; // Only for SSC/HSC levels
  department?: string; // For Varsity / Diploma / Honours / Masters / PhD
  passingYear: string;
  resultType?: 'CGPA out of 4.00' | 'GPA out of 5.00' | 'Division' | 'Class';
  result: string; // For varsity: CGPA; for SSC/HSC: GPA
  allSubjectAplus?: boolean; // When GPA is 5.0, optionally show "5.0 (All Subject A+)"
}

export interface AddressBlock {
  country: string;
  divisionState: string;
  district: string;
  thanaCity: string;
  streetRoadPostCode: string;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  role: string;
  startYear: string;
  endYear: string;
  description: string;
}

export interface TrainingItem {
  id: string;
  title: string;
  institution: string;
  duration?: string;
  year?: string;
  description?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  designation: string;
  organization: string;
  phone: string;
  email: string;
}

export interface ActivityItem {
  id: string;
  organization: string;
  role: string;
  year: string;
  description: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  items: string;
}

export interface HonorAwardItem {
  id: string;
  year: string;
  title: string;
  description?: string;
}

export interface CertificationItem {
  id: string;
  year: string;
  title: string;
  issuer?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  tools?: string;
  description: string;
  link?: string;
}

export type SocialPlatform =
  | 'LinkedIn'
  | 'GitHub'
  | 'Portfolio'
  | 'Instagram'
  | 'Facebook'
  | 'X (Twitter)'
  | 'YouTube'
  | 'Behance'
  | 'Dribbble'
  | 'Medium'
  | 'Discord'
  | 'Telegram'
  | 'Other';

export interface SocialAccountItem {
  id: string;
  platform: SocialPlatform | string;
  customPlatformName?: string;
  usernameOrUrl: string;
}

export interface CVData {
  personal: {
    fullName: string;
    jobTitle: string;
    avatarUrl: string;
    showAvatar: boolean;
    gender: string;
    phone: string;
    website?: string;
    birthDate: string;
    email: string;
    // Cascading Address
    presentAddress: AddressBlock;
    permanentAddress: AddressBlock;
    sameAsPresentAddress: boolean;
    socialAccounts?: SocialAccountItem[];
  };
  objective: string;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  trainingCourses: TrainingItem[];
  projects: ProjectItem[];
  activities: ActivityItem[];
  skillCategories: SkillCategory[];
  honorsAwards: HonorAwardItem[];
  certifications: CertificationItem[];
  references: ReferenceItem[];
  interests: string;
  themeColor: string;
  fontFamily: string;
  template: 'teal-split' | 'modern-clean' | 'executive';
}

// Education order: 1st Honours / Bachelor, 2nd HSC / A-Level / Alim, 3rd SSC / O-Level / Dakhil
export const EDUCATION_LEVEL_RANKS: Record<EducationLevel, number> = {
  'Honours / Bachelor': 100,
  Masters: 95,
  PhD: 90,
  'HSC / A-Level / Alim / Diploma': 80,
  'SSC / O-Level / Dakhil': 70,
  Other: 10,
};

export const BANGLADESH_EDUCATION_BOARDS = [
  'Dhaka',
  'Rajshahi',
  'Cumilla',
  'Jashore',
  'Chattogram',
  'Barishal',
  'Sylhet',
  'Dinajpur',
  'Mymensingh',
  'Madrasah',
  'Technical',
];

export const BANGLADESH_EDUCATION_GROUPS = [
  'Science',
  'Commerce',
  'Arts/Humanities',
  'Other',
];
