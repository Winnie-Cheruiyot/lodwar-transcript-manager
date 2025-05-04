
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
import AddStudentForm from "@/components/AddStudentForm";
import ExcelImportModal from "@/components/ExcelImportModal";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Students = () => {
  const { students, deleteStudent } = useTranscript();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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
      toast.success(`${name}'s record has been deleted`);
    }
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
