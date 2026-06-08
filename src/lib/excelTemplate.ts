import * as XLSX from "xlsx";
import { defaultCourseUnits } from "@/types/transcript";

export const downloadTranscriptTemplate = () => {
  const workbook = XLSX.utils.book_new();

  const headers = ["name", "admissionNumber", "course", "schoolYear"];
  defaultCourseUnits.forEach(unit => {
    headers.push(`${unit.name}_EXAM`);
  });
  headers.push("closingDay", "openingDay", "feeBalance", "managerComments", "hodComments", "hodName");

  const explanations = [
    "REQUIRED: Full student name", "REQUIRED: Unique ID", "REQUIRED: E.g. Electrical Installation", "E.g. 2024",
  ];
  defaultCourseUnits.forEach(() => {
    explanations.push("Exam marks (max 100)");
  });
  explanations.push("School closing date", "School opening date", "Outstanding fees amount", "Manager's comments", "HOD's comments", "Full HOD name");

  const sampleRow = ["John Doe", "ADM/2024/001", "Electrical Installation", "2024"];
  defaultCourseUnits.forEach(() => {
    sampleRow.push("75");
  });
  sampleRow.push("December 15, 2024", "January 10, 2025", "10000", "Good progress overall", "Excellent performance in practical", "Mr. John Smith");

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
    [""],
    ["Available subjects:"],
    ...defaultCourseUnits.map(unit => [`- ${unit.name}`])
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(workbook, instructionsWs, "Instructions");

  XLSX.writeFile(workbook, "transcript_template.xlsx");
};
