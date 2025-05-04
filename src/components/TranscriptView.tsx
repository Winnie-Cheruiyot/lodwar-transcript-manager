
import React from "react";
import { Transcript, gradeScales, passScales } from "@/types/transcript";
import logo from "/public/lovable-uploads/983b1936-167d-4866-9b92-dd8338b28c65.png";

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

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-lg max-w-4xl mx-auto transition-all ${isPrinting ? "animate-print-pop" : ""} print:shadow-none`}>
      <div className="p-4 rounded-[24px] bg-lvtc-navy text-white relative overflow-hidden">
        {/* Contact Info Header */}
        <div className="flex justify-between mb-2 text-sm">
          <div className="flex items-center">
            <div className="rounded-full bg-white p-1 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <span>0723456899</span>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-white p-1 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <span>plodwaryouth@yahoo.com</span>
          </div>
        </div>

        {/* School Logo and Name */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Lodwar VTC Logo" 
            className="w-24 h-24 object-contain mr-4" 
          />
          <div className="text-white">
            <h1 className="text-xl md:text-3xl font-bold mb-0 uppercase tracking-wide">
              Lodwar Vocational Training
            </h1>
            <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
              Centre
            </h1>
          </div>
        </div>

        {/* Transcript Title */}
        <div className="mt-4 text-center bg-lvtc-navy py-3">
          <h2 className="text-3xl font-bold uppercase">TRANSCRIPT</h2>
        </div>
      </div>

      <div className="p-6 bg-white">
        {/* Student Information */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <div className="font-bold text-lvtc-navy text-lg">Name of Student:</div>
            <div className="text-lg">{transcript.student.name}</div>
            <div className="font-bold text-lvtc-navy text-lg mt-4">COURSE</div>
            <div className="text-lg">{transcript.student.course}</div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="font-bold text-lvtc-navy text-lg">ADMISSION NO</div>
            <div className="text-lg">{transcript.student.admissionNumber}</div>
            <div className="font-bold text-lvtc-navy text-lg mt-4">School Year:</div>
            <div className="text-lg">{transcript.student.schoolYear}</div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full md:w-3/4 pr-0 md:pr-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lvtc-navy text-white">
                  <th className="p-2 text-left w-1/3">COURSE UNIT</th>
                  <th className="p-2 text-center">CAT</th>
                  <th className="p-2 text-center">EXAM</th>
                  <th className="p-2 text-center">TOTAL</th>
                  <th className="p-2 text-center">GRADE</th>
                </tr>
              </thead>
              <tbody>
                {transcript.courseUnits.map((unit, index) => (
                  <tr 
                    key={unit.id} 
                    className={index % 2 === 0 ? "bg-lvtc-yellow" : "bg-white"}
                  >
                    <td className="p-2 font-semibold">{unit.name}</td>
                    <td className="p-2 text-center">{unit.cat !== null ? unit.cat : "-"}</td>
                    <td className="p-2 text-center">{unit.exam !== null ? unit.exam : "-"}</td>
                    <td className="p-2 text-center">{unit.total !== null ? unit.total : "-"}</td>
                    <td className="p-2 text-center">{unit.grade || "-"}</td>
                  </tr>
                ))}
                <tr className="bg-lvtc-yellow font-bold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">{stats.total}</td>
                  <td className="p-2 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grading System */}
          <div className="w-full md:w-1/4 mt-4 md:mt-0">
            <div className="bg-lvtc-navy text-white p-2 font-bold text-center">
              GRADING SYSTEM
            </div>
            <table className="w-full border-collapse">
              <tbody>
                {gradeScales.map((scale, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-2 text-center font-bold text-lvtc-navy">{scale.grade}</td>
                    <td className="p-2 text-center">{scale.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks and Grade Scale */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-4 md:mb-0">
            <div className="mb-2 font-bold text-lvtc-navy">REMARKS</div>
            <div className="min-h-[80px] p-2 border border-gray-300 rounded bg-gray-50">
              {transcript.remarks}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="mb-2 font-bold text-lvtc-navy">GRADE SCALE</div>
            <div className="grid grid-cols-2 gap-2">
              {passScales.map((scale, index) => (
                <div key={index} className="text-center">
                  <div className="font-bold">{scale.level}</div>
                  <div>{scale.range}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRADE SCALE Header */}
        <div className="bg-lvtc-navy text-white p-2 font-bold text-center mb-4">
          GRADE SCALE
        </div>

        {/* Comments and Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-lvtc-yellow p-4 rounded">
            <div className="uppercase font-bold mb-2 text-center">Manager Comments and Feedback:</div>
            <div className="min-h-[80px]">{transcript.managerComments}</div>
            <div className="mt-4 font-bold text-center">
              MR. ABRAHAM CHEGEM<br />
              MANAGER LVTC
            </div>
          </div>

          <div className="bg-lvtc-yellow p-4 rounded">
            <div className="uppercase font-bold mb-2 text-center">Closing Day:</div>
            <div>{transcript.closingDay}</div>
            <div className="uppercase font-bold mb-2 mt-4 text-center">Opening Day:</div>
            <div>{transcript.openingDay}</div>
            <div className="uppercase font-bold mb-2 mt-4 text-center">Fee Balance:</div>
            <div>{transcript.feeBalance}</div>
          </div>

          <div className="bg-lvtc-yellow p-4 rounded">
            <div className="uppercase font-bold mb-2 text-center">H.O.D Comments and Feedback:</div>
            <div className="min-h-[80px]">{transcript.hodComments}</div>
            <div className="mt-4 font-bold text-center">
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
