# Cartify – E-Commerce Web Application

**Cartify** is a full-stack e-commerce web application developed as part of the Thiranex Full Stack Development Internship. It allows users to browse products, add items to their cart, place orders, and track their purchases. It also provides an admin dashboard for managing products and orders.

## 🌐 Live Demo

**Website:** https://cartify-peach.vercel.app/

**GitHub Repository:** https://github.com/sanjanasraj/Cartify

## ✨ Features

### User Features
- User registration and login
- Browse available products
- Search and filter products
- Add products to cart
- Update product quantities and remove items
- Checkout and place orders
- View order confirmation and status

### Admin Features
- Admin login with role-based access
- Add new products
- Edit existing product details
- Delete products
- View and manage customer orders
- Update order status

## 🛠️ Technologies Used

**Frontend**
- React.js
- Vite
- JavaScript
- CSS

**Backend**
- Python
- Flask
- Flask-CORS
- REST APIs

**Database**
- PostgreSQL
- Neon Database

**Deployment**
- Vercel – Frontend Hosting
- Render – Backend Hosting
- GitHub – Version Control

## 📁 Project Structure

```text
Cartify/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── routes/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api.js
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sanjanasraj/Cartify.git
cd Cartify
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder and configure the required environment variables:

```env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
```

Start the Flask backend:

```bash
python app.py
```

The backend runs locally at:

`http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally at:

`http://localhost:5173`

## 🗄️ Database

Cartify uses PostgreSQL for storing:
- User information
- Product details
- Customer orders
- Order items

The deployed application uses Neon PostgreSQL.

## 🔐 Authentication and Security

- Role-based access for Admin and User accounts
- Session-based authentication
- Protected admin functionalities
- Environment variables for sensitive configuration
- Secure cross-origin requests with credentials

**Note:** Admin demo credentials are available upon request. Please contact the project developer for access.

## 👩‍💻 Developed By

**Sanjana S Raj**

B.E. Computer Science and Engineering

**Project:** Thiranex Full Stack Development Internship

---

*Cartify – Making Online Shopping Simple! 🛍️*
