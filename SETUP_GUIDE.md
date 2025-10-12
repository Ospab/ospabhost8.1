# Server Management System - Setup Guide

## Overview

This implementation adds a complete server management system to ospabhost8.1 with real-time monitoring, WebSocket updates, snapshot management, and automated alerting.

## New Features

### Backend Features

1. **WebSocket Server** (`backend/src/websocket/serverUpdates.ts`)
   - Real-time server status updates every 30 seconds
   - JWT-based authentication
   - Subscribe/unsubscribe to specific server updates
   - Automatic metrics collection and storage

2. **Monitoring Service** (`backend/src/modules/monitoring/monitoring.service.ts`)
   - Automatic monitoring of CPU, RAM, and disk usage
   - Configurable alert rules
   - Email notifications for threshold breaches
   - Automatic cleanup of old metrics (7-day retention)

3. **Snapshot Management**
   - Create server snapshots
   - List all snapshots
   - Restore from snapshots
   - Delete old snapshots

4. **Extended API Endpoints**
   - `GET /api/server/my-servers` - Get user's servers
   - `POST /api/server/:id/control` - Control server (start/stop/restart)
   - `GET /api/server/:id/console` - Get console URL
   - `POST /api/server/:id/snapshot` - Create snapshot
   - `GET /api/server/:id/snapshots` - List snapshots
   - `POST /api/server/:id/snapshot/restore` - Restore snapshot
   - `DELETE /api/server/:id/snapshot/:snapshotId` - Delete snapshot
   - `POST /api/server/:id/change-password` - Change root password

5. **Extended Database Schema**
   - `ServerMetrics` - Historical server metrics
   - `ServerSnapshot` - Snapshot records
   - `ServerAction` - Action logging
   - `AlertRule` - Alert configuration
   - `AlertNotification` - Alert history

### Frontend Features

1. **ServerManagement Dashboard** (`frontend/src/pages/dashboard/ServerManagement.tsx`)
   - Modern card-based interface
   - Real-time statistics display (CPU, RAM, Disk, Uptime)
   - Server control buttons (Start, Stop, Restart)
   - Console access
   - Password management
   - Snapshot creation
   - Safe server deletion with confirmation
   - WebSocket integration for live updates

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd ospabhost/backend
npm install
```

#### Configure Environment
Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="mysql://user:password@localhost:3306/ospabhost"
JWT_SECRET="your_super_secret_key"
PROXMOX_API_URL="https://your-proxmox-host:8006/api2/json"
PROXMOX_TOKEN_ID="user@pam!token-id"
PROXMOX_TOKEN_SECRET="your-token-secret"
PROXMOX_NODE="proxmox"
PROXMOX_WEB_URL="https://your-proxmox-host:8006"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
PORT="5000"
```

#### Run Database Migration
```bash
cd ospabhost/backend
npx prisma migrate dev --name add_monitoring_and_snapshots
```

#### Generate Prisma Client
```bash
npx prisma generate
```

#### Build and Start Backend
```bash
npm run build
npm start
```

Or for development:
```bash
npm run dev
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd ospabhost/frontend
npm install
```

#### Build and Start Frontend
```bash
npm run build
npm run preview
```

Or for development:
```bash
npm run dev
```

## Usage Guide

### Accessing Server Management

1. Log in to your account
2. Navigate to **Dashboard** → **Управление** (Management)
3. You'll see all your servers in a card-based layout

### Managing Servers

#### Start/Stop/Restart
- Use the colored buttons at the top of each server card
- Green (Start), Red (Stop), Yellow (Restart)
- Buttons are disabled when action is in progress or not applicable

#### View Real-Time Stats
- CPU, RAM, and Disk usage update automatically every 30 seconds
- Uptime is displayed for running servers

#### Console Access
- Click **Console** button to open noVNC console in new window
- Provides direct terminal access to your server

#### Change Password
- Click **Password** button
- New root password is generated and displayed
- **Important**: Copy the password immediately, it won't be shown again

#### Create Snapshot
- Click **Snapshot** button
- Enter optional snapshot name
- Snapshot is created for backup/restore

#### Delete Server
- Click **Delete** button
- Confirm deletion in modal dialog
- Server is permanently removed from Proxmox

### WebSocket Connection

The frontend automatically connects to WebSocket server on login:
- Subscribe to server updates
- Receive real-time metric updates
- Status changes reflected immediately

### Monitoring and Alerts

