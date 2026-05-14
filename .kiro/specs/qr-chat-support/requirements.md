# Requirements Document

## Introduction

This document specifies the requirements for a QR-based customer support chat system for A25 Hotel. The system enables customers to scan QR codes placed at approximately 70 unique locations/addresses, which redirect them to dedicated chat pages where they can communicate directly with admins in realtime. The architecture follows a client-server model with React/Vite frontend and NestJS backend, using Socket.IO for bidirectional realtime communication.

## Glossary

- **System**: The complete QR-based customer support chat application including frontend and backend components
- **Customer_Chat_Page**: The frontend page displayed to customers after scanning a QR code, accessible at `/location/:slug`
- **Admin_Dashboard**: The authenticated admin interface for managing locations and responding to customer chats
- **WebSocket_Gateway**: The NestJS Socket.IO gateway handling realtime bidirectional communication
- **Auth_Service**: The backend service responsible for admin authentication and JWT token management
- **Locations_Service**: The backend service managing CRUD operations for location entities
- **Messages_Service**: The backend service handling message persistence and retrieval
- **Chat_Room**: A Socket.IO room identified by `location_{id}` that isolates messages for a specific location
- **Location**: A physical address/place with a unique slug used for QR code routing
- **Message**: A chat message with content, sender type (customer or admin), and timestamp
- **Admin**: An authenticated user with access to the admin dashboard
- **JWT_Token**: A JSON Web Token used for admin authentication with 24-hour expiration
- **Slug**: A URL-safe unique identifier for a location (lowercase alphanumeric with hyphens)

## Requirements

### Requirement 1: QR Code Location Routing

**User Story:** As a customer, I want to scan a QR code and be directed to a location-specific chat page, so that I can get support relevant to my current location.

#### Acceptance Criteria

1. WHEN a customer navigates to `/location/:slug`, THE Customer_Chat_Page SHALL resolve the location by slug and display the chat interface
2. WHEN a customer navigates to a URL with a non-existent slug, THE Customer_Chat_Page SHALL display a friendly "Location not found" message
3. THE System SHALL support approximately 70 unique locations, each with a unique slug
4. THE Locations_Service SHALL ensure all slugs are URL-safe (lowercase alphanumeric with hyphens)
5. WHEN a location is created, THE Locations_Service SHALL generate a unique slug that does not conflict with existing slugs

### Requirement 2: Customer Chat Interface

**User Story:** As a customer, I want to send and receive messages in realtime without authentication, so that I can quickly get support without creating an account.

#### Acceptance Criteria

1. WHEN a customer loads the Customer_Chat_Page, THE System SHALL NOT require any authentication
2. WHEN the Customer_Chat_Page loads successfully, THE WebSocket_Gateway SHALL establish a WebSocket connection automatically
3. WHEN a WebSocket connection is established, THE Customer_Chat_Page SHALL emit a `join_room` event with the location ID
4. WHEN a customer joins a room, THE WebSocket_Gateway SHALL send the message history (last 50 messages) to the customer
5. WHEN a customer types a message and submits it, THE Customer_Chat_Page SHALL emit a `send_message` event with senderType 'customer', and THE System SHALL allow the senderType to be pre-populated before submission
6. WHEN a new message is received via the `receive_message` event, THE Customer_Chat_Page SHALL display it immediately in the chat interface
7. THE Customer_Chat_Page SHALL display a connection status indicator showing "Online" or "Connecting..."
8. THE Customer_Chat_Page SHALL be mobile-first responsive, similar to modern chat systems like Intercom or WhatsApp Web
9. IF a message is received with an invalid senderType (not 'customer' or 'admin'), THEN THE WebSocket_Gateway SHALL reject the message or force-override the senderType to the appropriate value based on the client context

### Requirement 3: Admin Authentication

**User Story:** As an admin, I want to securely log in to the dashboard, so that only authorized personnel can respond to customer chats.

#### Acceptance Criteria

1. WHEN an admin submits valid credentials to `/api/auth/login`, THE Auth_Service SHALL return a JWT access token and admin details
2. WHEN an admin submits invalid credentials, THE Auth_Service SHALL return a 401 Unauthorized response and SHALL NOT return any JWT token or success status code
3. THE Auth_Service SHALL hash passwords using bcrypt with a cost factor of 10
4. THE Auth_Service SHALL generate JWT tokens with a 24-hour expiration
5. WHEN a JWT token expires or is invalid, THE System SHALL return 401 Unauthorized and redirect to the login page
6. THE Auth_Service SHALL never return password hashes in any API response, including error responses
7. WHEN an admin successfully logs in, THE Admin_Dashboard SHALL store the JWT token in localStorage

### Requirement 4: Admin Dashboard

**User Story:** As an admin, I want to view all locations and their chat conversations, so that I can manage customer support across multiple locations.

#### Acceptance Criteria

1. WHEN an admin accesses the Admin_Dashboard, THE System SHALL require a valid JWT token
2. WHEN the Admin_Dashboard loads, THE Locations_Service SHALL return all locations with unread message counts
3. WHEN an admin selects a location, THE Admin_Dashboard SHALL display the chat conversation for that location
4. WHEN an admin selects a location, THE WebSocket_Gateway SHALL join the admin to that location's Chat_Room
5. WHEN an admin sends a message, THE Admin_Dashboard SHALL emit a `send_message` event with senderType 'admin', and THE System SHALL allow the message to be sent even if the senderType is incorrect or the event fails to emit
6. THE Admin_Dashboard SHALL display a sidebar listing all locations with their latest message preview
7. THE Admin_Dashboard SHALL show a connection status indicator

