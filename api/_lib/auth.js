import {auth} from "./firebaseAdmin.js";

export async function authenticateRequest(request){
    const authorization=request.headers.authorization;

    if(!authorization){
        const error=new Error("Authentication required.");
        error.statusCode=401;
        throw error;
    }

    if(!authorization.startsWith("Bearer ")){
        const error=new Error("Invalid authorization header.");
        error.statusCode=401;
        throw error;
    }

    const token=authorization.substring(7);

    if(!token){
        const error=new Error("Authentication token is missing.");
        error.statusCode=401;
        throw error;
    }

    try{
        return await auth.verifyIdToken(token);
    }catch(error){
        console.error(
            "Firebase token verification failed:",
            error
        );

        const authenticationError=new Error(
            error.message||"Invalid authentication token."
        );

        authenticationError.statusCode=401;

        throw authenticationError;
    }
}