
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
    // Create sample data
    const subjects = [
      "TRADE THEORY", 
      "TRADE PRACTICE", 
      "COMMUNICATION SKILLS", 
      "ENTREPRENEURSHIP", 
      "MATHEMATICS", 
      "GENERAL SCIENCE", 
      "DIGITAL LITERACY"
    ];

    // Create headers
    const headers = {
      name: "Student Name",
      admissionNumber: "Admission Number",
      course: "Course",
      schoolYear: "School Year",
    };

    // Add subject columns
    subjects.forEach(subject => {
      headers[`${subject}_CAT`] = `${subject} CAT`;
      headers[`${subject}_EXAM`] = `${subject} EXAM`;
      headers[`${subject}_TOTAL`] = `${subject} TOTAL`;
    });

    // Add additional fields
    Object.assign(headers, {
      closingDay: "Closing Day",
      openingDay: "Opening Day",
      feeBalance: "Fee Balance",
      managerComments: "Manager Comments",
      hodComments: "HOD Comments",
      hodName: "HOD Name",
    });

    // Create sample row
    const sampleData = {
      name: "John Doe",
      admissionNumber: "ADM/2024/001",
      course: "Electrical Installation",
      schoolYear: "2024",
    };

    // Add sample grades
    subjects.forEach(subject => {
      sampleData[`${subject}_CAT`] = 30;
      sampleData[`${subject}_EXAM`] = 50;
      sampleData[`${subject}_TOTAL`] = 80;
    });

    // Add sample additional info
    Object.assign(sampleData, {
      closingDay: "December 15, 2024",
      openingDay: "January 10, 2025",
      feeBalance: "10,000",
      managerComments: "Good performance",
      hodComments: "Excellent work",
      hodName: "Mr. John Smith",
    });

    // Create empty row template (just headers)
    const emptyTemplate = {};
    Object.keys(headers).forEach(key => {
      emptyTemplate[key] = "";
    });

    // Create sheet with headers, sample row, and empty template
    const data = [headers, sampleData, emptyTemplate];
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
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
                  
                  <p className="font-medium mb-1">Optional columns:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-2">
                    <li><strong>schoolYear</strong> - School year</li>
                    <li><strong>[SUBJECT_NAME]_CAT</strong> - CAT marks for each subject</li>
                    <li><strong>[SUBJECT_NAME]_EXAM</strong> - Exam marks for each subject</li>
                    <li><strong>[SUBJECT_NAME]_TOTAL</strong> - Total marks for each subject</li>
                    <li><strong>remarks</strong> - General remarks</li>
                    <li><strong>managerComments</strong> - Comments from manager</li>
                    <li><strong>hodComments</strong> - Comments from HOD</li>
                    <li><strong>hodName</strong> - Name of the HOD</li>
                    <li><strong>closingDay</strong> - School closing date</li>
                    <li><strong>openingDay</strong> - School opening date</li>
                    <li><strong>feeBalance</strong> - Outstanding fee balance</li>
                  </ul>
                  
                  <p className="font-medium">Note:</p>
                  <p>Download the template for a ready-to-use Excel format.</p>
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
