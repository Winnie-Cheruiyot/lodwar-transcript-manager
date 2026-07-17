
import React, { useState } from "react";
import { useTranscript } from "@/context/TranscriptContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { courses } from "@/lib/courses";



interface AddStudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onSuccess, onCancel }) => {
  const { addStudent } = useTranscript();
  const [formData, setFormData] = useState({
    name: "",
    admissionNumber: "",
    course: "",
  });
  const [termNumber, setTermNumber] = useState("1");
  const [termYear, setTermYear] = useState(String(currentYear));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schoolYear = `TERM ${termNumber} ${termYear}`;
    addStudent({ ...formData, schoolYear });
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
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admissionNumber">Admission Number</Label>
            <Input id="admissionNumber" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input id="course" name="course" value={formData.course} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>Term</Label>
            <div className="flex gap-3">
              <Select value={termNumber} onValueChange={setTermNumber}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">TERM 1</SelectItem>
                  <SelectItem value="2">TERM 2</SelectItem>
                  <SelectItem value="3">TERM 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={termYear} onValueChange={setTermYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Add Student</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddStudentForm;
