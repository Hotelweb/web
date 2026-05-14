# Implementation Plan: QR-Based Customer Support Chat

## Overview

This implementation plan covers the complete QR-based customer support chat system for A25 Hotel. The system enables customers to scan QR codes at ~70 locations and chat with admins in realtime. The architecture uses React/Vite frontend and NestJS backend with Socket.IO for bidirectional communication.

The implementation is organized into backend setup, authentication, location management, messaging, WebSocket gateway, and frontend components. Each task builds incrementally on previous work to ensure a working system at each checkpoint.

## Tasks

- [x] 1. Backend Setup and Database Configuration
  - [x] 1.1 Install backend dependencies and configure Prisma
    - Install NestJS packages: `@nestjs/platform-socket.io`, `@nestjs/websockets`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/config`, `@prisma/client`, `passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `socket.io`
    - Install dev dependencies: `prisma`, `@types/bcrypt`, `@types/passport-jwt`
    - Initialize Prisma with PostgreSQL provider
    - Create `.env` file with `DATABASE_URL` and `JWT_SECRET`
    - _Requirements: 10.4_

  - [x] 1.2 Create Prisma schema with Admin, Location, and Message models
    - Define Admin model with id, email, passwordHash, createdAt
    - Define Location model with id, name, slug (unique), qrCodeUrl, createdAt
    - Define Message model with id, locationId, senderType (enum), content, isRead, createdAt
    - Add SenderType enum with 'customer' and 'admin' values
    - Add index on messages(locationId, createdAt) for efficient retrieval
    - Configure cascade delete for messages when location is deleted
    - _Requirements: 7.1, 7.4, 5.3_

  - [x] 1.3 Create PrismaModule and PrismaService
    - Create `prisma/prisma.module.ts` as a global module
    - Create `prisma/prisma.service.ts` extending PrismaClient with onModuleInit and onModuleDestroy
    - Export PrismaService for use in other modules
    - _Requirements: 10.2_

  - [x] 1.4 Run Prisma migrations and generate client
    - Run `npx prisma migrate dev --name init` to create database tables
    - Verify database schema is created correctly
    - _Requirements: 7.1_

- [x] 2. Authentication Module
  - [x] 2.1 Create Auth module structure with DTOs
    - Create `auth/auth.module.ts`, `auth/auth.controller.ts`, `auth/auth.service.ts`
    - Create `auth/dto/login.dto.ts` with email and password validation using class-validator
    - Create `auth/strategies/jwt.strategy.ts` for Passport JWT strategy
    - _Requirements: 3.1, 10.1_

  - [x] 2.2 Implement AuthService with login and validation
    - Implement `validateAdmin(email, password)` to find admin and verify bcrypt hash
    - Implement `login(loginDto)` to return JWT token and admin details (excluding passwordHash)
    - Configure JWT with 24-hour expiration
    - Use bcrypt with cost factor of 10 for password hashing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [x] 2.3 Implement AuthController with login endpoint
    - Create `POST /api/auth/login` endpoint
    - Return 401 Unauthorized for invalid credentials
    - Return JWT token and admin details on success
    - _Requirements: 3.1, 3.2_

  - [x] 2.4 Create JwtAuthGuard and CurrentAdmin decorator
    - Create `common/guards/jwt-auth.guard.ts` extending AuthGuard('jwt')
    - Create `common/decorators/current-admin.decorator.ts` to extract admin from request
    - Handle expired/invalid tokens with 401 response
    - _Requirements: 3.5, 4.1_

  - [x] 2.5 Write property test for authentication token generation
    - **Property 5: Authentication Token Generation**
    - **Validates: Requirements 3.1, 3.4**

  - [x] 2.6 Write property test for authentication failure security
    - **Property 6: Authentication Failure Security**
    - **Validates: Requirements 3.2, 3.5**

  - [x] 2.7 Write property test for password hash security
    - **Property 7: Password Hash Security**
    - **Validates: Requirement 3.6**

