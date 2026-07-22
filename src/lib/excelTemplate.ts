import * as XLSX from "xlsx";
import { defaultCourseUnits } from "@/types/transcript";
import { electricalCourseUnits } from "@/lib/courses";

export const downloadTranscriptTemplate = () => {
  const workbook = XLSX.utils.book_new();

  // Include all possible course units so the template works for every course
  const allUnits = [...defaultCourseUnits, ...electricalCourseUnits.filter(u => !defaultCourseUnits.some(d => d.name === u.name))];

  const headers = ["name", "admissionNumber", "course", "schoolYear"];
  allUnits.forEach(unit => {
    headers.push(`${unit.name}_EXAM`);
  });
  headers.push("closingDay", "openingDay", "feeBalance", "managerComments", "hodComments", "hodName");

  const explanations = [
    "REQUIRED: Full student name", "REQUIRED: Unique ID", "REQUIRED: E.g. Electrical Installation", "E.g. TERM 1 2026",
  ];
  allUnits.forEach(() => {
    explanations.push("Exam marks (max 100)");
  });
  explanations.push("School closing date", "School opening date", "Outstanding fees amount", "Manager's comments", "HOD's comments", "Full HOD name");

  const sampleRow = ["John Doe", "ADM/2024/001", "Electrical Installation", "TERM 1 2026"];
  allUnits.forEach(() => {
    sampleRow.push("75");
  });
  sampleRow.push("23rd July 2026", "8th September 2026", "10000", "Good progress overall", "Excellent performance in practical", "Mr. John Smith");

  const worksheet = XLSX.utils.aoa_to_sheet([headers, explanations, sampleRow]);
  worksheet['!cols'] = headers.map(header => ({ wch: Math.max(20, header.length) }));
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  const instructionsData = [
    ["IMPORTANT INSTRUCTIONS:"],
    ["1. The first row contains column names - DO NOT modify these names"],
    ["2. The second row contains explanations and can be deleted"],
    ["3. The third row is a sample data row and can be deleted"],
    ["4. Each row represents one student record"],
    ["5. Required fields: name, admissionNumber, and course"],
    ["6. Subject columns: SUBJECTNAME_EXAM (out of 100)"],
    ["7. Grade is auto-calculated from EXAM marks"],
    ["8. Most courses use TRADE THEORY + TRADE PRACTICE only (Total /200, Pass >= 100)"],
    ["9. Electrical Installation Technology uses all 6 subjects (Total /600, Pass >= 400)"],
    [""],
    ["Available subjects:"],
    ...allUnits.map(unit => [`- ${unit.name}`])
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(workbook, instructionsWs, "Instructions");

  XLSX.writeFile(workbook, "transcript_template.xlsx");
};
