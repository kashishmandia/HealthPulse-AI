import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  score: any; // Type based on your HealthScore interface
}

export default function HealthScoreBento({ score }: Props) {
  if (!score) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <TrendingUp size={16} className="text-emerald-400" />;
    if (trend === 'DECLINING') return <TrendingDown size={16} className="text-red-400" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  // Bento Card Component
  const BentoItem = ({ title, value, subtitle, className, children }: any) => (
    <div className={`p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col justify-between group hover:border-white/20 transition-all ${className}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        {children}
      </div>
      <div>
        <div className="text-2xl font-bold text-white mt-2">{value}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      
      {/* 1. Main Score - Takes up 2x2 space */}
      <div className="col-span-2 row-span-2 p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-black border border-white/10 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-500/10 blur-[100px]" />
        
        {/* Circular Progress (Simplified CSS) */}
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
              <path className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                strokeDasharray={`${score.overallScore}, 100`} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-bold text-white">{score.overallScore}</span>
              <span className="text-xs text-purple-300">HEALTH SCORE</span>
            </div>
        </div>
        
        <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          {getTrendIcon(score.trend)}
          <span className="text-sm text-gray-300">Trend: <span className="text-white">{score.trend}</span></span>
        </div>
      </div>

      {/* 2. Vitals Score */}
      <BentoItem title="Vitals" value={score.vitalScore} subtitle="Based on BP & HR">
         <Activity size={18} className="text-blue-400" />
      </BentoItem>

      {/* 3. Symptoms Score */}
      <BentoItem title="Symptoms" value={score.symptomScore} subtitle="Urgency Triage">
         <AlertTriangle size={18} className="text-pink-400" />
      </BentoItem>

      {/* 4. Mental Score */}
      <BentoItem title="Mental" value={score.mentalScore} subtitle="Wellness Check">
         <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
      </BentoItem>

      {/* 5. Risk Level */}
      <div className={`col-span-1 p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-center ${getRiskColor(score.riskLevel)}`}>
         <div className="text-sm font-medium opacity-80">Risk Level</div>
         <div className="text-xl font-bold mt-1 flex items-center gap-2">
            {score.riskLevel === 'LOW' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            {score.riskLevel}
         </div>
      </div>

    </div>
  );
}