- [x] 3. Checkpoint - Backend Auth Setup
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Locations Module
  - [x] 4.1 Create Locations module structure with DTOs
    - Create `locations/locations.module.ts`, `locations/locations.controller.ts`, `locations/locations.service.ts`
    - Create `locations/dto/create-location.dto.ts` with name validation (max 255 chars)
    - Create `locations/dto/update-location.dto.ts` using PartialType
    - _Requirements: 5.4, 10.1_

  - [x] 4.2 Implement LocationsService with CRUD operations
    - Implement `create(dto)` with unique slug generation (lowercase alphanumeric with hyphens)
    - Implement `findAll()`, `findOne(id)`, `findBySlug(slug)`
    - Implement `update(id, dto)` ensuring slug uniqueness
    - Implement `delete(id)` with cascade delete of messages
    - _Requirements: 1.4, 1.5, 5.1, 5.2, 5.3, 5.5_

  - [x] 4.3 Implement LocationsService admin dashboard methods
    - Implement `getAllWithUnreadCount()` returning locations with unread message counts
    - Implement `getLocationWithLatestMessage(id)` for preview in sidebar
    - _Requirements: 4.2, 12.3_

  - [x] 4.4 Implement LocationsController with REST endpoints
    - Create `GET /api/locations` (public)
    - Create `GET /api/locations/:id` (public)
    - Create `GET /api/locations/slug/:slug` (public)
    - Create `POST /api/locations` (protected with JwtAuthGuard)
    - Create `PATCH /api/locations/:id` (protected)
    - Create `DELETE /api/locations/:id` (protected)
    - Create `GET /api/locations/admin/dashboard` (protected)
    - _Requirements: 5.1, 5.2, 5.3, 4.2_

  - [x] 4.5 Write property test for slug uniqueness and URL-safety
    - **Property 1: Slug Uniqueness and URL-Safety**
    - **Validates: Requirements 1.4, 1.5, 5.1, 5.5**

  - [x] 4.6 Write property test for location resolution correctness
    - **Property 2: Location Resolution Correctness**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 4.7 Write property test for location name validation
    - **Property 12: Location Name Validation**
    - **Validates: Requirement 5.4**

  - [x] 4.8 Write property test for cascade delete integrity
    - **Property 11: Cascade Delete Integrity**
    - **Validates: Requirements 5.3, 7.4**

- [x] 5. Messages Module
  - [x] 5.1 Create Messages module structure with DTOs
    - Create `messages/messages.module.ts`, `messages/messages.controller.ts`, `messages/messages.service.ts`
    - Create `messages/dto/create-message.dto.ts` with content validation (required, max 2000 chars)
    - _Requirements: 7.5, 10.1_

  - [x] 5.2 Implement MessagesService with persistence and retrieval
    - Implement `create(dto)` setting isRead based on senderType (admin=true, customer=false)
    - Implement `findByLocation(locationId, options)` with pagination (default 50, cursor-based)
    - Implement `markAsRead(locationId)` to update all customer messages
    - Implement `getUnreadCount(locationId)`
    - Order messages by createdAt descending
    - _Requirements: 6.3, 7.1, 7.2, 7.3, 12.1, 12.4_

  - [x] 5.3 Implement MessagesController with REST endpoints
    - Create `GET /api/messages/location/:locationId` (public) with pagination query params
    - Create `POST /api/messages/:locationId/read` (protected) to mark messages as read
    - _Requirements: 7.3, 12.2_

  - [x] 5.4 Write property test for message persistence guarantee
    - **Property 13: Message Persistence Guarantee**
    - **Validates: Requirements 6.1, 7.1**

  - [x] 5.5 Write property test for read status by sender type
    - **Property 15: Read Status by Sender Type**
    - **Validates: Requirements 6.3, 12.1**

  - [x] 5.6 Write property test for message content validation
    - **Property 18: Message Content Validation**
    - **Validates: Requirement 7.5**

  - [x] 5.7 Write property test for pagination correctness
    - **Property 17: Pagination Correctness**
    - **Validates: Requirement 7.3**

  - [x] 5.8 Write property test for message ordering consistency
    - **Property 16: Message Ordering Consistency**
    - **Validates: Requirements 6.6, 7.2**

