import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container mt-5 text-center">
      <h1>Welcome to Personal Finance Assistant</h1>
      <p className="lead">Manage your finances with ease.</p>
      <div className="mt-4">
        <Link to="/login" className="btn btn-primary btn-lg me-3">Login</Link>
        <Link to="/signup" className="btn btn-secondary btn-lg">Sign Up</Link>
      </div>
    </div>
  );
}
