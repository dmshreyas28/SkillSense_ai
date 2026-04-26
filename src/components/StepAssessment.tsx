import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { AppData } from '../App';
import { generateQuestion, scoreAnswer } from '../utils/api';

interface Props {
  onNext: () => void;
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  apiKey: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  skill?: string;
}

const StepAssessment: React.FC<Props> = ({ onNext, appData, setAppData, apiKey }) => {
  const skillsToAssess = appData.skills.length > 0 ? appData.skills : ['React', 'TypeScript', 'Node.js', 'System Design', 'REST APIs'];
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const hasInitialized = useRef(false);

  // Initial greeting and first question
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const initChat = async () => {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1500));
      setMessages([
        { id: '1', sender: 'ai', text: "Hello! I've analyzed your resume and the job description. I have a few questions to assess your proficiency in key areas." },
      ]);
      await new Promise(r => setTimeout(r, 1000));
      askNextQuestion(0);
    };
    initChat();
  }, []);

  const askNextQuestion = async (index: number) => {
    setIsTyping(true);
    const skill = skillsToAssess[index];
    try {
      const question = await generateQuestion(appData.jd, skill, apiKey);
      setCurrentQuestion(question);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: question,
        skill: skill
      }]);
    } catch (e) {
      const fallback = `Could you elaborate on your experience with ${skill}?`;
      setCurrentQuestion(fallback);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'ai', 
        text: fallback,
        skill: skill
      }]);
    }
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    const answer = inputValue;
    setInputValue('');
    setIsTyping(true);

    const skill = skillsToAssess[currentSkillIndex];
    
    // Evaluate answer with Gemini
    try {
      const { score, reasoning } = await scoreAnswer(skill, currentQuestion, answer, apiKey);
      setAppData(prev => ({
        ...prev,
        scores: [...prev.scores, { skill, score, reasoning }]
      }));
    } catch (e) {
      setAppData(prev => ({
        ...prev,
        scores: [...prev.scores, { skill, score: 5, reasoning: "Evaluation failed." }]
      }));
    }

    // Next step logic
    const nextIndex = currentSkillIndex + 1;
    if (nextIndex < skillsToAssess.length) {
      setCurrentSkillIndex(nextIndex);
      askNextQuestion(nextIndex);
    } else {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 2000));
      setMessages(prev => [...prev, { id: 'done', sender: 'ai', text: "Thank you! I've completed the assessment. Generating your personalized results..." }]);
      setIsTyping(false);
      await new Promise(r => setTimeout(r, 2000));
      onNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto flex flex-col h-[600px]"
    >
      {/* Header & Progress */}
      <div className="glass-card rounded-t-2xl p-4 border-b border-white/10 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center">
            <Bot className="text-brand-blue" />
          </div>
          <div>
            <h3 className="font-bold">SkillSense Interviewer</h3>
            <p className="text-xs text-white/50">Assessing {skillsToAssess.length} key skills</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium mb-1 text-brand-violet">
            Progress {currentSkillIndex}/{skillsToAssess.length}
          </span>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-blue to-brand-violet"
              initial={{ width: 0 }}
              animate={{ width: `${(currentSkillIndex / skillsToAssess.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card flex-1 border-y-0 rounded-none overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-brand-violet/20' : 'bg-brand-blue/20'
                }`}>
                  {msg.sender === 'user' ? <User size={16} className="text-brand-violet" /> : <Bot size={16} className="text-brand-blue" />}
                </div>
                <div className="flex flex-col">
                  {msg.skill && (
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-brand-blue/20 text-brand-blue px-2 py-1 rounded-full w-fit mb-2">
                      Target Skill: {msg.skill}
                    </span>
                  )}
                  <div className={`p-4 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-brand-violet/20 border border-brand-violet/30 rounded-tr-sm' 
                      : 'bg-white/5 border border-white/10 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex-shrink-0 flex items-center justify-center">
                <Bot size={16} className="text-brand-blue" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-white/40 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-white/40 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-white/40 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card rounded-b-2xl p-4 border-t border-white/10 z-10 bg-white/[0.05]">
        <div className="flex items-center gap-3">
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your answer here..."
            className="glass-input flex-1 resize-none h-[60px] py-3 bg-white/5"
            disabled={isTyping}
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all duration-300 ${
              inputValue.trim() && !isTyping 
                ? 'bg-gradient-to-r from-brand-blue to-brand-violet shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105' 
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-white/30 text-center mt-2">Press Enter to send, Shift + Enter for new line</p>
      </div>
    </motion.div>
  );
};

export default StepAssessment;
