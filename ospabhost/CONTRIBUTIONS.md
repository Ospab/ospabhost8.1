# 🤝 Contributing to Ospabhost 8.1

Thank you for considering contributing to **Ospabhost 8.1**! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Contact](#contact)

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the project
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting comments, personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations of the Code of Conduct can be reported to:
- **Email:** support@ospab.host
- **Telegram:** @ospab_support

All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Node.js (v24.x or higher)
node --version

# npm (v10.x or higher)
npm --version

# MySQL (8.0 or higher)
mysql --version

# Git
git --version
```

### Fork and Clone

1. **Fork the repository** on GitHub:
   - Click "Fork" button at https://github.com/Ospab/ospabhost8.1

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ospabhost8.1.git
   cd ospabhost8.1/ospabhost
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/Ospab/ospabhost8.1.git
   git remote -v
   ```

### Setup Development Environment

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your local configuration
nano .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env
nano .env

# Start development server
npm run dev
```

#### Database Setup

```sql
-- Create database
CREATE DATABASE ospab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'ospab_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ospab.* TO 'ospab_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔄 Development Workflow

### Branch Strategy

We follow **Git Flow** workflow:

```
main                 # Production-ready code
  ├── develop        # Development branch
  │   ├── feature/   # New features
  │   ├── fix/       # Bug fixes
  │   ├── refactor/  # Code refactoring
  │   └── docs/      # Documentation updates
  └── hotfix/        # Critical production fixes
```

### Creating a Feature Branch

```bash
# Ensure you're on latest develop
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/add-payment-gateway
git checkout -b fix/proxmox-connection
git checkout -b docs/api-examples
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/panel-websocket` |
| Bug Fix | `fix/<description>` | `fix/sso-timestamp-validation` |
| Hotfix | `hotfix/<description>` | `hotfix/critical-security-patch` |
| Refactor | `refactor/<description>` | `refactor/prisma-queries` |
| Docs | `docs/<description>` | `docs/sso-integration` |
| Test | `test/<description>` | `test/panel-api-integration` |

### Staying Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream changes into your branch
git checkout feature/your-feature
git merge upstream/develop

# Or rebase (preferred for cleaner history)
git rebase upstream/develop
```

---

## 📝 Coding Standards

### TypeScript Style Guide

#### File Structure

```typescript
// 1. Imports (external first, then internal)
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../utils/validation';

// 2. Types/Interfaces
interface CreateServerRequest {
  tariffId: number;
  osId: number;
}

// 3. Constants
const PROXMOX_TIMEOUT = 30000;
const MAX_SERVERS_PER_USER = 10;

// 4. Main code
export class ServerService {
  // Implementation
}

// 5. Helper functions
function generateServerName(userId: number): string {
  return `server-${userId}-${Date.now()}`;
}

// 6. Exports
export default ServerService;
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class ServerService {}
class ProxmoxApi {}

// Interfaces: PascalCase with "I" prefix (optional)
interface IUser {}
interface ServerConfig {}

// Functions: camelCase
function createServer() {}
function validateEmail(email: string): boolean {}

// Variables: camelCase
const userCount = 42;
let isActive = true;

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.ospab.host';
const MAX_RETRY_ATTEMPTS = 3;

// Private properties: prefix with underscore (optional)
class Example {
  private _privateField: string;
  public publicField: string;
}

// Files: kebab-case
// server-service.ts
// proxmox-api.ts
// auth-middleware.ts
```

#### Code Style

```typescript
// ✅ GOOD: Explicit types
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// ❌ BAD: Implicit any
function calculateTotal(price, quantity) {
  return price * quantity;
}

// ✅ GOOD: Async/await
async function getUser(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

// ❌ BAD: Promise chaining
function getUser(id: number) {
  return prisma.user.findUnique({ where: { id } })
    .then(user => user);
}

// ✅ GOOD: Error handling
async function createServer(userId: number): Promise<Server> {
  try {
    const server = await prisma.server.create({
      data: { userId, name: generateServerName(userId) }
    });
    return server;
  } catch (error) {
    console.error('Failed to create server:', error);
    throw new Error('Server creation failed');
  }
}

// ✅ GOOD: Destructuring
const { id, username, email } = user;

// ❌ BAD: Multiple property access
const id = user.id;
const username = user.username;
const email = user.email;

// ✅ GOOD: Optional chaining
const serverName = user?.servers?.[0]?.name ?? 'N/A';

// ❌ BAD: Nested checks
const serverName = user && user.servers && user.servers[0] 
  ? user.servers[0].name 
  : 'N/A';
```

### React/Frontend Standards

```tsx
// ✅ GOOD: Functional components with TypeScript
interface UserCardProps {
  user: User;
  onEdit: (id: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const handleEdit = () => {
    onEdit(user.id);
  };

  return (
    <div className="user-card">
      <h3>{user.username}</h3>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};

// ✅ GOOD: Custom hooks
function useServerData(userId: number) {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServers() {
      try {
        const response = await api.get(`/users/${userId}/servers`);
        setServers(response.data);
      } catch (error) {
        console.error('Failed to fetch servers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchServers();
  }, [userId]);

  return { servers, loading };
}

// ✅ GOOD: Tailwind CSS classes organized
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-white hover:bg-gray-50
  border border-gray-200 rounded-lg
  shadow-sm
">
  Content
</div>
```

### Prisma Schema Conventions

```prisma
// ✅ GOOD: Explicit relations
model User {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  email     String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  servers   Server[]  @relation("UserServers")
  tickets   Ticket[]  @relation("UserTickets")
  
  @@map("users")
}

model Server {
  id       Int      @id @default(autoincrement())
  name     String
  userId   Int
  user     User     @relation("UserServers", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("servers")
}
```

---

## 💬 Commit Guidelines

### Commit Message Format

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(api): Add Panel API endpoints` |
| `fix` | Bug fix | `fix(sso): Fix timestamp validation` |
| `docs` | Documentation | `docs(readme): Update setup instructions` |
| `style` | Code style (formatting) | `style(backend): Format with Prettier` |
| `refactor` | Code refactoring | `refactor(prisma): Optimize user queries` |
| `test` | Add/update tests | `test(panel-api): Add integration tests` |
| `chore` | Maintenance | `chore(deps): Update dependencies` |
| `perf` | Performance improvement | `perf(proxmox): Cache API responses` |
| `ci` | CI/CD changes | `ci(github): Add deployment workflow` |
| `build` | Build system changes | `build(vite): Update Vite config` |
| `revert` | Revert previous commit | `revert: Revert "feat: Add feature X"` |

#### Scope (Optional)

Scope indicates which part of codebase is affected:

- `backend` - Backend code
- `frontend` - Frontend code
- `api` - API endpoints
- `auth` - Authentication
- `sso` - Single Sign-On
- `panel-api` - Panel API
- `proxmox` - Proxmox integration
- `prisma` - Database/ORM
- `docs` - Documentation

#### Examples

```bash
# Good commits
git commit -m "feat(panel-api): Add VPS status endpoint"
git commit -m "fix(sso): Fix HMAC signature validation"
git commit -m "docs(api): Add Panel API usage examples"
git commit -m "refactor(backend): Extract Proxmox logic to service"

# Bad commits (too vague)
git commit -m "fix stuff"
git commit -m "update code"
git commit -m "changes"
```

#### Multi-line Commits

For complex changes, add body and footer:

```bash
git commit -m "feat(panel-api): Add VPS monitoring endpoint

- Implement real-time CPU, RAM, disk stats
- Integrate with Proxmox API
- Add fallback to zeros if Proxmox unavailable
- Add caching layer for performance

Closes #42
Refs #38"
```

### Commit Best Practices

1. **Atomic commits:** One logical change per commit
2. **Present tense:** "Add feature" not "Added feature"
3. **Imperative mood:** "Fix bug" not "Fixes bug"
4. **Reference issues:** Use `Closes #123` or `Refs #456`
5. **Keep subject < 72 chars**
6. **Use body for "why" not "what"**

---

## 🔀 Pull Request Process

### Before Opening PR

1. **Ensure all tests pass:**
   ```bash
   # Backend
   cd backend
   npm run build
   npm test

   # Frontend
   cd frontend
   npm run build
   npm run lint
   ```

2. **Update documentation:**
   - If API changed, update `PANEL_API_DOCUMENTATION.md`
   - If SSO changed, update `SSO_FINAL_SETUP.md`
   - Update `README.md` if major feature added

3. **Check code quality:**
   ```bash
   # Backend: TypeScript check
   cd backend
   npx tsc --noEmit

   # Frontend: ESLint
   cd frontend
   npm run lint
   ```

4. **Rebase on latest develop:**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

### Opening Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub:**
   - Go to https://github.com/Ospab/ospabhost8.1/pulls
   - Click "New Pull Request"
   - Select your fork and branch
   - Target: `develop` branch (not `main`)

3. **Fill PR template:**

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work)
- [ ] Documentation update

## How Has This Been Tested?
Describe tests performed:
- [ ] Manual testing
- [ ] Unit tests
- [ ] Integration tests

## Checklist
- [ ] My code follows project style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix works
- [ ] New and existing tests pass locally

## Screenshots (if applicable)
Add screenshots of UI changes.

## Related Issues
Closes #123
Refs #456
```

### PR Review Process

1. **Automated checks:**
   - CI/CD pipeline runs tests
   - TypeScript compilation
   - ESLint checks

2. **Code review:**
   - At least 1 approval required
   - Address reviewer feedback
   - Update PR as needed

3. **Merge:**
   - Squash commits if many small commits
   - Merge to `develop`
   - Delete feature branch

---

## 🧪 Testing Requirements

### Backend Testing

```typescript
// Example: Unit test with Jest
import { generateSSOLink } from './sso.service';

describe('SSO Service', () => {
  test('generateSSOLink includes userId', () => {
    const link = generateSSOLink(1, 'john', 'john@example.com', 'pass123');
    expect(link).toContain('userId=1');
    expect(link).toContain('username=john');
    expect(link).toContain('email=john@example.com');
  });

  test('generateSSOLink creates valid HMAC signature', () => {
    const link = generateSSOLink(1, 'john', 'john@example.com', 'pass123');
    const url = new URL(link);
    const signature = url.searchParams.get('signature');
    expect(signature).toHaveLength(64); // SHA256 hex
  });
});
```

### Integration Testing

```typescript
// Example: API endpoint test with Supertest
import request from 'supertest';
import app from '../src/index';

describe('Panel API', () => {
  test('GET /api/panel/health returns success', async () => {
    const response = await request(app).get('/api/panel/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  test('GET /api/panel/users requires API key', async () => {
    const response = await request(app).get('/api/panel/users');
    expect(response.status).toBe(401);
  });

  test('GET /api/panel/users with API key returns users', async () => {
    const response = await request(app)
      .get('/api/panel/users')
      .set('X-API-Key', process.env.PANEL_API_KEY);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with JWT
- [ ] Login with OAuth2 (Google/GitHub/Yandex)
- [ ] Order VPS
- [ ] View server list
- [ ] Open VPS terminal
- [ ] Test SSO to panel
- [ ] Upload payment check
- [ ] Create support ticket

---

## 📖 Documentation

### When to Update Documentation

- **New API endpoint:** Update `PANEL_API_DOCUMENTATION.md`
- **Changed endpoint:** Update examples in `PANEL_API_USAGE_EXAMPLES.md`
- **New feature:** Update `README.md`
- **Deployment change:** Update `DEPLOY_BACKEND.md` or `DEPLOY_NGINX_FIX.md`
- **SSO change:** Update `SSO_FINAL_SETUP.md`
- **Database schema:** Update Prisma comments

### Documentation Standards

```typescript
// ✅ GOOD: JSDoc comments
/**
 * Creates a new VPS server for user.
 * 
 * @param userId - The ID of the user
 * @param tariffId - The tariff plan ID
 * @param osId - The operating system ID
 * @returns Promise resolving to created Server
 * @throws {Error} If Proxmox API fails
 * 
 * @example
 * const server = await createServer(1, 2, 3);
 * console.log(server.ipAddress);
 */
async function createServer(
  userId: number,
  tariffId: number,
  osId: number
): Promise<Server> {
  // Implementation
}
```

---

## 📞 Contact

### Questions?

- **Email:** support@ospab.host
- **Telegram:** @ospab_support
- **GitHub Issues:** https://github.com/Ospab/ospabhost8.1/issues

### Reporting Bugs

1. **Check existing issues:** Search https://github.com/Ospab/ospabhost8.1/issues
2. **Create detailed report:**
   ```markdown
   ## Bug Description
   Clear description of the bug.

   ## Steps to Reproduce
   1. Go to '...'
   2. Click on '...'
   3. See error

   ## Expected Behavior
   What should happen.

   ## Actual Behavior
   What actually happens.

   ## Environment
   - OS: Windows 11
   - Node.js: v24.10.0
   - Browser: Chrome 120

   ## Screenshots
   Add screenshots if applicable.

   ## Additional Context
   Any other relevant information.
   ```

### Feature Requests

1. **Check roadmap:** See `README.md` roadmap section
2. **Open discussion:** https://github.com/Ospab/ospabhost8.1/discussions
3. **Describe use case:** Why is this feature needed?

---

## 🎉 Thank You!

Thank you for contributing to **Ospabhost 8.1**! Every contribution, no matter how small, helps improve the project.

**Contributors Hall of Fame:**
- [@Ospab](https://github.com/Ospab) - Lead Developer
- *Your name here?* 🌟

---

**Happy Coding! 🚀**

If you have questions about contributing, feel free to reach out via support@ospab.host.