- [x] 6. Checkpoint - Backend CRUD Operations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. WebSocket Gateway (Chat Module)
  - [x] 7.1 Create Chat module structure with DTOs
    - Create `chat/chat.module.ts`, `chat/chat.gateway.ts`
    - Create `chat/dto/join-room.dto.ts` with locationId validation
    - Create `chat/dto/send-message.dto.ts` with locationId, content, senderType validation
    - Create `common/filters/ws-exception.filter.ts` for WebSocket error handling
    - _Requirements: 10.1, 10.5_

  - [x] 7.2 Implement ChatGateway connection management
    - Configure WebSocket gateway with CORS and `/chat` namespace
    - Implement `handleConnection(client)` to log client connections
    - Implement `handleDisconnect(client)` to clean up client from all rooms
    - _Requirements: 9.1, 9.3, 10.6_

  - [x] 7.3 Implement ChatGateway room operations
    - Implement `@SubscribeMessage('join_room')` handler
    - Validate location exists, throw WsException if not found
    - Join client to room `location_{locationId}`
    - Send message history (last 50 messages) to client
    - Emit `room_joined` acknowledgment
    - Implement `@SubscribeMessage('leave_room')` handler
    - _Requirements: 2.3, 2.4, 11.1_

  - [x] 7.4 Implement ChatGateway message handling
    - Implement `@SubscribeMessage('send_message')` handler
    - Validate senderType is 'customer' or 'admin', reject or override invalid values
    - Persist message to database via MessagesService
    - Broadcast message to all clients in room via `receive_message` event
    - Ensure room isolation (messages only go to same room)
    - _Requirements: 2.5, 2.9, 6.1, 6.2, 6.5_

  - [x] 7.5 Implement ChatGateway typing indicators
    - Implement `@SubscribeMessage('typing_start')` handler
    - Implement `@SubscribeMessage('typing_stop')` handler
    - Broadcast `user_typing` event to other clients in room
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.6 Write property test for message history limit
    - **Property 3: Message History Limit**
    - **Validates: Requirement 2.4**

  - [x] 7.7 Write property test for sender type validation
    - **Property 4: Sender Type Validation**
    - **Validates: Requirement 2.9**

  - [x] 7.8 Write property test for room isolation
    - **Property 14: Room Isolation**
    - **Validates: Requirements 6.2, 6.5**

  - [x] 7.9 Write property test for client cleanup on disconnect
    - **Property 19: Client Cleanup on Disconnect**
    - **Validates: Requirement 9.3**

  - [x] 7.10 Write property test for location not found error
    - **Property 22: Location Not Found Error**
    - **Validates: Requirement 11.1**

- [x] 8. Checkpoint - Backend WebSocket Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Frontend Setup and Configuration
  - [x] 9.1 Install frontend dependencies and configure routing
    - Install `react-router-dom`, `socket.io-client`
    - Configure React Router in App.tsx with routes for `/location/:slug`, `/admin/login`, `/admin/dashboard`
    - Create `.env` file with `VITE_API_URL` pointing to backend
    - _Requirements: 1.1_

  - [x] 9.2 Create TypeScript type definitions
    - Create `types/index.ts` with Location, Message, Admin, LocationWithPreview interfaces
    - Define JoinRoomPayload, SendMessagePayload, TypingPayload, ReceiveMessagePayload types
    - _Requirements: N/A (infrastructure)_

  - [x] 9.3 Create API client module
    - Create `api/client.ts` with base fetch configuration and auth header injection
    - Create `api/auth.ts` with login function
    - Create `api/locations.ts` with CRUD functions and getBySlug
    - Create `api/messages.ts` with getByLocation and markAsRead functions
    - _Requirements: N/A (infrastructure)_

- [x] 10. Frontend Authentication Context and Hooks
  - [x] 10.1 Create AuthContext for admin authentication state
    - Create `contexts/AuthContext.tsx` with admin state, login, logout functions
    - Store JWT token in localStorage on successful login
    - Clear token and redirect to login on 401 or logout
    - Provide isAuthenticated, admin, login, logout via context
    - _Requirements: 3.7, 11.5_

  - [x] 10.2 Create useAuth hook
    - Create `hooks/useAuth.ts` consuming AuthContext
    - Provide convenient access to auth state and functions
    - _Requirements: 3.7_

  - [x] 10.3 Write property test for authorization enforcement
    - **Property 8: Authorization Enforcement**
    - **Validates: Requirement 4.1**

