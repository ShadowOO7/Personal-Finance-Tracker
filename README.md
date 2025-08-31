# Personal Finance Assistant

This is a comprehensive Personal Finance Assistant application built with the MERN stack (MongoDB, Express.js, React, Node.js). It allows users to manage their income and expenses, visualize financial data, and even parse PDF receipts.

---

## Features

*   **User Authentication:** Secure signup and login functionality with JWT (JSON Web Tokens).
*   **User-Specific Data:** All transactions are now associated with the logged-in user, ensuring privacy and personalized finance management.
*   **Transaction Management:**
    *   Create income and expense entries.
    *   List transactions with optional date range filtering and pagination.
    *   Delete existing transactions.
*   **Financial Visualization:**
    *   Dynamic pie charts showing expenses by category and by date.
    *   Charts update automatically when new transactions are added.
*   **Receipt Parsing:**
    *   Parse text-based PDF receipts to suggest transactions (amount, description, and date extraction).
    *   Review and edit suggested transactions before saving.
*   **Responsive UI:** Modern and aesthetic user interface built with React and Bootstrap, featuring a clean design and intuitive navigation.
*   **Centralized Error Handling:** Robust error handling on the backend for a stable application.

---

## Local Setup & Running the Application

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (v16 or higher) & **npm** (Node Package Manager)
*   **MongoDB** (local installation or a cloud service like MongoDB Atlas)

### Step-by-Step Guide

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd personal_finance_assistant
    ```

2.  **Backend Setup:**
    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    *   Install backend dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `backend` directory based on `.env.example`.
        ```
        MONGO_URL="mongodb://localhost:27017/pfa"
        PORT=3000
        JWT_SECRET="your_very_secret_jwt_key" # IMPORTANT: Change this to a strong, random string
        ```
    *   Start the backend server:
        ```bash
        node server.js
        ```
        *(Keep this terminal window open as the backend server will run here.)*

3.  **Frontend Setup:**
    *   Open a new terminal window and navigate to the `client` directory:
        ```bash
        cd client
        ```
    *   Install frontend dependencies:
        ```bash
        npm install
        ```
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```
        *(This will usually open the application in your browser at `http://localhost:5173` or `http://localhost:5174`.)*

4.  **Database Setup (MongoDB):**
    *   Ensure your MongoDB instance is running.
        *   **Local MongoDB (macOS with Homebrew):**
            ```bash
            brew services start mongodb-community
            ```
        *   **Other OS / Manual Installation:** Refer to MongoDB's official documentation for starting your local instance.
        *   **Docker Compose (Alternative for Development):** If you have Docker and Docker Compose installed, you can run both MongoDB and the backend application in containers. See the "Future Deployment with Docker" section below.

### Usage

1.  **Access the Application:** Open your web browser and navigate to the address provided by the frontend development server (e.g., `http://localhost:5174/`).
2.  **Sign Up:** Create a new user account with a username, email, and password, this is simple login later we can aalso add API to check weather it is valid mail or not by sending OTP and also add a feature to login with E-mail id.
3.  **Login:** Use your new credentials to log in.
4.  **Manage Transactions:** Add new income or expense transactions, view them in the list, filter by date, and delete them.
5.  **View Charts:** Observe your financial data visualized in dynamic pie charts.
6.  **Parse Receipts:** Upload text-based PDF receipts to get suggested transactions, which you can then review and save.

---

## Future Deployment with Docker

This project is set up for easy containerization. Once you have Docker and Docker Compose installed, you can build and run the entire application (backend + MongoDB) with a single command from the project root:

```bash
docker compose up --build
```
The application will then be accessible at `http://localhost:3000`.

---

## Key Technologies Used

*   **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM), bcryptjs (password hashing), jsonwebtoken (JWT).
*   **Frontend:** React, Vite, React Router DOM, Chart.js (for charts), Bootstrap (UI framework).
*   **Database:** MongoDB

---

*   **Comprehensive User Authentication:** Implemented secure signup and login with JWTs, ensuring user-specific data.
*   **Improved User Experience:**
    *   Modernized UI with Bootstrap, featuring a clean and aesthetic design.
    *   Dynamic pie charts for financial visualization.
    *   Enhanced user feedback with a custom notification system.
    *   Loading indicators for better responsiveness.
    *   Clear filter option for transaction list.
*   **Robust Backend:**
    *   Centralized error handling for improved stability.
    *   Refined input validation for transactions.
    *   Corrected `userId` handling in MongoDB queries for accurate user-specific data.
    *   Added transaction deletion functionality.
*   **Receipt Parsing Enhancements:** Improved date extraction from PDF receipts and integrated it into the transaction form for review.# Personal-Finance-Tracker
