import React from "react";
import { createRoot, Root } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import TranscriptView from "@/components/TranscriptView";
import { Transcript } from "@/types/transcript";

type ProgressFn = (current: number, total: number, name: string) => void;

const renderTranscript = (transcript: Transcript): Promise<HTMLDivElement> => {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "0";
    host.style.width = "800px";
    host.style.background = "white";
    document.body.appendChild(host);

    const root: Root = createRoot(host);
    root.render(React.createElement(TranscriptView, { transcript }));

    // Wait for images/fonts to settle
    setTimeout(() => resolve(host), 600);
    (host as any).__root = root;
  });
};

const cleanup = (host: HTMLDivElement) => {
  const root: Root | undefined = (host as any).__root;
  try { root?.unmount(); } catch {}
  host.remove();
};

const sanitizeFilename = (s: string) =>
  s.replace(/[^a-z0-9_\-]+/gi, "_").replace(/^_+|_+$/g, "");

/** Build a single combined PDF (one transcript per A4 page). */
export const downloadTranscriptsCombinedPdf = async (
  transcripts: Transcript[],
  filename = "transcripts.pdf",
  onProgress?: ProgressFn,
) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 6;

  for (let i = 0; i < transcripts.length; i++) {
    const t = transcripts[i];
    onProgress?.(i + 1, transcripts.length, t.student.name);
    const host = await renderTranscript(t);
    try {
      const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;
      const ratio = Math.min(availW / (canvas.width / 2), availH / (canvas.height / 2));
      const w = (canvas.width / 2) * ratio;
      const h = (canvas.height / 2) * ratio;
      if (i > 0) pdf.addPage();
      pdf.addImage(img, "JPEG", (pageW - w) / 2, margin, w, h);
    } finally {
      cleanup(host);
    }
  }

  pdf.save(filename);
};

/** Build one PDF per student and trigger separate downloads. */
export const downloadTranscriptsIndividualPdfs = async (
  transcripts: Transcript[],
  onProgress?: ProgressFn,
) => {
  for (let i = 0; i < transcripts.length; i++) {
    const t = transcripts[i];
    onProgress?.(i + 1, transcripts.length, t.student.name);
    const host = await renderTranscript(t);
    try {
      const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;
      const ratio = Math.min(availW / (canvas.width / 2), availH / (canvas.height / 2));
      const w = (canvas.width / 2) * ratio;
      const h = (canvas.height / 2) * ratio;
      pdf.addImage(img, "JPEG", (pageW - w) / 2, margin, w, h);
      const name = `${sanitizeFilename(t.student.admissionNumber || t.student.name || "transcript")}.pdf`;
      pdf.save(name);
    } finally {
      cleanup(host);
    }
  }
};

/** Build one PDF per student and bundle them into a single ZIP download. */
export const downloadTranscriptsZip = async (
  transcripts: Transcript[],
  filename = "transcripts.zip",
  onProgress?: ProgressFn,
) => {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (let i = 0; i < transcripts.length; i++) {
    const t = transcripts[i];
    onProgress?.(i + 1, transcripts.length, t.student.name);
    const host = await renderTranscript(t);
    try {
      const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;
      const ratio = Math.min(availW / (canvas.width / 2), availH / (canvas.height / 2));
      const w = (canvas.width / 2) * ratio;
      const h = (canvas.height / 2) * ratio;
      pdf.addImage(img, "JPEG", (pageW - w) / 2, margin, w, h);
      const base = sanitizeFilename(t.student.admissionNumber || t.student.name || "transcript");
      let name = `${base}.pdf`;
      let n = 1;
      while (usedNames.has(name)) { name = `${base}_${++n}.pdf`; }
      usedNames.add(name);
      const blob = pdf.output("blob");
      zip.file(name, blob);
    } finally {
      cleanup(host);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
