import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transcript, Student, CourseUnit, defaultCourseUnits, calculateGrade } from "@/types/transcript";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { getHodForCourse } from "@/lib/courses";


interface TranscriptContextType {
  transcripts: Transcript[];
  students: Student[];
  currentTranscript: Transcript | null;
  loading: boolean;
  setCurrentTranscript: (transcript: Transcript | null) => void;
  addTranscript: (transcript: Transcript) => void;
  updateTranscript: (transcript: Transcript) => Promise<void>;
  deleteTranscript: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, "id" | "transcriptId">) => Promise<Student>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentTranscript: (studentId: string) => Transcript | null;
  importFromExcel: (file: File) => Promise<void>;
  refresh: () => Promise<void>;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export const useTranscript = () => {
  const ctx = useContext(TranscriptContext);
  if (!ctx) throw new Error("useTranscript must be used within a TranscriptProvider");
  return ctx;
};

interface TranscriptProviderProps { children: ReactNode }

// Shape stored in DB rows -> app objects
const rowToStudent = (row: any): Student => ({
  id: row.id,
  name: row.name,
  admissionNumber: row.admission_number,
  course: row.course,
  schoolYear: row.school_year,
  transcriptId: row.transcript_id ?? "",
});

const rowToTranscript = (row: any, student: Student): Transcript => ({
  id: row.id,
  student,
  courseUnits: Array.isArray(row.course_units) && row.course_units.length > 0
    ? row.course_units
    : [...defaultCourseUnits],
  remarks: row.remarks ?? "",
  managerComments: row.manager_comments ?? "",
  hodComments: row.hod_comments ?? "",
  hodName: row.hod_name ?? "",
  closingDay: row.closing_day ?? "",
  openingDay: row.opening_day ?? "",
  feeBalance: row.fee_balance ?? "",
});

