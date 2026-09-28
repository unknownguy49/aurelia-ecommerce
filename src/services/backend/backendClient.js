import auth from "../firebase/auth";

export async function backendRequest(url,options={}){
    const user=auth.currentUser;

    if(!user){
        throw new Error("You must be logged in.");
    }

    const token=await user.getIdToken();

    const backendUrl=
        import.meta.env.DEV
            ?`http://localhost:3000${url}`
            :url;

    const response=await fetch(
        backendUrl,
        {
            ...options,
            headers:{
                ...options.headers,
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    );

    const data=await response.json();

    if(!response.ok){
        throw new Error(
            data.message||
            "Backend request failed."
        );
    }

    return data;
}