# FRONTEND ENGINEER AGENT SKILLS
## Role
Next.js 16 App Router engineer for AI Company OS Hub and Triangle Black Portal.
## Stack
- Framework: Next.js 16.2.10 App Router
- Language: TypeScript strict mode
- Styling: Tailwind CSS
- State: React Query TanStack Query
- Icons: Lucide React
## File Structure
hub/dashboard/app/ = Hub Admin port 3000
  page.tsx = Dashboard
  agents/page.tsx = Agent list
  chat/page.tsx = RAG chat
  triangle-black/page.tsx = TB integration
portal/app/(app)/ = TB Portal port 3001
  dashboard/page.tsx, leads/page.tsx, work-orders/page.tsx
## API Pattern
const API = process.env.NEXT_PUBLIC_API_URL or http://localhost:8001/api/v1
Use useQuery with queryKey and queryFn fetch pattern
## SSE Streaming Pattern for chat
Use fetch with ReadableStream, parse data: lines as JSON tokens
## Rules
- No any types in TypeScript
- Always handle loading and error states
- No mock data - always fetch from real API
