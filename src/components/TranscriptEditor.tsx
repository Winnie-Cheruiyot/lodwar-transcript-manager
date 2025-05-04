
import React, { useState, useEffect } from "react";
import { useTranscript } from "@/context/TranscriptContext";
import { Transcript, CourseUnit } from "@/types/transcript";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { toast } from "sonner";

interface TranscriptEditorProps {
  transcript: Transcript;
  onSave: () => void;
  onCancel: () => void;
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  transcript,
  onSave,
  onCancel,
}) => {
  const { updateTranscript, updateStudent } = useTranscript();
  const [editedTranscript, setEditedTranscript] = useState<Transcript>({
    ...transcript,
  });

  // Helper function to calculate grade based on total points
  const calculateGrade = (total: number | null): string | null => {
    if (total === null) return null;
    if (total >= 70) return "A";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 40) return "D";
    return "E";
  };

  // Handle student info changes
  const handleStudentChange = (field: keyof typeof editedTranscript.student, value: string) => {
    setEditedTranscript({
      ...editedTranscript,
      student: {
        ...editedTranscript.student,
        [field]: value,
      },
    });
  };

  // Handle course unit changes
  const handleCourseUnitChange = (
    unitId: string,
    field: keyof CourseUnit,
    value: string | number | null
  ) => {
    const updatedUnits = editedTranscript.courseUnits.map((unit) => {
      if (unit.id !== unitId) return unit;
      
      const updatedUnit = { ...unit, [field]: value };
      
      // Auto-calculate grade when CAT or EXAM changes
      if (field === "cat" || field === "exam") {
        const cat = field === "cat" ? value as number : unit.cat;
        const exam = field === "exam" ? value as number : unit.exam;
        
        if (cat !== null && exam !== null) {
          updatedUnit.total = cat + exam;
          updatedUnit.grade = calculateGrade(updatedUnit.total);
        }
      }
      
      // Auto-calculate grade when total changes
      if (field === "total") {
        updatedUnit.grade = calculateGrade(value as number | null);
      }
      
      return updatedUnit;
    });

    setEditedTranscript({
      ...editedTranscript,
      courseUnits: updatedUnits,
    });
  };

  // Handle other transcript field changes
  const handleTranscriptChange = (
    field: "remarks" | "managerComments" | "hodComments" | "closingDay" | "openingDay" | "feeBalance",
    value: string
  ) => {
    setEditedTranscript({
      ...editedTranscript,
      [field]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update transcript in context
      updateTranscript(editedTranscript);
      
      // Also update student info
      updateStudent(editedTranscript.student);
      
      onSave();
      toast.success("Transcript saved successfully");
    } catch (error) {
      console.error("Error saving transcript:", error);
      toast.error("Failed to save transcript");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="student">Student Info</TabsTrigger>
          <TabsTrigger value="courses">Courses & Grades</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
          <TabsTrigger value="comments">Comments & Details</TabsTrigger>
        </TabsList>

        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={editedTranscript.student.name}
                    onChange={(e) => handleStudentChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number</Label>
                  <Input
                    id="admissionNumber"
                    value={editedTranscript.student.admissionNumber}
                    onChange={(e) => handleStudentChange("admissionNumber", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={editedTranscript.student.course}
                    onChange={(e) => handleStudentChange("course", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolYear">School Year</Label>
                  <Input
                    id="schoolYear"
                    value={editedTranscript.student.schoolYear}
                    onChange={(e) => handleStudentChange("schoolYear", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Units and Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-lvtc-navy text-white">
                      <th className="p-2 text-left">Course Unit</th>
                      <th className="p-2 text-center">CAT (30%)</th>
                      <th className="p-2 text-center">EXAM (70%)</th>
                      <th className="p-2 text-center">TOTAL (100%)</th>
                      <th className="p-2 text-center">GRADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedTranscript.courseUnits.map((unit, index) => (
                      <tr key={unit.id} className={index % 2 === 0 ? "bg-lvtc-yellow" : "bg-white"}>
                        <td className="p-2 font-semibold">{unit.name}</td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="30"
                            value={unit.cat !== null ? unit.cat : ""}
                            onChange={(e) => handleCourseUnitChange(
                              unit.id, 
                              "cat", 
                              e.target.value ? Number(e.target.value) : null
                            )}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="70"
                            value={unit.exam !== null ? unit.exam : ""}
                            onChange={(e) => handleCourseUnitChange(
                              unit.id, 
                              "exam", 
                              e.target.value ? Number(e.target.value) : null
                            )}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={unit.total !== null ? unit.total : ""}
                            onChange={(e) => handleCourseUnitChange(
                              unit.id, 
                              "total", 
                              e.target.value ? Number(e.target.value) : null
                            )}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            value={unit.grade || ""}
                            onChange={(e) => handleCourseUnitChange(unit.id, "grade", e.target.value || null)}
                            className="h-8 text-center"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remarks">
          <Card>
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={editedTranscript.remarks}
                  onChange={(e) => handleTranscriptChange("remarks", e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments and Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="managerComments">Manager Comments</Label>
                <Textarea
                  id="managerComments"
                  value={editedTranscript.managerComments}
                  onChange={(e) => handleTranscriptChange("managerComments", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hodComments">H.O.D Comments</Label>
                <Textarea
                  id="hodComments"
                  value={editedTranscript.hodComments}
                  onChange={(e) => handleTranscriptChange("hodComments", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closingDay">Closing Day</Label>
                  <Input
                    id="closingDay"
                    value={editedTranscript.closingDay}
                    onChange={(e) => handleTranscriptChange("closingDay", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingDay">Opening Day</Label>
                  <Input
                    id="openingDay"
                    value={editedTranscript.openingDay}
                    onChange={(e) => handleTranscriptChange("openingDay", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeBalance">Fee Balance</Label>
                  <Input
                    id="feeBalance"
                    value={editedTranscript.feeBalance}
                    onChange={(e) => handleTranscriptChange("feeBalance", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">Save Transcript</Button>
      </div>
    </form>
  );
};

export default TranscriptEditor;
