
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranscript } from "@/context/TranscriptContext";
import TranscriptView from "@/components/TranscriptView";
import TranscriptEditor from "@/components/TranscriptEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Printer, Download } from "lucide-react";
import * as XLSX from "xlsx";

const TranscriptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transcripts, setCurrentTranscript } = useTranscript();
  const [transcript, setTranscript] = useState<typeof transcripts[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/students");
      return;
    }

    const foundTranscript = transcripts.find((t) => t.id === id);
    if (!foundTranscript) {
      toast.error("Transcript not found");
      navigate("/students");
      return;
    }

    setTranscript(foundTranscript);
    setCurrentTranscript(foundTranscript);

    return () => {
      setCurrentTranscript(null);
    };
  }, [id, transcripts, navigate, setCurrentTranscript]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handleDownload = () => {
    if (!transcript) return;

    // Create data for Excel
    const student = transcript.student;
    
    // Define the different types of rows we'll add to the Excel file
    type StudentInfoRow = {
      "Student Name": string;
      "Admission Number": string;
      "Course": string;
      "Term & Year": string;
    };

    type EmptyRow = Record<string, never>;

    type SubjectRow = {
      "Subject": string;
      "EXAM": string;
      "GRADE": string;
    };

    type TotalRow = {
      "Subject": string;
      "EXAM": string;
      "GRADE": string;
    };

    type CommentRow = {
      "Subject": string;
      "Comment": string;
    };

    // Create an array to hold all our row types
    const data: Array<StudentInfoRow | EmptyRow | SubjectRow | TotalRow | CommentRow> = [];

    // Header row for student info
    data.push({ 
      "Student Name": student.name,
      "Admission Number": student.admissionNumber,
      "Course": student.course,
      "Term & Year": student.schoolYear
    });

    // Empty row for spacing
    data.push({} as EmptyRow);
    
    // Header for subjects
    data.push({
      "Subject": "Subject",
      "EXAM": "EXAM",
      "GRADE": "GRADE"
    });

    // Add course units
    transcript.courseUnits.forEach(unit => {
      data.push({
        "Subject": unit.name,
        "EXAM": unit.exam !== null ? String(unit.exam) : "",
        "GRADE": unit.grade || ""
      });
    });

    // Calculate total
    const totalPoints = transcript.courseUnits.reduce(
      (sum, unit) => sum + (unit.exam || 0), 0
    );
    
    // Add empty row and total row
    data.push({} as EmptyRow);
    data.push({
      "Subject": "TOTAL",
      "EXAM": String(totalPoints),
      "GRADE": ""
    } as TotalRow);

    // Add additional information with comments
    data.push({} as EmptyRow);
    data.push({ "Subject": "Manager Comments", "Comment": transcript.managerComments } as CommentRow);
    data.push({ "Subject": "HOD Comments", "Comment": transcript.hodComments } as CommentRow);
    if (transcript.hodName) {
      data.push({ "Subject": "HOD Name", "Comment": transcript.hodName } as CommentRow);
    }
    data.push({} as EmptyRow);
    data.push({ "Subject": "Closing Day", "Comment": transcript.closingDay } as CommentRow);
    data.push({ "Subject": "Opening Day", "Comment": transcript.openingDay } as CommentRow);
    data.push({ "Subject": "Fee Balance", "Comment": transcript.feeBalance } as CommentRow);
    
    // Add footer with copyright
    data.push({} as EmptyRow);
    data.push({ "Subject": "© Examination department@2025 LVTC", "Comment": "" } as CommentRow);

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transcript");
    
    // Download
    XLSX.writeFile(workbook, `${student.name}_transcript.xlsx`);
    toast.success("Transcript downloaded successfully");
  };

  if (!transcript) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="animate-pulse p-8">Loading transcript...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <Button
            variant="outline"
            onClick={() => navigate("/students")}
          >
            ← Back to Students
          </Button>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <div className="text-sm text-gray-600 font-medium mt-2">
              Editing transcript...
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Transcript
              </Button>
              <Button 
                variant="outline"
                onClick={handleDownload} 
                className="flex items-center gap-1"
              >
                <Download size={18} />
                Download Excel
              </Button>
              <Button onClick={handlePrint} className="flex items-center gap-1">
                <Printer size={18} />
                Print Transcript
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="print-container">
        {isEditing ? (
          <TranscriptEditor
            transcript={transcript}
            onSave={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <TranscriptView transcript={transcript} isPrinting={isPrinting} />
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
        © Examination department@2025 LVTC
      </div>
    </div>
  );
};

export default TranscriptDetail;
