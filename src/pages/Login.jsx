import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {signInWithEmailAndPassword} from "firebase/auth";
import auth from "../services/firebase/auth";
import "./Login.css";

function Login(){
    const navigate=useNavigate();

    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);

    async function handleLogin(event){
        event.preventDefault();
        setError("");
        setLoading(true);

        try{
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/");
        }catch(error){
            if(error.code==="auth/invalid-credential"){
                setError("Incorrect email or password.");
            }else if(error.code==="auth/invalid-email"){
                setError("Please enter a valid email address.");
            }else if(error.code==="auth/too-many-requests"){
                setError("Too many attempts. Please try again later.");
            }else{
                setError("Unable to sign in. Please try again.");
            }
        }finally{
            setLoading(false);
        }
    }

    return(
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-header">
                    <p className="auth-eyebrow">
                        WELCOME BACK
                    </p>

                    <h1>
                        Sign in.
                    </h1>

                    <p>
                        Access your account and continue
                        exploring the collection.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >
                    <div className="auth-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={event=>setEmail(event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={event=>setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error&&(
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading?"Signing In...":"Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create Account
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Login;