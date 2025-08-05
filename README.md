# SiteDesk

SiteDesk is a real-time multi-tenant customer support chat platform designed to enable seamless communication between customers and agents across multiple organizations. It features instant chat assignment, real-time messaging, and an embeddable React widget.

---

## Features

- Real-time messaging powered by Socket.IO and Redis for scalability  
- Redis-backed FIFO queues for fair, atomic chat assignment  
- Multi-organization support with strict data isolation via JWT authentication  
- Embeddable React chat widget for easy integration into any website  
- Agent dashboard with typing indicators and chat management  
- Feedback collection with star ratings and comments  
- Robust backend API built with Express, Prisma ORM, and PostgreSQL  
- Frontend state management using Zustand and React Query for performance  

---

## Tech Stack

- Backend: Node.js, Express, Socket.IO, Redis, Prisma, PostgreSQL  
- Frontend: React, Zustand, TanStack Query, TypeScript, Tailwind CSS, Shadcn UI  
- Authentication: JWT  
- Build tools: Vite, TurboRepo
