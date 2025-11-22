'use client';

import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type StatusVariant = 'success' | 'error' | 'warning' | 'info';

interface StatusCardProps {
  variant: StatusVariant;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, { bg: string; border: string; icon: React.ElementType; iconColor: string; titleColor: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    icon: XCircleIcon,
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
  },
};

export function StatusCard({ variant, title, description, children, className = '' }: StatusCardProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} ${styles.border} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 flex-shrink-0 ${styles.iconColor}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold ${styles.titleColor}`}>
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

