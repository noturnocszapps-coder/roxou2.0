'use client';

import { useEffect, useState } from 'react';
import { formatPublishedTime } from '@/lib/format-published-time';

interface TimeAgoProps {
  date: string | Date;
  prefix?: string; // Prefix is now handled within formatPublishedTime logic but kept for compatibility
  className?: string;
}

export default function TimeAgo({ date, prefix = 'Publicado há', className = '' }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('Publicado agora');

  useEffect(() => {
    const updateTime = () => {
      const formatted = formatPublishedTime(date.toString());
      setTimeAgo(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={className}>
      {timeAgo}
    </span>
  );
}