- [x] 11. Frontend Socket Hook and Context
  - [x] 11.1 Create useSocket hook for WebSocket management
    - Create `hooks/useSocket.ts` with Socket.IO connection management
    - Connect to `/chat` namespace on mount when locationId provided
    - Emit `join_room` on connect, handle `message_history` and `receive_message` events
    - Implement `sendMessage`, `startTyping`, `stopTyping` functions
    - Track connection status (isConnected) and typing indicator state
    - Implement automatic reconnection with exponential backoff
    - Clean up socket on unmount
    - _Requirements: 2.2, 2.3, 2.6, 2.7, 8.4, 9.2, 9.4_

  - [x] 11.2 Create SocketContext for shared socket state (optional)
    - Create `contexts/SocketContext.tsx` if socket needs to be shared across components
    - _Requirements: N/A (optional enhancement)_

- [x] 12. Frontend Common Components
  - [x] 12.1 Create LoadingSpinner and ErrorMessage components
    - Create `components/common/LoadingSpinner.tsx` for loading states
    - Create `components/common/ErrorMessage.tsx` for error display
    - _Requirements: 1.2, 11.4_

  - [x] 12.2 Create ConnectionStatus component
    - Create `components/admin/ConnectionStatus.tsx` showing "Online" or "Connecting..."
    - _Requirements: 2.7, 4.7_

- [x] 13. Frontend Chat Components
  - [x] 13.1 Create MessageBubble component
    - Create `components/chat/MessageBubble.tsx` displaying single message
    - Style differently for customer vs admin messages
    - Show timestamp
    - _Requirements: 2.6_

  - [x] 13.2 Create MessageList component
    - Create `components/chat/MessageList.tsx` rendering list of MessageBubble components
    - Support marking failed messages with retry option
    - Order messages chronologically for display
    - _Requirements: 2.6, 11.4_

  - [x] 13.3 Create ChatInput component
    - Create `components/chat/ChatInput.tsx` with text input and send button
    - Call onTypingStart/onTypingStop with 300ms debounce
    - Disable input when not connected
    - _Requirements: 2.5, 8.1, 8.2, 8.4_

  - [x] 13.4 Create TypingIndicator component
    - Create `components/chat/TypingIndicator.tsx` showing typing animation
    - _Requirements: 8.3_

- [x] 14. Frontend Admin Components
  - [x] 14.1 Create LocationItem component
    - Create `components/admin/LocationItem.tsx` showing location name, latest message preview, unread count badge
    - _Requirements: 4.6_

  - [x] 14.2 Create LocationSidebar component
    - Create `components/admin/LocationSidebar.tsx` listing all locations
    - Highlight selected location
    - Show unread counts
    - _Requirements: 4.2, 4.6_

- [x] 15. Checkpoint - Frontend Components Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Frontend Pages
  - [x] 16.1 Create CustomerChat page
    - Create `pages/CustomerChat.tsx` at route `/location/:slug`
    - Fetch location by slug on mount, show "Location not found" if not exists
    - Use useSocket hook with location.id
    - Display header with location name and connection status
    - Render MessageList, TypingIndicator, and ChatInput
    - Send messages with senderType 'customer'
    - Mobile-first responsive design
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 9.5_

  - [x] 16.2 Create AdminLogin page
    - Create `pages/AdminLogin.tsx` at route `/admin/login`
    - Form with email and password inputs
    - Call auth API on submit, store token on success
    - Redirect to dashboard on successful login
    - Show error message for invalid credentials
    - _Requirements: 3.1, 3.2, 3.7_

  - [x] 16.3 Create AdminDashboard page
    - Create `pages/AdminDashboard.tsx` at route `/admin/dashboard`
    - Require authentication (redirect to login if not authenticated)
    - Fetch locations with unread counts on mount
    - Render LocationSidebar with location selection
    - Use useSocket hook with selected location ID
    - Display chat interface for selected location
    - Send messages with senderType 'admin'
    - Show connection status indicator
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 16.4 Write property test for unread count accuracy
    - **Property 9: Unread Count Accuracy**
    - **Validates: Requirements 4.2, 12.3**

  - [x] 16.5 Write property test for bulk read status update
    - **Property 23: Bulk Read Status Update**
    - **Validates: Requirement 12.4**

