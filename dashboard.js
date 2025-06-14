import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if not logged in
    }
  }, [user, navigate]);

  if (!user) return null; // or a loading spinner

  return (
    <div className="page-container">
      <h2>Welcome, {user.name}!</h2>
      <Link to="/interview"><button>Start Interview</button></Link>
    </div>
  );
}
