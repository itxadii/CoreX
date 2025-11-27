# CoreX — Enterprise AI Agent Platform

> Production-grade serverless AI Agent Framework built with AWS Bedrock, Lambda, Cognito, and Terraform

[![AWS](https://img.shields.io/badge/AWS-Bedrock%20%7C%20Lambda%20%7C%20Cognito-FF9900?style=flat&logo=amazon-aws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=flat&logo=terraform)](https://www.terraform.io/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat&logo=react)](https://vitejs.dev/)

**CoreX** is a cloud-native AI Agent system that combines AWS Bedrock Agents, Lambda, DynamoDB, and Cognito to deliver a secure, scalable GenAI platform with tool-using capabilities, persistent memory, and enterprise-grade authentication.

---

## 🎯 What Makes CoreX Different

This isn't a chatbot demo. CoreX is a **full-stack, production-ready AI Agent Platform** with:

- 🔐 **Enterprise Authentication** (Cognito + Google OAuth 2.0)
- 🧠 **Context-Aware Memory** (DynamoDB-backed conversation history)
- 🛠️ **Tool-Using Agent** (Bedrock Agent with custom action groups)
- 🏗️ **Infrastructure as Code** (100% Terraform-managed with multi-environment support)
- 📱 **Production Frontend** (AWS Amplify hosting with mobile-optimized UX)
- 🔌 **Extensible Architecture** (OpenAPI-based tool integration)

---

## ⚙️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (AWS Amplify)                        │
│              React + TypeScript + Tailwind CSS                   │
│          [Signup/Login] → [Chat Interface] → [Sidebar]          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS + JWT Token
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Amazon API Gateway (REST)                      │
│    ┌──────────────┬──────────────┬─────────────────┐           │
│    │ OPTIONS      │ POST /chat   │ GET /history    │           │
│    │ (Public)     │ (Secured)    │ (Secured)       │           │
│    └──────────────┴──────────────┴─────────────────┘           │
└──────────┬────────────────────────────────┬────────────────────┘
           │                                 │
           │ Cognito Authorizer              │
           │ (JWT Validation)                │
           ▼                                 ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│   Amazon Cognito         │    │   AWS Lambda                 │
│   User Pool              │    │   CoreX-Agent-Handler        │
│   ┌──────────────────┐   │    │   (Python 3.11)              │
│   │ Email/Password   │   │    └──────────┬───────────────────┘
│   │ Google OAuth 2.0 │   │               │
│   └──────────────────┘   │               │ invoke_agent
└──────────────────────────┘               ▼
                               ┌──────────────────────────────┐
                               │   Amazon Bedrock Agent       │
                               │   (Nova Lite Model)          │
                               │   ┌────────────────────────┐ │
                               │   │ Custom Orchestration   │ │
                               │   │ Action Groups:         │ │
                               │   │  • Email Sender        │ │
                               │   │  • Internet Search     │ │
                               │   │  • Action Handler      │ │
                               │   └────────────────────────┘ │
                               └──────────┬───────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────┐
              ▼                           ▼                   ▼
    ┌─────────────────┐      ┌──────────────────┐   ┌────────────────┐
    │   Lambda: Email │      │ Lambda: Search   │   │ Lambda: Action │
    │   (AWS SES)     │      │ (Tavily API)     │   │ (System Ops)   │
    └─────────────────┘      └──────────────────┘   └────────────────┘
                                          │
                                          ▼
                               ┌──────────────────────────────┐
                               │   Amazon DynamoDB            │
                               │   Chat History Storage       │
                               │   (SessionId → Messages)     │
                               └──────────────────────────────┘
```

---

## 🏗️ Infrastructure Highlights

### 1. **Multi-Environment Terraform Architecture**

The entire infrastructure is organized into **reusable modules** with **isolated dev and prod environments**:

```
COREX/
├── backend/
│   ├── src/
│   │   ├── corexAgent.py          # Main agent orchestrator
│   │   ├── build/                 # Lambda deployment packages
│   │   └── requirements.txt
│   │
│   └── terraform/
│       ├── envs/
│       │   ├── dev/
│       │   │   ├── .terraform/
│       │   │   ├── .terraform.lock.hcl
│       │   │   ├── main.tf
│       │   │   ├── outputs.tf
│       │   │   ├── provider.tf
│       │   │   ├── terraform.tfstate
│       │   │   └── variables.tf
│       │   └── prod/
│       │       ├── .terraform.lock.hcl
│       │       ├── main.tf
│       │       ├── outputs.tf
│       │       ├── provider.tf
│       │       ├── terraform.tfstate
│       │       └── variables.tf
│       └── modules/
│           ├── api_gateway/
│           │   ├── main.tf
│           │   ├── outputs.tf
│           │   └── variables.tf
│           ├── cognito/
│           │   ├── main.tf
│           │   ├── outputs.tf
│           │   └── variables.tf
│           ├── dynamodb/
│           │   ├── main.tf
│           │   ├── outputs.tf
│           │   └── variables.tf
│           ├── iam/
│           │   ├── main.tf
│           │   ├── outputs.tf
│           │   └── variables.tf
│           └── lambda/
│               ├── main.tf
│               ├── outputs.tf
│               └── variables.tf
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── landing/           # Landing page components
    │   ├── pages/
    │   │   ├── ChatPage.tsx       # Main chat interface
    │   │   ├── ForgotPage.tsx     # Password recovery
    │   │   ├── LoginPage.tsx      # Login with OAuth
    │   │   └── SignupPage.tsx     # Mobile-optimized signup
    │   ├── assets/                # Static assets
    │   ├── App.tsx
    │   └── main.tsx
    ├── public/
    │   ├── auth-bg.mp4            # Cinematic background
    │   └── hero-bg.mp4
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

**Key Architecture Decisions:**

- ✅ **Environment Isolation:** Separate state files for dev and prod prevent accidental cross-environment modifications
- ✅ **DRY Principle:** All infrastructure logic lives in reusable modules
- ✅ **Variable-Driven:** Environment-specific configs (region, model ID, resource naming) are parameterized
- ✅ **State Management:** Terraform state is version-controlled and backed up
- ✅ **Zero-Downtime Deployments:** API Gateway deployments use SHA1-based triggers

### 2. **Authentication System (AWS Cognito)**

**Implemented:**
- Email/Password authentication with OTP verification
- Google OAuth 2.0 federation with PKCE flow
- JWT-based API authorization via API Gateway Authorizer
- Mobile-optimized signup flow with localStorage state persistence
- Auto-recovery for "User already exists" edge cases
- Password reset flow with secure code delivery

**Challenges Solved:**
- **Mobile Refresh Trap:** Implemented localStorage to survive browser reloads when users check email for OTP
- **Redirect URI Mismatch:** Ensured Terraform-generated Cognito domains matched Google Cloud Console exactly
- **NXDOMAIN Errors:** Handled DNS propagation delays for CloudFront distributions
- **Unconfirmed User Limbo:** Built auto-recovery that detects existing users and resends verification codes

### 3. **AI Agent (Amazon Bedrock)**

**Configuration:**
- **Model:** Nova Lite (optimized for speed and cost)
- **Orchestration:** Custom prompt templates allowing both conversational chat AND tool invocation
- **Action Groups:** OpenAPI-defined functions for real-world capabilities

**Current Tools:**
1. **Email Sender** (`CoreX-Email-Sender` Lambda)
   - Sends emails via AWS SES
   - Validates recipient addresses
   - Supports HTML formatting
2. **Internet Search** (`CoreX-Internet-Search` Lambda)
   - Real-time web search using Tavily API
   - Returns ranked, relevant results
   - Handles rate limiting gracefully
3. **Action Handler** (`CoreX-Action-Handler` Lambda)
   - System operations (restart server, check status)
   - Simulated infrastructure control
   - Extensible for real DevOps integrations

**Challenges Solved:**
- **False "Out of Domain" Rejections:** Modified orchestration prompt to explicitly allow "General Knowledge" queries without forcing tool use
- **API Path Mismatch:** Dynamically captured `apiPath` from Lambda event object to ensure responses match Bedrock's routing expectations
- **Memory vs. Storage:** Chose custom DynamoDB implementation over Bedrock native memory for full UI access to conversation history
- **Stream Crash:** Rewrote Lambda handler to properly iterate over Bedrock's event stream chunks instead of expecting JSON body

### 4. **Backend (AWS Lambda)**

**CoreX-Agent-Handler Capabilities:**
- **Context Injection:** Fetches last 6 messages from DynamoDB and injects them into Bedrock prompts to maintain conversation continuity
- **Session Management:** Uses UUID-based session IDs independent of user IDs, enabling multiple concurrent conversations per user
- **Response Cleaning:** Regex-based filtering to strip internal XML tags (`<outOfDomain>`, `<thinking>`) before sending to frontend
- **Stream Processing:** Handles Bedrock Agent's chunked event stream responses with proper buffering and error handling
- **Error Recovery:** Graceful fallbacks when tools fail (e.g., network timeout on search)

**Lambda Architecture:**
- Python 3.11 runtime
- Custom IAM roles with least-privilege policies
- CloudWatch logging for observability
- Environment variables for configuration (API keys, table names)
- Packaged with dependencies in deployment ZIP

### 5. **API Gateway (REST API)**

**Security Strategy:**
- **OPTIONS:** Public MOCK integration for instant CORS preflight (no Lambda invocation)
- **POST/GET:** Cognito Authorizer with JWT validation before reaching Lambda
- **Custom Gateway Responses:** Ensures CORS headers are returned even on 4xx/5xx errors

**Endpoints:**
- `POST /` → Send chat message (streams response from Bedrock)
- `GET /` → Retrieve chat history for sidebar
- `OPTIONS /` → CORS preflight (200 OK, no auth required)

**Challenges Solved:**
- **Root vs. Proxy Resource:** Added explicit GET method on root resource (`/`) in addition to `/{proxy+}` for sidebar API calls
- **401 Masking CORS:** Configured Gateway Responses to reveal true authentication errors instead of generic CORS failures
- **Stale Deployment Bug:** Implemented `triggers = { redeployment = sha1(...) }` to force API redeployment on every Terraform config change
- **Double CORS Headers:** Removed duplicate headers from Lambda responses since Gateway Responses already add them

### 6. **Frontend (React + AWS Amplify)**

**Tech Stack:**
- React 18 + TypeScript (type-safe development)
- Vite (fast HMR and optimized builds)
- Tailwind CSS (utility-first styling)
- Framer Motion (smooth animations)
- AWS Amplify Hosting (CI/CD pipeline with auto-deployment)

**UI/UX Features:**
- 🎨 **Glassmorphism Design:** Translucent cards with backdrop blur over cinematic video backgrounds
- 📱 **Mobile-First:** Responsive layouts with touch-optimized interactions
- 💬 **Real-Time Chat:** Auto-scrolling message feed with typing indicators
- 📂 **Sidebar History:** Grouped by session with timestamps, supports switching between conversations
- 🔄 **Session Management:** Create new chats or resume previous ones seamlessly
- 🔐 **Protected Routes:** Automatic redirect to login for unauthenticated users
- ⚡ **Optimized Performance:** Code splitting and lazy loading for fast initial load

**Landing Page Components:**
- `Hero.tsx` — Full-screen hero with animated CTAs
- `Features.tsx` — Feature grid with icons
- `HowItWorks.tsx` — Step-by-step explanation
- `LandingNavbar.tsx` — Navigation with smooth scroll
- `Particles.tsx` — Animated background particles
- `ProtectedRoute.tsx` — Auth guard component
- `ResponseLoader.tsx` — Loading states
- `SidebarItem.tsx` — Individual chat history item

---

## 📊 Project Status

| Component | Status | Description |
|-----------|--------|-------------|
| Terraform Infrastructure | ✅ **Production** | Multi-environment setup (dev/prod) with reusable modules |
| Authentication (Cognito) | ✅ **Production** | Email + Google OAuth + password reset working |
| API Gateway | ✅ **Production** | CORS + Auth + custom error responses configured |
| Lambda Functions | ✅ **Production** | Agent handler + 3 action group lambdas deployed |
| Bedrock Agent | ✅ **Production** | Custom orchestration + tool use enabled |
| Chat History (DynamoDB) | ✅ **Production** | Session-based storage with sidebar integration |
| Frontend (React) | ✅ **Production** | Deployed on Amplify with CI/CD pipeline |
| Email Tool | ✅ **Working** | AWS SES integration active |
| Internet Search Tool | ✅ **Working** | Tavily API integration functional |
| Landing Page | ✅ **Complete** | Full marketing site with animations |
| Knowledge Base (RAG) | 🚧 **Planned** | S3 + Bedrock Knowledge Base integration |
| Multi-Agent Orchestration | 🚧 **Planned** | Agent-to-agent collaboration framework |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Type-safe UI framework |
| | Tailwind CSS | Utility-first styling |
| | Framer Motion | Animation library |
| | Vite | Fast build tool and dev server |
| | AWS Amplify Hosting | CI/CD + global CDN hosting |
| **Backend** | AWS Lambda (Python 3.11) | Serverless compute |
| | Amazon Bedrock (Nova Lite) | LLM + Agent orchestration |
| | Amazon DynamoDB | NoSQL chat history database |
| | AWS SES | Transactional email service |
| | Tavily API | Web search provider |
| **API** | API Gateway (REST) | Secure API layer with throttling |
| | AWS Cognito | User management + OAuth 2.0 |
| **Infrastructure** | Terraform | Declarative Infrastructure as Code |
| | Terraform Cloud | Remote state management |
| **Region** | ap-south-1 (Mumbai) | Primary AWS deployment region |

---

## 🎓 Key Technical Achievements

### 1. **Solved the "Circular Dependency" Deadlock**
**Problem:** API Gateway module needed Cognito User Pool ARN for the authorizer, but Cognito module referenced API Gateway endpoints in redirect URLs—creating a circular dependency that Terraform couldn't resolve.

**Solution:** Decoupled the architecture by moving the Cognito Authorizer resource into the API Gateway module. Cognito ARN is now passed as a simple input variable, creating a clean one-way dependency flow: `Cognito → API Gateway`.

**Impact:** Enabled modular infrastructure design without sacrificing resource relationships.

---

### 2. **Conquered the "Silent CORS Error"**
**Problem:** Browser DevTools showed a generic CORS error when API calls failed, but the actual issue was a `401 Unauthorized` response. API Gateway's default 401 response didn't include CORS headers, so the browser blocked it before JavaScript could read the status code—masking the true error.

**Solution:** Configured **Gateway Responses** in Terraform to explicitly add `Access-Control-Allow-Origin: *` headers to 4xx and 5xx error responses. This allowed the browser to expose the real HTTP status, revealing the authentication failure.

**Impact:** Reduced debugging time from hours to minutes by surfacing real errors instead of red herrings.

---

### 3. **Implemented Mobile-Resilient Authentication**
**Problem:** Mobile browsers (especially iOS Safari and Chrome) aggressively kill background tabs to save memory. When users minimized the browser to check their email for the OTP code, the signup page reloaded and lost all form state—forcing them to restart.

**Solution:** Built a state persistence layer using `localStorage`:
- On signup, save `{ email, awaitingConfirmation: true }` to localStorage
- On page load, check localStorage and auto-restore the OTP screen if data exists
- Added a "Change Email" button that explicitly clears localStorage, distinguishing between "accidental refresh" (restore state) and "intentional correction" (clear state)

**Impact:** Eliminated user frustration and improved signup completion rate.

---

### 4. **Built Custom Context Injection for Memory**
**Problem:** Bedrock Agents have no built-in long-term memory. Each invocation is stateless, causing the agent to "forget" previous messages in the conversation—even when using sessions.

**Solution:** Designed a hybrid memory system:
1. **DynamoDB Storage:** Every message (user + assistant) is saved with `SessionId`, `MessageId`, and `Timestamp`
2. **Context Fetching:** Lambda fetches the last 6 messages before invoking Bedrock
3. **Prompt Injection:** Prepends fetched history to the current user query: `"Previous conversation: [...]\n\nUser: [new message]"`

**Impact:** Agent maintains conversation context, enabling multi-turn reasoning and follow-up questions.

---

### 5. **Mastered Terraform State Migration**
**Problem:** Initial infrastructure was built in a monolithic `main.tf`. Needed to refactor into modules for dev/prod isolation without destroying live resources (which would cause downtime).

**Solution:** Executed a complex **Terraform state surgery**:
```bash
terraform state mv aws_lambda_function.corex_agent module.lambda.aws_lambda_function.corex_agent
terraform state mv aws_api_gateway_rest_api.corex_api module.api_gateway.aws_api_gateway_rest_api.corex_api
# ... 20+ state moves
```
Verified with `terraform plan` showing 0 changes, proving the migration was non-destructive.

**Impact:** Achieved enterprise-grade infrastructure modularity with zero downtime.

---

### 6. **Debugged Bedrock Agent Tool Routing**
**Problem:** Bedrock Agent rejected Lambda responses with error: `"APIPath in Lambda response doesn't match input"`. The agent sends a specific `apiPath` in the event (e.g., `/search`), and expects the Lambda to echo it back in the response—but we were returning a hardcoded path.

**Solution:** Modified Lambda to dynamically extract `apiPath` from the incoming event:
```python
api_path = event.get('apiPath', '/')
return {
    'messageVersion': '1.0',
    'response': {
        'apiPath': api_path,  # Echo back the path
        'actionGroup': event['actionGroup'],
        'httpMethod': event['httpMethod'],
        'httpStatusCode': 200,
        'responseBody': { ... }
    }
}
```

**Impact:** Enabled multi-tool architecture where a single Lambda can handle multiple action groups.

---

### 7. **Fixed the "False Out-of-Domain" Problem**
**Problem:** Bedrock Agent was rejecting simple greetings like "Hi" or "What's your name?" with `<outOfDomain>User query is out of scope</outOfDomain>`. The default orchestration template assumed **every** query must map to a tool—even casual conversation.

**Solution:** Overrode the **Pre-Processing Prompt Template** in Bedrock Agent configuration:
```
You are an AI assistant. You can EITHER:
1. Answer from your general knowledge (for greetings, facts, advice)
2. Use available tools (for emails, searches, actions)

Do NOT reject queries as "out of domain" unless they are harmful or unrelated to your capabilities.
```

**Impact:** Agent now handles both tool-based tasks AND normal conversation, behaving like a true assistant.

---

### 8. **Conquered API Gateway's "Stale Deployment" Mystery**
**Problem:** After updating API Gateway methods via Terraform (e.g., removing auth from `OPTIONS`), the live API didn't reflect changes. Running `terraform apply` showed "no changes," but the old configuration was still active.

**Solution:** Discovered that API Gateway requires an explicit **Deployment** resource to push changes to a stage. Added a trigger:
```hcl
resource "aws_api_gateway_deployment" "corex_deployment" {
  rest_api_id = aws_api_gateway_rest_api.corex_api.id
  
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.root.id,
      aws_api_gateway_method.post_method.id,
      aws_api_gateway_integration.lambda_integration.id,
    ]))
  }
}
```
Now, any change to methods/integrations forces a new deployment.

**Impact:** Eliminated hours of "why isn't my change live?" debugging.

---

## 💡 Lessons Learned (Interview Talking Points)

### The "Unconfirmed User" Limbo
**Scenario:** User signs up but forgets to verify email. Later, they try to sign up again with the same email. AWS returns `UsernameExistsException`. They try to log in—AWS returns `UserNotConfirmedException`. They're stuck.

**Solution:** Built intelligent error handling:
```typescript
try {
  await signUp({ username, password });
} catch (error) {
  if (error.name === 'UsernameExistsException') {
    // User exists but may be unconfirmed. Resend code and show OTP screen.
    await resendSignUpCode({ username });
    setAwaitingConfirmation(true);
  }
}
```
**Impact:** Eliminated support burden of "I can't sign up or log in" tickets.

---

### The "Double CORS Headers" Trap
**Scenario:** API Gateway's Gateway Responses added CORS headers, but Lambda was also adding them—resulting in `Access-Control-Allow-Origin: *, *`, which browsers reject.

**Solution:** Removed CORS headers from Lambda responses, letting Gateway Responses be the single source of truth.

**Impact:** Cleaner architecture with centralized CORS policy.

---

### The "Root vs. Proxy" Resource Confusion
**Scenario:** Sidebar made `GET` requests to API root (`/`), but Terraform only defined methods on `/{proxy+}`. API Gateway returned 403 Missing Authentication Token.

**Solution:** Added explicit `GET` method on root resource in addition to proxy resource.

**Impact:** Both root and path-based endpoints now work correctly.

---

## 🗺️ Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1** | Core agent with authentication | ✅ Complete |
| **Phase 2** | Tool-using agent (email, search, actions) | ✅ Complete |
| **Phase 3** | Persistent chat history + sidebar UI | ✅ Complete |
| **Phase 4** | Landing page with marketing content | ✅ Complete |
| **Phase 5** | Knowledge Base (RAG) with S3 + vector DB | 🚧 In Progress |
| **Phase 6** | Multi-agent orchestration | 📋 Planned |
| **Phase 7** | Streaming responses in UI | 📋 Planned |
| **Phase 8** | Production monitoring + alerts | 📋 Planned |

---

## 🧰 Engineering Philosophy

CoreX follows enterprise AWS architecture principles:

1. **Infrastructure is Code** — Every resource is Terraform-managed and version-controlled
2. **Least Privilege by Default** — IAM policies grant only required permissions per function
3. **Stateless Compute** — Lambdas are ephemeral; state lives in DynamoDB/S3
4. **Security First** — JWT auth on every API call, secrets in Parameter Store, encrypted data at rest
5. **Observable Systems** — CloudWatch logging on all Lambdas with structured JSON logs
6. **Modular Design** — Each component (Cognito, Lambda, API Gateway) is independently deployable
7. **Fail Fast, Fail Gracefully** — Proper error handling with user-friendly messages, no silent failures

---

## 👤 Author

**Aditya Waghmare**  
AWS Solutions Architect | GenAI Engineer | Terraform Specialist

Building cloud-native AI systems with enterprise-grade infrastructure.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com)

---

## 🏆 Project Highlights

CoreX demonstrates mastery of:

- ✅ **Full-stack serverless architecture** on AWS (Lambda, API Gateway, DynamoDB, Cognito, Bedrock)
- ✅ **Production-grade authentication** with OAuth 2.0 and mobile-resilient state handling
- ✅ **AI Agent orchestration** with custom tool integration and memory management
- ✅ **Infrastructure as Code** with Terraform modules and multi-environment deployments
- ✅ **Complex state management** across distributed systems (frontend, API, Lambda, DynamoDB)
- ✅ **Mobile-first UX** with localStorage persistence and graceful error recovery
- ✅ **Security best practices** (JWT, IAM least privilege, encrypted secrets, CORS hardening)
- ✅ **Debugging distributed systems** (CORS, API Gateway deployments, Bedrock streaming, OAuth flows)

**This isn't a tutorial project. This is production-ready infrastructure for enterprise AI applications.**

---

## 📜 License

This project is currently under active development. All rights reserved.

---

**⭐ If you're building enterprise AI systems on AWS, this is the architecture you need.**
