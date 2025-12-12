import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { ShimmerButton } from "./ui/shimmer-button";
import { GlowCard } from "./ui/glow-card"; 
import { Heart } from 'lucide-react';

interface Props {
  onMoodLogged: (mood: any) => void;
}

export default function MoodForm({ onMoodLogged }: Props) {
  const [formData, setFormData] = useState({
    moodLevel: 3, stressLevel: 5, sleepQuality: 7, sleepHours: 7, anxietyLevel: 3, notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'notes' ? value : parseFloat(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mood = await apiClient.logMood({
        moodLevel: formData.moodLevel,
        stressLevel: formData.stressLevel,
        sleepQuality: formData.sleepQuality,
        sleepHours: formData.sleepHours,
        anxietyLevel: formData.anxietyLevel,
        notes: formData.notes || undefined,
      });
      onMoodLogged(mood);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error logging mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (level: number) => {
    const emojis = ['😢', '😞', '😐', '🙂', '😄'];
    return emojis[level - 1] || '😐';
  };

  const SliderField = ({ label, name, min, max, step = 1, value, emoji }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <span className="text-white font-bold text-sm flex items-center gap-2">
          {value} {emoji && <span className="text-base">{emoji}</span>}
        </span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
      />
    </div>
  );

  return (
    <GlowCard glowColor="cyan" customSize={true}>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-full bg-cyan-500/10 text-cyan-400">
          <Heart size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Daily Wellness</h2>
          <p className="text-[11px] text-gray-400">Track your mental & physical state</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
           <SliderField label="Current Mood" name="moodLevel" min="1" max="5" value={formData.moodLevel} emoji={getMoodEmoji(formData.moodLevel)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <SliderField label="Stress Level" name="stressLevel" min="1" max="10" value={formData.stressLevel} />
          <SliderField label="Anxiety Level" name="anxietyLevel" min="1" max="10" value={formData.anxietyLevel} />
          <SliderField label="Sleep Quality" name="sleepQuality" min="1" max="10" value={formData.sleepQuality} />
          <SliderField label="Sleep Hours" name="sleepHours" min="0" max="12" step="0.5" value={formData.sleepHours} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Journal Notes</label>
          <textarea
            id="notes" name="notes" placeholder="Any thoughts..." value={formData.notes} onChange={handleChange} rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none text-sm"
          />
        </div>

        {success && <div className="text-emerald-400 text-xs bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-center">✓ Recorded!</div>}

        <div className="pt-2 flex justify-end">
          <ShimmerButton 
            type="submit" 
            disabled={loading}
            className="w-full shadow-lg"
            background="linear-gradient(to right, #06b6d4, #3b82f6)"
            shimmerColor="#ffffff"
          >
            <span className="font-semibold tracking-wide text-white text-sm">
              {loading ? 'Saving...' : 'Save Check-In'}
            </span>
          </ShimmerButton>
        </div>
      </form>
    </GlowCard>
  );
}