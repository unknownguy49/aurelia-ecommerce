import {useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import {getProductById} from "../services/products/productService";
import {useCart} from "../context/CartContext";
import "./ProductDetails.css";

function ProductDetails(){
    const {addToCart}=useCart();
    const {id}=useParams();
    const [product,setProduct]=useState(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    const [quantity,setQuantity]=useState(1);
    const [added,setAdded]=useState(false);

    useEffect(()=>{
        async function loadProduct(){
            try{
                const data=await getProductById(id);

                if(!data){
                    setError("Product not found.");
                    return;
                }

                setProduct(data);
            }catch(error){
                setError("Unable to load product.");
            }finally{
                setLoading(false);
            }
        }

        loadProduct();
    },[id]);

    async function handleAddToCart(){
        try{
            for(let i=0;i<quantity;i++){
                await addToCart(product.id);
            }

            setAdded(true);

            setTimeout(()=>{
                setAdded(false);
            },1500);
        }catch(error){
            setError("Unable to add product to bag.");
        }
    }

    if(loading){
        return(
            <main className="product-details-page">
                <div className="product-details-state">
                    Loading product...
                </div>
            </main>
        );
    }

    if(error){
        return(
            <main className="product-details-page">
                <div className="product-details-state product-details-error">
                    {error}
                </div>
            </main>
        );
    }

    const image=product.images?.[0];
    const unavailable=product.stock<=0;

    return(
        <main className="product-details-page">
            <section className="product-details">
                <div className="product-details-image">
                    {image?(
                        <img
                            src={image}
                            alt={product.name}
                        />
                    ):(
                        <div className="product-details-placeholder">
                            NO IMAGE
                        </div>
                    )}
                </div>

                <div className="product-details-content">
                    <p className="product-details-category">
                        {product.category}
                    </p>

                    <h1>{product.name}</h1>

                    <p className="product-details-price">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    <div className="product-details-divider"/>

                    <p className="product-details-description">
                        {product.description}
                    </p>

                    <div className="product-details-specs">
                        <div>
                            <span>Material</span>
                            <strong>{product.material}</strong>
                        </div>

                        <div>
                            <span>Purity</span>
                            <strong>{product.purity}</strong>
                        </div>

                        <div>
                            <span>Weight</span>
                            <strong>{product.weight}g</strong>
                        </div>
                    </div>

                    <div className="product-details-stock">
                        {unavailable
                            ?"Currently unavailable"
                            :`${product.stock} available`}
                    </div>

                    {!unavailable&&(
                        <div className="product-details-purchase">
                            <div className="quantity-selector">
                                <button
                                    onClick={()=>{
                                        setQuantity(current=>
                                            Math.max(1,current-1)
                                        );
                                    }}
                                    disabled={quantity<=1}
                                >
                                    −
                                </button>

                                <span>{quantity}</span>

                                <button
                                    onClick={()=>{
                                        setQuantity(current=>
                                            Math.min(
                                                product.stock,
                                                current+1
                                            )
                                        );
                                    }}
                                    disabled={quantity>=product.stock}
                                >
                                    +
                                </button>
                            </div>

                            <button
                                className="product-details-button"
                                onClick={handleAddToCart}
                            >
                                {added?"Added to Bag":"Add to Bag"}
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default ProductDetails;