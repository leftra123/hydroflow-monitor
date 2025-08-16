/**
 * 🔗 Connection Status Indicator Component
 * 
 * Visual indicator for real-time connection status
 */

import React from 'react';
import { 
  ConnectionStatusProps, 
  getConnectionStatusColor, 
  getConnectionStatusText 
} from '@/hooks/useSmoothDataUpdates';
import { formatChileanTime } from '@/constants/translations';

export const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({ 
  status, 
  lastUpdate 
}) => {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor(status)}`} />
      <span>{getConnectionStatusText(status)}</span>
      {status === 'connected' && (
        <span>• {formatChileanTime(lastUpdate)}</span>
      )}
    </div>
  );
};
