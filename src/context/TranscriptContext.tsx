
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
    
    console.log("Processing Excel data:", data);
    
    // Remove header and explanation rows
    const dataRows = data.filter((row, index) => {
      // Skip first two rows (headers and explanations) and check for required fields
      return index > 1 && row.name && row.admissionNumber && row.course;
    });
    
    console.log("Valid data rows:", dataRows);
    
    if (dataRows.length === 0) {
      throw new Error("No valid data rows found in the Excel file");
    }

    dataRows.forEach((row) => {
      // Output raw row data for debugging
      console.log("Processing row:", row);
      
      // Check for required fields
      if (!row.name || !row.admissionNumber || !row.course) {
        console.log("Skipping row due to missing required fields");
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
          // Process update for existing transcript
          processTranscriptData(existingTranscript, row, true);
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
          processTranscriptData(newTranscript, row, false);
          studentsAdded++;
        }
      }
    });

    return { studentsAdded, studentsUpdated };
  };

  // Helper function to process transcript data from Excel row
  const processTranscriptData = (transcript: Transcript, row: any, isUpdate: boolean) => {
    console.log("Processing transcript data for:", transcript.student.name);
    console.log("Row data:", row);
    
    // Process course units
    const updatedCourseUnits = transcript.courseUnits.map(unit => {
      const unitName = unit.name;
      
      // Create exact column names that match the Excel template
      const catKey = `${unitName}_CAT`;
      const examKey = `${unitName}_EXAM`;
      const totalKey = `${unitName}_TOTAL`;
      
      console.log(`Checking for unit ${unitName}:`, {
        "CAT key": catKey,
        "CAT exists": catKey in row,
        "CAT value": row[catKey],
        "EXAM key": examKey,
        "EXAM exists": examKey in row,
        "EXAM value": row[examKey],
        "TOTAL key": totalKey,
        "TOTAL exists": totalKey in row,
        "TOTAL value": row[totalKey]
      });
      
      // Get values if keys were found
      let cat = isUpdate ? unit.cat : null;
      let exam = isUpdate ? unit.exam : null;
      let total = isUpdate ? unit.total : null;
      
      if (row[catKey] !== undefined && row[catKey] !== "") {
        cat = Number(row[catKey]);
        if (isNaN(cat)) cat = isUpdate ? unit.cat : null;
      }
      
      if (row[examKey] !== undefined && row[examKey] !== "") {
        exam = Number(row[examKey]);
        if (isNaN(exam)) exam = isUpdate ? unit.exam : null;
      }
      
      if (row[totalKey] !== undefined && row[totalKey] !== "") {
        total = Number(row[totalKey]);
        if (isNaN(total)) total = isUpdate ? unit.total : null;
      }
      
      // Calculate grade based on total if available
      let grade = unit.grade;
      if (total !== null && !isNaN(total)) {
        if (total >= 70) grade = "A";
        else if (total >= 60) grade = "B";
        else if (total >= 50) grade = "C";
        else if (total >= 40) grade = "D";
        else grade = "E";
      }

      return {
        ...unit,
        cat,
        exam,
        total,
        grade
      };
    });

    // Update additional fields
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

    console.log("Updated transcript:", updatedTranscript);

    // Update the transcript in state
    updateTranscript(updatedTranscript);
    
    // Also update student info if needed
    if (isUpdate) {
      const updatedStudent = {
        ...transcript.student,
        name: row.name || transcript.student.name,
        course: row.course || transcript.student.course,
        schoolYear: row.schoolYear || transcript.student.schoolYear,
      };

      updateStudent(updatedStudent);
    }
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

          console.log("Raw Excel data:", jsonData);
          
          const { studentsAdded, studentsUpdated } = processExcelData(jsonData);
          
          toast.success(`Import successful: ${studentsAdded} students added, ${studentsUpdated} students updated`);
          resolve();
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
