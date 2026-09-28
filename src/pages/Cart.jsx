import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {useCart} from "../context/CartContext";
import {getCartProducts} from "../services/cart/cartProductService";
import "./Cart.css";

function Cart(){
    const {items,loading,updateQuantity,removeFromCart}=useCart();
    const [products,setProducts]=useState([]);
    const [productsLoading,setProductsLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>{
        async function loadProducts(){
            try{
                setProductsLoading(true);

                const data=await getCartProducts(items);
                setProducts(data);
            }catch(error){
                setError("Unable to load your bag.");
            }finally{
                setProductsLoading(false);
            }
        }

        if(!loading){
            loadProducts();
        }
    },[items,loading]);

    if(loading||productsLoading){
        return(
            <main className="cart-page">
                <div className="cart-state">
                    <p>Loading your bag...</p>
                </div>
            </main>
        );
    }

    if(error){
        return(
            <main className="cart-page">
                <div className="cart-state cart-error">
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    if(products.length===0){
        return(
            <main className="cart-page">
                <div className="cart-state">
                    <p className="cart-eyebrow">
                        YOUR BAG
                    </p>

                    <h1>Your bag is empty.</h1>

                    <p>
                        Discover something you'll love.
                    </p>

                    <Link to="/products">
                        Explore Collection →
                    </Link>
                </div>
            </main>
        );
    }

    const total=products.reduce((sum,product)=>{
        const quantity=items[product.id]?.quantity||0;
        return sum+(product.price*quantity);
    },0);

    return(
        <main className="cart-page">
            <header className="cart-header">
                <p className="cart-eyebrow">
                    YOUR BAG
                </p>

                <h1>
                    Your selections.
                </h1>
            </header>

            <div className="cart-layout">
                <section className="cart-items">
                    {products.map(product=>{
                        const quantity=items[product.id]?.quantity||0;
                        const subtotal=product.price*quantity;
                        const image=product.images?.[0];

                        return(
                            <article
                                className="cart-item"
                                key={product.id}
                            >
                                <Link
                                    to={`/products/${product.id}`}
                                    className="cart-item-image"
                                >
                                    {image?(
                                        <img
                                            src={image}
                                            alt={product.name}
                                        />
                                    ):(
                                        <div className="cart-item-placeholder">
                                            NO IMAGE
                                        </div>
                                    )}
                                </Link>

                                <div className="cart-item-info">
                                    <p className="cart-item-category">
                                        {product.category}
                                    </p>

                                    <h2>
                                        <Link
                                            to={`/products/${product.id}`}
                                        >
                                            {product.name}
                                        </Link>
                                    </h2>

                                    <p className="cart-item-price">
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </p>

                                    <div className="cart-item-actions">
                                        <div className="cart-quantity">
                                            <button
                                                onClick={()=>{
                                                    updateQuantity(
                                                        product.id,
                                                        quantity-1
                                                    );
                                                }}
                                                disabled={quantity<=1}
                                            >
                                                −
                                            </button>

                                            <span>
                                                {quantity}
                                            </span>

                                            <button
                                                onClick={()=>{
                                                    updateQuantity(
                                                        product.id,
                                                        quantity+1
                                                    );
                                                }}
                                                disabled={
                                                    quantity>=product.stock
                                                }
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            className="cart-remove"
                                            onClick={()=>{
                                                removeFromCart(product.id);
                                            }}
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                </div>

                                <p className="cart-item-subtotal">
                                    ₹{subtotal.toLocaleString("en-IN")}
                                </p>
                            </article>
                        );
                    })}
                </section>

                <aside className="cart-summary">
                    <h2>
                        Order Summary
                    </h2>

                    <div className="cart-summary-row">
                        <span>Subtotal</span>

                        <strong>
                            ₹{total.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="cart-summary-row">
                        <span>Shipping</span>

                        <strong>
                            Calculated at checkout
                        </strong>
                    </div>

                    <div className="cart-summary-divider"/>

                    <div className="cart-summary-total">
                        <span>Total</span>

                        <strong>
                            ₹{total.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <Link
                        to="/checkout"
                        className="cart-checkout-button"
                    >
                        Proceed to Checkout
                    </Link>

                    <Link
                        to="/products"
                        className="cart-continue"
                    >
                        Continue Shopping
                    </Link>
                </aside>
            </div>
        </main>
    );
}

export default Cart;