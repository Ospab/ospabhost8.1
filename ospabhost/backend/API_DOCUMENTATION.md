# API Documentation - Server Management

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require Bearer token authentication via the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Server Management Endpoints

### 1. Get All Servers
**GET** `/server`

Returns a list of all servers for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "tariffId": 2,
    "osId": 1,
    "status": "running",
    "proxmoxId": 100,
    "ipAddress": "10.0.0.5",
    "rootPassword": "encrypted_password",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "os": {
      "id": 1,
      "name": "Ubuntu 22.04",
      "type": "linux"
    },
    "tariff": {
      "id": 2,
      "name": "Базовый",
      "price": 300
    }
  }
]
```

---

### 2. Get Server Details
**GET** `/server/:id`

Returns detailed information about a specific server.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "id": 1,
  "status": "running",
  "proxmoxId": 100,
  "ipAddress": "10.0.0.5",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "os": { "name": "Ubuntu 22.04", "type": "linux" },
  "tariff": { "name": "Базовый", "price": 300 }
}
```

---

### 3. Get Server Status and Statistics
**GET** `/server/:id/status`

Returns real-time status and resource usage statistics.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "id": 1,
  "status": "running",
  "stats": {
    "status": "success",
    "data": {
      "vmid": 100,
      "status": "running",
      "uptime": 3600,
      "cpu": 0.15,
      "memory": {
        "used": 536870912,
        "max": 2147483648,
        "usage": 25.0
      },
      "disk": {
        "used": 5368709120,
        "max": 21474836480,
        "usage": 25.0
      },
      "network": {
        "in": 104857600,
        "out": 52428800
      },
      "rrdData": [...]
    }
  }
}
```

---

### 4. Create New Server
**POST** `/server/create`

Creates a new LXC container.

**Request Body:**
```json
{
  "osId": 1,
  "tariffId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "status": "creating",
  "proxmoxId": 100,
  "ipAddress": null,
  "rootPassword": "generated_password"
}
```

---

### 5. Start Server
**POST** `/server/:id/start`

Starts a stopped server.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "status": "success",
  "action": "start",
  "taskId": "UPID:..."
}
```

---

### 6. Stop Server
**POST** `/server/:id/stop`

Stops a running server.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "status": "success",
  "action": "stop",
  "taskId": "UPID:..."
}
```

---

### 7. Restart Server
**POST** `/server/:id/restart`

Restarts a server.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "status": "success",
  "action": "restart",
  "taskId": "UPID:..."
}
```

---

### 8. Delete Server
**DELETE** `/server/:id`

Permanently deletes a server and its container.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "status": "deleted"
}
```

---

### 9. Change Root Password
**POST** `/server/:id/password`

Generates and sets a new root password for the server.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "status": "success",
  "password": "new_generated_password"
}
```

---

### 10. Resize Server Configuration
**PUT** `/server/:id/resize`

Changes server resources (CPU, RAM, disk).

**Parameters:**
- `id` (path) - Server ID

**Request Body:**
```json
{
  "cores": 4,
  "memory": 4096,
  "disk": 80
}
```
Note: All fields are optional. Only specified fields will be updated.

**Response:**
```json
{
  "status": "success",
  "data": "..."
}
```

---

### 11. Create Snapshot
**POST** `/server/:id/snapshots`

Creates a snapshot of the server's current state.

**Parameters:**
- `id` (path) - Server ID

**Request Body:**
```json
{
  "snapname": "backup-2024-01-01",
  "description": "Before major update"
}
```

**Response:**
```json
{
  "status": "success",
  "taskId": "UPID:...",
  "snapname": "backup-2024-01-01"
}
```

---

### 12. List Snapshots
**GET** `/server/:id/snapshots`

Returns a list of all snapshots for the server.

**Parameters:**
- `id` (path) - Server ID

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "name": "backup-2024-01-01",
      "description": "Before major update",
      "snaptime": 1704067200
    }
  ]
}
```

---

### 13. Rollback Snapshot
**POST** `/server/:id/snapshots/rollback`

Restores the server to a previous snapshot state.

**Parameters:**
- `id` (path) - Server ID

**Request Body:**
```json
{
  "snapname": "backup-2024-01-01"
}
```

**Response:**
```json
{
  "status": "success",
  "taskId": "UPID:..."
}
```

---

### 14. Delete Snapshot
**DELETE** `/server/:id/snapshots`

Deletes a specific snapshot.

**Parameters:**
- `id` (path) - Server ID

**Request Body:**
```json
{
  "snapname": "backup-2024-01-01"
}
```

**Response:**
```json
{
  "status": "success",
  "taskId": "UPID:..."
}
```

---

### 15. Get Console Access
**POST** `/server/console`

Returns a URL for accessing the server console via noVNC.

**Request Body:**
```json
{
  "vmid": 100
}
```

**Response:**
```json
{
  "status": "success",
  "url": "https://proxmox.example.com/?console=lxc&vmid=100&node=proxmox&ticket=..."
}
```

---

## WebSocket Events

### Connection
Connect to `http://localhost:5000` with Socket.IO client.

### Subscribe to Server Updates
```javascript
socket.emit('subscribe-server', serverId);
```

### Unsubscribe from Server Updates
```javascript
socket.emit('unsubscribe-server', serverId);
```

### Receive Server Statistics
```javascript
socket.on('server-stats', (data) => {
  console.log(data);
  // {
  //   serverId: 1,
  //   stats: { ... }
  // }
});
```

### Receive Server Alerts
```javascript
socket.on('server-alerts', (data) => {
  console.log(data);
  // {
  //   serverId: 1,
  //   alerts: [
  //     { type: 'cpu', message: 'CPU usage is at 95%', level: 'warning' }
  //   ]
  // }
});
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Email Notifications

The system automatically sends email notifications for:
- Server creation
- Resource usage alerts (CPU/Memory/Disk > 90%)
- Payment reminders
- Support ticket responses

Email notifications require SMTP configuration in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Monitoring Service

The monitoring service runs automatically and:
- Checks all servers every 30 seconds
- Updates database with current metrics
- Broadcasts real-time updates via WebSocket
- Sends alerts when resource usage exceeds 90%
- Sends email notifications for critical alerts

---

## Best Practices

1. **Resource Management**: Always check server status before performing actions (start/stop/restart)
2. **Snapshots**: Create snapshots before major changes or updates
3. **Monitoring**: Subscribe to WebSocket updates for real-time monitoring
4. **Error Handling**: Always handle potential errors from API calls
5. **Authentication**: Store and refresh access tokens securely
6. **Rate Limiting**: Avoid excessive API calls; use WebSocket for real-time data

---

## Example Usage

### JavaScript/TypeScript Example
```typescript
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('access_token');

// Get server status
const getServerStatus = async (serverId: number) => {
  const response = await axios.get(
    `${API_URL}/server/${serverId}/status`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Subscribe to real-time updates
const socket = io('http://localhost:5000');
socket.emit('subscribe-server', 1);
socket.on('server-stats', (data) => {
  console.log('Real-time stats:', data);
});

// Create snapshot
const createSnapshot = async (serverId: number) => {
  const response = await axios.post(
    `${API_URL}/server/${serverId}/snapshots`,
    {
      snapname: `backup-${Date.now()}`,
      description: 'Automatic backup'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
```

---

Last updated: October 2024
Version: 8.1
