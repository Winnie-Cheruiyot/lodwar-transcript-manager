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
    let subjectsWithTotal = 0;

    transcript.courseUnits.forEach(unit => {
      if (unit.total !== null) {
        totalPoints += unit.total;
        subjectsWithTotal++;
      }
    });

    return { 
      total: totalPoints, 
      average: subjectsWithTotal > 0 ? Math.round(totalPoints / subjectsWithTotal) : 0
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
    <div className={`bg-white rounded-3xl overflow-hidden shadow-lg max-w-4xl mx-auto transition-all ${isPrinting ? "animate-print-pop" : ""} print:shadow-none`}>
      <div className="p-2 rounded-[24px] bg-lvtc-navy text-white relative overflow-hidden">
        {/* Contact Info Header - Further reduced size */}
        <div className="flex justify-between text-xs text-right">
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

        {/* School Logo and Name - Center aligned and more compact */}
        <div className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="Lodwar VTC Logo" 
            className="w-14 h-14 object-contain mr-2" 
          />
          <div className="text-white text-center">
            <h1 className="text-lg font-bold mb-0 uppercase tracking-wide">
              Lodwar Vocational Training
            </h1>
            <h1 className="text-lg font-bold uppercase tracking-wide">
              Centre
            </h1>
          </div>
        </div>

        {/* Transcript Title */}
        <div className="text-center bg-lvtc-navy py-0.5">
          <h2 className="text-lg font-bold uppercase">TRANSCRIPT</h2>
        </div>
      </div>

      <div className="p-3 bg-white">
        {/* Student Information - Inline and compact layout */}
        <div className="flex flex-wrap text-xs mb-2 border-b pb-1 border-gray-300">
          <div className="w-1/2 flex items-center">
            <span className="font-bold text-lvtc-navy mr-1">Name:</span>
            <span>{transcript.student.name}</span>
          </div>
          <div className="w-1/2 flex items-center">
            <span className="font-bold text-lvtc-navy mr-1">Adm No:</span>
            <span>{transcript.student.admissionNumber}</span>
          </div>
          <div className="w-1/2 flex items-center mt-0.5">
            <span className="font-bold text-lvtc-navy mr-1">Course:</span>
            <span>{transcript.student.course}</span>
          </div>
          <div className="w-1/2 flex items-center mt-0.5">
            <span className="font-bold text-lvtc-navy mr-1">School Year:</span>
            <span>{transcript.student.schoolYear}</span>
          </div>
        </div>

        {/* Grades Table with minimized grading scale */}
        <div className="flex mb-2">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-lvtc-navy text-white">
                <th className="p-1 text-left">COURSE UNIT</th>
                <th className="p-1 text-center">CAT</th>
                <th className="p-1 text-center">EXAM</th>
                <th className="p-1 text-center">TOTAL</th>
                <th className="p-1 text-center">GRADE</th>
              </tr>
            </thead>
            <tbody>
              {transcript.courseUnits.map((unit, index) => (
                <tr 
                  key={unit.id} 
                  className={index % 2 === 0 ? "bg-lvtc-yellow" : "bg-white"}
                >
                  <td className="p-1 font-semibold">{unit.name}</td>
                  <td className="p-1 text-center">{unit.cat !== null ? unit.cat : "-"}</td>
                  <td className="p-1 text-center">{unit.exam !== null ? unit.exam : "-"}</td>
                  <td className="p-1 text-center">{unit.total !== null ? unit.total : "-"}</td>
                  <td className="p-1 text-center">{unit.grade || "-"}</td>
                </tr>
              ))}
              <tr className="bg-lvtc-yellow font-bold">
                <td className="p-1">Total</td>
                <td className="p-1 text-center">-</td>
                <td className="p-1 text-center">-</td>
                <td className="p-1 text-center">{stats.total}</td>
                <td className="p-1 text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grading Scales - Simplified and inline */}
        <div className="flex justify-between text-xs mb-2 bg-gray-100 p-1 rounded">
          <div className="font-bold text-lvtc-navy">FINAL GRADE: {passLevel}</div>
          <div className="flex space-x-2">
            {gradeScales.map((scale, index) => (
              <div key={index} className="text-center">
                <span className="font-bold mr-1">{scale.grade}:</span>
                <span>{scale.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments and Feedback Section - 3 columns */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-lvtc-yellow p-2 rounded">
            <div className="uppercase font-bold mb-1 text-center">Manager Comments:</div>
            <div className="min-h-[50px]">{managerComments}</div>
            <div className="mt-2 font-bold text-center">
              MR. ABRAHAM CHEGEM<br />
              MANAGER LVTC
            </div>
          </div>

          {/* Information Column - With Fee Balance and Dates */}
          <div className="bg-lvtc-yellow p-2 rounded text-center">
            <div>
              <div className="uppercase font-bold mb-0.5">Closing Day:</div>
              <div className="mb-1">{transcript.closingDay}</div>
            </div>
            <div>
              <div className="uppercase font-bold mb-0.5">Opening Day:</div>
              <div className="mb-1">{transcript.openingDay}</div>
            </div>
            <div>
              <div className="uppercase font-bold mb-0.5">Fee Balance:</div>
              <div className="mb-1 font-bold">{transcript.feeBalance}</div>
            </div>
            {/* Pass Levels - Condensed */}
            <div className="mt-1 grid grid-cols-2 gap-1 text-[9px]">
              {passScales.map((scale, index) => (
                <div key={index}>
                  <span className="font-bold">{scale.level}</span>: {scale.range}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-lvtc-yellow p-2 rounded">
            <div className="uppercase font-bold mb-1 text-center">H.O.D Comments:</div>
            <div className="min-h-[50px]">{hodComments}</div>
            <div className="mt-2 font-bold text-center">
              {transcript.hodName || "MR. GEOFREY NALIMA"}<br />
              H.O.D ELECTRICAL
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TranscriptView;
