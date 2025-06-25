# AI-Powered Recognition of Prior Learning (RPL) Platform

This project is a web-based platform designed to automate and streamline the Recognition of Prior Learning (RPL) process. It uses AI to assess a candidate's skills and knowledge through a multi-phase evaluation, culminating in the generation of a verifiable, blockchain-anchored certificate upon successful completion.

## ✨ Features

- **Multi-Phase Assessments:** A comprehensive evaluation process including knowledge-based questions, scenario-based challenges, and a practical task with evidence submission.
- **Dynamic Question Generation:** AI-powered question and scenario generation tailored to a user's selected field of expertise.
- **AI-Powered Scoring:** Automated scoring of user responses and evaluation of uploaded evidence using AI.
- **User Dashboard:** A personalized dashboard for users to track their assessment history, view detailed results, and download their credentials.
- **Verifiable Certificates:** Secure, verifiable certificates are generated as PDFs, uploaded to IPFS, and anchored to a blockchain (e.g., Ethereum testnet) for ultimate authenticity.
- **Public Verification Page:** A public-facing page where anyone can verify the authenticity of a certificate using its unique ID.

## 🛠️ Architecture

The platform is built on a modern, full-stack JavaScript architecture using Next.js. The backend and frontend are tightly integrated within the same framework, which simplifies development and deployment.

```mermaid
graph TD
    subgraph "User's Browser"
        A[Next.js Frontend - React]
    end

    subgraph "Next.js Backend"
        B[API Routes]
        B1[ /api/auth ]
        B2[ /api/generate_questions ]
        B3[ /api/score_answers ]
        B4[ /api/upload_documents ]
        B5[ /api/final_result ]
    end
    
    subgraph "Data Layer"
        C[Prisma ORM]
        D[PostgreSQL Database]
    end

    subgraph "External Services"
        E[NextAuth.js]
        F[OpenAI API]
        G[Thirdweb/Blockchain]
        H[IPFS/Pinata]
    end

    A --> B
    B -- "CRUD Operations" --> C
    C -- "Manages Schema & Queries" --> D
    
    A -- "Sign In/Out" --> B1
    B1 -- "Handles Auth" --> E
    
    B2 -- "Sends Prompt" --> F
    F -- "Returns Questions" --> B2
    
    B3 -- "Sends Answers" --> F
    F -- "Returns Scores" --> B3
    
    B4 -- "Processes Files" --> C
    
    B5 -- "Generates Certificate" --> G
    B5 -- "Uploads PDF" --> H

    style A fill:#cde4ff
    style B fill:#e1f5c4
    style D fill:#ffcdd2
    style E fill:#fcf8e3
    style F fill:#fcf8e3
    style G fill:#fcf8e3
    style H fill:#fcf8e3
```

- **Frontend:** Built with **React** and **Next.js**, using **Tailwind CSS** for styling.
- **Backend:** **Next.js API Routes** provide the server-side logic.
- **Database:** **PostgreSQL** is used for data storage, with **Prisma** as the ORM for type-safe database access.
- **Authentication:** Handled by **NextAuth.js**, configured with an OAuth provider (e.g., Discord, Google).
- **AI Services:** The **OpenAI API** is used for generating questions and scoring assessments.
- **Web3 Services:** **Thirdweb** is used to interact with smart contracts for minting certificates as NFTs, and **Pinata** can be used for pinning certificate data to **IPFS**.

## ⚙️ Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (or pnpm/yarn)
- [PostgreSQL](https://www.postgresql.org/) database running locally or on a cloud service.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required credentials.

```env
# Database URL - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:port/database_name"

# Authentication - Replace with your OAuth provider's credentials
# See https://next-auth.js.org/providers/ for more info
AUTH_SECRET="a_very_secret_string_for_session_encryption"
AUTH_DISCORD_ID="your_discord_client_id"
AUTH_DISCORD_SECRET="your_discord_client_secret"

# OpenAI API Key
OPENAI_API_KEY="sk-..."

# Application Logic - You can tweak these values
PASS_THRESHOLD=6
NEXT_PUBLIC_PASS_THRESHOLD=6
KNOWLEDGE_QUESTIONS_COUNT=8
SCENARIO_QUESTIONS_COUNT=2
```

### 4. Set Up the Database

Run the following command to apply all database migrations. This will create the necessary tables in your database according to the schema defined in `prisma/schema.prisma`.

```bash
npx prisma migrate dev
```

This will also automatically generate the Prisma Client based on your schema.

### 5. Run the Application

Now you can start the development server:

```bash
npm run dev
```

The application should be running at [http://localhost:3000](http://localhost:3000).
