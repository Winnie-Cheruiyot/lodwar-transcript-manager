
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
  const remarks = transcript.remarks || getAutoRemarks(passLevel);
  const managerComments = transcript.managerComments || getManagerComments(passLevel);
  const hodComments = transcript.hodComments || getHodComments(passLevel);

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-lg max-w-4xl mx-auto transition-all ${isPrinting ? "animate-print-pop" : ""} print:shadow-none`}>
      <div className="p-3 rounded-[24px] bg-lvtc-navy text-white relative overflow-hidden">
        {/* Contact Info Header - Reduced size */}
        <div className="flex justify-between mb-1 text-xs">
          <div className="flex items-center">
            <div className="rounded-full bg-white p-0.5 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <span>0723456899</span>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-white p-0.5 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <span>plodwaryouth@yahoo.com</span>
          </div>
        </div>

        {/* School Logo and Name - Reduced size */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Lodwar VTC Logo" 
            className="w-16 h-16 object-contain mr-3" 
          />
          <div className="text-white">
            <h1 className="text-lg md:text-2xl font-bold mb-0 uppercase tracking-wide">
              Lodwar Vocational Training
            </h1>
            <h1 className="text-lg md:text-2xl font-bold uppercase tracking-wide">
              Centre
            </h1>
          </div>
        </div>

        {/* Transcript Title */}
        <div className="mt-2 text-center bg-lvtc-navy py-1">
          <h2 className="text-xl font-bold uppercase">TRANSCRIPT</h2>
        </div>
      </div>

      <div className="p-4 bg-white">
        {/* Student Information - More compact layout */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="font-bold text-lvtc-navy">Name:</span>
            <span className="ml-1">{transcript.student.name}</span>
          </div>
          <div>
            <span className="font-bold text-lvtc-navy">Admission No:</span>
            <span className="ml-1">{transcript.student.admissionNumber}</span>
          </div>
          <div>
            <span className="font-bold text-lvtc-navy">Course:</span>
            <span className="ml-1">{transcript.student.course}</span>
          </div>
          <div>
            <span className="font-bold text-lvtc-navy">School Year:</span>
            <span className="ml-1">{transcript.student.schoolYear}</span>
          </div>
        </div>

        {/* Grades Table */}
        <div className="flex flex-wrap mb-3">
          <div className="w-full md:w-3/4 pr-0 md:pr-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lvtc-navy text-white">
                  <th className="p-1.5 text-left w-1/3 text-sm">COURSE UNIT</th>
                  <th className="p-1.5 text-center text-sm">CAT</th>
                  <th className="p-1.5 text-center text-sm">EXAM</th>
                  <th className="p-1.5 text-center text-sm">TOTAL</th>
                  <th className="p-1.5 text-center text-sm">GRADE</th>
                </tr>
              </thead>
              <tbody>
                {transcript.courseUnits.map((unit, index) => (
                  <tr 
                    key={unit.id} 
                    className={index % 2 === 0 ? "bg-lvtc-yellow" : "bg-white"}
                  >
                    <td className="p-1.5 font-semibold text-sm">{unit.name}</td>
                    <td className="p-1.5 text-center text-sm">{unit.cat !== null ? unit.cat : "-"}</td>
                    <td className="p-1.5 text-center text-sm">{unit.exam !== null ? unit.exam : "-"}</td>
                    <td className="p-1.5 text-center text-sm">{unit.total !== null ? unit.total : "-"}</td>
                    <td className="p-1.5 text-center text-sm">{unit.grade || "-"}</td>
                  </tr>
                ))}
                <tr className="bg-lvtc-yellow font-bold">
                  <td className="p-1.5 text-sm">Total</td>
                  <td className="p-1.5 text-center text-sm">-</td>
                  <td className="p-1.5 text-center text-sm">-</td>
                  <td className="p-1.5 text-center text-sm">{stats.total}</td>
                  <td className="p-1.5 text-center text-sm">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grading System */}
          <div className="w-full md:w-1/4 mt-4 md:mt-0">
            <div className="bg-lvtc-navy text-white p-1.5 font-bold text-center text-sm">
              GRADING SYSTEM
            </div>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {gradeScales.map((scale, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-1.5 text-center font-bold text-lvtc-navy">{scale.grade}</td>
                    <td className="p-1.5 text-center">{scale.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Grade and Remarks */}
        <div className="flex flex-wrap mb-3">
          <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-3 md:mb-0">
            <div className="mb-1 font-bold text-lvtc-navy text-sm">FINAL GRADE: {passLevel}</div>
            <div className="mb-1 font-bold text-lvtc-navy text-sm">REMARKS</div>
            <div className="min-h-[70px] p-2 border border-gray-300 rounded bg-gray-50 text-sm">
              {remarks}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="mb-1 font-bold text-lvtc-navy text-sm">GRADE SCALE</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {passScales.map((scale, index) => (
                <div key={index} className="text-center">
                  <div className="font-bold">{scale.level}</div>
                  <div>{scale.range}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments and Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-lvtc-yellow p-3 rounded">
            <div className="uppercase font-bold mb-1 text-center text-sm">Manager Comments:</div>
            <div className="min-h-[70px] text-sm">{managerComments}</div>
            <div className="mt-3 font-bold text-center text-sm">
              MR. ABRAHAM CHEGEM<br />
              MANAGER LVTC
            </div>
          </div>

          <div className="bg-lvtc-yellow p-3 rounded">
            <div className="uppercase font-bold mb-1 text-center text-sm">Closing Day:</div>
            <div className="text-sm">{transcript.closingDay}</div>
            <div className="uppercase font-bold mb-1 mt-3 text-center text-sm">Opening Day:</div>
            <div className="text-sm">{transcript.openingDay}</div>
            <div className="uppercase font-bold mb-1 mt-3 text-center text-sm">Fee Balance:</div>
            <div className="text-sm">{transcript.feeBalance}</div>
          </div>

          <div className="bg-lvtc-yellow p-3 rounded">
            <div className="uppercase font-bold mb-1 text-center text-sm">H.O.D Comments:</div>
            <div className="min-h-[70px] text-sm">{hodComments}</div>
            <div className="mt-3 font-bold text-center text-sm">
              MR. GEOFREY NALIMA<br />
              H.O.D ELECTRICAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptView;
