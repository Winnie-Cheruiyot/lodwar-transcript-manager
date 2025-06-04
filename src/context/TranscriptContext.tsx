
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
          
          // Process data
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
    
    console.log(`Processing ${data.length} rows from Excel`);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.error("No data found in Excel file or invalid format");
      throw new Error("Invalid Excel format");
    }
    
    // Filter out empty rows and header/instruction rows more carefully
    const validRows = data.filter((row, index) => {
      // Skip first few rows if they contain headers or instructions
      if (index === 0) {
        // Check if this is a header row
        const hasHeaderText = Object.values(row).some(value => 
          typeof value === 'string' && 
          (value.includes('REQUIRED') || value.includes('Full student name') || value === 'name')
        );
        if (hasHeaderText) {
          console.log("Skipping header row");
          return false;
        }
      }
      
      // Check for required fields - be more flexible with data types
      const name = row.name || row.Name || row.NAME;
      const admissionNumber = row.admissionNumber || row['Admission Number'] || row.ADMISSION_NUMBER;
      const course = row.course || row.Course || row.COURSE;
      
      const hasRequiredFields = name && admissionNumber && course;
      
      // Also check that these aren't instruction text
      const isInstructionRow = typeof name === 'string' && (
        name.includes('REQUIRED') || 
        name.includes('Full student name') ||
        name.includes('John Doe') ||
        name === ''
      );
      
      console.log(`Row ${index} - name: ${name}, admissionNumber: ${admissionNumber}, course: ${course}, valid: ${hasRequiredFields && !isInstructionRow}`);
      
      return hasRequiredFields && !isInstructionRow;
    });
    
    console.log(`Found ${validRows.length} valid rows with required fields`);
    
    if (validRows.length === 0) {
      throw new Error("No valid data rows found in the Excel file. Please check the template format.");
    }

    validRows.forEach((row, index) => {
      try {
        // Normalize field names to handle variations
        const normalizedRow = {
          name: row.name || row.Name || row.NAME || '',
          admissionNumber: row.admissionNumber || row['Admission Number'] || row.ADMISSION_NUMBER || '',
          course: row.course || row.Course || row.COURSE || '',
          schoolYear: row.schoolYear || row['School Year'] || row.SCHOOL_YEAR || row.schoolYear || '',
          closingDay: row.closingDay || row['Closing Day'] || row.CLOSING_DAY || '',
          openingDay: row.openingDay || row['Opening Day'] || row.OPENING_DAY || '',
          feeBalance: row.feeBalance || row['Fee Balance'] || row.FEE_BALANCE || '',
          managerComments: row.managerComments || row['Manager Comments'] || row.MANAGER_COMMENTS || '',
          hodComments: row.hodComments || row['HOD Comments'] || row.HOD_COMMENTS || '',
          hodName: row.hodName || row['HOD Name'] || row.HOD_NAME || ''
        };

        // Add all the subject columns
        defaultCourseUnits.forEach(unit => {
          const unitName = unit.name;
          normalizedRow[`${unitName}_CAT`] = row[`${unitName}_CAT`];
          normalizedRow[`${unitName}_EXAM`] = row[`${unitName}_EXAM`];
          normalizedRow[`${unitName}_TOTAL`] = row[`${unitName}_TOTAL`];
        });

        console.log(`Processing student ${index + 1}:`, normalizedRow.name);

        // Check for existing student by admission number
        const existingStudent = students.find(
          (s) => s.admissionNumber === normalizedRow.admissionNumber
        );

        if (existingStudent) {
          // Update existing student's transcript
          const existingTranscript = transcripts.find(
            (t) => t.id === existingStudent.transcriptId
          );
          
          if (existingTranscript) {
            console.log(`Updating existing student: ${existingStudent.name} (${existingStudent.admissionNumber})`);
            processTranscriptData(existingTranscript, normalizedRow, true);
            studentsUpdated++;
          }
        } else {
          // Create new student
          console.log(`Adding new student: ${normalizedRow.name} (${normalizedRow.admissionNumber})`);
          const newStudent = addStudent({
            name: normalizedRow.name,
            admissionNumber: normalizedRow.admissionNumber,
            course: normalizedRow.course,
            schoolYear: normalizedRow.schoolYear
          });

          // Wait for state to update, then get the transcript and update with data
          setTimeout(() => {
            const newTranscript = getStudentTranscript(newStudent.id);
            if (newTranscript) {
              processTranscriptData(newTranscript, normalizedRow, false);
              console.log(`Successfully processed new student: ${newStudent.name}`);
            }
          }, 100);
          
          studentsAdded++;
        }
      } catch (rowError) {
        console.error(`Error processing row ${index}:`, rowError);
        // Continue with other rows instead of failing completely
      }
    });

    return { studentsAdded, studentsUpdated };
  };

  // Helper function to process transcript data from Excel row
  const processTranscriptData = (transcript: Transcript, row: any, isUpdate: boolean) => {
    console.log(`Processing transcript data for ${transcript.student.name}`);
    
    // Process course units
    const updatedCourseUnits = transcript.courseUnits.map(unit => {
      const unitName = unit.name;
      
      // Column names that match the Excel template exactly
      const catKey = `${unitName}_CAT`;
      const examKey = `${unitName}_EXAM`;
      const totalKey = `${unitName}_TOTAL`;
      
      console.log(`Checking for ${unitName} marks - CAT: ${row[catKey]}, EXAM: ${row[examKey]}, TOTAL: ${row[totalKey]}`);
      
      // Get values from Excel (or keep existing for updates)
      let cat = isUpdate ? unit.cat : null;
      let exam = isUpdate ? unit.exam : null;
      let total = isUpdate ? unit.total : null;
      
      // Process CAT score if present
      if (row[catKey] !== undefined && row[catKey] !== "" && row[catKey] !== null) {
        const parsedCat = parseFloat(String(row[catKey]));
        if (!isNaN(parsedCat) && parsedCat >= 0 && parsedCat <= 30) {
          cat = parsedCat;
          console.log(`Set ${unitName} CAT to ${cat}`);
        }
      }
      
      // Process EXAM score if present
      if (row[examKey] !== undefined && row[examKey] !== "" && row[examKey] !== null) {
        const parsedExam = parseFloat(String(row[examKey]));
        if (!isNaN(parsedExam) && parsedExam >= 0 && parsedExam <= 70) {
          exam = parsedExam;
          console.log(`Set ${unitName} EXAM to ${exam}`);
        }
      }
      
      // Process TOTAL score if present
      if (row[totalKey] !== undefined && row[totalKey] !== "" && row[totalKey] !== null) {
        const parsedTotal = parseFloat(String(row[totalKey]));
        if (!isNaN(parsedTotal) && parsedTotal >= 0 && parsedTotal <= 100) {
          total = parsedTotal;
          console.log(`Set ${unitName} TOTAL to ${total}`);
        }
      }
      
      // Auto-calculate total if CAT and EXAM are available but total is not
      if (cat !== null && exam !== null && total === null) {
        total = cat + exam;
        console.log(`Auto-calculated ${unitName} TOTAL as ${total}`);
      }
      
      // Calculate grade based on total if available
      let grade = unit.grade;
      if (total !== null && total >= 0) {
        if (total >= 70) grade = "A";
        else if (total >= 60) grade = "B";
        else if (total >= 50) grade = "C";
        else if (total >= 40) grade = "D";
        else grade = "E";
        console.log(`Calculated grade for ${unitName}: ${grade}`);
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
    
    console.log(`Additional fields updated - closingDay: ${updatedTranscript.closingDay}, openingDay: ${updatedTranscript.openingDay}, feeBalance: ${updatedTranscript.feeBalance}`);

    // Update the transcript in state
    updateTranscript(updatedTranscript);
    
    // Also update student info if needed
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
