
import React, { useState, useMemo } from "react";
import { useTranscript } from "@/context/TranscriptContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const Dashboard = () => {
  const { students, transcripts } = useTranscript();
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Extract unique courses and years for filters
  const courses = useMemo(() => {
    const courseSet = new Set(students.map(student => student.course));
    return ["all", ...Array.from(courseSet)];
  }, [students]);

  const years = useMemo(() => {
    const yearSet = new Set(students.map(student => student.schoolYear).filter(Boolean));
    return ["all", ...Array.from(yearSet)];
  }, [students]);

  // Filter transcripts based on selected filters
  const filteredTranscripts = useMemo(() => {
    return transcripts.filter(transcript => {
      const matchesCourse = courseFilter === "all" || transcript.student.course === courseFilter;
      const matchesYear = yearFilter === "all" || transcript.student.schoolYear === yearFilter;
      return matchesCourse && matchesYear;
    });
  }, [transcripts, courseFilter, yearFilter]);

  // Calculate school averages
  const schoolStats = useMemo(() => {
    if (filteredTranscripts.length === 0) return { average: 0, passRate: 0, totalStudents: 0 };
    
    let totalMarks = 0;
    let passingStudents = 0;
    
    filteredTranscripts.forEach(transcript => {
      const total = transcript.courseUnits.reduce((sum, unit) => sum + (unit.exam || 0), 0);
      totalMarks += total;
      
      // Calculate if student passed (total >= 200 based on pass scale)
      if (total >= 200) passingStudents++;
    });
    
    return {
      average: Math.round(totalMarks / filteredTranscripts.length),
      passRate: Math.round((passingStudents / filteredTranscripts.length) * 100),
      totalStudents: filteredTranscripts.length
    };
  }, [filteredTranscripts]);

  // Calculate course averages
  const courseStats = useMemo(() => {
    if (filteredTranscripts.length === 0) return [];
    
    const courseData = {};
    
    filteredTranscripts.forEach(transcript => {
      const course = transcript.student.course;
      const total = transcript.courseUnits.reduce((sum, unit) => sum + (unit.exam || 0), 0);
      
      if (!courseData[course]) {
        courseData[course] = { totalMarks: 0, count: 0, students: [] };
      }
      
      courseData[course].totalMarks += total;
      courseData[course].count += 1;
      courseData[course].students.push({
        name: transcript.student.name,
        admissionNumber: transcript.student.admissionNumber,
        total
      });
    });
    
    return Object.keys(courseData).map(course => ({
      name: course,
      average: Math.round(courseData[course].totalMarks / courseData[course].count),
      students: courseData[course].count,
      topStudents: courseData[course].students
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
    }));
  }, [filteredTranscripts]);

  // Calculate subject statistics
  const subjectStats = useMemo(() => {
    if (filteredTranscripts.length === 0) return [];
    
    const subjectData = {};
    
    filteredTranscripts.forEach(transcript => {
      transcript.courseUnits.forEach(unit => {
        const subjectName = unit.name;
        
        if (!subjectData[subjectName]) {
          subjectData[subjectName] = { totalMarks: 0, count: 0, students: [] };
        }
        
        if (unit.exam !== null) {
          subjectData[subjectName].totalMarks += unit.exam;
          subjectData[subjectName].count += 1;
          subjectData[subjectName].students.push({
            name: transcript.student.name,
            admissionNumber: transcript.student.admissionNumber,
            course: transcript.student.course,
            total: unit.exam
          });
        }
      });
    });
    
    return Object.keys(subjectData).map(subject => ({
      name: subject,
      average: subjectData[subject].count > 0 
        ? Math.round(subjectData[subject].totalMarks / subjectData[subject].count) 
        : 0,
      topStudents: subjectData[subject].students
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
    }));
  }, [filteredTranscripts]);

  // Find top 10 students overall
  const topStudents = useMemo(() => {
    return filteredTranscripts
      .map(transcript => ({
        name: transcript.student.name,
        admissionNumber: transcript.student.admissionNumber,
        course: transcript.student.course,
        total: transcript.courseUnits.reduce((sum, unit) => sum + (unit.exam || 0), 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredTranscripts]);

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    const grades = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    let totalGrades = 0;

    filteredTranscripts.forEach(transcript => {
      transcript.courseUnits.forEach(unit => {
        if (unit.grade) {
          grades[unit.grade] = (grades[unit.grade] || 0) + 1;
          totalGrades++;
        }
      });
    });

    return Object.keys(grades).map(grade => ({
      name: grade,
      value: grades[grade],
      percentage: totalGrades > 0 ? Math.round((grades[grade] / totalGrades) * 100) : 0
    }));
  }, [filteredTranscripts]);

  // Performance levels distribution
  const performanceLevels = useMemo(() => {
    const levels = { DISTINCTION: 0, CREDIT: 0, PASS: 0, FAIL: 0 };
    
    filteredTranscripts.forEach(transcript => {
      const total = transcript.courseUnits.reduce((sum, unit) => sum + (unit.exam || 0), 0);
      
      if (total >= 451) levels.DISTINCTION++;
      else if (total >= 301) levels.CREDIT++;
      else if (total >= 200) levels.PASS++;
      else levels.FAIL++;
    });
    
    return Object.keys(levels).map(level => ({
      name: level,
      value: levels[level]
    }));
  }, [filteredTranscripts]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    toast.success(`Exported ${filename} successfully`);
  };

  const exportTopStudents = () => {
    exportToExcel(
      topStudents.map((student, index) => ({
        Rank: index + 1,
        Name: student.name,
        'Admission Number': student.admissionNumber,
        Course: student.course,
        'Total Marks': student.total
      })), 
      'top_students'
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-lvtc-navy">School Analytics Dashboard</h1>
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <div>
            <select
              className="px-3 py-2 border rounded-md"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course === "all" ? "All Courses" : course}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="px-3 py-2 border rounded-md"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schoolStats.totalStudents}</div>
            <p className="text-sm text-gray-500">Currently filtered students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schoolStats.average}</div>
            <p className="text-sm text-gray-500">Overall average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schoolStats.passRate}%</div>
            <p className="text-sm text-gray-500">Students scoring 200+ points</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{topStudents[0]?.name || "N/A"}</div>
            <p className="text-sm text-gray-500">{topStudents[0]?.total || 0} points</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="students">Top Students</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Performance Levels Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Level Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceLevels}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceLevels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Number of Grades" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 mt-6">
            {/* Course Averages */}
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" name="Average Score" fill="#8884d8" />
                    <Bar dataKey="students" name="Number of Students" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Course Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Top 5 Students Per Course</h3>
              {courseStats.map((course) => (
                <Card key={course.name}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <div className="text-sm text-gray-500">
                        Average: <span className="font-bold text-lvtc-navy">{course.average}</span> | 
                        Students: <span className="font-bold">{course.students}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Admission Number</TableHead>
                            <TableHead className="text-right">Total Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {course.topStudents.slice(0, 5).map((student, idx) => (
                            <TableRow key={student.admissionNumber}>
                              <TableCell className="font-medium">{idx + 1}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.admissionNumber}</TableCell>
                              <TableCell className="text-right font-semibold">{student.total}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 mt-6">
            {/* Subject Averages */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" name="Average Score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Subject Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Top 5 Students Per Subject</h3>
              {subjectStats.map((subject) => (
                <Card key={subject.name}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <div className="text-sm text-gray-500">
                        Average: <span className="font-bold text-lvtc-navy">{subject.average}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Admission Number</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subject.topStudents.slice(0, 5).map((student, idx) => (
                            <TableRow key={`${student.admissionNumber}-${idx}`}>
                              <TableCell className="font-medium">{idx + 1}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.course}</TableCell>
                              <TableCell>{student.admissionNumber}</TableCell>
                              <TableCell className="text-right font-semibold">{student.total}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Top Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex justify-between items-center mt-6 mb-2">
            <h3 className="text-lg font-medium">Top 10 Students</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportTopStudents}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              Export to Excel
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudents.map((student, index) => (
                  <TableRow key={student.admissionNumber}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell className="text-right">{student.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
