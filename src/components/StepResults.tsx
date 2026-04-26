import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, BookOpen, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { AppData } from '../App';
import { generateLearningPlan, LearningPlanItem } from '../utils/api';

interface Props {
  onRestart: () => void;
  appData: AppData;
  apiKey: string;
}

const CircularProgress = ({ score }: { score: number }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;
  
  let colorClass = "text-red-500";
  let dropShadow = "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  if (score >= 8) {
    colorClass = "text-green-500";
    dropShadow = "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]";
  } else if (score >= 5) {
    colorClass = "text-amber-500";
    dropShadow = "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-20 h-20 transform -rotate-90">
        <circle 
          className="text-white/10" 
          strokeWidth="6" 
          stroke="currentColor" 
          fill="transparent" 
          r={radius} 
          cx="40" 
          cy="40" 
        />
        <motion.circle 
          className={`${colorClass} ${dropShadow}`}
          strokeWidth="6" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          stroke="currentColor" 
          fill="transparent" 
          r={radius} 
          cx="40" 
          cy="40" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-heading">{score}</span>
        <span className="text-[10px] text-white/50 -mt-1">/10</span>
      </div>
    </div>
  );
};

const StepResults: React.FC<Props> = ({ onRestart, appData, apiKey }) => {
  const [learningPlan, setLearningPlan] = useState<LearningPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const plan = await generateLearningPlan(appData.scores, apiKey);
        setLearningPlan(plan);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (appData.scores.some(s => s.score < 7)) {
      fetchPlan();
    } else {
      setIsLoading(false);
    }
  }, [appData.scores, apiKey]);
  console.log(learningPlan);

  const handlePrint = () => {
    console.log('learningPlan at print time:', learningPlan);
    console.log('appData.scores at print time:', appData.scores);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const skillScoresHTML = appData.scores.map((s: any) => `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid #eee;">
        <div style="flex:1;">
          <strong style="font-size:15px;">${s.skill}</strong>
          <div style="color:#555;font-size:13px;margin-top:4px;">${s.reasoning}</div>
        </div>
        <strong style="font-size:22px;margin-left:16px;color:${s.score >= 8 ? '#22c55e' : s.score >= 5 ? '#f59e0b' : '#ef4444'}">${s.score}/10</strong>
      </div>
    `).join('');

    const learningPlanHTML = learningPlan.map((item: any) => `
      <div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px;page-break-inside:avoid;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:16px;">${item.skill}</strong>
          <span style="background:${item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#22c55e'};color:white;padding:2px 10px;border-radius:4px;font-size:12px;">${item.priority} Priority</span>
        </div>
        <div style="color:#666;margin-bottom:10px;">⏱ Estimated time: ${item.time}</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#999;margin-bottom:8px;">RECOMMENDED RESOURCES</div>
        ${item.resources.map((r: any) => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f5;">
            <span>• ${r.name}</span>
            <span style="background:#f0f0f0;color:#666;padding:1px 8px;border-radius:4px;font-size:11px;">${r.type}</span>
          </div>
        `).join('')}
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>SkillSense AI Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; padding: 48px; color: #1a1a2e; line-height: 1.6; }
            h1 { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
            .subtitle { color: #888; font-size: 14px; margin-bottom: 40px; }
            h2 { font-size: 18px; font-weight: 700; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            @page { margin: 1cm; size: A4; }
          </style>
        </head>
        <body>
          <h1>SkillSense AI</h1>
          <div class="subtitle">Assessment Report · Generated on ${new Date().toLocaleDateString()}</div>
          <h2>Skill Proficiency Overview</h2>
          ${skillScoresHTML}
          <h2>Personalised Learning Plan</h2>
          ${learningPlanHTML}
          <script>
            window.onload = () => setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl mx-auto space-y-8 print:hidden"
      >
      {/* Top Section - Scores */}
      <div className="glass-card p-8 rounded-2xl">
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <AlertCircle className="text-brand-blue" /> Skill Proficiency Overview
        </h2>
        <div className="flex flex-wrap gap-6 justify-center md:justify-between">
          {appData.scores.length > 0 ? appData.scores.map((item, index) => (
            <motion.div 
              key={item.skill}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors w-32 relative group"
            >
              <CircularProgress score={item.score} />
              <span className="text-sm font-medium text-center">{item.skill}</span>
              
              {/* Tooltip for reasoning */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] p-2 rounded -top-12 left-1/2 -translate-x-1/2 w-48 pointer-events-none z-10 border border-white/10">
                {item.reasoning}
              </div>
            </motion.div>
          )) : (
            <p className="text-white/50 text-center w-full">No scores recorded.</p>
          )}
        </div>
      </div>

      {/* Learning Plan Section */}
      <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <BookOpen className="text-brand-violet" /> Personalised Learning Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[200px]">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center text-white/50 gap-4">
              <Loader2 className="animate-spin w-8 h-8 text-brand-violet" />
              <p>AI is generating your personalised learning plan...</p>
            </div>
          ) : learningPlan.length > 0 ? (
            learningPlan.map((plan, index) => (
              <motion.div 
                key={plan.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col hover:border-brand-violet/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{plan.skill}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm ${
                    plan.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    plan.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {plan.priority} Priority
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                  <Clock size={14} />
                  <span>Estimated time: {plan.time}</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Recommended Resources</p>
                  {plan.resources.map((res, i) => (
                    <a href={res.link} key={i} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg hover:bg-black/40 transition-colors group">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue group-hover:scale-150 transition-transform"></span>
                      <span className="text-white/80 group-hover:text-white transition-colors">{res.name}</span>
                      <span className="ml-auto text-[10px] text-white/30 border border-white/10 px-1.5 rounded">{res.type}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-white/50">
              <p>Great job! You scored 7 or higher on all assessed skills.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handlePrint} className="btn-secondary flex items-center justify-center gap-2">
            <Download size={18} />
            Download Report PDF
          </button>
          <button onClick={onRestart} className="btn-primary flex items-center justify-center gap-2">
            <RefreshCw size={18} />
            Start New Assessment
          </button>
        </div>
        <p className="text-[10px] text-white/50 mt-1">In print dialog → More settings → uncheck Headers and footers</p>
      </motion.div>
      </motion.div>

    </>
  );
};

export default StepResults;
