
import { useAuthStore, useHealthStore } from '../store';
import { apiClient } from '../services/api';
import { wsService } from '../services/websocket';

// --- UI Components ---
import { FloatingNavBar } from '../components/ui/floating-navbar';
import HealthTrendChart from '../components/HealthTrendChart'; 
import CorrelationsList from '../components/CorrelationsList';
import VitalsForm from '../components/VitalsForm';
import SymptomForm from '../components/SymptomForm';
import MoodForm from '../components/MoodForm';
import ChatInterface from '../components/ChatInterface';

// --- Icons ---
import { LayoutDashboard, Activity, Brain, Heart, MessageSquare, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PatientDashboard() {
  const { user, logout } = useAuthStore();
  const { healthScore, correlations, setHealthScore, setCorrelations, setVitals } = useHealthStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const navItems = [
    { name: "Overview", id: "overview", icon: LayoutDashboard },
    { name: "Vitals", id: "vitals", icon: Activity },
    { name: "Symptoms", id: "symptoms", icon: Brain },
    { name: "Mood", id: "mood", icon: Heart },
    { name: "AI Doctor", id: "ai-doctor", icon: MessageSquare },
  ];

  useEffect(() => {
    wsService.connect(user?.id || '', 'PATIENT');
    wsService.on('health-score-updated', (data) => setHealthScore(data.score));
    loadHealthData();
    return () => wsService.disconnect();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const scoreData = await apiClient.getHealthScore();
      setHealthScore(scoreData.score);
      setCorrelations(scoreData.correlations);
      const vitalsData = await apiClient.getVitals(7);
      setVitals(vitalsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => await loadHealthData();
  const handleVitalLogged = async (v: any) => { wsService.emit('vitals-logged', { patientId: user?.id, ...v }); refreshData(); };
  const handleSymptomLogged = async (s: any) => { wsService.emit('symptom-logged', { patientId: user?.id, ...s }); refreshData(); };
  const handleMoodLogged = async (m: any) => { wsService.emit('mood-logged', { patientId: user?.id, ...m }); refreshData(); };

  // Helper for the "Stacked List" Items
  const ScoreRow = ({ label, value, colorClass }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-6 rounded-full ${colorClass}`} />
        <span className="text-gray-300 font-medium text-sm">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );

  return (
    // NEW BACKGROUND: "Sci-Fi Grid" Style
    <div 
      className="min-h-screen relative overflow-x-hidden bg-black"
      style={{
        // 1. Subtle Grid Pattern
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.5) 0%, transparent 60%) 
        `,
        // 2. Grid Size & Gradient
        backgroundSize: '40px 40px, 40px 40px, 100% 100%',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* 1. CENTER: Floating Navbar */}
      <FloatingNavBar items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. HEADER LAYER: Fixed to Top */}
      <div className="fixed top-0 left-0 w-full px-16 pt-14 pb-6 z-40 pointer-events-none flex justify-between items-center">
          
          {/* Left: Greeting (Conditional) */}
          <div className="pointer-events-auto">
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{user?.firstName}</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">Here is your daily health intelligence summary.</p>
              </div>
            )}
          </div>

          {/* Right: Sign Out (Always visible) */}
          <div className="pointer-events-auto">
            <button 
                onClick={logout} 
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors border border-red-500/30 rounded-lg px-6 py-3 bg-black/40 backdrop-blur-md shadow-lg"
            >
                Sign Out
            </button>
          </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 pt-48 pb-20 flex flex-col gap-8">
        
        <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          {loading ? (
            <div className="text-center text-gray-500 mt-20 animate-pulse">Syncing biometrics...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* LEFT COLUMN: Circle + List */}
                  <div className="flex flex-col gap-6">
                    {/* Circle Score Card */}
                    <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                        <div className="absolute inset-0 bg-purple-500/5 blur-[80px]" />
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                            <path className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" 
                                strokeDasharray={`${healthScore.overallScore}, 100`} 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" 
                            />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                            <span className="text-6xl font-bold text-white tracking-tighter">{healthScore.overallScore}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                            {healthScore.trend === 'IMPROVING' ? <TrendingUp size={16} className="text-emerald-400" /> : <Activity size={16} className="text-purple-400" />}
                            <span className="text-xs text-gray-300">Trend: <span className="text-white font-medium">{healthScore.trend}</span></span>
                        </div>
                    </div>

                    {/* Stacked List of Values */}
                    <div className="flex flex-col gap-3">
                        <ScoreRow label="Vital Score" value={healthScore.vitalScore} colorClass="bg-blue-500" />
                        <ScoreRow label="Symptom Score" value={healthScore.symptomScore} colorClass="bg-pink-500" />
                        <ScoreRow label="Mental Health Score" value={healthScore.mentalScore} colorClass="bg-teal-500" />
                        
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-gray-300 font-medium ml-2 text-sm">Risk Level</span>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                                healthScore.riskLevel === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                healthScore.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                                {healthScore.riskLevel === 'LOW' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                <span className="font-bold text-sm">{healthScore.riskLevel} Risk</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Graph */}
                  <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md h-[300px]">
                       <HealthTrendChart />
                    </div>
                    
                    {correlations && correlations.length > 0 && (
                        <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
                        <h2 className="text-lg font-semibold text-white mb-4">AI Insights</h2>
                        <CorrelationsList correlations={correlations} />
                        </div>
                    )}
                  </div>

                </div>
              )}

              {/* Other Forms */}
              {activeTab === 'vitals' && <div className="max-w-xl mx-auto mt-8"><VitalsForm onVitalLogged={handleVitalLogged} /></div>}
              {activeTab === 'symptoms' && <div className="max-w-xl mx-auto mt-8"><SymptomForm onSymptomLogged={handleSymptomLogged} /></div>}
              {activeTab === 'mood' && <div className="max-w-xl mx-auto mt-8"><MoodForm onMoodLogged={handleMoodLogged} /></div>}
              {activeTab === 'ai-doctor' && <div className="max-w-4xl mx-auto mt-4 h-[600px]"><ChatInterface /></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
