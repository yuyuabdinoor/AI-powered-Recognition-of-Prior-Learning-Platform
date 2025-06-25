/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader, AlertTriangle, CheckCircle, ExternalLink, QrCode, FileText, ChevronRight, ShieldCheck } from 'lucide-react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import dynamic from 'next/dynamic';
import IpfsStatus from './IpfsStatus';

const CertificateViewer = dynamic(() => import('./CertificateViewer'), {
  ssr: false,
  loading: () => <div className="flex h-[200px] items-center justify-center"><Loader className="h-12 w-12 animate-spin text-purple-600" /></div>
});

interface CertificateData {
  id: string;
  userId: string;
  field: string;
  pdfUrl: string;
  ipfsUrl: string;
  txHash: string;
  createdAt: string;
  user: {
    name: string;
    walletAddress?: string;
  };
}

export default function VerifyPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [showWalletInput, setShowWalletInput] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const anchorCertificate = async (wallet: string) => {
    if (!data) return;
    setIsAnchoring(true);
    try {
      const response = await fetch('/api/anchor_certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certId: data.id, userWallet: wallet }),
      });
      if (!response.ok) {
        throw new Error(
          (await response.json()).error || 'Failed to anchor certificate.',
        );
      }

      const anchoredData = await response.json();
      setData(
        (prevData) =>
          prevData
            ? {
                ...prevData,
                ipfsUrl: anchoredData.ipfsUrl,
                txHash: anchoredData.txHash,
              }
            : null,
      );
    } catch (err: any) {
      console.error(err);
      alert(`An error occurred while anchoring: ${err.message}`);
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleAnchorClick = () => {
    if (!data) return;
    setShowWalletInput(true);
  };

  const handleWalletSubmit = async () => {
    if (!data) return;

    const trimmedAddress = walletAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      alert(
        'Invalid Ethereum wallet address. Please check the format (it should start with 0x and be 42 characters long).',
      );
      setWalletAddress(''); // Clear the invalid address from the input
      return;
    }

    try {
      // 1. Save the wallet address
      const updateRes = await fetch('/api/user/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.userId,
          walletAddress: trimmedAddress,
        }),
      });
      if (!updateRes.ok) throw new Error('Failed to save wallet address.');

      // 2. Update local state
      setData((prev) =>
        prev
          ? { ...prev, user: { ...prev.user, walletAddress: trimmedAddress } }
          : null,
      );
      setShowWalletInput(false);

      // 3. Anchor the certificate
      await anchorCertificate(trimmedAddress);
    } catch (err) {
      console.error(err);
      alert('Failed to save wallet address.');
    }
  };

  useEffect(() => {
    if (id) {
      fetch(`/api/certificate/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Certificate not found or error fetching data.');
          }
          return res.json();
        })
        .then(setData)
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (showWalletInput && data?.user.walletAddress) {
      setWalletAddress(data.user.walletAddress);
    }
  }, [showWalletInput, data?.user.walletAddress]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="flex items-center rounded-lg bg-red-100 p-6 text-red-700 shadow-md">
          <AlertTriangle className="mr-4 h-8 w-8" />
          <div>
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const verificationUrl = typeof window !== 'undefined' ? window.location.href : '';
  const blockExplorerUrl = `https://sepolia.etherscan.io/tx/${data.txHash}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="bg-green-600 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-10 w-10 text-white" />
              <h1 className="ml-4 text-3xl font-bold text-white">
                Certificate Verified
              </h1>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500">RECIPIENT</h2>
                    <p className="text-xl text-gray-800">{data.user.name}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500">QUALIFICATION</h2>
                    <p className="text-xl text-gray-800">{data.field}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500">ISSUED ON</h2>
                    <p className="text-xl text-gray-800">{new Date(data.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-8">
                  {/* Show anchor button if not yet anchored */}
                  {!data.txHash && !data.ipfsUrl && (
                    <div className="space-y-2">
                      <button
                        onClick={handleAnchorClick}
                        disabled={isAnchoring}
                        className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-4 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isAnchoring ? (
                          <Loader className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-5 w-5" />
                        )}
                        Anchor to Blockchain
                      </button>

                      {showWalletInput && (
                        <div className="space-y-2 rounded-lg border p-4">
                          <label
                            htmlFor="walletAddress"
                            className="text-sm font-medium text-gray-700"
                          >
                            Confirm or enter your wallet address to proceed:
                          </label>
                          <input
                            id="walletAddress"
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            placeholder="0x..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleWalletSubmit}
                              className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                              Save & Anchor
                            </button>
                            <button
                              onClick={() => setShowWalletInput(false)}
                              className="w-full rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(data.ipfsUrl || data.txHash) && (
                    <>
                      <button
                        onClick={() => setDetailsVisible(!detailsVisible)}
                        className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 text-left font-semibold text-gray-800 hover:bg-gray-100 focus:outline-none"
                      >
                        <span className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-purple-600" />
                          Verification Details
                        </span>
                        <ChevronRight
                          className={`transform transition-transform ${
                            detailsVisible ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {detailsVisible && (
                        <div className="mt-2 space-y-4 rounded-b-lg border border-t-0 border-gray-200 bg-white p-4">
                          {data.ipfsUrl && (
                            <IpfsStatus ipfsUrl={data.ipfsUrl} />
                          )}
                          {data.txHash && (
                            <a
                              href={blockExplorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-blue-600 hover:underline"
                            >
                              <span>View on Blockchain</span>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-gray-50 p-4">
                <QrCode className="h-8 w-8 text-purple-600"/>
                <QRCode value={verificationUrl} size={160} />
                <p className="text-center text-sm text-gray-600">Scan to verify this certificate</p>
              </div>
            </div>
          </div>
        </div>

        <CertificateViewer pdfUrl={data.pdfUrl} />

      </div>
    </div>
  );
} 