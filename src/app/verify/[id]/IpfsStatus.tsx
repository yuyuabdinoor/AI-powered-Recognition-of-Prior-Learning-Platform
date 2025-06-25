'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Loader, ExternalLink, Globe } from 'lucide-react';

interface IpfsStatusProps {
  ipfsUrl: string;
  className?: string;
}

interface GatewayStatus {
  gateway: string;
  available: boolean;
  url: string;
}

export default function IpfsStatus({ ipfsUrl, className = '' }: IpfsStatusProps) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [gateways, setGateways] = useState<GatewayStatus[]>([]);
  const [showGateways, setShowGateways] = useState(false);

  const extractHash = (url: string) => {
    if (!url) return null;
    
    // Handle different IPFS URL formats
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', '');
    }
    
    if (url.includes('/ipfs/')) {
      return url.split('/ipfs/')[1];
    }
    
    // If it's just a hash
    if (url.length === 46 && url.startsWith('Qm')) {
      return url;
    }
    
    return null;
  };

  const checkIpfsStatus = async () => {
    const hash = extractHash(ipfsUrl);
    if (!hash) {
      setStatus('unavailable');
      return;
    }

    setStatus('checking');
    
    try {
      const response = await fetch(`/api/ipfs?hash=${hash}&action=check`);
      const data = await response.json();
      
      setGateways(data.gateways || []);
      setStatus(data.available ? 'available' : 'unavailable');
    } catch (error) {
      setStatus('unavailable');
    }
  };

  useEffect(() => {
    if (ipfsUrl) {
      checkIpfsStatus();
    }
  }, [ipfsUrl]);

  const getPrimaryUrl = () => {
    if (!ipfsUrl) return null;
    
    if (ipfsUrl.startsWith('http')) return ipfsUrl;
    
    const hash = extractHash(ipfsUrl);
    if (!hash) return null;
    
    return `https://ipfs.io/ipfs/${hash}`;
  };

  if (!ipfsUrl) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <a 
          href={getPrimaryUrl()} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center text-blue-600 hover:underline"
        >
          <span>View on IPFS</span>
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
        
        <div className="flex items-center space-x-2">
          {status === 'checking' && (
            <Loader className="h-4 w-4 animate-spin text-gray-500" />
          )}
          {status === 'available' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {status === 'unavailable' && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          
          {gateways.length > 0 && (
            <button
              onClick={() => setShowGateways(!showGateways)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <Globe className="h-4 w-4 mr-1" />
              {showGateways ? 'Hide' : 'Show'} Gateways
            </button>
          )}
        </div>
      </div>

      {showGateways && gateways.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-600">Available gateways:</p>
          {gateways.map((gateway, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">{gateway.gateway}</span>
              <div className="flex items-center space-x-2">
                {gateway.available ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                {gateway.available && (
                  <a 
                    href={gateway.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 