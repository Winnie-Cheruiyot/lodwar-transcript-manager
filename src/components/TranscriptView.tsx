import React from "react";
import { Transcript, gradeScales, passScales } from "@/types/transcript";
import logo from "/public/lovable-uploads/2a540926-4284-411c-aa4b-7863224682f2.png";

interface TranscriptViewProps {
  transcript: Transcript;
  isPrinting?: boolean;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript, isPrinting = false }) => {
  const calculateTotal = () => {
    let totalPoints = 0;
    let subjectsWithExam = 0;

    transcript.courseUnits.forEach(unit => {
      if (unit.exam !== null) {
        totalPoints += unit.exam;
        subjectsWithExam++;
      }
    });

    return { 
      total: totalPoints, 
      average: subjectsWithExam > 0 ? Math.round(totalPoints / subjectsWithExam) : 0
    };
  };

  const stats = calculateTotal();
  
  const getPassLevel = (totalMarks) => {
    for (const scale of passScales) {
      const [min, max] = scale.range.split('-').map(Number);
      if (totalMarks >= min && totalMarks <= max) {
        return scale.level;
      }
    }
    return "NOT GRADED";
  };

  const passLevel = getPassLevel(stats.total);
  
  const getAutoRemarks = (level) => {
    switch(level) {
      case "DISTINCTION":
        return "Excellent performance! Student has demonstrated exceptional understanding of course content.";
      case "CREDIT":
        return "Good performance! Student has shown strong grasp of course material.";
      case "PASS":
        return "Satisfactory performance. Student has met the minimum requirements.";
      case "FAIL":
        return "Below required standards. Student needs to improve in most areas.";
      default:
        return "Not enough data to generate remarks.";
    }
  };

  const getManagerComments = (level) => {
    switch(level) {
      case "DISTINCTION":
        return "Outstanding performance. Keep up the excellent work!";
      case "CREDIT":
        return "Commendable performance. Continue with the good effort.";
      case "PASS":
        return "You have passed. Work harder to improve your grades.";
      case "FAIL":
        return "You need to put in more effort and seek additional support.";
      default:
        return "Please complete all assessments for proper evaluation.";
    }
  };

  const getHodComments = (level) => {
    switch(level) {
      case "DISTINCTION":
        return "Exceptional results. Student shows great potential in this field.";
      case "CREDIT":
        return "Good results. Student demonstrates solid understanding of the subject.";
      case "PASS":
        return "Acceptable results. Student should focus on improving weak areas.";
      case "FAIL":
        return "Student requires remedial work and closer supervision.";
      default:
        return "Incomplete assessment. Unable to provide comprehensive feedback.";
    }
  };

  // Use existing remarks if available, otherwise use auto-generated ones
  const managerComments = transcript.managerComments || getManagerComments(passLevel);
  const hodComments = transcript.hodComments || getHodComments(passLevel);

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-lg mx-auto transition-all ${isPrinting ? "animate-print-pop" : ""} print:shadow-none print:w-full print:max-w-none`}>
      <div className="p-3 rounded-t-3xl bg-lvtc-navy text-white relative overflow-hidden">
        {/* Contact Info Header */}
        <div className="flex justify-between text-xs">
          <div className="flex items-center">
            <div className="rounded-full bg-white p-0.5 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <span>0723456899</span>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-white p-0.5 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <span>plodwaryouth@yahoo.com</span>
          </div>
        </div>

        {/* School Logo and Name - Center aligned */}
        <div className="flex items-center justify-center py-2">
          <img 
            src={logo} 
            alt="Lodwar VTC Logo" 
            className="w-16 h-16 object-contain mr-3" 
          />
          <div className="text-white text-center">
            <h1 className="text-xl font-bold mb-0 uppercase tracking-wide">
              Lodwar Vocational Training
            </h1>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              Centre
            </h1>
          </div>
        </div>

        {/* Transcript Title */}
        <div className="text-center bg-lvtc-navy py-1">
          <h2 className="text-lg font-bold uppercase">TRANSCRIPT</h2>
        </div>
      </div>

      <div className="p-4 bg-white">
        {/* Student Information - Inline layout */}
        <div className="flex flex-wrap mb-3 border-b pb-2 border-gray-300">
          <div className="w-1/2 flex items-center mb-1">
            <span className="font-bold text-lvtc-navy mr-1">Name:</span>
            <span>{transcript.student.name}</span>
          </div>
          <div className="w-1/2 flex items-center mb-1">
            <span className="font-bold text-lvtc-navy mr-1">Adm No:</span>
            <span>{transcript.student.admissionNumber}</span>
          </div>
          <div className="w-1/2 flex items-center">
            <span className="font-bold text-lvtc-navy mr-1">Course:</span>
            <span>{transcript.student.course}</span>
          </div>
          <div className="w-1/2 flex items-center">
            <span className="font-bold text-lvtc-navy mr-1">School Year:</span>
            <span>{transcript.student.schoolYear}</span>
          </div>
        </div>

        {/* Grades Table with minimized grading scale */}
        <div className="mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-lvtc-navy text-white">
                <th className="p-1 text-left">COURSE UNIT</th>
                <th className="p-1 text-center">EXAM (100)</th>
                <th className="p-1 text-center">GRADE</th>
              </tr>
            </thead>
            <tbody>
              {transcript.courseUnits.map((unit, index) => (
                <tr 
                  key={unit.id} 
                  className={index % 2 === 0 ? "bg-lvtc-yellow/50" : "bg-white"}
                >
                  <td className="p-1.5 font-semibold">{unit.name}</td>
                  <td className="p-1.5 text-center">{unit.exam !== null ? unit.exam : "-"}</td>
                  <td className="p-1.5 text-center">{unit.grade || "-"}</td>
                </tr>
              ))}
              <tr className="bg-lvtc-yellow font-bold">
                <td className="p-1.5">Total</td>
                <td className="p-1.5 text-center">{stats.total}</td>
                <td className="p-1.5 text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Final Grade and Grading Scale - Split layout */}
        <div className="flex justify-between items-start bg-gray-100 p-2 rounded mb-2 gap-4">
          <div className="font-bold text-lvtc-navy flex items-center gap-2">
            FINAL GRADE: <span className="text-black text-lg">{passLevel}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-lvtc-navy mb-1">Pass Scales:</div>
            <div className="flex flex-wrap gap-2">
              {passScales.map((scale, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <span className="font-semibold">{scale.level}:</span>
                  <span>{scale.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Scale Legend */}
        <div className="bg-gray-50 p-2 rounded mb-3 flex justify-end">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-lvtc-navy mb-1">Grade Scales:</div>
            <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
              {gradeScales.map((scale, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <span className="font-bold">{scale.grade}:</span>
                  <span>{scale.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments and Info Section - Improved layout with more space */}
        <div className="grid grid-cols-3 gap-3">
          {/* Manager Comments */}
          <div className="bg-lvtc-yellow/60 p-3 rounded">
            <div className="uppercase font-bold mb-2 text-center">Manager Comments:</div>
            <div className="min-h-[85px] text-sm">{managerComments}</div>
            <div className="mt-3 font-bold text-center">
              MR. ABRAHAM CHEGEM<br />
              MANAGER LVTC
            </div>
          </div>

          {/* Information Column - With Fee Balance and Dates */}
          <div className="bg-lvtc-yellow/60 p-3 rounded flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="uppercase font-bold mb-1">Closing Day:</div>
                <div>{transcript.closingDay}</div>
              </div>
              <div>
                <div className="uppercase font-bold mb-1">Opening Day:</div>
                <div>{transcript.openingDay}</div>
              </div>
              <div>
                <div className="uppercase font-bold mb-1">Fee Balance:</div>
                <div className="font-bold">{transcript.feeBalance}</div>
              </div>
            </div>
          </div>

          {/* HOD Comments */}
          <div className="bg-lvtc-yellow/60 p-3 rounded">
            <div className="uppercase font-bold mb-2 text-center">H.O.D Comments:</div>
            <div className="min-h-[85px] text-sm">{hodComments}</div>
            <div className="mt-3 font-bold text-center">
              {transcript.hodName || "H.O.D"}
            </div>
          </div>
        </div>
        
        {/* Footer with Copyright */}
        <div className="mt-3 text-center text-xs text-gray-600 border-t pt-2">
          <p>&copy; Examination Department @ 2025 LVTC. All Rights Reserved.</p>
        </div>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0.5cm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print-container {
              width: 100%;
              height: 100%;
              page-break-after: always;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TranscriptView;
