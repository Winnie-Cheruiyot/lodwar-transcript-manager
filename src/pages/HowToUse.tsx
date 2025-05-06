
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ChevronRight, 
  User, 
  FileEdit, 
  Printer, 
  Download, 
  Plus, 
  FileUp 
} from "lucide-react";

const HowToUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-lvtc-navy">How to Use the System</h1>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>

      <div className="grid gap-6">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Lodwar VTC Transcript Manager</CardTitle>
            <CardDescription>
              A simplified guide to help you get started with the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              This system allows you to manage student transcripts efficiently. You can create, edit, 
              view, print, and download transcripts for students at Lodwar Vocational Training Centre.
            </p>
          </CardContent>
        </Card>

        {/* Feature 1: Managing Students */}
        <Card>
          <CardHeader className="bg-lvtc-navy/10">
            <div className="flex items-center">
              <User className="mr-2 h-6 w-6 text-lvtc-navy" />
              <CardTitle>Managing Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Navigate to Students</h3>
                  <p className="text-sm text-gray-500">
                    Click on the "Students" tab in the navigation menu to view all students.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Add New Student</h3>
                  <p className="text-sm text-gray-500">
                    Click on the "Add Student" button <Plus className="inline h-4 w-4" /> to create a new student record.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Import Students</h3>
                  <p className="text-sm text-gray-500">
                    Use the "Import from Excel" button <FileUp className="inline h-4 w-4" /> to bulk import student data. 
                    Download the template provided in the modal to ensure correct data formatting.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature 2: Working with Transcripts */}
        <Card>
          <CardHeader className="bg-lvtc-navy/10">
            <div className="flex items-center">
              <FileEdit className="mr-2 h-6 w-6 text-lvtc-navy" />
              <CardTitle>Managing Transcripts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">View Student Transcript</h3>
                  <p className="text-sm text-gray-500">
                    From the students list, click on "View Transcript" for any student to see their transcript.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Edit Transcript</h3>
                  <p className="text-sm text-gray-500">
                    While viewing a transcript, click "Edit Transcript" to modify student information, 
                    add/remove courses, update grades, or add comments.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Course Units & Grades</h3>
                  <p className="text-sm text-gray-500">
                    When editing a transcript, use the "Courses & Grades" tab to add course units and input CAT and EXAM scores. 
                    The system will automatically calculate the total and assign a grade.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">Comments & Additional Information</h3>
                  <p className="text-sm text-gray-500">
                    Use the "Comments & Details" tab to add Manager and HOD comments, closing/opening days,
                    and fee balance information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature 3: Printing & Exporting */}
        <Card>
          <CardHeader className="bg-lvtc-navy/10">
            <div className="flex items-center">
              <Printer className="mr-2 h-6 w-6 text-lvtc-navy" />
              <CardTitle>Printing & Downloading Transcripts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Print Transcript</h3>
                  <p className="text-sm text-gray-500">
                    Click the "Print Transcript" button <Printer className="inline h-4 w-4" /> to open the print dialog and print
                    the transcript on paper.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border border-lvtc-navy bg-lvtc-navy text-white">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Download as Excel</h3>
                  <p className="text-sm text-gray-500">
                    Click the "Download Excel" button <Download className="inline h-4 w-4" /> to export the transcript data to
                    an Excel spreadsheet.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Tips & Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Always save your changes after editing a transcript.</li>
              <li>Preview the transcript before printing to ensure everything is displayed correctly.</li>
              <li>For bulk imports, carefully follow the template structure to avoid data errors.</li>
              <li>CAT scores are typically out of 30 points, and EXAM scores out of 70 points.</li>
              <li>The system will automatically calculate final grades based on total scores.</li>
              <li>Remember to include all required information like closing/opening days and fee balances.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => navigate("/")} 
            className="flex items-center"
          >
            Get Started <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