- [x] 17. Wire Up App Module and Main Entry
  - [x] 17.1 Configure NestJS AppModule with all modules
    - Import PrismaModule, AuthModule, LocationsModule, MessagesModule, ChatModule
    - Configure ConfigModule for environment variables
    - Enable CORS on main.ts
    - Set global validation pipe with class-validator
    - _Requirements: 10.1, 10.6_

  - [x] 17.2 Configure React App with providers and routes
    - Wrap App with AuthProvider
    - Configure all routes in React Router
    - _Requirements: N/A (infrastructure)_

- [x] 18. Database Seeding
  - [x] 18.1 Create seed script for initial admin and test locations
    - Create `prisma/seed.ts` to create initial admin user with hashed password
    - Create a few test locations with unique slugs
    - Configure seed script in package.json
    - _Requirements: 1.3_

- [x] 19. Final Checkpoint - Full Integration
  - Ensure all tests pass, ask the user if questions arise.

  - [x] 19.1 Write property test for DTO validation enforcement
    - **Property 20: DTO Validation Enforcement**
    - **Validates: Requirement 10.1**

  - [x] 19.2 Write property test for invalid payload error handling
    - **Property 21: Invalid Payload Error Handling**
    - **Validates: Requirement 10.5**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The backend uses NestJS with TypeScript, Prisma ORM, and Socket.IO
- The frontend uses React 19 with TypeScript, Vite, and Tailwind CSS
- All WebSocket communication uses the `/chat` namespace
- JWT tokens have 24-hour expiration for admin authentication
- Customer chat requires no authentication by design

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4", "9.1"] },
    { "id": 4, "tasks": ["2.1", "9.2"] },
    { "id": 5, "tasks": ["2.2", "9.3"] },
    { "id": 6, "tasks": ["2.3"] },
    { "id": 7, "tasks": ["2.4"] },
    { "id": 8, "tasks": ["2.5", "2.6", "2.7"] },
    { "id": 9, "tasks": ["4.1", "10.1"] },
    { "id": 10, "tasks": ["4.2", "10.2"] },
    { "id": 11, "tasks": ["4.3", "10.3"] },
    { "id": 12, "tasks": ["4.4"] },
    { "id": 13, "tasks": ["4.5", "4.6", "4.7", "4.8"] },
    { "id": 14, "tasks": ["5.1", "11.1"] },
    { "id": 15, "tasks": ["5.2", "11.2"] },
    { "id": 16, "tasks": ["5.3"] },
    { "id": 17, "tasks": ["5.4", "5.5", "5.6", "5.7", "5.8"] },
    { "id": 18, "tasks": ["7.1", "12.1"] },
    { "id": 19, "tasks": ["7.2", "12.2"] },
    { "id": 20, "tasks": ["7.3", "13.1"] },
    { "id": 21, "tasks": ["7.4", "13.2"] },
    { "id": 22, "tasks": ["7.5", "13.3"] },
    { "id": 23, "tasks": ["7.6", "7.7", "7.8", "7.9", "7.10", "13.4"] },
    { "id": 24, "tasks": ["14.1"] },
    { "id": 25, "tasks": ["14.2"] },
    { "id": 26, "tasks": ["16.1", "16.2"] },
    { "id": 27, "tasks": ["16.3"] },
    { "id": 28, "tasks": ["16.4", "16.5"] },
    { "id": 29, "tasks": ["17.1", "17.2"] },
    { "id": 30, "tasks": ["18.1"] },
    { "id": 31, "tasks": ["19.1", "19.2"] }
  ]
}
```