Default alert rules are created automatically:
- CPU usage > 90%
- Memory usage > 90%
- Disk usage > 90%

When thresholds are exceeded:
- Alert is logged in database
- Email notification sent (if SMTP configured)
- Maximum one alert per hour per server

## Architecture

### WebSocket Flow
```
Frontend → Connect with JWT → Backend WebSocket Server
         ← Authentication
Frontend → Subscribe to server:123
         ← Initial server data + stats
         ← Periodic updates every 30s
```

### Monitoring Flow
```
Monitoring Service (every 30s)
  → Check all running servers
  → Get stats from Proxmox
  → Update database
  → Save metrics history
  → Check alert rules
  → Send notifications if needed
  → Clean up old metrics (7+ days)
```

### API Authentication
All API endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

### New Tables

**ServerMetrics**
- `id` - Primary key
- `serverId` - Foreign key to Server
- `cpu`, `memory`, `disk` - Usage percentages
- `networkIn`, `networkOut` - Network traffic
- `timestamp` - Metric capture time

**ServerSnapshot**
- `id` - Primary key
- `serverId` - Foreign key to Server
- `name` - Snapshot name
- `description` - Optional description
- `snapname` - Proxmox snapshot identifier
- `createdAt` - Creation timestamp

**ServerAction**
- `id` - Primary key
- `serverId` - Foreign key to Server
- `action` - Action type (start, stop, restart, etc.)
- `userId` - User who performed action
- `status` - Action status (pending, success, failed)
- `result` - Action result details
- `createdAt` - Action timestamp

**AlertRule**
- `id` - Primary key
- `name` - Rule name
- `metric` - Metric to monitor (cpu, memory, disk)
- `threshold` - Threshold value
- `condition` - Condition type (greater_than, less_than)
- `enabled` - Rule enabled status

**AlertNotification**
- `id` - Primary key
- `serverId` - Foreign key to Server
- `ruleId` - Foreign key to AlertRule
- `message` - Alert message
- `sent` - Email sent status
- `sentAt` - Email sent timestamp
- `createdAt` - Alert creation timestamp

## Troubleshooting

### WebSocket Connection Issues
- Check that backend server is running on correct port
- Verify JWT token is valid
- Check browser console for connection errors
- Ensure CORS is properly configured

### Server Stats Not Updating
- Verify Proxmox API credentials in .env
- Check backend logs for Proxmox connection errors
- Ensure servers have valid proxmoxId

### Email Alerts Not Sending
- Verify SMTP configuration in .env
- Check if SMTP credentials are valid
- Review backend logs for email errors
- Test SMTP connection separately

### Database Migration Errors
- Ensure MySQL is running and accessible
- Verify DATABASE_URL is correct
- Check database user has proper permissions
- Try running migration with `--create-only` first to review SQL

## Development

### Running Tests
```bash
# Backend
cd ospabhost/backend
npm test

# Frontend
cd ospabhost/frontend
npm test
```

### Linting
```bash
# Frontend
cd ospabhost/frontend
npm run lint
```

### Building for Production
```bash
# Backend
cd ospabhost/backend
npm run build

# Frontend
cd ospabhost/frontend
npm run build
```

## Security Notes

1. **JWT Tokens**: Keep JWT_SECRET secure and unique
2. **Proxmox API**: Use API tokens with minimal required permissions
3. **SMTP**: Use app-specific passwords for email accounts
4. **Database**: Use strong database passwords
5. **HTTPS**: Always use HTTPS in production for Proxmox API
6. **WebSocket**: WebSocket connections are authenticated via JWT

## Performance Considerations

1. **Metrics Storage**: Old metrics are auto-deleted after 7 days
2. **WebSocket Polling**: Stats update every 30 seconds (configurable)
3. **Alert Throttling**: Maximum one alert per hour per server
4. **Database Indexes**: Added indexes on frequently queried columns

## API Rate Limits

- Proxmox API calls are optimized to minimize load
- WebSocket updates are batched where possible
- Consider Proxmox API rate limits for large deployments

## Next Steps

1. Set up production database
2. Configure Proxmox API access
3. Set up SMTP for email alerts (optional)
4. Run migrations
5. Test with development servers
6. Deploy to production

## Support

For issues or questions:
1. Check backend logs: `ospabhost/backend/logs/`
2. Check Proxmox logs
3. Review database for error details
4. Check GitHub issues

## License

[Your License Here]
