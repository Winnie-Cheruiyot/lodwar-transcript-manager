import { CourseUnit, defaultCourseUnits } from "@/types/transcript";

export interface CourseInfo {
  name: string;
  hod: string;
}

export const courses: CourseInfo[] = [
  { name: "Hairdressing and Beauty Therapy", hod: "Mrs. Jackline Chebet" },
  { name: "Food and Beverage Production", hod: "Mrs. Irene Kitui" },
  { name: "Arc Welding", hod: "Mr. Silas Namojong" },
  { name: "Building and Construction", hod: "Mr. Godfrey Wekesa" },
  { name: "Electrical Installation Technology", hod: "Mr. Geoffrey Nalima" },
  { name: "Fashion Design and Garment Making", hod: "Mrs. Jeniffer Tioko" },
  { name: "Plumbing", hod: "Mr. Paul Mikisi" },
  { name: "Light Vehicle Mechanics", hod: "Mr. James Lokirien" },
];

export const MANAGER_NAME = "Mr. Abraham Chegem";

export const ELECTRICAL_COURSE_NAME = "Electrical Installation Technology";

export const electricalCourseUnits: CourseUnit[] = [
  { id: "1", name: "TRADE THEORY", exam: null, grade: null },
  { id: "2", name: "TRADE PRACTICE", exam: null, grade: null },
  { id: "3", name: "ELECTRICAL PRINCIPLES", exam: null, grade: null },
  { id: "4", name: "ELECTRICAL INSTALLATION", exam: null, grade: null },
  { id: "5", name: "ELECTRONICS", exam: null, grade: null },
  { id: "6", name: "WORKSHOP TECHNOLOGY", exam: null, grade: null },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const isElectricalCourse = (course: string): boolean => {
  if (!course) return false;
  const n = norm(course);
  const electricalNorm = norm(ELECTRICAL_COURSE_NAME);
  return n === electricalNorm || n.includes(electricalNorm) || electricalNorm.includes(n);
};

export const getCourseDefaultUnits = (course: string): CourseUnit[] => {
  return isElectricalCourse(course) ? electricalCourseUnits : [...defaultCourseUnits];
};

export const getCourseMaxMarks = (course: string): number => {
  return isElectricalCourse(course) ? 600 : 200;
};

export const getCoursePassThreshold = (course: string): number => {
  return isElectricalCourse(course) ? 400 : 100;
};

export const getPassScalesForCourse = (course: string) => {
  if (isElectricalCourse(course)) {
    return [
      { level: "PASS", range: "400-600" },
      { level: "FAIL", range: "0-399" },
    ];
  }
  return [
    { level: "PASS", range: "100-200" },
    { level: "FAIL", range: "0-99" },
  ];
};

export const getHodForCourse = (course: string): string => {
  if (!course) return "";
  const n = norm(course);
  const match = courses.find(c => norm(c.name) === n || n.includes(norm(c.name)) || norm(c.name).includes(n));
  return match ? match.hod : "";
};