export const TranscriptProvider = ({ children }: TranscriptProviderProps) => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data: studentRows, error: sErr } = await supabase
      .from("students").select("*").order("created_at", { ascending: false });
    if (sErr) { toast.error("Failed to load students"); console.error(sErr); return; }

    const { data: transcriptRows, error: tErr } = await supabase
      .from("transcripts").select("*");
    if (tErr) { toast.error("Failed to load transcripts"); console.error(tErr); return; }

    const studentList: Student[] = (studentRows ?? []).map((r: any) => {
      const t = (transcriptRows ?? []).find((tr: any) => tr.student_id === r.id);
      return { ...rowToStudent(r), transcriptId: t?.id ?? "" };
    });
    const transcriptList: Transcript[] = (transcriptRows ?? []).map((tr: any) => {
      const sRow = (studentRows ?? []).find((s: any) => s.id === tr.student_id);
      const student = sRow ? { ...rowToStudent(sRow), transcriptId: tr.id } : ({} as Student);
      return rowToTranscript(tr, student);
    });
    setStudents(studentList);
    setTranscripts(transcriptList);
  };

  // One-time migration of any existing localStorage data into cloud DB
  const migrateLocalIfNeeded = async () => {
    const flag = localStorage.getItem("cloud_migrated_v1");
    if (flag) return;
    const oldStudents = localStorage.getItem("students");
    const oldTranscripts = localStorage.getItem("transcripts");
    if (!oldStudents && !oldTranscripts) {
      localStorage.setItem("cloud_migrated_v1", "1");
      return;
    }
    try {
      const stArr: Student[] = oldStudents ? JSON.parse(oldStudents) : [];
      const trArr: Transcript[] = oldTranscripts ? JSON.parse(oldTranscripts) : [];
      for (const s of stArr) {
        const { data: newS, error } = await supabase.from("students").insert({
          name: s.name,
          admission_number: s.admissionNumber,
          course: s.course,
          school_year: s.schoolYear,
        }).select().single();
        if (error || !newS) { console.error(error); continue; }
        const t = trArr.find(t => t.id === s.transcriptId);
        await supabase.from("transcripts").insert({
          student_id: newS.id,
          course_units: (t?.courseUnits ?? defaultCourseUnits) as any,
          remarks: t?.remarks ?? "",
          manager_comments: t?.managerComments ?? "",
          hod_comments: t?.hodComments ?? "",
          hod_name: t?.hodName ?? "",
          closing_day: t?.closingDay ?? "",
          opening_day: t?.openingDay ?? "",
          fee_balance: t?.feeBalance ?? "",
        });
      }
      localStorage.setItem("cloud_migrated_v1", "1");
      toast.success(`Migrated ${stArr.length} students to the cloud`);
    } catch (e) {
      console.error("Migration failed:", e);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await migrateLocalIfNeeded();
      await refresh();
      setLoading(false);
    })();
  }, []);

  const addStudent = async (studentData: Omit<Student, "id" | "transcriptId">) => {
    const { data: newS, error } = await supabase.from("students").insert({
      name: studentData.name,
      admission_number: studentData.admissionNumber,
      course: studentData.course,
      school_year: studentData.schoolYear,
    }).select().single();
    if (error || !newS) { toast.error("Failed to add student"); throw error; }

    const { data: newT, error: tErr } = await supabase.from("transcripts").insert({
      student_id: newS.id,
      course_units: defaultCourseUnits as any,
      hod_name: getHodForCourse(studentData.course),
    }).select().single();

    if (tErr || !newT) { toast.error("Failed to create transcript"); throw tErr; }

    const student: Student = { ...rowToStudent(newS), transcriptId: newT.id };
    const transcript = rowToTranscript(newT, student);
    setStudents(prev => [student, ...prev]);
    setTranscripts(prev => [...prev, transcript]);
    toast.success("Student added");
    return student;
  };

  const updateStudent = async (student: Student) => {
    const { error } = await supabase.from("students").update({
      name: student.name,
      admission_number: student.admissionNumber,
      course: student.course,
      school_year: student.schoolYear,
    }).eq("id", student.id);
    if (error) { toast.error("Failed to update student"); return; }
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
    setTranscripts(prev => prev.map(t => t.student.id === student.id ? { ...t, student } : t));
    toast.success("Student updated");
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) { toast.error("Failed to delete student"); return; }
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    if (student) setTranscripts(prev => prev.filter(t => t.id !== student.transcriptId));
    toast.success("Student deleted");
  };

  const updateTranscript = async (transcript: Transcript) => {
    const { error } = await supabase.from("transcripts").update({
      course_units: transcript.courseUnits as any,
      remarks: transcript.remarks,
      manager_comments: transcript.managerComments,
      hod_comments: transcript.hodComments,
      hod_name: transcript.hodName,
      closing_day: transcript.closingDay,
      opening_day: transcript.openingDay,
      fee_balance: transcript.feeBalance,
    }).eq("id", transcript.id);
    if (error) { toast.error("Failed to update transcript"); return; }
    setTranscripts(prev => prev.map(t => t.id === transcript.id ? transcript : t));
    toast.success("Transcript updated");
  };

  const deleteTranscript = async (id: string) => {
    const { error } = await supabase.from("transcripts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete transcript"); return; }
    setTranscripts(prev => prev.filter(t => t.id !== id));
    toast.success("Transcript deleted");
  };

  const addTranscript = (_transcript: Transcript) => {
    // Kept for API compatibility; transcripts are created automatically with students.
    toast.info("Transcripts are created automatically when a student is added");
  };

  const getStudentTranscript = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    return transcripts.find(t => t.id === student.transcriptId) || null;
  };

  const importFromExcel = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file");
          const workbook = XLSX.read(data, { type: "binary" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

          let added = 0, updated = 0;
          for (const row of rows) {
            const name = row.name || row.Name || row.NAME;
            const admissionNumber = row.admissionNumber || row['Admission Number'] || row.ADMISSION_NUMBER;
            const course = row.course || row.Course || row.COURSE;
            if (!name || !admissionNumber || !course) continue;
            if (typeof name === "string" && (name.includes("REQUIRED") || name.includes("John Doe"))) continue;

            const schoolYear = row.schoolYear || row['School Year'] || row.SCHOOL_YEAR || row.term || row.Term || "";
            const closingDay = row.closingDay || row['Closing Day'] || "";
            const openingDay = row.openingDay || row['Opening Day'] || "";
            const feeBalance = row.feeBalance || row['Fee Balance'] || "";
            const managerComments = row.managerComments || row['Manager Comments'] || "";
            const hodComments = row.hodComments || row['HOD Comments'] || "";
            const hodName = row.hodName || row['HOD Name'] || "";

            // Find existing
            const existing = students.find(s => s.admissionNumber === admissionNumber && s.schoolYear === schoolYear);
            let studentId: string, transcriptId: string;
            let currentUnits: CourseUnit[];

            if (existing) {
              studentId = existing.id;
              transcriptId = existing.transcriptId;
              const t = transcripts.find(t => t.id === transcriptId);
              currentUnits = t ? [...t.courseUnits] : [...defaultCourseUnits];
              await supabase.from("students").update({ name, course, school_year: schoolYear }).eq("id", studentId);
              updated++;
            } else {
              const { data: newS } = await supabase.from("students").insert({
                name, admission_number: admissionNumber, course, school_year: schoolYear
              }).select().single();
              if (!newS) continue;
              studentId = newS.id;
              currentUnits = [...defaultCourseUnits];
              const { data: newT } = await supabase.from("transcripts").insert({
                student_id: studentId, course_units: currentUnits as any
              }).select().single();
              if (!newT) continue;
              transcriptId = newT.id;
              added++;
            }

            const updatedUnits = currentUnits.map(unit => {
              const key = `${unit.name}_EXAM`;
              let exam = unit.exam;
              if (row[key] !== undefined && row[key] !== "" && row[key] !== null) {
                const v = parseFloat(String(row[key]));
                if (!isNaN(v) && v >= 0 && v <= 100) exam = v;
              }
              return { ...unit, exam, grade: calculateGrade(exam) };
            });

            await supabase.from("transcripts").update({
              course_units: updatedUnits as any,
              closing_day: closingDay || undefined,
              opening_day: openingDay || undefined,
              fee_balance: feeBalance || undefined,
              manager_comments: managerComments || undefined,
              hod_comments: hodComments || undefined,
              hod_name: hodName || undefined,
            }).eq("id", transcriptId);
          }

          await refresh();
          toast.success(`Import done: ${added} added, ${updated} updated`);
          resolve();
        } catch (err) {
          console.error(err);
          toast.error(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  return (
    <TranscriptContext.Provider value={{
      transcripts, students, currentTranscript, loading, setCurrentTranscript,
      addTranscript, updateTranscript, deleteTranscript,
      addStudent, updateStudent, deleteStudent,
      getStudentTranscript, importFromExcel, refresh,
    }}>
      {children}
    </TranscriptContext.Provider>
  );
};
