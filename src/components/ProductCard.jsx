import {Link} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import {useCart} from "../context/CartContext";
import "./ProductCard.css";

function ProductCard({product}){
    const image=product.images?.[0];
    const {user}=useAuth();
    const {addToCart}=useCart();
    const [added,setAdded]=useState(false);

    async function handleAddToCart(){
        if(!user){
            window.location.href="/login";
            return;
        }

        try{
            await addToCart(product.id);
            setAdded(true);

            setTimeout(()=>{
                setAdded(false);
            },1500);
        }catch(error){
            console.error(error);
        }
    }

    const unavailable=product.stock<=0;

    return(
        <article className="product-card">
            <Link
                to={`/products/${product.id}`}
                className="product-card-image"
            >
                {image?(
                    <img
                        src={image}
                        alt={product.name}
                    />
                ):(
                    <div className="product-card-placeholder">
                        NO IMAGE
                    </div>
                )}
            </Link>

            <div className="product-card-info">
                <div>
                    <p className="product-card-category">
                        {product.category}
                    </p>

                    <h3>
                        <Link to={`/products/${product.id}`}>
                            {product.name}
                        </Link>
                    </h3>
                </div>

                <p className="product-card-price">
                    ₹{product.price.toLocaleString("en-IN")}
                </p>
            </div>

            <button
                className="product-card-button"
                onClick={handleAddToCart}
                disabled={unavailable}
            >
                {unavailable
                    ?"Out of Stock"
                    :added
                        ?"Added to Bag"
                        :"Add to Bag"}
            </button>
        </article>
    );
}

export default ProductCard;