import React from 'react';

export type StatusType = 'tracking' | 'paused' | 'completed' | 'active' | 'triggered' | 'dismissed' | 'expired';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = false, 
  className = '' 
}: StatusBadgeProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'tracking':
      case 'active':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: '🔍',
          label: status === 'tracking' ? 'Tracking' : 'Active'
        };
      case 'paused':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: '⏸️',
          label: 'Paused'
        };
      case 'completed':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: '✅',
          label: 'Completed'
        };
      case 'triggered':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: '🚨',
          label: 'Triggered'
        };
      case 'dismissed':
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: '❌',
          label: 'Dismissed'
        };
      case 'expired':
        return {
          color: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: '⏰',
          label: 'Expired'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default: // md
        return 'px-2.5 py-1 text-xs';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${config.color} ${sizeClasses} ${className}
      `}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
} 