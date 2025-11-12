# CoreX — AI Agent Platform

> Serverless AI Agent Framework built with AWS Bedrock, Lambda, and Terraform

[![AWS](https://img.shields.io/badge/AWS-Bedrock%20%7C%20Lambda-FF9900?style=flat&logo=amazon-aws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=flat&logo=terraform)](https://www.terraform.io/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react)](https://vitejs.dev/)

**CoreX** is an enterprise-grade AI Agent system that combines AWS Bedrock, Lambda, and Cognito to deliver a secure, scalable GenAI backend — orchestrated entirely through Terraform Infrastructure-as-Code.

The frontend, built with React (Vite), provides an intelligent chat interface where users interact with the CoreX Agent — an AI assistant designed to process queries, invoke AWS services, and reason over real-world data.

---

## 🧩 Project Vision

CoreX aims to become a **modular AI Agent Framework** built natively on AWS — capable of integrating Bedrock, event-driven Lambdas, and external APIs to automate intelligent workflows and business processes.

**This isn't a demo chatbot.**

It's a cloud-native AI system engineered to function as a bedrock-integrated agent platform, with authentication, context awareness, and action capabilities.

---

## ⚙️ System Architecture

```
Frontend (React + Vite + Tailwind)
        │
        ▼
Amazon API Gateway ───▶ AWS Lambda (Python)
        │                       │
        ▼                       ▼
Amazon Cognito             Amazon Bedrock (LLM)
```

### Core Services

| Layer | Purpose |
|-------|---------|
| **AWS Lambda** (`corexAgent.py`) | Executes CoreX's reasoning logic and interacts with Bedrock models |
| **API Gateway** | Acts as the single public entry point with Cognito-secured routes |
| **Cognito** | Handles user authentication and API authorization |
| **Bedrock** (Claude / Titan) | Provides foundation model reasoning and text generation |
| **Terraform** | Automates deployment of IAM roles, policies, Lambdas, APIs, and Cognito |

---

## 🧱 Infrastructure Highlights

- **Serverless Design**: No servers or containers — 100% managed AWS services
- **Infrastructure as Code**: Fully automated using Terraform (modular, versioned)
- **Authentication Layer**: Cognito integration for secure API Gateway access
- **IAM Precision**: Role-based permission design following least privilege principle
- **Observability**: CloudWatch-ready Lambda logging for debugging and performance tracking
- **Extensible Architecture**: Designed to integrate Bedrock Agents, S3, DynamoDB, and event triggers

---

## 🧠 Current Focus (In Development)

CoreX is currently in **Phase 1 (Core Agent Development)**:

- ✅ Working backend pipeline: React → API Gateway → Lambda → Bedrock
- ✅ Infrastructure automated via Terraform
- ⚙️ Adding contextual memory and multi-agent orchestration
- ⚙️ Designing persistent conversation storage (DynamoDB integration)
- 🚧 Building Bedrock Agent layer for tool execution (calendar, email, etc.)

### Future Phases

- Agent-to-Agent collaboration
- Natural task planning and reasoning memory
- Integration with S3 (multimodal input) and Step Functions (workflow automation)

---

## 🧰 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React (Vite) + Tailwind CSS |
| **Backend Runtime** | AWS Lambda (Python 3.11) |
| **AI Models** | Amazon Bedrock (Claude 3 / Titan) |
| **Auth & Security** | Amazon Cognito + IAM |
| **Infra-as-Code** | Terraform (AWS Provider v5) |
| **Monitoring** | CloudWatch Logs |
| **Region** | ap-south-1 (Mumbai) |

---

## 🧩 Backend Infrastructure (Terraform)

All infrastructure is provisioned declaratively using Terraform:

- **IAM Role & Policy** — grants Bedrock and SSM access
- **Lambda Function** — Python handler packaged and deployed automatically
- **API Gateway** — proxy integration with Lambda and Cognito authorizer
- **Cognito User Pool & Client** — enables secure user authentication
- **Outputs** — auto-exports invoke URL and Cognito credentials

The backend is **fully reproducible and version-controlled**. Each environment (dev/prod) can be cloned using isolated Terraform state files.

---

## 🧠 Core Agent Logic

The CoreX Agent acts as the system brain:

```
User Query → Lambda Handler → Bedrock Model Invocation → AI Reasoning → Response Stream to Frontend
```

### Extensibility

The agent can be extended with:

- **Knowledge Retrieval** (RAG)
- **API actions** (e.g., search, automation)
- **Event triggers** (CloudWatch / SQS)
- **Bedrock multi-agent workflows** (planned)

---

## 🧾 Repository Structure

```
COREX/
├── backend/
│   ├── src/
│   │   ├── corexAgent.py        # Lambda AI Agent logic
│   │   └── build/               # Lambda bundle output
│   ├── requirements.txt
│   └── terraform/
│       ├── main.tf              # Full infrastructure definition
│       ├── terraform.tfstate
│       └── terraform.tfstate.backup
│
└── frontend/
    ├── src/
    │   ├── pages/ChatPage.tsx
    │   ├── App.tsx
    │   └── assets/
    ├── vite.config.ts
    └── package.json
```

---

## 📊 Project Status

| Module | Status | Notes |
|--------|--------|-------|
| Terraform Infrastructure | ✅ Stable | Working Lambda + API Gateway + Cognito pipeline |
| Core Lambda Logic | ⚙️ In Development | Bedrock API integration functional |
| Frontend Chat UI | ✅ Working Prototype | React chat interface with real API connection |
| Multi-Agent System | 🚧 Planned | Will use Bedrock Agents for reasoning |
| Persistent Storage | 🚧 Planned | DynamoDB & S3 integration next |

---

## 🚀 Getting Started

### Prerequisites

- AWS Account with Bedrock model access
- Terraform >= 1.5
- Node.js >= 18
- Python 3.11
- AWS CLI configured

### Backend Deployment

```bash
cd backend/terraform
terraform init
terraform plan
terraform apply
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🗺️ Roadmap

| Milestone | Goal |
|-----------|------|
| 🔹 **Phase 1** | Functional Bedrock Agent with context memory |
| 🔹 **Phase 2** | Multi-Agent orchestration with Bedrock tools |
| 🔹 **Phase 3** | Persistent session memory (DynamoDB + S3) |
| 🔹 **Phase 4** | CI/CD pipeline & production deployment |
| 🔹 **Phase 5** | UI redesign with streaming responses |

---

## 🧰 Engineering Philosophy

CoreX follows real-world AWS architecture principles:

- Infrastructure should be **immutable and repeatable**
- Every service must have **explicit IAM permissions**
- Every component must be **stateless and observable**
- **Terraform + Bedrock = AI automation infrastructure**, not just LLM calls

---

## 👤 Author

**Aditya Waghmare**  
AWS & Cloud-Native Engineer | GenAI Builder | Terraform Specialist

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/xadi)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/itxadii)

---

## 📜 License

This project is currently under active development.

---

## 🏁 Summary

CoreX represents the foundation of a **next-generation AI Agent Framework**, built with AWS-native intelligence, serverless scalability, and enterprise-grade IaC discipline.

It's currently under active development and evolving toward a **multi-agent autonomous AI system**.

---

**⭐ Star this repo if you're interested in AWS-native AI Agent development!**
