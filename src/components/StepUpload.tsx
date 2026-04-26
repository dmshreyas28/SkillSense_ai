import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Briefcase, Loader2 } from 'lucide-react';
import { extractText } from 'unpdf';
import { AppData } from '../App';
import { extractSkills } from '../utils/api';

interface Props {
  onNext: () => void;
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  apiKey: string;
}

const StepUpload: React.FC<Props> = ({ onNext, appData, setAppData, apiKey }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState(appData.jd || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true
    });
    return text;
  };

  const handleAnalyze = async () => {
    if (!jd || !file) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const resumeText = await extractTextFromPDF(file);
      const skills = await extractSkills(jd, resumeText, apiKey);
      
      setAppData(prev => ({
        ...prev,
        jd,
        resumeText,
        skills
      }));
      onNext();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to analyze skills. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 mt-8"
    >
      <div className="flex-1 glass-card p-6 rounded-2xl flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="text-brand-blue" />
          <h2 className="text-xl font-bold font-heading">Job Description</h2>
        </div>
        <p className="text-sm text-white/50 mb-4">Paste the job description you want to assess your skills against.</p>
        <textarea 
          className="glass-input flex-1 resize-none min-h-[250px]"
          placeholder="e.g. We are looking for a Senior Frontend Engineer with strong React and TypeScript skills..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-brand-violet" />
            <h2 className="text-xl font-bold font-heading">Your Resume</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">Upload your latest resume (PDF).</p>
          
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${
              isDragging ? 'border-brand-blue bg-brand-blue/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud size={48} className={`mb-4 ${isDragging ? 'text-brand-blue' : 'text-white/40'}`} />
            <p className="text-center font-medium mb-1">
              {file ? file.name : 'Drag & drop your PDF here'}
            </p>
            <p className="text-xs text-white/40 text-center mb-4">or click to browse</p>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }} 
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm py-2">Select File</button>
          </div>
        </div>

        {errorMsg && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 p-2 rounded-lg">{errorMsg}</p>}
        <button 
          onClick={handleAnalyze}
          disabled={!jd || !file || isLoading}
          className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 ${
            (!jd || !file || isLoading) ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' : ''
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              Analyse My Skills
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default StepUpload;
