import React from 'react';
import { motion } from 'framer-motion';
import { Step } from '../App';

interface Props {
  currentStep: Step;
}

const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Upload' },
    { id: 2, name: 'Assessment' },
    { id: 3, name: 'Results' }
  ];

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-blue to-brand-violet rounded-full z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div 
                animate={{
                  backgroundColor: isActive || isCompleted ? '#3b82f6' : '#1e1e24',
                  borderColor: isActive || isCompleted ? '#8b5cf6' : '#ffffff20',
                  scale: isActive ? 1.2 : 1
                }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  isActive || isCompleted ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-white/50'}`}>
                    {step.id}
                  </span>
                )}
              </motion.div>
              <span className={`absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                isActive ? 'text-brand-blue' : isCompleted ? 'text-white/70' : 'text-white/40'
              }`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
