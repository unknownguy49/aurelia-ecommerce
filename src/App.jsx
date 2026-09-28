import {BrowserRouter,useLocation,Routes,Route} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import "./services/firebase/config";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MiniCart from "./components/MiniCart";
import {useCart} from "./context/CartContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";

function App(){
    return(
        <BrowserRouter>
            <AppContent/>
        </BrowserRouter>
    );
}

function AppContent(){
    const {items,loading}=useCart();
    const {pathname}=useLocation();

    const hideMiniCart=
        pathname==="/cart"||
        pathname==="/checkout"||
        pathname==="/order-success";

    const hasCartItems=
        !loading&&
        Object.keys(items).length>0&&
        !hideMiniCart;

    return(
        <>
            <Navbar/>

            <div
                className={
                    hasCartItems
                        ?"app-layout app-layout-with-cart"
                        :"app-layout"
                }
            >
                <main className="app-content">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/products" element={<Products/>}/>
                        <Route
                            path="/products/:id"
                            element={<ProductDetails/>}
                        />
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <Cart/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <Checkout/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/order-success"
                            element={<OrderSuccess/>}
                        />
                    </Routes>
                </main>

                {hasCartItems&&<MiniCart/>}
            </div>
        </>
    );
}

export default App;