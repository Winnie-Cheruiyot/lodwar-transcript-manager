
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-lvtc-navy text-white print:hidden">
        <div className="container mx-auto py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <h1 className="text-xl font-bold">Lodwar VTC Transcript Manager</h1>
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link
                    to="/"
                    className={`hover:underline ${
                      location.pathname === "/" ? "font-bold underline" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/students"
                    className={`hover:underline ${
                      location.pathname === "/students" ? "font-bold underline" : ""
                    }`}
                  >
                    Students
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-8 print:pb-0">
        {children}
      </main>

      <footer className="bg-lvtc-navy text-white py-4 print:hidden">
        <div className="container mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} Lodwar Vocational Training Centre</p>
        </div>
      </footer>

      <style>
        {`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body {
            padding: 0;
            margin: 0;
          }
          .print-hidden {
            display: none;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Layout;
