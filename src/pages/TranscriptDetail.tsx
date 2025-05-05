
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
    const data = [
      // Header row for student info
      { 
        "Student Name": student.name,
        "Admission Number": student.admissionNumber,
        "Course": student.course,
        "School Year": student.schoolYear
      },
      {}, // Empty row for spacing
      // Header for subjects
      {
        "Subject": "Subject",
        "CAT": "CAT",
        "EXAM": "EXAM",
        "TOTAL": "TOTAL",
        "GRADE": "GRADE"
      }
    ];

    // Add course units
    transcript.courseUnits.forEach(unit => {
      data.push({
        "Subject": unit.name,
        "CAT": unit.cat !== null ? unit.cat : "",
        "EXAM": unit.exam !== null ? unit.exam : "",
        "TOTAL": unit.total !== null ? unit.total : "",
        "GRADE": unit.grade || ""
      });
    });

    // Calculate total
    const totalPoints = transcript.courseUnits.reduce(
      (sum, unit) => sum + (unit.total || 0), 0
    );
    
    data.push({}, { "Subject": "TOTAL", "TOTAL": totalPoints });

    // Add additional information
    data.push(
      {},
      { "Comments": "Manager Comments", "Value": transcript.managerComments },
      { "Comments": "HOD Comments", "Value": transcript.hodComments },
      {},
      { "Details": "Closing Day", "Value": transcript.closingDay },
      { "Details": "Opening Day", "Value": transcript.openingDay },
      { "Details": "Fee Balance", "Value": transcript.feeBalance }
    );

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
    </div>
  );
};

export default TranscriptDetail;
