# Task Management System

A comprehensive task management application with role-based access and analytics features built with Next.js, MongoDB, and Shadcn UI.

## Features

- Role-based access control (Admin, Team Lead, Team Member)
- Task management with drag-and-drop interface
- Project management
- Team collaboration
- Real-time analytics and reporting
- Dark/Light mode support
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **State Management**: React Query
- **Data Visualization**: Recharts
- **Drag and Drop**: @hello-pangea/dnd

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── middleware/           # Custom middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
