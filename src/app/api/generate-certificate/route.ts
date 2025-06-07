/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
 
import { NextResponse } from 'next/server';
import { fillCertificate, type FillData } from '~/lib/fillCertificate';
import { ThirdwebSDK, type TransactionResultWithId, type NFT } from '@thirdweb-dev/sdk';
import { db } from '~/server/db';
import fs from 'fs';
import path from 'path';

// Ensure /tmp directory exists for temporary file storage
const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Grab query params
  const name  = searchParams.get('name')  ?? 'Learner';
  const field = searchParams.get('field') ?? 'Field';
  const id    = searchParams.get('id')    ?? undefined;
  const userWallet = searchParams.get('wallet') ?? undefined; // e.g. ?wallet=0x...

  const date  = new Date().toLocaleDateString('en-GB');
  const data: FillData = { name, date, id };

  // Generate the certificate PDF as a buffer
  const pdfBuffer = await fillCertificate(data);

  // Save the PDF to disk temporarily (required for upload)
  const certFilePath = path.join(TMP_DIR, `Certificate_${field}_${Date.now()}.pdf`);
  fs.writeFileSync(certFilePath, pdfBuffer);

  // Blockchain mint and DB save
  let tokenId = "";
  let txHash = "";
  let ipfsUrl = "";
  try {
    if (userWallet) {
      // 1. Initialize Thirdweb SDK
      const sdk = new ThirdwebSDK("mumbai", {
        clientId: process.env.THIRDWEB_CLIENT_ID!,
        secretKey: process.env.THIRDWEB_SECRET_KEY!,
      });

      // 2. Get your NFT contract (nft-collection)
      const contract = await sdk.getContract(
        process.env.CERT_CONTRACT_ADDRESS!,
        "nft-collection"
      );

      // 3. Prepare NFT metadata (image is the PDF buffer)
      const fileBuffer = fs.readFileSync(certFilePath);
      const metadata = {
        name: `${name} RPL Certificate`,
        description: `Recognition of Prior Learning for ${field}`,
        image: fileBuffer, // This line causes upload to IPFS!
        properties: { name, field, dateIssued: date, userId: id },
      };

      // 4. Mint NFT to user's wallet (uploads PDF to IPFS)
      // --- TypeScript fix: type-cast the result! ---
      const tx = await contract.mintTo(userWallet, metadata);
      tokenId = tx.id?.toString() ?? "";
      txHash = tx.receipt?.transactionHash ?? "";
      const nft: NFT = await tx.data();
      ipfsUrl = nft.metadata?.image ?? "";

      // 5. Save blockchain data to DB
      await db.certificate.create({
        data: {
          userId: id ?? userWallet,   // adjust as needed
          pdfUrl: ipfsUrl,
          tokenId: tokenId,
          txHash: txHash,
        },
      });

      // Debug: Log the returned IPFS url
      console.log("NFT Minted! IPFS URL:", ipfsUrl);
    }
  } catch (err) {
    console.error("Blockchain anchoring failed:", err);
  } finally {
    // Clean up temp file
    if (fs.existsSync(certFilePath)) fs.unlinkSync(certFilePath);
  }

  // Return the PDF as a download
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename=Certificate_${field}.pdf`,
      // Optional: custom headers for blockchain data if needed
    },
  });
}
