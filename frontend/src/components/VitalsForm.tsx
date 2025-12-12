import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { ShimmerButton } from "./ui/shimmer-button"; 
import { GlowCard } from "./ui/glow-card"; 
import { Activity } from 'lucide-react';

interface Props {
  onVitalLogged: (vital: any) => void;
}

export default function VitalsForm({ onVitalLogged }: Props) {
  const [formData, setFormData] = useState({
    systolic: '', diastolic: '', heartRate: '', temperature: '', bloodGlucose: '', oxygenSaturation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const vital = await apiClient.logVitals({
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        heartRate: parseInt(formData.heartRate),
        temperature: parseFloat(formData.temperature),
        bloodGlucose: formData.bloodGlucose ? parseInt(formData.bloodGlucose) : undefined,
        oxygenSaturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : undefined,
      });
      onVitalLogged(vital);
      setSuccess(true);
      setFormData({ systolic: '', diastolic: '', heartRate: '', temperature: '', bloodGlucose: '', oxygenSaturation: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to log vitals');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, placeholder, required = false, step = "1" }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{label}</label>
      <input
        type="number"
        name={name}
        value={(formData as any)[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        step={step}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
      />
    </div>
  );

  return (
    <GlowCard glowColor="blue" customSize={true}>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-400">
          <Activity size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Log Vital Signs</h2>
          <p className="text-[11px] text-gray-400">Record your daily biometrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Systolic (mmHg)" name="systolic" placeholder="120" required />
          <InputField label="Diastolic (mmHg)" name="diastolic" placeholder="80" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Heart Rate (bpm)" name="heartRate" placeholder="72" required />
          <InputField label="Temperature (°C)" name="temperature" placeholder="37.0" step="0.1" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Glucose (mg/dL)" name="bloodGlucose" placeholder="Optional" />
          <InputField label="SpO2 (%)" name="oxygenSaturation" placeholder="Optional" step="0.1" />
        </div>

        {error && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20 text-center">{error}</div>}
        {success && <div className="text-emerald-400 text-xs bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-center">✓ Vitals logged successfully!</div>}

        <div className="pt-2 flex justify-end">
          <ShimmerButton 
            type="submit" 
            disabled={loading}
            className="w-full shadow-lg"
            background="linear-gradient(to right, #3b82f6, #2563eb)"
            shimmerColor="#ffffff"
          >
            <span className="font-semibold tracking-wide text-white text-sm">
              {loading ? 'Logging...' : 'Log Vitals'}
            </span>
          </ShimmerButton>
        </div>
      </form>
    </GlowCard>
  );
}