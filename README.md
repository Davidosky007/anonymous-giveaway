# Anonymous Giveaway System

A simple web app for running anonymous giveaways. Users can enter without signing up, and admins can pick winners randomly. Built this to explore how to handle user anonymity while still preventing spam.

## Getting Started

### Prerequisites
- Node.js (16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- Git (optional, for cloning)

### Step-by-Step Setup

1. **Get the code**
   ```bash
   git clone https://github.com/Davidosky007/anonymous-giveaway.git
   cd anonymous-giveaway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up admin access**
   - Copy the `.env.example` file to create your local environment:
   ```bash
   cp .env.example .env.local
   ```
   
   - Update `.env.local` with your desired admin password:
   ```bash
   ADMIN_PASSWORD=yourPasswordHere
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - **Public app**: `http://localhost:3000`
   - **Admin login**: `http://localhost:3000/admin/login`
   - Use the password you generated in step 3

That's it! The database gets created automatically when you first run the app.

### Quick Start (Default Setup)
If you just want to test it quickly with default settings:

```bash
git clone https://github.com/Davidosky007/anonymous-giveaway.git
cd anonymous-giveaway
npm install
cp .env.example .env.local
# Edit .env.local to set your admin password
npm run dev
```

Then visit `http://localhost:3000` and use "admin" as your password.

## Troubleshooting

### "Invalid password" error when logging in
- Make sure you've created a `.env.local` file with the correct `ADMIN_PASSWORD`
- Check that your password in `.env.local` matches what you're typing
- Restart the dev server: `npm run dev`

### Port 3000 already in use
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

### Database errors
- Delete the `database/` folder and restart - it will recreate automatically
- Make sure you have write permissions in the project directory

### npm install fails
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure you're using Node.js 16 or higher: `node --version`

### Database
Uses SQLite - the database file gets created automatically in `./database/giveaway.db` when you first run the app. No setup needed.

## Using the App

### For Users (Public)
1. Visit `http://localhost:3000`
2. Browse available giveaways
3. Click "Enter Giveaway" on any active giveaway
4. Get a unique anonymous ID as confirmation
5. Wait for the admin to pick winners!

### For Admins
1. Login at `http://localhost:3000/admin/login`
2. **Create giveaways**: Add title, description, set as active
3. **View entries**: See how many people entered (anonymously)
4. **Pick winners**: Randomly select winners from entries
5. **Manage giveaways**: Mark as completed when done

**Note**: Currently you can only create and manage giveaways. Editing/deleting existing giveaways isn't implemented yet.

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

**Production-ready security**: Implemented rate limiting (prevents brute force attacks), input validation with Joi schemas, and comprehensive security headers including HTTPS enforcement and CORS protection.

**Simple auth**: Plain text password comparison for simplicity. Cookie-based sessions for admin access.

## Security Features

This implementation includes production-ready security measures:

- **Simple Password Auth**: Plain text password comparison for easy setup and debugging
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
- **Security**: express-rate-limit, Joi validation, security headers
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
```

## License

Built for demo purposes. Use however you want!
