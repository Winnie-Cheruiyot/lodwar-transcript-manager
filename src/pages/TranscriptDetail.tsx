
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranscript } from "@/context/TranscriptContext";
import TranscriptView from "@/components/TranscriptView";
import TranscriptEditor from "@/components/TranscriptEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TranscriptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transcripts, setCurrentTranscript } = useTranscript();
  const [transcript, setTranscript] = useState<typeof transcripts[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/students");
      return;
    }

    const foundTranscript = transcripts.find((t) => t.id === id);
    if (!foundTranscript) {
      toast.error("Transcript not found");
      navigate("/students");
      return;
    }

    setTranscript(foundTranscript);
    setCurrentTranscript(foundTranscript);

    return () => {
      setCurrentTranscript(null);
    };
  }, [id, transcripts, navigate, setCurrentTranscript]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  if (!transcript) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="animate-pulse p-8">Loading transcript...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <Button
            variant="outline"
            onClick={() => navigate("/students")}
          >
            ← Back to Students
          </Button>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <div className="text-sm text-gray-600 font-medium mt-2">
              Editing transcript...
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Transcript
              </Button>
              <Button onClick={handlePrint}>
                Print Transcript
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <TranscriptEditor
          transcript={transcript}
          onSave={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <TranscriptView transcript={transcript} isPrinting={isPrinting} />
      )}
    </div>
  );
};

export default TranscriptDetail;
