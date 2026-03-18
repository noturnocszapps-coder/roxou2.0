'use client';

import { useEffect, useState } from 'react';

interface TimeAgoProps {
  date: string | Date;
  prefix?: string;
  className?: string;
}

export default function TimeAgo({ date, prefix = 'Publicado há', className = '' }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const created = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

      if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds}s`);
      } else if (diffInSeconds < 3600) {
        setTimeAgo(`${Math.floor(diffInSeconds / 60)} min`);
      } else if (diffInSeconds < 86400) {
        setTimeAgo(`${Math.floor(diffInSeconds / 3600)}h`);
      } else {
        setTimeAgo(`${Math.floor(diffInSeconds / 86400)} dias`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={className}>
      {prefix} {timeAgo}
    </span>
  );
}
