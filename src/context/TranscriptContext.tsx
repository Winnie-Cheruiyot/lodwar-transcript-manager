import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { Transcript, Student, CourseUnit, defaultCourseUnits } from "@/types/transcript";
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

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedTranscripts = localStorage.getItem("transcripts");
    const storedStudents = localStorage.getItem("students");

    if (storedTranscripts) {
      setTranscripts(JSON.parse(storedTranscripts));
    }

    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
  }, []);

  // Save data to localStorage whenever it changes
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
    setTranscripts((prev) =>
      prev.map((t) => (t.id === transcript.id ? transcript : t))
    );
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
    
    // Also update the student info in their transcript
    setTranscripts((prev) =>
      prev.map((t) =>
        t.id === student.transcriptId ? { ...t, student } : t
      )
    );
    
    toast.success("Student updated successfully");
  };

  const deleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (studentToDelete) {
      setTranscripts((prev) => 
        prev.filter((t) => t.id !== studentToDelete.transcriptId)
      );
    }
    
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast.success("Student deleted successfully");
  };

  const getStudentTranscript = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    
    return transcripts.find((t) => t.id === student.transcriptId) || null;
  };

  const processExcelData = (data: any[]) => {
    let studentsAdded = 0;
    let studentsUpdated = 0;

    data.forEach((row) => {
      // Check for required fields
      if (!row.name || !row.admissionNumber || !row.course) {
        return;
      }
      
      const existingStudent = students.find(
        (s) => s.admissionNumber === row.admissionNumber
      );

      if (existingStudent) {
        // Update existing student's transcript
        const existingTranscript = transcripts.find(
          (t) => t.id === existingStudent.transcriptId
        );
        
        if (existingTranscript) {
          // Update course units based on Excel data
          const updatedCourseUnits = existingTranscript.courseUnits.map(unit => {
            const unitName = unit.name;
            // Look for matching column names in Excel data for grades
            const catValue = row[`${unitName}_CAT`] || row[`${unitName.toLowerCase()}_cat`] || row[`${unitName} CAT`] || unit.cat;
            const examValue = row[`${unitName}_EXAM`] || row[`${unitName.toLowerCase()}_exam`] || row[`${unitName} EXAM`] || unit.exam;
            const totalValue = row[`${unitName}_TOTAL`] || row[`${unitName.toLowerCase()}_total`] || row[`${unitName} TOTAL`] || unit.total;
            
            // Calculate grade based on total if available
            let grade = unit.grade;
            if (totalValue !== null && totalValue !== undefined) {
              const total = Number(totalValue);
              if (!isNaN(total)) {
                if (total >= 70) grade = "A";
                else if (total >= 60) grade = "B";
                else if (total >= 50) grade = "C";
                else if (total >= 40) grade = "D";
                else grade = "E";
              }
            }

            return {
              ...unit,
              cat: catValue !== undefined ? Number(catValue) : unit.cat,
              exam: examValue !== undefined ? Number(examValue) : unit.exam,
              total: totalValue !== undefined ? Number(totalValue) : unit.total,
              grade
            };
          });

          // Update transcript with new data
          const updatedTranscript = {
            ...existingTranscript,
            courseUnits: updatedCourseUnits,
            remarks: row.remarks || existingTranscript.remarks,
            managerComments: row.managerComments || existingTranscript.managerComments,
            hodComments: row.hodComments || existingTranscript.hodComments,
            closingDay: row.closingDay || existingTranscript.closingDay,
            openingDay: row.openingDay || existingTranscript.openingDay,
            feeBalance: row.feeBalance || existingTranscript.feeBalance,
          };

          // Update transcript in state
          setTranscripts((prev) =>
            prev.map((t) => (t.id === updatedTranscript.id ? updatedTranscript : t))
          );

          // Update student info if needed
          const updatedStudent = {
            ...existingStudent,
            name: row.name || existingStudent.name,
            course: row.course || existingStudent.course,
            schoolYear: row.schoolYear || existingStudent.schoolYear,
          };

          setStudents((prev) =>
            prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
          );

          studentsUpdated++;
        }
      } else {
        // Create new student
        const newStudent = addStudent({
          name: row.name,
          admissionNumber: row.admissionNumber,
          course: row.course,
          schoolYear: row.schoolYear || ""
        });

        // Get the transcript for the new student and update with data
        const newTranscript = getStudentTranscript(newStudent.id);
        if (newTranscript) {
          const updatedCourseUnits = newTranscript.courseUnits.map(unit => {
            const unitName = unit.name;
            // Look for matching column names in Excel data for grades
            const catValue = row[`${unitName}_CAT`] || row[`${unitName.toLowerCase()}_cat`] || row[`${unitName} CAT`];
            const examValue = row[`${unitName}_EXAM`] || row[`${unitName.toLowerCase()}_exam`] || row[`${unitName} EXAM`];
            const totalValue = row[`${unitName}_TOTAL`] || row[`${unitName.toLowerCase()}_total`] || row[`${unitName} TOTAL`];
            
            // Calculate grade based on total if available
            let grade = null;
            if (totalValue !== null && totalValue !== undefined) {
              const total = Number(totalValue);
              if (!isNaN(total)) {
                if (total >= 70) grade = "A";
                else if (total >= 60) grade = "B";
                else if (total >= 50) grade = "C";
                else if (total >= 40) grade = "D";
                else grade = "E";
              }
            }

            return {
              ...unit,
              cat: catValue !== undefined ? Number(catValue) : null,
              exam: examValue !== undefined ? Number(examValue) : null,
              total: totalValue !== undefined ? Number(totalValue) : null,
              grade
            };
          });

          const updatedTranscript = {
            ...newTranscript,
            courseUnits: updatedCourseUnits,
            remarks: row.remarks || "",
            managerComments: row.managerComments || "",
            hodComments: row.hodComments || "",
            closingDay: row.closingDay || "",
            openingDay: row.openingDay || "",
            feeBalance: row.feeBalance || "",
          };

          updateTranscript(updatedTranscript);
          studentsAdded++;
        }
      }
    });

    return { studentsAdded, studentsUpdated };
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
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const { studentsAdded, studentsUpdated } = processExcelData(jsonData);
          
          toast.success(`Import successful: ${studentsAdded} students added, ${studentsUpdated} students updated`);
          resolve();
        } catch (error) {
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

  return (
    <TranscriptContext.Provider
      value={{
        transcripts,
        students,
        currentTranscript,
        setCurrentTranscript,
        addTranscript,
        updateTranscript,
        deleteTranscript,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentTranscript,
        importFromExcel,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};
