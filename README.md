# 🚀 Laundry Management System

A modern web application for managing laundry services, built with **Next.js 14**, featuring a **responsive dashboard** for both administrators and customers.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.2-blue?style=for-the-badge&logo=tailwind-css)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet?style=for-the-badge&logo=stripe)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge&logo=json-web-tokens)

[Live Demo](https://laundryhub-plum.vercel.app/dashboard/orders) 

---

## 📌 Features

### 🔐 **User Authentication**
- Secure login and signup functionality
- Role-based access control (Admin/User)
- JWT-based authentication with `jose`
- Protected routes and middleware

### 👤 **Customer Features**
- Order tracking with **real-time updates**
- Payment history and invoices
- Profile management and settings
- Real-time order status notifications
- **Schedule pickups and deliveries**
- Service customization options

### 🛠 **Admin Dashboard**
- Revenue analytics and charts
- Comprehensive order management
- User management and roles
- Service configuration
- Performance reports and metrics
- Staff management & inventory tracking

### 💳 **Payment Integration**
- Secure payments via **Stripe**
- Payment history tracking
- Automated payment status updates
- Invoice generation & refund management

### 🎨 **UI/UX Features**
- **Fully responsive** design for all devices
- Dark/Light theme support
- Animated transitions and components
- Toast notifications
- Form validation & error handling
- Interactive **charts & graphs**

---

## 🏗 Tech Stack

### 🔹 **Frontend**
- Next.js 14, React 18, App Router
- Tailwind CSS, Shadcn UI, Radix UI Primitives
- Framer Motion animations, Lucide Icons
- Class Variance Authority for component variants
- Tailwind Merge for class name merging

### 🔹 **Backend & Database**
- MongoDB with Mongoose ODM
- JWT Authentication with jose
- Stripe API integration
- RESTful API endpoints
- Server Actions for form handling

### 🔹 **State Management & Data**
- React Hooks
- Server Components
- MongoDB with Mongoose
- JWT Authentication

### 🔹 **Security**
- JWT-based authentication
- HTTP-only cookies
- CORS protection
- Rate limiting
- Input validation
- XSS protection

### 🔹 **Components & Libraries**
- Recharts for analytics
- React Day Picker for date selection
- Sonner for toast notifications
- HeadlessUI for accessibility
- Next Themes for dark/light mode

### 🔹 **Development Tools**
- ESLint for code linting
- Prettier for code formatting
- PostCSS for CSS processing
- Autoprefixer for browser compatibility

---

## 📸 Screenshots

### **Admin Dashboard**
![Admin Dashboard](https://i.postimg.cc/XvbVByq2/dashboard.png)

### **Order Management**
![Order Management](https://i.postimg.cc/fLHZP2KF/orders.png)

> Store images inside a `/screenshots` folder in your repo.

---

## 🚀 Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/shreejaybhay/laundry-management.git
```
2. **Install dependencies:**
```bash
npm install
```
3. **Set up environment variables:**  
Create a `.env.local` file and add:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_FRONTEND_URL=your_frontend_url
```
4. **Run the development server:**
```bash
npm run dev
```
Visit **[http://localhost:3000](http://localhost:3000)** to see the application.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── dashboard/         # Dashboard data endpoints
│   │   ├── orders/           # Order management endpoints
│   │   ├── payments/         # Payment processing endpoints
│   │   └── webhooks/         # Webhook handlers
│   ├── dashboard/             # Dashboard pages
│   │   ├── orders/           # Order management
│   │   ├── payments/         # Payment management
│   │   ├── reports/          # Analytics & reports
│   │   └── settings/         # User settings
│   ├── login/                 # Authentication pages
│   └── signup/
├── components/
│   ├── dashboard/             # Dashboard components
│   ├── orders/               # Order-related components
│   ├── ui/                   # Reusable UI components
│   └── providers/            # Context providers
├── lib/
│   ├── api/                  # API utilities
│   ├── db.js                 # Database configuration
│   └── utils.js              # Helper functions
├── middleware/               # Authentication middleware
└── models/                   # MongoDB models
    ├── Order.js
    ├── Payment.js
    ├── Service.js
    └── User.js
```

---

## 🌐 API Endpoints

### **Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |
| `GET`  | `/api/auth/me` | Get authenticated user |
| `POST` | `/api/auth/logout` | User logout |
| `PUT`  | `/api/auth/profile` | Update user profile |

### **Orders**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET`  | `/api/orders` | Get all orders (Admin) |
| `POST` | `/api/orders` | Place a new order |
| `GET`  | `/api/orders/:id` | Get order details |
| `PUT`  | `/api/orders/:id/status` | Update order status (Admin) |
| `GET`  | `/api/orders/:id/track` | Track order status |

### **Payments**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/payments` | Process payment via Stripe |
| `GET`  | `/api/payments/:orderId` | Get payment details |
| `POST` | `/api/payments/stripe/success` | Handle successful payment |
| `POST` | `/api/webhooks/stripe` | Stripe webhook for payment updates |

### **Services**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET`  | `/api/services` | Get all services |
| `POST` | `/api/services` | Create new service (Admin) |
| `GET`  | `/api/services/:id` | Get service details |
| `PUT`  | `/api/services/:id` | Update service (Admin) |

### **Dashboard**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET`  | `/api/dashboard/stats` | Get dashboard statistics |
| `GET`  | `/api/dashboard/user-stats` | Get user statistics |
| `GET`  | `/api/reports/trends` | Get trend reports |

---

## 🔒 Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# Authentication
JWT_SECRET=                           # Secret key for JWT token generation

# Database
MONGODB_URI=                          # MongoDB Atlas connection string

# Application URL
NEXT_PUBLIC_FRONTEND_URL=             # Frontend URL (e.g., http://localhost:3000)

# Stripe Configuration
STRIPE_SECRET_KEY=                    # Stripe API secret key
STRIPE_WEBHOOK_SECRET=                # Stripe webhook signing secret
```

> **Note**: Never commit your actual environment variable values to version control. The above shows the required variables without their values.

## 📊 Features in Development

- [ ] Real-time chat support
- [ ] Mobile application
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Automated email notifications
- [ ] Integration with delivery services

## 🚀 Deployment

1. **Push your code to GitHub**
2. **Go to Vercel → Import Project → Select GitHub Repo**
3. **Add Environment Variables** (`.env.local` variables)
4. **Click Deploy 🚀**

Your app will be live at `https://your-project.vercel.app`

---

## 🤝 Contributing

We welcome contributions to improve the Laundry Management System! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

- Email: shreejaybhay26@gmail.com
- LinkedIn: [Shree Jaybhay](https://in.linkedin.com/in/shree-jaybhay-084014316)
- GitHub: [shreejaybhay](https://github.com/shreejaybhay)

## 📜 License

MIT License

Copyright (c) 2024 Shreejay Bhay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<p align="center">Made with ❤️ by <a href="https://github.com/shreejaybhay">Shreejay Bhay</a></p>
