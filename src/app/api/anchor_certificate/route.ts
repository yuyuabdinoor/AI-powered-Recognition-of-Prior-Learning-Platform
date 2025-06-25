/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
 
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from "next/server";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { db } from "~/server/db"; // update this to your actual Prisma import path
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { certId, userWallet } = await req.json();

    // Basic wallet address validation
    if (!userWallet || !/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address provided.' },
        { status: 400 },
      );
    }

    // 1. Fetch the certificate from DB
    const cert = await db.certificate.findUnique({ where: { id: certId } });
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    // 2. Read PDF file
    const certPath = path.join(process.cwd(), "public/certificates", path.basename(cert.pdfUrl));
    const fileBuffer = fs.readFileSync(certPath);

    // 3. Mint on-chain with Thirdweb
    const sdk = new ThirdwebSDK("mumbai", {
      clientId: process.env.THIRDWEB_CLIENT_ID!,
      secretKey: process.env.THIRDWEB_SECRET_KEY!,
    });
    const contract = await sdk.getContract(process.env.CERT_CONTRACT_ADDRESS!, "nft-collection");

    const metadata = {
      name: `RPL Certificate - ${cert.userId}`,
      description: `Recognition of Prior Learning Certificate`,
      image: fileBuffer, // Attach the certificate file (PDF or PNG)
      properties: {
        userId: cert.userId,
        dateIssued: cert.createdAt.toISOString(),
      },
    };

const tx = await contract.mintTo(userWallet, metadata);
const tokenId = tx.id;
const txHash = tx.receipt.transactionHash;
const ipfsUrl = (tx.data as any).metadata.image; // <-- This silences TS error

await db.certificate.update({
  where: { id: cert.id },
  data: {
    tokenId: String(tokenId),
    txHash: txHash,
    pdfUrl: ipfsUrl,
  },
});


    return NextResponse.json({
      message: "Anchored successfully",
      tokenId,
      txHash,
      ipfsUrl,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
