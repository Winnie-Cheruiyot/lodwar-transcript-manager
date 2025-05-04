
export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  course: string;
  schoolYear: string;
  transcriptId: string;
}

export interface CourseUnit {
  id: string;
  name: string;
  cat: number | null;
  exam: number | null;
  total: number | null;
  grade: string | null;
}

export interface Transcript {
  id: string;
  student: Student;
  courseUnits: CourseUnit[];
  remarks: string;
  managerComments: string;
  hodComments: string;
  closingDay: string;
  openingDay: string;
  feeBalance: string;
}

export interface GradeScale {
  grade: string;
  range: string;
  description?: string;
}

export const gradeScales: GradeScale[] = [
  { grade: 'A', range: '70-100' },
  { grade: 'B', range: '60-69' },
  { grade: 'C', range: '50-59' },
  { grade: 'D', range: '40-49' },
  { grade: 'E', range: '0-39' },
];

export const passScales = [
  { level: 'DISTINCTION', range: '451-600' },
  { level: 'CREDIT', range: '301-450' },
  { level: 'PASS', range: '200-300' },
  { level: 'FAIL', range: '0-199' },
];

export const defaultCourseUnits = [
  { id: '1', name: 'TRADE THEORY', cat: null, exam: null, total: null, grade: null },
  { id: '2', name: 'TRADE PRACTICE', cat: null, exam: null, total: null, grade: null },
  { id: '3', name: 'COMMUNICATION SKILLS', cat: null, exam: null, total: null, grade: null },
  { id: '4', name: 'ENTREPRENEURSHIP', cat: null, exam: null, total: null, grade: null },
  { id: '5', name: 'MATHEMATICS', cat: null, exam: null, total: null, grade: null },
  { id: '6', name: 'GENERAL SCIENCE', cat: null, exam: null, total: null, grade: null },
  { id: '7', name: 'DIGITAL LITERACY', cat: null, exam: null, total: null, grade: null },
];
