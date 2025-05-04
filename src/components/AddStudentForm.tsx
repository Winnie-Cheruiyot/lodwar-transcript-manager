
import React, { useState } from "react";
import { useTranscript } from "@/context/TranscriptContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AddStudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onSuccess, onCancel }) => {
  const { addStudent } = useTranscript();
  const [formData, setFormData] = useState({
    name: "",
    admissionNumber: "",
    course: "",
    schoolYear: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent(formData);
    onSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admissionNumber">Admission Number</Label>
            <Input
              id="admissionNumber"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolYear">School Year</Label>
            <Input
              id="schoolYear"
              name="schoolYear"
              value={formData.schoolYear}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Student</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddStudentForm;
