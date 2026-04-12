import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const auth = useAuth();
    const { user, isAuthenticated, loading, isAdmin } = auth;
    
    console.log('AdminRoute State:', { isAuthenticated, loading, isAdmin, role: user?.role });
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
