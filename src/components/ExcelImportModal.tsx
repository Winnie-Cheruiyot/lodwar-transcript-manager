
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Students Data</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) containing student data and grades.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="excelFile">Excel File</Label>
            <Input id="excelFile" type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-1">The Excel file should have the following columns:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>name - Student name</li>
              <li>admissionNumber - Student admission number</li>
              <li>course - Course name</li>
              <li>schoolYear - School year (optional)</li>
              <li>[COURSE_NAME]_CAT - CAT marks for each course</li>
              <li>[COURSE_NAME]_EXAM - Exam marks for each course</li>
              <li>[COURSE_NAME]_TOTAL - Total marks for each course (optional)</li>
              <li>remarks, managerComments, hodComments (all optional)</li>
              <li>closingDay, openingDay, feeBalance (all optional)</li>
            </ul>
          </div>
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
