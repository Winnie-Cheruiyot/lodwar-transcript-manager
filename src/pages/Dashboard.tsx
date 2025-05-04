
import React, { useState } from "react";
import { useTranscript } from "@/context/TranscriptContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import ExcelImportModal from "@/components/ExcelImportModal";
import AddStudentForm from "@/components/AddStudentForm";

const Dashboard = () => {
  const { students, transcripts } = useTranscript();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate basic statistics
  const totalStudents = students.length;
  const completedTranscripts = transcripts.filter(
    (transcript) => transcript.courseUnits.some((unit) => unit.total !== null)
  ).length;
  const incompleteTranscripts = totalStudents - completedTranscripts;

  // Calculate grade distribution
  const gradeDistribution = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  transcripts.forEach((transcript) => {
    transcript.courseUnits.forEach((unit) => {
      if (unit.grade) {
        gradeDistribution[unit.grade as keyof typeof gradeDistribution]++;
      }
    });
  });

  // Get recently added students (up to 5)
  const recentStudents = [...students]
    .sort((a, b) => b.admissionNumber.localeCompare(a.admissionNumber))
    .slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-lvtc-navy">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            Add Student
          </Button>
          <Button onClick={() => setShowImportModal(true)}>
            Import from Excel
          </Button>
          <Button asChild>
            <Link to="/students">View All Students</Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Complete Transcripts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{completedTranscripts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Incomplete Transcripts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{incompleteTranscripts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Students</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length > 0 ? (
              <ul className="space-y-2">
                {recentStudents.map((student) => (
                  <li key={student.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.course}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/transcripts/${student.transcriptId}`}>
                        View Transcript
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No students added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center">
                  <span className="w-8 font-bold">{grade}</span>
                  <div className="flex-grow bg-gray-200 h-6 rounded-md overflow-hidden">
                    <div
                      className={`h-full ${
                        grade === "A"
                          ? "bg-green-500"
                          : grade === "B"
                          ? "bg-blue-500"
                          : grade === "C"
                          ? "bg-yellow-500"
                          : grade === "D"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${
                          count > 0
                            ? Math.max(
                                5,
                                (count /
                                  Math.max(
                                    1,
                                    Object.values(gradeDistribution).reduce(
                                      (a, b) => a + b,
                                      0
                                    )
                                  )) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <AddStudentForm
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default Dashboard;
