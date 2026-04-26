import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Background from './components/Background';
import StepIndicator from './components/StepIndicator';
import StepUpload from './components/StepUpload';
import StepAssessment from './components/StepAssessment';
import StepResults from './components/StepResults';
import { Settings } from 'lucide-react';

export type Step = 1 | 2 | 3;

export interface SkillScore {
  skill: string;
  score: number;
  reasoning: string;
}

export interface AppData {
  jd: string;
  resumeText: string;
  skills: string[];
  scores: SkillScore[];
}
function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(
    (import.meta as any).env.VITE_GROQ_API_KEY || ''
  );
  
  const [appData, setAppData] = useState<AppData>({
    jd: '',
    resumeText: '',
    skills: [],
    scores: []
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3) as Step);
  const startOver = () => {
    setCurrentStep(1);
    setAppData({ jd: '', resumeText: '', skills: [], scores: [] });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <Background />
      
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105"
      >
        <Settings size={20} className="text-white/70 hover:text-white" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue via-brand-violet to-brand-blue animate-gradient-x"
          >
            SkillSense AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            AI-powered skill assessment and personalised learning plan generator
          </motion.p>
        </div>

        <StepIndicator currentStep={currentStep} />

        <div className="w-full mt-8 relative flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepUpload key="step1" onNext={nextStep} appData={appData} setAppData={setAppData} apiKey={apiKey} />
            )}
            {currentStep === 2 && (
              <StepAssessment key="step2" onNext={nextStep} appData={appData} setAppData={setAppData} apiKey={apiKey} />
            )}
            {currentStep === 3 && (
              <StepResults key="step3" onRestart={startOver} appData={appData} apiKey={apiKey} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Modal (Simplified) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 rounded-2xl relative"
            >
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Groq API Key</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_..." 
                    className="glass-input w-full"
                  />
                  <p className="text-xs text-white/40 mt-2">Required for actual AI processing. Stored locally.</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button onClick={() => setShowSettings(false)} className="btn-primary">Done</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
