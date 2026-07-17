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

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getHodForCourse = (course: string): string => {
  if (!course) return "";
  const n = norm(course);
  const match = courses.find(c => norm(c.name) === n || n.includes(norm(c.name)) || norm(c.name).includes(n));
  return match ? match.hod : "";
};
