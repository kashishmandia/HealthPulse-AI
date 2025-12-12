import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { ShimmerButton } from "./ui/shimmer-button"; 
import { GlowCard } from "./ui/glow-card"; 
import { Brain, Info } from 'lucide-react';

interface Props {
  onSymptomLogged: (symptom: any) => void;
}

export default function SymptomForm({ onSymptomLogged }: Props) {
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const symptom = await apiClient.logSymptom({ description, duration, notes });
      setResult(symptom);
      onSymptomLogged(symptom);
      setDescription('');
      setDuration('');
      setNotes('');
      setTimeout(() => setResult(null), 10000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to log symptom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard glowColor="pink" customSize={true}>

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-full bg-pink-500/10 text-pink-400">
          <Brain size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Log Symptoms</h2>
          <p className="text-[11px] text-gray-400">AI-powered triage analysis</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Info size={16} className="text-pink-400"/> AI Analysis Result
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase">Severity</span>
                    <div className="text-sm font-bold text-white">{result.severity}</div>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase">Urgency Score</span>
                    <div className="text-sm font-bold text-white">{result.urgencyScore}/100</div>
                </div>
            </div>
            <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Recommendation</label>
                <p className="text-xs text-white bg-white/5 p-2 rounded-lg border border-white/10">
                    {result.recommendedAction}
                </p>
            </div>
          </div>
          <button onClick={() => setResult(null)} className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors">
            Log Another Symptom
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Describe Symptoms *</label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., I have a sharp pain in my chest..."
              rows={3}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="E.g., 2 hours"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Additional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20 text-center">{error}</div>}

          <div className="pt-2 flex justify-end">
            <ShimmerButton 
              type="submit" 
              disabled={loading}
              className="w-full shadow-lg"
              background="linear-gradient(to right, #ec4899, #be185d)"
              shimmerColor="#ffffff"
            >
              <span className="font-semibold tracking-wide text-white text-sm">
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </span>
            </ShimmerButton>
          </div>
        </form>
      )}
    </GlowCard>
  );
}