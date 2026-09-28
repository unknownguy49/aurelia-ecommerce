import {useEffect,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {signOut} from "firebase/auth";
import {useCart} from "../context/CartContext";
import {useAuth} from "../context/AuthContext";
import auth from "../services/firebase/auth";
import "./Navbar.css";

function Navbar(){
    const [theme,setTheme]=useState(
        localStorage.getItem("theme")||"dark"
    );
    const [menuOpen,setMenuOpen]=useState(false);

    const {items}=useCart();
    const {user}=useAuth();
    const navigate=useNavigate();
    const location=useLocation();

    useEffect(()=>{
        document.documentElement.setAttribute("data-theme",theme);
        localStorage.setItem("theme",theme);
    },[theme]);

    useEffect(()=>{
        setMenuOpen(false);
    },[location.pathname]);

    useEffect(()=>{
        function handleResize(){
            if(window.innerWidth>760){
                setMenuOpen(false);
            }
        }

        window.addEventListener("resize",handleResize);

        return()=>{
            window.removeEventListener("resize",handleResize);
        };
    },[]);

    useEffect(()=>{
        if(!menuOpen){
            document.body.style.overflow="";
            return;
        }

        document.body.style.overflow="hidden";

        return()=>{
            document.body.style.overflow="";
        };
    },[menuOpen]);

    function toggleTheme(){
        setTheme(currentTheme=>
            currentTheme==="dark"?"light":"dark"
        );
    }

    async function handleLogout(){
        try{
            await signOut(auth);
            navigate("/");
        }catch(error){
            console.error(error);
        }
    }

    const cartCount=Object.values(items||{}).reduce(
        (total,item)=>total+item.quantity,
        0
    );

    return(
        <header className="site-header">
            <nav className="navbar">
                <Link
                    to="/"
                    className="navbar-brand"
                >
                    AURELIA
                </Link>

                <div className="navbar-links">
                    <Link to="/products">
                        Collections
                    </Link>
                </div>

                <div className="navbar-actions">
                    <button
                        className="navbar-icon-button"
                        onClick={toggleTheme}
                        aria-label={
                            theme==="dark"
                                ?"Switch to light mode"
                                :"Switch to dark mode"
                        }
                        title={
                            theme==="dark"
                                ?"Switch to light mode"
                                :"Switch to dark mode"
                        }
                    >
                        {theme==="dark"?(
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="4"
                                />
                                <path d="M12 2v2"/>
                                <path d="M12 20v2"/>
                                <path d="m4.93 4.93 1.41 1.41"/>
                                <path d="m17.66 17.66 1.41 1.41"/>
                                <path d="M2 12h2"/>
                                <path d="M20 12h2"/>
                                <path d="m6.34 17.66-1.41 1.41"/>
                                <path d="m19.07 4.93-1.41 1.41"/>
                            </svg>
                        ):(
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        )}
                    </button>

                    {user?(
                        <button
                            className="navbar-icon-button navbar-account-button"
                            onClick={handleLogout}
                            aria-label="Sign out"
                            title="Sign out"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M10 17l5-5-5-5"/>
                                <path d="M15 12H3"/>
                                <path d="M21 3v18"/>
                            </svg>
                        </button>
                    ):(
                        <Link
                            to="/login"
                            className="navbar-icon-button navbar-account-button"
                            aria-label="Account"
                            title="Account"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="8"
                                    r="4"
                                />
                                <path d="M4 21a8 8 0 0 1 16 0"/>
                            </svg>
                        </Link>
                    )}

                    <Link
                        to="/cart"
                        className="navbar-cart-button"
                        aria-label={
                            cartCount>0
                                ?`Shopping bag, ${cartCount} items`
                                :"Shopping bag"
                        }
                        title="Shopping bag"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M6 8h12l1 13H5L6 8z"/>
                            <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                        </svg>

                        {cartCount>0&&(
                            <span className="cart-badge">
                                {cartCount>99?"99+":cartCount}
                            </span>
                        )}
                    </Link>

                    <button
                        className={
                            menuOpen
                                ?"navbar-menu-button is-open"
                                :"navbar-menu-button"
                        }
                        onClick={()=>setMenuOpen(current=>!current)}
                        aria-label={
                            menuOpen
                                ?"Close navigation menu"
                                :"Open navigation menu"
                        }
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                    >
                        <span/>
                        <span/>
                        <span/>
                    </button>
                </div>
            </nav>

            <div
                id="mobile-navigation"
                className={
                    menuOpen
                        ?"mobile-navigation is-open"
                        :"mobile-navigation"
                }
                aria-hidden={!menuOpen}
            >
                <div className="mobile-navigation-inner">
                    <Link to="/products">
                        Collections
                    </Link>

                    {!user&&(
                        <Link to="/login">
                            Account
                        </Link>
                    )}

                    <Link to="/cart">
                        Bag
                        {cartCount>0&&(
                            <span>
                                {cartCount} items
                            </span>
                        )}
                    </Link>

                    {user&&(
                        <button onClick={handleLogout}>
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;