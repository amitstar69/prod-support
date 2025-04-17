
# Ticket System Architecture

This folder contains the architecture for the ticket system, which handles help requests between developers and clients.

## Folder Structure

```
tickets/
├── client/                  # Client-side ticket components and logic
│   ├── components/          # UI components for client ticket interactions
│   ├── hooks/               # Custom hooks for client ticket functionality
│   └── pages/               # Client ticket pages
├── developer/               # Developer-side ticket components and logic
│   ├── components/          # UI components for developer ticket interactions
│   ├── hooks/               # Custom hooks for developer ticket functionality
│   └── pages/               # Developer ticket pages
├── shared/                  # Shared ticket functionality
│   ├── components/          # Shared UI components
│   ├── hooks/               # Shared custom hooks
│   ├── types/               # Ticket type definitions
│   └── utils/               # Shared utility functions
├── api/                     # API interaction for tickets
└── store/                   # State management for tickets
```

## Core Concepts

1. **Ticket Workflow States**:
   - `DRAFT` - Being created by client
   - `OPEN` - Available for developers to apply
   - `ASSIGNED` - Developer has been selected
   - `IN_PROGRESS` - Work has begun
   - `COMPLETED` - Work is done but waiting for client approval
   - `CLOSED` - Ticket is completed and client approved
   - `CANCELLED` - Ticket was cancelled

2. **Role Separation**:
   - Clients create and manage tickets
   - Developers browse, apply for, and work on tickets
   - Each role has different views and permissions

3. **Communication Flow**:
   - Initial ticket creation includes requirements
   - Developer applications include proposed solutions
   - In-progress communication via chat
   - Final delivery includes results documentation
