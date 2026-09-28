import {Navigate,useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

function ProtectedRoute({children}){
    const {user,loading}=useAuth();
    const location=useLocation();

    if(loading){
        return(
            <main className="auth-state">
                <p>Loading...</p>
            </main>
        );
    }

    if(!user){
        return(
            <Navigate
                to="/login"
                replace
                state={{
                    from:location.pathname
                }}
            />
        );
    }

    return children;
}

export default ProtectedRoute;