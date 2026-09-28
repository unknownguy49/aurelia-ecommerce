import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {doc,setDoc,serverTimestamp} from "firebase/firestore";
import auth from "../services/firebase/auth";
import db from "../services/firebase/firestore";
import "./Login.css";

function Register(){
    const navigate=useNavigate();

    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);

    async function handleRegister(event){
        event.preventDefault();
        setError("");
        setLoading(true);

        try{
            const credential=await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await setDoc(
                doc(db,"users",credential.user.uid),
                {
                    name:name,
                    email:email,
                    role:"CUSTOMER",
                    createdAt:serverTimestamp()
                }
            );

            navigate("/");
        }catch(error){
            if(error.code==="auth/email-already-in-use"){
                setError("An account with this email already exists.");
            }else if(error.code==="auth/invalid-email"){
                setError("Please enter a valid email address.");
            }else if(error.code==="auth/weak-password"){
                setError("Password must be at least 6 characters.");
            }else{
                setError("Unable to create your account. Please try again.");
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
                        JOIN AURELIA
                    </p>

                    <h1>
                        Create an account.
                    </h1>

                    <p>
                        Create your account to save your bag
                        and place orders.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >
                    <div className="auth-field">
                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={event=>setName(event.target.value)}
                            autoComplete="name"
                            required
                        />
                    </div>

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
                            autoComplete="new-password"
                            minLength="6"
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
                        {loading
                            ?"Creating Account..."
                            :"Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign In
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Register;