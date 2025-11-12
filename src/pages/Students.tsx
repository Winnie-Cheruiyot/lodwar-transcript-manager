
import React, { useState } from "react";
import { useTranscript } from "@/context/TranscriptContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import AddStudentForm from "@/components/AddStudentForm";
import ExcelImportModal from "@/components/ExcelImportModal";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Printer, Download } from "lucide-react";

const Students = () => {
  const { students, deleteStudent, transcripts } = useTranscript();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}'s record? This cannot be undone.`)) {
      deleteStudent(id);
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
      toast.success(`${name}'s record has been deleted`);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const handleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handlePrintSelected = () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsGeneratingBatch(true);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups and try again.");
      setIsGeneratingBatch(false);
      return;
    }

    // Set up the HTML content for the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Batch Transcripts</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .print-container { page-break-after: always; }
          @page { size: A4 portrait; margin: 0.5cm; }
          ${document.head.querySelector('style')?.innerHTML || ''}
          ${Array.from(document.styleSheets)
            .filter(sheet => sheet.href?.includes('index.css'))
            .map(() => `@import url("${window.location.origin}/index.css");`)
            .join('\n')}
        </style>
      </head>
      <body>
        <div id="content"></div>
        <script>
          window.onload = function() {
            window.setTimeout(function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);

    // Get the content div in the print window
    const contentDiv = printWindow.document.getElementById('content');
    
    // Add each selected transcript to the print window
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        const transcript = transcripts.find(t => t.id === student.transcriptId);
        if (transcript && contentDiv) {
          // Create a container for this transcript
          const transcriptContainer = printWindow.document.createElement('div');
          transcriptContainer.className = 'print-container';
          
          // Clone our transcript HTML and add it to the container
          const transcriptElement = document.createElement('div');
          transcriptElement.innerHTML = `
            <div class="bg-white rounded-3xl overflow-hidden shadow-lg mx-auto transition-all print:shadow-none print:w-full print:max-w-none">
              <div class="p-3 rounded-t-3xl bg-lvtc-navy text-white relative overflow-hidden">
                <div class="flex justify-between text-xs">
                  <div class="flex items-center">
                    <div class="rounded-full bg-white p-0.5 mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <span>0723456899</span>
                  </div>
                  <div class="flex items-center">
                    <div class="rounded-full bg-white p-0.5 mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <span>plodwaryouth@yahoo.com</span>
                  </div>
                </div>
                <div class="flex items-center justify-center py-2">
                  <img 
                    src="${window.location.origin}/lovable-uploads/2a540926-4284-411c-aa4b-7863224682f2.png" 
                    alt="Lodwar VTC Logo" 
                    class="w-16 h-16 object-contain mr-3" 
                  />
                  <div class="text-white text-center">
                    <h1 class="text-xl font-bold mb-0 uppercase tracking-wide">
                      Lodwar Vocational Training
                    </h1>
                    <h1 class="text-xl font-bold uppercase tracking-wide">
                      Centre
                    </h1>
                  </div>
                </div>
                <div class="text-center bg-lvtc-navy py-1">
                  <h2 class="text-lg font-bold uppercase">TRANSCRIPT</h2>
                </div>
              </div>
              <div class="p-4 bg-white">
                <div class="flex flex-wrap mb-3 border-b pb-2 border-gray-300">
                  <div class="w-1/2 flex items-center mb-1">
                    <span class="font-bold text-lvtc-navy mr-1">Name:</span>
                    <span>${transcript.student.name}</span>
                  </div>
                  <div class="w-1/2 flex items-center mb-1">
                    <span class="font-bold text-lvtc-navy mr-1">Adm No:</span>
                    <span>${transcript.student.admissionNumber}</span>
                  </div>
                  <div class="w-1/2 flex items-center">
                    <span class="font-bold text-lvtc-navy mr-1">Course:</span>
                    <span>${transcript.student.course}</span>
                  </div>
                  <div class="w-1/2 flex items-center">
                    <span class="font-bold text-lvtc-navy mr-1">School Year:</span>
                    <span>${transcript.student.schoolYear}</span>
                  </div>
                </div>
                <div class="mb-4">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-lvtc-navy text-white">
                        <th class="p-1 text-left">COURSE UNIT</th>
                        <th class="p-1 text-center">EXAM (100)</th>
                        <th class="p-1 text-center">GRADE</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${transcript.courseUnits.map((unit, index) => `
                        <tr class="${index % 2 === 0 ? "bg-lvtc-yellow/50" : "bg-white"}">
                          <td class="p-1.5 font-semibold">${unit.name}</td>
                          <td class="p-1.5 text-center">${unit.exam !== null ? unit.exam : "-"}</td>
                          <td class="p-1.5 text-center">${unit.grade || "-"}</td>
                        </tr>
                      `).join('')}
                      <tr class="bg-lvtc-yellow font-bold">
                        <td class="p-1.5">Total</td>
                        <td class="p-1.5 text-center">${transcript.courseUnits.reduce((sum, unit) => sum + (unit.exam || 0), 0)}</td>
                        <td class="p-1.5 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="flex items-center bg-gray-100 p-2 rounded mb-4">
                  <div class="font-bold text-lvtc-navy">FINAL GRADE: ${
                    (() => {
                      const total = transcript.courseUnits.reduce((sum, unit) => sum + (unit.exam || 0), 0);
                      for (const scale of [
                        { level: "DISTINCTION", range: "320-400" },
                        { level: "CREDIT", range: "240-319" },
                        { level: "PASS", range: "160-239" },
                        { level: "FAIL", range: "0-159" }
                      ]) {
                        const [min, max] = scale.range.split('-').map(Number);
                        if (total >= min && total <= max) {
                          return scale.level;
                        }
                      }
                      return "NOT GRADED";
                    })()
                  }</div>
                  <div class="flex-1 ml-4 flex space-x-4">
                    ${[
                      { level: "DISTINCTION", range: "320-400" },
                      { level: "CREDIT", range: "240-319" },
                      { level: "PASS", range: "160-239" },
                      { level: "FAIL", range: "0-159" }
                    ].map(scale => `
                      <div class="flex items-center gap-1 text-sm">
                        <span class="font-bold">${scale.level}:</span>
                        <span>${scale.range}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div class="bg-lvtc-yellow/60 p-3 rounded">
                    <div class="uppercase font-bold mb-2 text-center">Manager Comments:</div>
                    <div class="min-h-[80px]">${transcript.managerComments}</div>
                    <div class="mt-3 font-bold text-center">
                      MR. ABRAHAM CHEGEM<br />
                      MANAGER LVTC
                    </div>
                  </div>
                  <div class="bg-lvtc-yellow/60 p-3 rounded flex flex-col justify-between">
                    <div class="space-y-3">
                      <div>
                        <div class="uppercase font-bold mb-1">Closing Day:</div>
                        <div>${transcript.closingDay}</div>
                      </div>
                      <div>
                        <div class="uppercase font-bold mb-1">Opening Day:</div>
                        <div>${transcript.openingDay}</div>
                      </div>
                      <div>
                        <div class="uppercase font-bold mb-1">Fee Balance:</div>
                        <div class="font-bold">${transcript.feeBalance}</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-1 mt-3 text-[10px] border-t pt-1 border-gray-400">
                      ${[
                        { grade: "A", range: "70-100" },
                        { grade: "B", range: "60-69" },
                        { grade: "C", range: "50-59" },
                        { grade: "D", range: "40-49" },
                        { grade: "E", range: "0-39" }
                      ].map(scale => `
                        <div class="flex gap-1">
                          <span class="font-bold">${scale.grade}:</span>
                          <span>${scale.range}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  <div class="bg-lvtc-yellow/60 p-3 rounded">
                    <div class="uppercase font-bold mb-2 text-center">H.O.D Comments:</div>
                    <div class="min-h-[80px]">${transcript.hodComments}</div>
                    <div class="mt-3 font-bold text-center">
                      ${transcript.hodName || "MR. GEOFREY NALIMA"}<br />
                      H.O.D ELECTRICAL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          transcriptContainer.appendChild(transcriptElement);
          contentDiv.appendChild(transcriptContainer);
        }
      }
    });
    
    printWindow.document.close();
    setIsGeneratingBatch(false);
    toast.success(`Preparing ${selectedStudents.length} transcripts for printing...`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-lvtc-navy">Student Records</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-64"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Add Student</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAddForm(true)}>
                Add Single Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowImportModal(true)}>
                Import from Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showAddForm ? (
        <div className="mb-8">
          <AddStudentForm
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : null}

      {/* Batch Actions Bar */}
      {filteredStudents.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all"
              checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({filteredStudents.length})
            </label>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrintSelected}
              disabled={selectedStudents.length === 0 || isGeneratingBatch}
              className="flex items-center gap-1"
            >
              <Printer size={16} />
              Print Selected ({selectedStudents.length})
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {students.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-medium text-gray-600">No students found</h2>
            <p className="text-gray-500 mt-2">Add students by clicking the "Add Student" button</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-medium text-gray-600">No matching students</h2>
            <p className="text-gray-500 mt-2">
              Try changing your search term or add a new student
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lvtc-navy text-white">
                  <TableHead className="w-10 text-white"></TableHead>
                  <TableHead className="text-left text-white">Name</TableHead>
                  <TableHead className="text-left text-white">Admission Number</TableHead>
                  <TableHead className="text-left text-white">Course</TableHead>
                  <TableHead className="text-left text-white">School Year</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell className="pl-4">
                      <Checkbox 
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleSelectStudent(student.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.schoolYear}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/transcripts/${student.transcriptId}`}>
                            View Transcript
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default Students;
