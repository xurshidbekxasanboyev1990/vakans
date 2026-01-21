import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Briefcase, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketTrendsDashboardProps {
  className?: string;
}

interface TrendData {
  month: string;
  jobs: number;
  applications: number;
  avgSalary: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const generateTrendData = (): TrendData[] => {
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'];
  return months.map((month, index) => ({
    month,
    jobs: 150 + index * 20 + Math.floor(Math.random() * 30),
    applications: 300 + index * 50 + Math.floor(Math.random() * 100),
    avgSalary: 5000000 + index * 500000 + Math.floor(Math.random() * 1000000),
  }));
};

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-4 rounded-xl border',
        `bg-${color}-50 dark:bg-${color}-900/10 border-${color}-200 dark:border-${color}-800/30`
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', `bg-${color}-100 dark:bg-${color}-900/20`)}>
          {icon}
        </div>
        <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
          <TrendingUp className={cn('h-3 w-3', !isPositive && 'rotate-180')} />
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</p>
    </motion.div>
  );
}

export function MarketTrendsDashboard({ className }: MarketTrendsDashboardProps) {
  const trendData = generateTrendData();

  const currentMonth = trendData[trendData.length - 1];
  const prevMonth = trendData[trendData.length - 2];

  const jobsChange = ((currentMonth.jobs - prevMonth.jobs) / prevMonth.jobs) * 100;
  const applicationsChange = ((currentMonth.applications - prevMonth.applications) / prevMonth.applications) * 100;
  const salaryChange = ((currentMonth.avgSalary - prevMonth.avgSalary) / prevMonth.avgSalary) * 100;

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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Bozor tendensiyalari</h3>
            <p className="text-sm text-secondary-500">Oxirgi 6 oy statistikasi</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Jami e'lonlar"
          value={currentMonth.jobs}
          change={Math.round(jobsChange)}
          icon={<Briefcase className="h-5 w-5 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Jami arizalar"
          value={currentMonth.applications}
          change={Math.round(applicationsChange)}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          color="purple"
        />
        <StatCard
          title="O'rtacha maosh"
          value={`${Math.round(currentMonth.avgSalary / 1000000)}M`}
          change={Math.round(salaryChange)}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          color="green"
        />
      </div>

      {/* Trend Chart */}
      <div className="h-80 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
              }}
              formatter={(value: number | undefined, name: string | undefined) => {
                const val = value || 0;
                if (name === 'avgSalary') return [`${Math.round(val / 1000000)}M UZS`, 'O\'rtacha maosh'];
                return [val, name === 'jobs' ? 'E\'lonlar' : 'Arizalar'];
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => {
                if (value === 'jobs') return 'E\'lonlar';
                if (value === 'applications') return 'Arizalar';
                return 'Maosh';
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="jobs"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="applications"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgSalary"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">Asosiy xulosalar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <p className="text-sm text-secondary-700 dark:text-secondary-300">
              📈 E'lonlar soni oyma-oy <strong className="text-blue-600">+{Math.round(jobsChange)}%</strong> o'smoqda
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800/30">
            <p className="text-sm text-secondary-700 dark:text-secondary-300">
              👥 Har bir e'longa o'rtacha <strong className="text-purple-600">{Math.round(currentMonth.applications / currentMonth.jobs)}</strong> ta ariza
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
            <p className="text-sm text-secondary-700 dark:text-secondary-300">
              💰 Maoshlar <strong className="text-green-600">+{Math.round(salaryChange)}%</strong> oshdi
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
            <p className="text-sm text-secondary-700 dark:text-secondary-300">
              🔥 <strong className="text-amber-600">IT va texnologiya</strong> sohalari eng faol
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
