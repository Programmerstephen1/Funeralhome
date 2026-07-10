import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ userEmail, children }) {
  const location = useLocation();

  // If there is no userEmail (they are not logged in)
  if (!userEmail) {
    // Redirect to login. 
    // We use "replace" so the login redirect doesn't get stuck in the back-button history.
    // We also pass "state={{ from: location }}" so the login page knows where to send them AFTER they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are logged in, render the protected page normally
  return children;
}