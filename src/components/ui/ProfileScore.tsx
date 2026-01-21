import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface ProfileScoreProps {
  user: User;
  className?: string;
}

interface ScoreCriteria {
  label: string;
  points: number;
  completed: boolean;
  suggestion?: string;
}

export function ProfileScore({ user, className }: ProfileScoreProps) {
  // Calculate profile completeness score
  const criteria: ScoreCriteria[] = [
    {
      label: 'Profil rasmi',
      points: 10,
      completed: !!user.avatar,
      suggestion: 'Professional profil rasmi yuklang',
    },
    {
      label: 'Ism va familiya',
      points: 10,
      completed: !!(user.firstName && user.lastName),
      suggestion: 'To\'liq ism va familiya kiriting',
    },
    {
      label: 'Telefon raqam',
      points: 10,
      completed: !!user.phone,
      suggestion: 'Telefon raqamingizni tasdiqlang',
    },
    {
      label: 'Email manzil',
      points: 10,
      completed: !!user.email,
      suggestion: 'Email manzil qo\'shing',
    },
    {
      label: 'Bio/Haqida',
      points: 15,
      completed: !!(user.bio && user.bio.length > 20),
      suggestion: 'Qisqa biografiya yozing (kamida 20 ta belgi)',
    },
    {
      label: 'Ko\'nikmalar',
      points: 15,
      completed: !!(user.skills && user.skills.length >= 3),
      suggestion: 'Kamida 3 ta ko\'nikma qo\'shing',
    },
    {
      label: 'Tajriba',
      points: 15,
      completed: !!(user.bio && user.bio.length > 50),
      suggestion: 'Ish tajribangizni bio ga qo\'shing',
    },
    {
      label: 'Ta\'lim',
      points: 10,
      completed: !!(user.bio && user.bio.length > 100),
      suggestion: 'Ta\'lim ma\'lumotlaringizni bio ga qo\'shing',
    },
    {
      label: 'Ijtimoiy tarmoqlar',
      points: 5,
      completed: false,
      suggestion: 'LinkedIn yoki boshqa tarmoqlaringizni ulang',
    },
  ];

  const totalPoints = 100;
  const earnedPoints = criteria.filter((c) => c.completed).reduce((sum, c) => sum + c.points, 0);
  const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const incompleteCriteria = criteria.filter((c) => !c.completed);

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getScoreGradient(scorePercentage)} flex items-center justify-center`}>
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Profil ballari</h3>
            <p className="text-sm text-secondary-500">To'liqlik darajasi</p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn('text-3xl font-bold', getScoreColor(scorePercentage))}>
            {scorePercentage}%
          </div>
          <p className="text-xs text-secondary-500">{earnedPoints}/{totalPoints} ball</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${getScoreGradient(scorePercentage)} rounded-full`}
          />
        </div>
      </div>

      {/* Score Description */}
      <div className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
        {scorePercentage >= 80 ? (
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            🎉 <strong>Ajoyib!</strong> Profilingiz juda to'liq. Ish beruvchilar sizni osonlik bilan topa oladilar.
          </p>
        ) : scorePercentage >= 50 ? (
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            👍 <strong>Yaxshi!</strong> Profilingiz yetarlicha to'liq, lekin yaxshilash mumkin.
          </p>
        ) : (
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            ⚠️ <strong>E'tibor!</strong> Profilingizni to'ldiring - bu sizning imkoniyatlaringizni oshiradi.
          </p>
        )}
      </div>

      {/* Completed Criteria */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
          To'ldirilgan ({criteria.filter((c) => c.completed).length}/{criteria.length})
        </h4>
        <div className="space-y-2">
          {criteria
            .filter((c) => c.completed)
            .map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400"
              >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-secondary-500">+{item.points}</span>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Suggestions */}
      {incompleteCriteria.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Takomillashtirish ({incompleteCriteria.length})
          </h4>
          <div className="space-y-2">
            {incompleteCriteria.slice(0, 3).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">{item.suggestion}</p>
                </div>
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">+{item.points}</span>
              </motion.div>
            ))}
          </div>
          {incompleteCriteria.length > 3 && (
            <p className="text-xs text-secondary-500 text-center">
              Yana {incompleteCriteria.length - 3} ta takliflar mavjud
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
