import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {useCart} from "../context/CartContext";
import {getCartProducts} from "../services/cart/cartProductService";
import "./MiniCart.css";

function MiniCart(){
    const {items,loading,updateQuantity,removeFromCart}=useCart();
    const [products,setProducts]=useState([]);
    const [productsLoading,setProductsLoading]=useState(false);

    useEffect(()=>{
        async function loadProducts(){
            try{
                setProductsLoading(true);

                const data=await getCartProducts(items);
                setProducts(data);
            }catch(error){
                setProducts([]);
            }finally{
                setProductsLoading(false);
            }
        }

        if(!loading&&Object.keys(items).length>0){
            loadProducts();
        }else{
            setProducts([]);
        }
    },[items,loading]);

    if(loading||Object.keys(items).length===0){
        return null;
    }

    const total=products.reduce((sum,product)=>{
        const quantity=items[product.id]?.quantity||0;
        return sum+(product.price*quantity);
    },0);

    return(
        <aside className="mini-cart">
            <div className="mini-cart-header">
                <div>
                    <p className="mini-cart-eyebrow">
                        YOUR BAG
                    </p>

                    <h2>
                        {Object.values(items).reduce(
                            (total,item)=>total+item.quantity,
                            0
                        )} items
                    </h2>
                </div>
            </div>

            <div className="mini-cart-items">
                {productsLoading?(
                    <p className="mini-cart-loading">
                        Updating bag...
                    </p>
                ):(
                    products.map(product=>{
                        const quantity=items[product.id]?.quantity||0;
                        const subtotal=product.price*quantity;
                        const image=product.images?.[0];

                        return(
                            <div
                                className="mini-cart-item"
                                key={product.id}
                            >
                                <div className="mini-cart-image">
                                    {image?(
                                        <img
                                            src={image}
                                            alt={product.name}
                                        />
                                    ):(
                                        <span>
                                            NO IMAGE
                                        </span>
                                    )}
                                </div>

                                <div className="mini-cart-item-info">
                                    <h3>
                                        {product.name}
                                    </h3>

                                    <p>
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </p>

                                    <div className="mini-cart-controls">
                                        <div className="mini-cart-quantity">
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

                                            <span>{quantity}</span>

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
                                            className="mini-cart-remove"
                                            onClick={()=>{
                                                removeFromCart(product.id);
                                            }}
                                        >
                                            REMOVE
                                        </button>
                                    </div>

                                    <strong>
                                        ₹{subtotal.toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!productsLoading&&products.length>0&&(
                <div className="mini-cart-footer">
                    <div className="mini-cart-total">
                        <span>Total</span>

                        <strong>
                            ₹{total.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="mini-cart-actions">
                        <Link to="/cart">
                            VIEW BAG
                        </Link>

                        <Link to="/checkout">
                            CHECKOUT
                        </Link>
                    </div>
                </div>
            )}
        </aside>
    );
}

export default MiniCart;