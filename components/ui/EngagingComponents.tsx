import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Sparkles,
  Info,
  AlertTriangle,
  ChevronRight,
  Zap,
  Target,
  Award
} from 'lucide-react';

// Animated Circular Progress with Ring
export function CircularProgress({ 
  progress, 
  size = 80, 
  strokeWidth = 8,
  color = 'var(--gp-primary)',
  showLabel = true,
  label
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-gp-border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-xl font-bold text-gp-text"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            {progress}%
          </motion.span>
          {label && (
            <span className="text-xs text-gp-text-secondary mt-1">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Floating Action Button with Pulse Effect
export function FloatingActionButton({ 
  onClick, 
  icon: Icon,
  label,
  position = 'bottom-right',
  color = 'blue'
}: { 
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'blue' | 'green' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground',
    green: 'bg-gp-success hover:bg-gp-success/90 text-gp-canvas',
    red: 'bg-gp-danger hover:bg-gp-danger/90 text-gp-danger-foreground',
    purple: 'bg-gp-plum hover:bg-gp-plum/90 text-white'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    // Phones and small tablets only: on wider screens the same action is in the sidebar. No endless pulse.
    <div className={`fixed ${positionClasses[position]} z-50 md:hidden`}>
      <motion.button
        onClick={onClick}
        aria-label={label}
        className={`${colorClasses[color]} w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative`}
        whileTap={{ scale: 0.94 }}
      >
        <Icon className="w-6 h-6 relative z-10" aria-hidden="true" />
      </motion.button>
      {label && (
        <motion.div
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gp-plum text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          animate={{ opacity: 0, x: -10 }}
          whileFocus={{ opacity: 1, x: 0 }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
}

// Interactive Tooltip
export function InteractiveTooltip({ 
  children, 
  content,
  position = 'top'
}: { 
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute ${positionClasses[position]} bg-gp-plum text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-lg`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-gp-plum transform rotate-45 ${
              position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' :
              position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' :
              position === 'left' ? '-right-1 top-1/2 -translate-y-1/2' :
              '-left-1 top-1/2 -translate-y-1/2'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Success Celebration Animation
export function SuccessCelebration({ 
  message, 
  onComplete 
}: { 
  message: string;
  onComplete?: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gp-text/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gp-surface rounded-2xl p-8 shadow-gp-pop text-center max-w-sm mx-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 bg-gp-success-soft rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-10 h-10 text-gp-success" />
          </motion.div>
        </motion.div>
        <motion.h3
          className="text-xl font-bold text-gp-text mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Success!
        </motion.h3>
        <motion.p
          className="text-gp-text-secondary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
        <motion.div
          className="mt-6 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gp-success rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 300 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Skeleton Loading Component
export function Skeleton({ 
  className, 
  variant = 'default' 
}: { 
  className?: string;
  variant?: 'default' | 'circle' | 'text';
}) {
  const variantClasses = {
    default: 'rounded',
    circle: 'rounded-full',
    text: 'rounded-sm h-4'
  };

  return (
    <motion.div
      className={`bg-gp-surface-secondary ${variantClasses[variant]} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

// Interactive Time-Based Indicator
export function TimeIndicator({ 
  status, 
  time 
}: { 
  status: 'active' | 'pending' | 'completed' | 'overdue';
  time: string;
}) {
  const statusConfig = {
    active: { icon: Zap, color: 'text-gp-success bg-gp-success-soft', pulse: true },
    pending: { icon: Clock, color: 'text-gp-warning bg-gp-warning-soft', pulse: false },
    completed: { icon: CheckCircle2, color: 'text-gp-info bg-gp-info-soft', pulse: false },
    overdue: { icon: AlertTriangle, color: 'text-gp-danger bg-gp-danger-soft', pulse: true }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.color}`}
      animate={config.pulse ? {
        scale: [1, 1.02, 1],
        boxShadow: ['0 0 0 0 rgba(74, 222, 128, 0)', '0 0 0 8px rgba(74, 222, 128, 0)']
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity
      }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{time}</span>
    </motion.div>
  );
}

// Achievement Badge with Sparkle Effect
export function AchievementBadge({ 
  title, 
  icon: Icon,
  color = 'blue',
  unlocked = true
}: { 
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'purple' | 'gold' | 'emerald';
  unlocked?: boolean;
}) {
  const colorClasses = {
    blue: 'from-gp-primary to-gp-primary-hover',
    purple: 'from-gp-plum to-gp-plum/80',
    gold: 'from-amber-400 to-amber-500',
    emerald: 'from-gp-success to-gp-success/80'
  };

  return (
    <motion.div
      className={`relative ${unlocked ? '' : 'opacity-50 grayscale'} bg-linear-to-br ${colorClasses[color]} p-4 rounded-2xl text-white shadow-lg`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {unlocked && (
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Sparkles className="w-6 h-6 text-gp-warning" />
        </motion.div>
      )}
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8" />
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs opacity-90">
            {unlocked ? 'Unlocked!' : 'Locked'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Animated Progress Steps
export function ProgressSteps({ 
  steps, 
  currentStep 
}: { 
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                index < currentStep
                  ? 'bg-gp-success text-gp-canvas'
                  : index === currentStep
                  ? 'bg-gp-primary text-gp-primary-foreground ring-4 ring-gp-primary/30'
                  : 'bg-gp-surface-secondary text-gp-text-muted'
              }`}
              animate={index === currentStep ? {
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 0 rgba(249, 115, 22, 0)', '0 0 0 8px rgba(249, 115, 22, 0)']
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
            <motion.span
              className={`text-xs mt-2 ${
                index <= currentStep ? 'text-gp-text font-medium' : 'text-gp-text-muted'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {step}
            </motion.span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 bg-gp-surface-secondary rounded overflow-hidden">
              <motion.div
                className="h-full bg-gp-primary"
                initial={{ width: 0 }}
                animate={{ width: index < currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Interactive Status Card with Hover Effects
export function StatusCard({ 
  title, 
  value, 
  trend, 
  icon: Icon,
  color = 'blue',
  onClick
}: { 
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'hover:border-gp-primary/50 hover:shadow-gp-primary/20',
    green: 'hover:border-gp-success/50 hover:shadow-gp-success/20',
    purple: 'hover:border-gp-plum/50 hover:shadow-gp-plum/20',
    orange: 'hover:border-gp-accent/50 hover:shadow-gp-accent/20'
  };

  return (
    <motion.div
      className={`bg-gp-surface p-6 rounded-2xl border border-gp-border shadow-sm cursor-pointer transition-colors ${colorClasses[color]} hover:shadow-lg`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gp-primary-soft flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-gp-primary-strong`} />
        </div>
        {trend && (
          <motion.div
            className="flex items-center gap-1 text-gp-success text-sm font-medium"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="w-4 h-4" />
            {trend}
          </motion.div>
        )}
      </div>
      <motion.div
        className="text-3xl font-bold text-gp-text mb-1"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        {value}
      </motion.div>
      <div className="text-sm text-gp-text-secondary">{title}</div>
      <motion.div
        className="mt-4 flex items-center gap-2 text-gp-primary-strong text-sm font-medium"
        initial={{ opacity: 0 }}
        whileHover={{ x: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        View details <ChevronRight className="w-4 h-4" />
      </motion.div>
    </motion.div>
  );
}

// Animated Counter for Numbers
export function AnimatedCounter({ 
  value, 
  duration = 1.5,
  prefix = '',
  suffix = ''
}: { 
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}
