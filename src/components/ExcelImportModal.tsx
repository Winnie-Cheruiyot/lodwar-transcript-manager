
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranscript } from "@/context/TranscriptContext";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { defaultCourseUnits } from "@/types/transcript";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importFromExcel } = useTranscript();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
      } else {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    setIsImporting(true);
    try {
      await importFromExcel(file);
      onClose();
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Import failed. Please check the file format.");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    // Get the course units from our default units
    const courseUnits = defaultCourseUnits.map(unit => unit.name);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Create the headers - using exact column names that our import function expects
    const headers = {
      name: "Student Name",
      admissionNumber: "Admission Number",
      course: "Course Name",
      schoolYear: "School Year",
    };
    
    // Add subject columns with exact field names needed for import
    courseUnits.forEach(subject => {
      headers[`${subject}_CAT`] = `${subject}_CAT`;
      headers[`${subject}_EXAM`] = `${subject}_EXAM`;
      headers[`${subject}_TOTAL`] = `${subject}_TOTAL`;
    });
    
    // Add additional fields
    Object.assign(headers, {
      closingDay: "closingDay",
      openingDay: "openingDay",
      feeBalance: "feeBalance",
      managerComments: "managerComments",
      hodComments: "hodComments",
      hodName: "hodName"
    });

    // Create sample data row
    const sampleRow = {
      name: "John Doe",
      admissionNumber: "ADM/2024/001",
      course: "Electrical Installation",
      schoolYear: "2024",
    };
    
    // Add sample grades for each subject
    courseUnits.forEach(subject => {
      sampleRow[`${subject}_CAT`] = 25;
      sampleRow[`${subject}_EXAM`] = 55;
      sampleRow[`${subject}_TOTAL`] = 80;
    });
    
    // Add sample additional data
    Object.assign(sampleRow, {
      closingDay: "December 15, 2024",
      openingDay: "January 10, 2025",
      feeBalance: "10,000",
      managerComments: "Good progress overall",
      hodComments: "Excellent performance in practical",
      hodName: "Mr. John Smith"
    });
    
    // Create empty template row
    const emptyRow = {};
    Object.keys(headers).forEach(key => {
      emptyRow[key] = "";
    });
    
    // Add explanation row
    const explanationRow = {
      name: "REQUIRED: Full student name",
      admissionNumber: "REQUIRED: Unique ID",
      course: "REQUIRED: E.g. Electrical Installation",
      schoolYear: "E.g. 2024",
    };
    
    courseUnits.forEach(subject => {
      explanationRow[`${subject}_CAT`] = "CAT marks (max 30)";
      explanationRow[`${subject}_EXAM`] = "Exam marks (max 70)";
      explanationRow[`${subject}_TOTAL`] = "Total marks (max 100)";
    });
    
    Object.assign(explanationRow, {
      closingDay: "School closing date",
      openingDay: "School opening date",
      feeBalance: "Outstanding fees amount",
      managerComments: "Manager's comments",
      hodComments: "HOD's comments",
      hodName: "Full HOD name"
    });
    
    // Create the main worksheet with headers, explanations, a sample row and an empty row
    const data = [
      headers,
      explanationRow,
      sampleRow,
      emptyRow
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    
    // Add column auto-sizing
    const colWidths = Object.keys(headers).map(key => ({ wch: Math.max(20, key.length) }));
    worksheet['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    // Add instructions worksheet
    const instructionsData = [
      { col1: "IMPORTANT INSTRUCTIONS:" },
      { col1: "1. Do not change the column headers - they must match exactly as shown" },
      { col1: "2. Each row represents one student record" },
      { col1: "3. Subject columns use the format: SUBJECTNAME_CAT, SUBJECTNAME_EXAM, SUBJECTNAME_TOTAL" },
      { col1: "4. Required fields: name, admissionNumber, and course" },
      { col1: "5. The first row contains headers and should not be deleted" },
      { col1: "6. The second row contains explanations and can be deleted" },
      { col1: "7. The third row is a sample data row and can be deleted" },
      { col1: "" },
      { col1: "Subject name examples:" },
      ...courseUnits.map(unit => ({ col1: `- ${unit}` }))
    ];
    
    const instructionsWs = XLSX.utils.json_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsWs, "Instructions");
    
    // Write the file and download it
    XLSX.writeFile(workbook, "transcript_template.xlsx");
    
    toast.success("Sample template downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Students Data</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) containing student data and grades.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="excelFile">Excel File</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadSampleTemplate}
                className="flex items-center gap-1"
              >
                <Download size={14} />
                Download Template
              </Button>
            </div>
            <Input id="excelFile" type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="format">
              <AccordionTrigger>Excel Format Instructions</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">Required columns:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li><strong>name</strong> - Student name</li>
                    <li><strong>admissionNumber</strong> - Student admission number</li>
                    <li><strong>course</strong> - Course name</li>
                  </ul>
                  
                  <p className="font-medium mb-1">Grade columns structure:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li><strong>SUBJECT_CAT</strong> - CAT marks (e.g., MATHEMATICS_CAT)</li>
                    <li><strong>SUBJECT_EXAM</strong> - Exam marks (e.g., MATHEMATICS_EXAM)</li>
                    <li><strong>SUBJECT_TOTAL</strong> - Total marks (e.g., MATHEMATICS_TOTAL)</li>
                  </ul>
                  
                  <p className="font-medium mb-1">Other columns:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li><strong>schoolYear</strong> - School year</li>
                    <li><strong>closingDay</strong> - School closing date</li>
                    <li><strong>openingDay</strong> - School opening date</li>
                    <li><strong>feeBalance</strong> - Outstanding fee balance</li>
                    <li><strong>managerComments</strong> - Comments from manager</li>
                    <li><strong>hodComments</strong> - Comments from HOD</li>
                    <li><strong>hodName</strong> - Name of the HOD</li>
                  </ul>
                  
                  <p className="text-blue-500 font-medium mt-2">
                    Important: Download the template for the correct format. Column names must match exactly as shown in the template.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleImport}
            disabled={!file || isImporting}
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportModal;
