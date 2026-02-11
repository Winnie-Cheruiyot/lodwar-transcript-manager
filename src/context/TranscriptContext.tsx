
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { Transcript, Student, CourseUnit, defaultCourseUnits, calculateTotal, calculateGrade } from "@/types/transcript";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface TranscriptContextType {
  transcripts: Transcript[];
  students: Student[];
  currentTranscript: Transcript | null;
  setCurrentTranscript: (transcript: Transcript | null) => void;
  addTranscript: (transcript: Transcript) => void;
  updateTranscript: (transcript: Transcript) => void;
  deleteTranscript: (id: string) => void;
  addStudent: (student: Omit<Student, "id" | "transcriptId">) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  getStudentTranscript: (studentId: string) => Transcript | null;
  importFromExcel: (file: File) => Promise<void>;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error("useTranscript must be used within a TranscriptProvider");
  }
  return context;
};

interface TranscriptProviderProps {
  children: ReactNode;
}

export const TranscriptProvider = ({ children }: TranscriptProviderProps) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(null);

  useEffect(() => {
    const storedTranscripts = localStorage.getItem("transcripts");
    const storedStudents = localStorage.getItem("students");
    if (storedTranscripts) setTranscripts(JSON.parse(storedTranscripts));
    if (storedStudents) setStudents(JSON.parse(storedStudents));
  }, []);

  useEffect(() => {
    localStorage.setItem("transcripts", JSON.stringify(transcripts));
  }, [transcripts]);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const addTranscript = (transcript: Transcript) => {
    setTranscripts((prev) => [...prev, transcript]);
    toast.success("Transcript added successfully");
  };

  const updateTranscript = (transcript: Transcript) => {
    setTranscripts((prev) => prev.map((t) => (t.id === transcript.id ? transcript : t)));
    toast.success("Transcript updated successfully");
  };

  const deleteTranscript = (id: string) => {
    setTranscripts((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transcript deleted successfully");
  };

  const addStudent = (studentData: Omit<Student, "id" | "transcriptId">) => {
    const newStudentId = uuidv4();
    const newTranscriptId = uuidv4();

    const newStudent: Student = {
      id: newStudentId,
      transcriptId: newTranscriptId,
      ...studentData,
    };

    const newTranscript: Transcript = {
      id: newTranscriptId,
      student: newStudent,
      courseUnits: [...defaultCourseUnits],
      remarks: "",
      managerComments: "",
      hodComments: "",
      hodName: "",
      closingDay: "",
      openingDay: "",
      feeBalance: "",
    };

    setStudents((prev) => [...prev, newStudent]);
    setTranscripts((prev) => [...prev, newTranscript]);
    toast.success("Student added successfully");
    
    return newStudent;
  };

  const updateStudent = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    setTranscripts((prev) =>
      prev.map((t) => (t.id === student.transcriptId ? { ...t, student } : t))
    );
    toast.success("Student updated successfully");
  };

  const deleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (studentToDelete) {
      setTranscripts((prev) => prev.filter((t) => t.id !== studentToDelete.transcriptId));
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast.success("Student deleted successfully");
  };

  const getStudentTranscript = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    return transcripts.find((t) => t.id === student.transcriptId) || null;
  };

  const importFromExcel = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            toast.error("Failed to read file");
            reject(new Error("Failed to read file"));
            return;
          }

          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });

          console.log("Excel import - Raw data:", jsonData);
          const { studentsAdded, studentsUpdated } = processExcelData(jsonData);
          
          if (studentsAdded + studentsUpdated > 0) {
            toast.success(`Import successful: ${studentsAdded} students added, ${studentsUpdated} students updated`);
            resolve();
          } else {
            toast.warning("No valid student records found in the file");
            reject(new Error("No valid student records found"));
          }
        } catch (error) {
          console.error("Import error:", error);
          toast.error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          reject(error);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        reject(new Error("Failed to read file"));
      };

      reader.readAsBinaryString(file);
    });
  };

  const processExcelData = (data: any[]) => {
    let studentsAdded = 0;
    let studentsUpdated = 0;
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid Excel format");
    }
    
    const validRows = data.filter((row, index) => {
      if (index === 0) {
        const hasHeaderText = Object.values(row).some(value => 
          typeof value === 'string' && 
          (value.includes('REQUIRED') || value.includes('Full student name') || value === 'name')
        );
        if (hasHeaderText) return false;
      }
      
      const name = row.name || row.Name || row.NAME;
      const admissionNumber = row.admissionNumber || row['Admission Number'] || row.ADMISSION_NUMBER;
      const course = row.course || row.Course || row.COURSE;
      
      const hasRequiredFields = name && admissionNumber && course;
      const isInstructionRow = typeof name === 'string' && (
        name.includes('REQUIRED') || name.includes('Full student name') ||
        name.includes('John Doe') || name === ''
      );
      
      return hasRequiredFields && !isInstructionRow;
    });
    
    if (validRows.length === 0) {
      throw new Error("No valid data rows found in the Excel file.");
    }

    validRows.forEach((row, index) => {
      try {
        const normalizedRow: any = {
          name: row.name || row.Name || row.NAME || '',
          admissionNumber: row.admissionNumber || row['Admission Number'] || row.ADMISSION_NUMBER || '',
          course: row.course || row.Course || row.COURSE || '',
          schoolYear: row.schoolYear || row['School Year'] || row.SCHOOL_YEAR || '',
          closingDay: row.closingDay || row['Closing Day'] || row.CLOSING_DAY || '',
          openingDay: row.openingDay || row['Opening Day'] || row.OPENING_DAY || '',
          feeBalance: row.feeBalance || row['Fee Balance'] || row.FEE_BALANCE || '',
          managerComments: row.managerComments || row['Manager Comments'] || row.MANAGER_COMMENTS || '',
          hodComments: row.hodComments || row['HOD Comments'] || row.HOD_COMMENTS || '',
          hodName: row.hodName || row['HOD Name'] || row.HOD_NAME || ''
        };

        defaultCourseUnits.forEach(unit => {
          const unitName = unit.name;
          normalizedRow[`${unitName}_CAT`] = row[`${unitName}_CAT`];
          normalizedRow[`${unitName}_EXAM`] = row[`${unitName}_EXAM`];
        });

        const existingStudent = students.find(
          (s) => s.admissionNumber === normalizedRow.admissionNumber
        );

        if (existingStudent) {
          const existingTranscript = transcripts.find(
            (t) => t.id === existingStudent.transcriptId
          );
          if (existingTranscript) {
            processTranscriptData(existingTranscript, normalizedRow, true);
            studentsUpdated++;
          }
        } else {
          const newStudent = addStudent({
            name: normalizedRow.name,
            admissionNumber: normalizedRow.admissionNumber,
            course: normalizedRow.course,
            schoolYear: normalizedRow.schoolYear
          });

          const findTranscriptInStorage = (id: string) => {
            try {
              const stored = localStorage.getItem("transcripts");
              if (!stored) return null;
              const arr = JSON.parse(stored) as Transcript[];
              return arr.find(t => t.id === id) || null;
            } catch { return null; }
          };
          const attemptProcess = (retries = 0) => {
            const newTranscript = findTranscriptInStorage(newStudent.transcriptId);
            if (newTranscript) {
              processTranscriptData(newTranscript, normalizedRow, false);
            } else if (retries < 20) {
              setTimeout(() => attemptProcess(retries + 1), 100);
            }
          };
          attemptProcess();
          studentsAdded++;
        }
      } catch (rowError) {
        console.error(`Error processing row ${index}:`, rowError);
      }
    });

    return { studentsAdded, studentsUpdated };
  };

  const processTranscriptData = (transcript: Transcript, row: any, isUpdate: boolean) => {
    const updatedCourseUnits = transcript.courseUnits.map(unit => {
      const unitName = unit.name;
      const catKey = `${unitName}_CAT`;
      const examKey = `${unitName}_EXAM`;
      
      let cat = isUpdate ? (unit.cat ?? null) : null;
      let exam = isUpdate ? (unit.exam ?? null) : null;
      
      if (row[catKey] !== undefined && row[catKey] !== "" && row[catKey] !== null) {
        const parsedCat = parseFloat(String(row[catKey]));
        if (!isNaN(parsedCat) && parsedCat >= 0 && parsedCat <= 30) {
          cat = parsedCat;
        }
      }
      
      if (row[examKey] !== undefined && row[examKey] !== "" && row[examKey] !== null) {
        const parsedExam = parseFloat(String(row[examKey]));
        if (!isNaN(parsedExam) && parsedExam >= 0 && parsedExam <= 70) {
          exam = parsedExam;
        }
      }
      
      const total = calculateTotal(cat, exam);
      const grade = calculateGrade(total);

      return { ...unit, cat, exam, total, grade };
    });

    const updatedTranscript = {
      ...transcript,
      courseUnits: updatedCourseUnits,
      closingDay: row.closingDay || transcript.closingDay,
      openingDay: row.openingDay || transcript.openingDay,
      feeBalance: row.feeBalance || transcript.feeBalance,
      managerComments: row.managerComments || transcript.managerComments,
      hodComments: row.hodComments || transcript.hodComments,
      hodName: row.hodName || transcript.hodName,
    };

    updateTranscript(updatedTranscript);
    
    if (isUpdate && (row.name || row.course || row.schoolYear)) {
      const updatedStudent = {
        ...transcript.student,
        name: row.name || transcript.student.name,
        course: row.course || transcript.student.course,
        schoolYear: row.schoolYear || transcript.student.schoolYear,
      };
      updateStudent(updatedStudent);
    }
  };

  return (
    <TranscriptContext.Provider
      value={{
        transcripts, students, currentTranscript, setCurrentTranscript,
        addTranscript, updateTranscript, deleteTranscript,
        addStudent, updateStudent, deleteStudent,
        getStudentTranscript, importFromExcel,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};
