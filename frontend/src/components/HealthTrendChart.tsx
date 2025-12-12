import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function HealthTrendChart() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
  }, []);

  const loadTrendData = async () => {
    try {
      const data = await apiClient.getHealthScore();
      if (data.trend && data.trend.dates) {
        const chartData = data.trend.dates.map((date: string, idx: number) => ({
          date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          score: data.trend.scores[idx],
        }));
        setTrendData(chartData);
      } else {
        const demoData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                score: 70 + Math.random() * 10
            };
        });
        setTrendData(demoData);
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full w-full min-h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-white font-semibold text-lg">Health Score Trend</h3>
            <p className="text-gray-400 text-xs">7-Day Projection</p>
        </div>
        {/* 5. REMOVED LIVE INDICATOR */}
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        {loading ? (
            <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                Loading chart...
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
                <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                
                <XAxis 
                    dataKey="date" 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                />
                <YAxis hide domain={[0, 100]} />
                
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid #333', 
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    labelStyle={{ color: '#aaa', fontSize: '11px', marginBottom: '4px' }}
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                
                <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    style={{ filter: 'drop-shadow(0px 0px 10px rgba(139, 92, 246, 0.5))' }}
                    animationDuration={1500}
                />
            </AreaChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
