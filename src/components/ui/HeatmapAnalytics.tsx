import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface HeatmapAnalyticsProps {
  data?: ApplicationHeatmapData[];
  className?: string;
  title?: string;
  description?: string;
}

interface ApplicationHeatmapData {
  hour: number;
  count: number;
  label: string;
}

export function HeatmapAnalytics({
  data = [],
  className,
  title = 'Arizalar heatmap',
  description = 'Qaysi soatlarda ko\'proq ariza keladi',
}: HeatmapAnalyticsProps) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const avgCount = Math.round(data.reduce((sum, d) => sum + d.count, 0) / data.length);

  // Find peak hours
  const peakHours = data
    .filter((d) => d.count >= maxCount * 0.8)
    .map((d) => d.label)
    .join(', ');

  const getBarColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity >= 0.7) return '#10b981'; // green-500
    if (intensity >= 0.4) return '#f59e0b'; // amber-500
    return '#3b82f6'; // blue-500
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h3>
            <p className="text-sm text-secondary-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
          <p className="text-xs text-secondary-500 mb-1">Eng ko'p</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{maxCount}</p>
          <p className="text-xs text-secondary-500 mt-1">ariza/soat</p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
          <p className="text-xs text-secondary-500 mb-1">O'rtacha</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgCount}</p>
          <p className="text-xs text-secondary-500 mt-1">ariza/soat</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
          <p className="text-xs text-secondary-500 mb-1">Peak vaqt</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">{peakHours.split(',')[0]}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              formatter={(value: number | undefined) => [`${value || 0} ariza`, 'Soni']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
        <p className="text-sm text-secondary-700 dark:text-secondary-300">
          💡 <strong>Maslahat:</strong> Eng ko'p arizalar <strong>{peakHours}</strong> oralig'ida keladi.
          Yangi e'lonlarni shu vaqtda joylashtirish samaraliroq bo'ladi.
        </p>
      </div>
    </motion.div>
  );
}
