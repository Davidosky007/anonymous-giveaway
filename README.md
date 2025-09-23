# Anonymous Giveaway System

A simple web app for running anonymous giveaways. Users can enter without signing up, and admins can pick winners randomly. Built this to explore how to handle user anonymity while still preventing spam.

## Getting Started

You'll need Node.js (16+) and npm installed.

```bash
git clone <repository-url>
cd anonymous-giveaway
npm install
npm run dev
```

That's it! The app runs on `http://localhost:3000`.

### Admin Access
- Admin login: `http://localhost:3000/admin/login`
- Set up your admin password using the password hash generator:

```bash
node scripts/generate-password-hash.js yourSecurePassword123
```

Copy the generated hash to your `.env.local` file:

```bash
ADMIN_PASSWORD_HASH=$2b$10$your.generated.hash.here
```

### Database
Uses SQLite - the database file gets created automatically in `./database/giveaway.db` when you first run the app. No setup needed.

## Testing

```bash
npm test                    # Run all tests
npm test -- --coverage     # See coverage report
npm run test:watch         # Watch mode
```

I wrote 81 tests covering the main functionality:
- All API endpoints work correctly
- Components render properly
- Utility functions handle edge cases
- Database operations don't break

Coverage is pretty good for the core stuff (80-100% on most files).

## Why I Built It This Way

**Next.js for everything**: Keeps things simple - same framework for frontend and backend. Less moving parts to worry about.

**SQLite**: Fast, zero-config, and perfect for this scale. No need for a heavy database setup.

**Anonymous entries**: Each entry gets a UUID, but I track IPs to prevent spam. Users stay anonymous but can't flood the system.

**Production-ready security**: Implemented bcrypt password hashing, rate limiting (prevents brute force attacks), input validation with Joi schemas, and comprehensive security headers including HTTPS enforcement and CORS protection.

**Simple auth**: Cookie-based sessions for admin access. No fancy JWT stuff needed for a single-admin demo.

## Security Features

This implementation includes production-ready security measures:

- **Password Security**: Admin passwords are hashed using bcrypt with salt rounds
- **Rate Limiting**: API endpoints protected against brute force attacks (5 auth attempts per 15 minutes, 50 public requests per 15 minutes)
- **Input Validation**: All API inputs validated using Joi schemas with proper error handling
- **Security Headers**: HTTPS enforcement, CORS protection, Content Security Policy, and HSTS headers
- **IP-based Entry Control**: Prevents duplicate entries while maintaining user anonymity
- **Session Management**: Secure cookie-based authentication with configurable expiration

## list of missing items i'd implement with more time

### 🎯 Core Features
- **Email notifications** - Winner notification system and entry confirmations
- **Edit/delete giveaways** - Admin can only create, not modify
- **Entry requirements** - No social media follows, email collection, etc.
- **Scheduled start/end times** - All giveaways are manual
- **Multiple winners per giveaway** - Only supports single winner
- **Real-time entry count updates** - Counts only update on page refresh
- **Winner contact system** - No way to reach winners after selection

### 🔧 Nice-to-Have Improvements
- **Analytics dashboard** - Entry statistics, engagement metrics
- **Social media sharing** - Built-in viral mechanics
- **Mobile app** - React Native companion
- **Multi-language support** - i18n for global giveaways
- **Advanced admin features** - User management, audit logs, backups
- **Giveaway templates** - Quick setup for common giveaway types

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind
- **Backend**: Next.js API routes
- **Database**: SQLite with better-sqlite3
- **Security**: bcrypt password hashing, express-rate-limit, Joi validation, security headers
- **Testing**: Jest + React Testing Library (81 tests, 100% pass rate)

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Database, auth, utilities, security middleware
├── pages/         # Next.js pages + API routes
├── styles/        # CSS
└── types/         # TypeScript definitions

__tests__/         # All test files (81 tests covering APIs, components, utilities)
database/          # SQLite files (auto-created)
scripts/           # Utility scripts (password hash generator)
```

## License

Built for demo purposes. Use however you want!
