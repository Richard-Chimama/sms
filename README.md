# School Management System (SMS)

A modern, responsive web application for managing school operations, built with Next.js 13, TypeScript, and Tailwind CSS.

## Features

### For Administrators

- **Dashboard Overview**

  - Quick access to key metrics and statistics
  - Recent activities and notifications
  - System status overview
- **Student Management**

  - Add, edit, and remove student records
  - View student details and history
  - Manage student enrollments
- **Teacher Management**

  - Add, edit, and remove teacher records
  - Assign teachers to classes
  - View teacher schedules and workload
- **Class Management**

  - Create and manage class sections
  - Assign teachers to classes
  - Track class schedules and attendance
- **Fees Management**

  - Track student fees and payments
  - Generate fee reports
  - Manage payment schedules

### For Teachers

- **Class Management**

  - View assigned classes
  - Track attendance
  - Manage class schedules
- **Assignment Management**

  - Create and assign homework
  - Track submission status
  - Grade assignments
- **Exam Management**

  - Create and schedule exams
  - Set up question papers
  - Grade student submissions
  - Generate performance reports

### For Students

- **Class Access**

  - View class schedule
  - Access class materials
  - Track attendance
- **Exam Portal**

  - View upcoming exams
  - Take online exams
  - View exam results and feedback

### Common Features

- **Notice Board**

  - View and post announcements
  - Filter notices by category
  - Real-time updates
- **Chat System**

  - Direct messaging between users
  - Group chats for classes
  - File sharing capabilities
- **Profile Management**

  - Update personal information
  - Change password
  - View activity history

## Technical Stack

- **Frontend**

  - Next.js 13 (App Router)
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - Zustand (State Management)
- **Backend**

  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database
  - NextAuth.js (Authentication)
- **Features**

  - Server-side Rendering
  - Responsive Design
  - Dark Mode Support
  - Real-time Updates
  - Role-based Access Control

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/school-management-system.git
   cd school-management-system
   ```
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with your database credentials and other required variables.
4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js 13 app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── forms/            # Form components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email rich.chime@outlook.com or create an issue in the repository.

## Environment Configuration

The application supports different environments (development and production) with separate configurations.

### Environment Files

1. **Development** (`.env.development`)
   - Used during local development
   - Contains development-specific settings
   - Database connection to local PostgreSQL instance

2. **Production** (`.env.production`)
   - Used in production environment
   - Contains production-specific settings
   - Secure database connection
   - HTTPS URLs

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Authentication callback URL
- `NEXTAUTH_SECRET`: Secret key for authentication
- `API_URL`: Base URL for API endpoints

Optional environment variables:
- `ENABLE_LOGGING`: Enable/disable logging
- `ENABLE_DEBUG`: Enable/disable debug features

### Running in Different Environments

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm run start
```

### Database Management

Generate Prisma client:
```bash
npm run db:generate
```

Push database schema:
```bash
npm run db:push
```

Open Prisma Studio:
```bash
npm run db:studio
```

Seed database:
```bash
npm run db:seed
```
