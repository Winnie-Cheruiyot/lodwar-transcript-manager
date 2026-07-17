
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
  exam: number | null;
  grade: string | null;
}

export interface Transcript {
  id: string;
  student: Student;
  courseUnits: CourseUnit[];
  remarks: string;
  managerComments: string;
  hodComments: string;
  hodName: string;
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
  { grade: 'PASS', range: '100-200' },
  { grade: 'FAIL', range: '0-99' },
];

export const passScales = [
  { level: 'PASS', range: '100-200' },
  { level: 'FAIL', range: '0-99' },
];

export const defaultCourseUnits: CourseUnit[] = [
  { id: '1', name: 'TRADE THEORY', exam: null, grade: null },
  { id: '2', name: 'TRADE PRACTICE', exam: null, grade: null },
];

export const calculateGrade = (exam: number | null): string | null => {
  if (exam === null) return null;
  return exam >= 50 ? "PASS" : "FAIL";
};

