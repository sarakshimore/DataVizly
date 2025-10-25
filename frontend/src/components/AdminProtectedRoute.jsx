import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // not logged in → go to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    // logged in but not admin → redirect home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