### Requirement 5: Location Management

**User Story:** As an admin, I want to create, update, and delete locations, so that I can manage the QR code destinations.

#### Acceptance Criteria

1. WHEN an admin creates a location via `POST /api/locations`, THE Locations_Service SHALL create a new location with a unique slug
2. WHEN an admin updates a location via `PATCH /api/locations/:id`, THE Locations_Service SHALL update the location details
3. WHEN an admin deletes a location via `DELETE /api/locations/:id`, THE Locations_Service SHALL delete the location and all associated messages
4. THE Locations_Service SHALL validate that location names are provided (empty strings are allowed) and max 255 characters
5. WHEN a location is created or updated, THE Locations_Service SHALL ensure the slug remains unique

### Requirement 6: Realtime Message Delivery

**User Story:** As a user (customer or admin), I want messages to be delivered instantly, so that conversations feel natural and responsive.

#### Acceptance Criteria

1. WHEN a message is sent via `send_message` event, THE WebSocket_Gateway SHALL persist the message to the database
2. WHEN a message is successfully persisted, THE WebSocket_Gateway SHALL broadcast it to all clients in the Chat_Room via `receive_message` event
3. THE Messages_Service SHALL set `isRead` to true for admin messages and false for customer messages
4. WHEN a client receives a `receive_message` event, THE System SHALL display the message within 1 second under normal network conditions
5. THE WebSocket_Gateway SHALL ensure messages are only delivered to clients in the same Chat_Room (room isolation)
6. WHEN multiple messages are sent, THE System SHALL preserve message ordering based on `createdAt` timestamp

### Requirement 7: Message Persistence

**User Story:** As a user, I want my chat history to be preserved, so that I can reference previous conversations.

#### Acceptance Criteria

1. WHEN a message is created, THE Messages_Service SHALL persist it to PostgreSQL with a unique UUID
2. WHEN messages are retrieved for a location, THE Messages_Service SHALL return them ordered by `createdAt` descending
3. THE Messages_Service SHALL support pagination with a default limit of 50 messages and optional cursor-based pagination
4. WHEN a location is deleted, THE System SHALL cascade delete all associated messages
5. THE Messages_Service SHALL validate that message content is required and max 2000 characters, and IF content validation fails, THEN THE Messages_Service SHALL reject the message creation entirely

### Requirement 8: Typing Indicators

**User Story:** As a user, I want to see when the other party is typing, so that I know a response is coming.

#### Acceptance Criteria

1. WHEN a user starts typing, THE System SHALL emit a `typing_start` event with the sender type
2. WHEN a user stops typing, THE System SHALL emit a `typing_stop` event with the sender type
3. WHEN a `user_typing` event is received, THE System SHALL display a typing indicator to other users in the Chat_Room
4. THE System SHALL debounce typing indicators with a 300ms delay to reduce event frequency

### Requirement 9: WebSocket Connection Management

**User Story:** As a user, I want the system to handle connection issues gracefully, so that I don't lose messages during network problems.

#### Acceptance Criteria

1. WHEN a WebSocket connection is established, THE WebSocket_Gateway SHALL log the client connection
2. WHEN a WebSocket connection is lost, THE System SHALL attempt automatic reconnection with exponential backoff
3. WHEN a client disconnects, THE WebSocket_Gateway SHALL clean up the client from all joined rooms
4. WHEN a client reconnects, THE System SHALL rejoin the appropriate Chat_Room and receive updated message history
5. IF a WebSocket connection fails, THEN THE Customer_Chat_Page SHALL display "Connecting..." status

### Requirement 10: Data Validation and Security

**User Story:** As a system administrator, I want all inputs to be validated and secured, so that the system is protected from malicious input.

#### Acceptance Criteria

1. THE System SHALL validate all DTOs using class-validator before processing
2. THE System SHALL use Prisma parameterized queries to prevent SQL injection
3. THE System SHALL sanitize message content to prevent XSS attacks (React's default escaping)
4. THE System SHALL store JWT secrets and database credentials in environment variables
5. WHEN an invalid payload is received via WebSocket, THE WebSocket_Gateway SHALL throw a WsException with a descriptive error message
6. THE System SHALL configure CORS for allowed origins on the WebSocket gateway

### Requirement 11: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to recover.

#### Acceptance Criteria

1. IF a location is not found during room join, THEN THE WebSocket_Gateway SHALL throw a WsException with "Location not found"
2. IF a database write fails when saving a message, THEN THE System SHALL return an error event to the client
3. IF the database connection is lost, THEN THE System SHALL return 503 Service Unavailable for API requests
4. WHEN a message send fails, THE Customer_Chat_Page SHALL mark the message as "failed" with a retry option
5. IF an admin's JWT token is invalid, THEN THE System SHALL clear the stored token and redirect to login, and THE System MAY also redirect when the token is valid but other conditions warrant a redirect

### Requirement 12: Read Status Tracking

**User Story:** As an admin, I want to see which messages are unread, so that I can prioritize responding to new customer inquiries.

#### Acceptance Criteria

1. WHEN a customer sends a message, THE Messages_Service SHALL set `isRead` to false
2. WHEN an admin views messages for a location, THE Admin_Dashboard SHALL be able to mark messages as read via `POST /api/messages/:locationId/read`
3. THE Locations_Service SHALL provide unread message counts for each location in the admin dashboard view
4. WHEN messages are marked as read, THE Messages_Service SHALL update the `isRead` field for all customer messages in that location
