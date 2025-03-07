# Laundry Management System

A modern web application for managing laundry services, built with Next.js 14 and featuring a responsive dashboard for both administrators and customers.

## Features

- **User Authentication**
  - Secure login and signup functionality
  - Role-based access control (Admin/User)
  - JWT-based authentication

- **Customer Features**
  - Order tracking
  - Payment history
  - Profile management
  - Real-time order status updates

- **Admin Dashboard**
  - Revenue analytics
  - Order management
  - User management
  - Service configuration
  - Performance reports

- **Payment Integration**
  - Secure payments via Stripe
  - Payment history tracking
  - Automated payment status updates

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Hooks
- **Authentication**: JWT (jose)
- **Database**: MongoDB with Mongoose
- **Payment Processing**: Stripe
- **Charts**: Recharts
- **UI Components**: Radix UI

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_FRONTEND_URL=
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                 # App router pages
├── components/          # Reusable components
├── lib/                 # Utility functions
├── middleware/          # Authentication middleware
├── models/             # MongoDB models
└── providers/          # Context providers
```

## Authentication

The application uses JWT-based authentication with role-based access control:
- Public routes: `/`, `/login`, `/signup`
- User routes: `/dashboard/history`, `/dashboard/profile`, etc.
- Admin routes: `/dashboard/revenue`, `/dashboard/orders/manage`, etc.

## Deployment

The application is optimized for deployment on Vercel. Follow these steps:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your chosen license]
