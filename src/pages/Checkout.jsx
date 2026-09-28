import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {useCart} from "../context/CartContext";
import {useAuth} from "../context/AuthContext";
import {getCartProducts} from "../services/cart/cartProductService";
import {getUserProfile} from "../services/users/userService";
import {saveCustomerProfile} from "../services/backend/userService";
import {
    createOrder as createBackendOrder,
    verifyPayment as verifyBackendPayment
} from "../services/backend/paymentService";
import "./Checkout.css";

function Checkout(){
    useEffect(()=>{
        const script=document.createElement("script");

        script.src="https://checkout.razorpay.com/v1/checkout.js";
        script.async=true;

        document.body.appendChild(script);

        return()=>{
            document.body.removeChild(script);
        };
    },[]);

    const navigate=useNavigate();
    const {user}=useAuth();

    const {
        items,
        loading,
        clearCart
    }=useCart();

    const [products,setProducts]=useState([]);
    const [productsLoading,setProductsLoading]=useState(true);
    const [profileLoading,setProfileLoading]=useState(true);

    const [error,setError]=useState("");
    const [processing,setProcessing]=useState(false);

    const [savedAddress,setSavedAddress]=useState(null);
    const [useSavedAddress,setUseSavedAddress]=useState(false);
    const [saveNewAddress,setSaveNewAddress]=useState(true);

    const [name,setName]=useState("");
    const [phone,setPhone]=useState("");
    const [address,setAddress]=useState("");
    const [city,setCity]=useState("");
    const [state,setState]=useState("");
    const [pincode,setPincode]=useState("");

    useEffect(()=>{
        async function loadProducts(){
            try{
                const data=await getCartProducts(items);
                setProducts(data);
            }catch(error){
                setError("Unable to load your order.");
            }finally{
                setProductsLoading(false);
            }
        }

        if(!loading){
            loadProducts();
        }
    },[items,loading]);

    useEffect(()=>{
        async function loadProfile(){
            if(!user){
                setProfileLoading(false);
                return;
            }

            try{
                const profile=await getUserProfile(user.uid);

                if(profile){
                    setName(profile.name||"");

                    if(profile.shippingAddress){
                        setSavedAddress(
                            profile.shippingAddress
                        );

                        setPhone(
                            profile.shippingAddress.phone||""
                        );

                        setAddress(
                            profile.shippingAddress.address||""
                        );

                        setCity(
                            profile.shippingAddress.city||""
                        );

                        setState(
                            profile.shippingAddress.state||""
                        );

                        setPincode(
                            profile.shippingAddress.pincode||""
                        );

                        setUseSavedAddress(true);
                    }
                }
            }catch(error){
                console.error(error);
            }finally{
                setProfileLoading(false);
            }
        }

        loadProfile();
    },[user]);

    function handleUseSavedAddress(){
        if(!savedAddress){
            return;
        }

        setName(savedAddress.name||name);
        setPhone(savedAddress.phone||"");
        setAddress(savedAddress.address||"");
        setCity(savedAddress.city||"");
        setState(savedAddress.state||"");
        setPincode(savedAddress.pincode||"");

        setUseSavedAddress(true);
    }

    function handleNewAddress(){
        setUseSavedAddress(false);

        setPhone("");
        setAddress("");
        setCity("");
        setState("");
        setPincode("");
    }

    if(
        loading||
        productsLoading||
        profileLoading
    ){
        return(
            <main className="checkout-page">
                <div className="checkout-state">
                    Loading checkout...
                </div>
            </main>
        );
    }

    if(error&&!products.length){
        return(
            <main className="checkout-page">
                <div className="checkout-state checkout-error">
                    {error}
                </div>
            </main>
        );
    }

    if(products.length===0){
        return(
            <main className="checkout-page">
                <div className="checkout-state">
                    <p className="checkout-eyebrow">
                        CHECKOUT
                    </p>

                    <h1>
                        Your bag is empty.
                    </h1>

                    <p>
                        Add something to your bag before
                        continuing.
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

    async function handleSubmit(event){
        event.preventDefault();

        if(processing){
            return;
        }

        setError("");
        setProcessing(true);

        try{
            const shippingAddress={
                name:name,
                phone:phone,
                address:address,
                city:city,
                state:state,
                pincode:pincode
            };

            const orderItems=products.map(product=>({
                productId:product.id,
                quantity:items[product.id].quantity
            }));

            const result=await createBackendOrder(
                orderItems,
                shippingAddress
            );

            const options={
                key:import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount:result.totalAmount*100,
                currency:"INR",
                name:"Jewellery Store",
                description:"Jewellery Purchase",
                order_id:result.razorpayOrderId,

                handler:async function(response){
                    try{
                        const verification=
                            await verifyBackendPayment({
                                orderId:
                                    result.orderId,

                                razorpayOrderId:
                                    response.razorpay_order_id,

                                razorpayPaymentId:
                                    response.razorpay_payment_id,

                                razorpaySignature:
                                    response.razorpay_signature
                            });

                        if(!verification.verified){
                            setError(
                                "We could not verify the payment."
                            );

                            setProcessing(false);
                            return;
                        }

                        if(
                            !useSavedAddress&&
                            saveNewAddress
                        ){
                            try{
                                await saveCustomerProfile(
                                    name,
                                    phone,
                                    {
                                        address:address,
                                        city:city,
                                        state:state,
                                        pincode:pincode
                                    }
                                );
                            }catch(error){
                                console.error(
                                    "Unable to save customer profile:",
                                    error
                                );
                            }
                        }

                        try{
                            await clearCart();
                        }catch(error){
                            console.error(
                                "Unable to clear local cart:",
                                error
                            );
                        }

                        navigate(
                            "/order-success",
                            {
                                state:{
                                    orderId:
                                        verification.orderId,

                                    totalAmount:
                                        result.totalAmount
                                }
                            }
                        );
                    }catch(error){
                        console.error(
                            "Payment verification failed:",
                            error
                        );

                        setError(
                            "We could not verify your payment. Please do not try the payment again immediately."
                        );

                        setProcessing(false);
                    }
                },

                prefill:{
                    name:name,
                    contact:phone
                },

                theme:{
                    color:"#111827"
                },

                modal:{
                    ondismiss:function(){
                        setProcessing(false);
                    }
                }
            };

            const razorpay=
                new window.Razorpay(options);

            razorpay.open();
        }catch(error){
            console.error(
                "Create order failed:",
                error
            );

            setError(
                error.message||
                "Unable to create your order."
            );

            setProcessing(false);
        }
    }

    return(
        <main className="checkout-page">
            <header className="checkout-header">
                <p className="checkout-eyebrow">
                    CHECKOUT
                </p>

                <h1>
                    Complete your order.
                </h1>
            </header>

            <div className="checkout-layout">
                <section className="checkout-form-section">
                    <div className="checkout-section-header">
                        <p>
                            01
                        </p>

                        <h2>
                            Delivery details
                        </h2>
                    </div>

                    {savedAddress&&(
                        <div className="saved-address-section">
                            <div className="saved-address-header">
                                <div>
                                    <p>
                                        SAVED DETAILS
                                    </p>

                                    <strong>
                                        {savedAddress.name||
                                            name}
                                    </strong>
                                </div>

                                {useSavedAddress&&(
                                    <span>
                                        SELECTED
                                    </span>
                                )}
                            </div>

                            <div className="saved-address-content">
                                <p>
                                    {savedAddress.address}
                                </p>

                                <p>
                                    {savedAddress.city},
                                    {" "}
                                    {savedAddress.state}
                                    {" "}
                                    {savedAddress.pincode}
                                </p>

                                <p>
                                    {savedAddress.phone}
                                </p>
                            </div>

                            <div className="saved-address-actions">
                                <button
                                    type="button"
                                    className={
                                        useSavedAddress
                                            ?"saved-address-option active"
                                            :"saved-address-option"
                                    }
                                    onClick={
                                        handleUseSavedAddress
                                    }
                                >
                                    Use saved details
                                </button>

                                <button
                                    type="button"
                                    className={
                                        !useSavedAddress
                                            ?"saved-address-option active"
                                            :"saved-address-option"
                                    }
                                    onClick={
                                        handleNewAddress
                                    }
                                >
                                    Use a different address
                                </button>
                            </div>
                        </div>
                    )}

                    <form
                        className="checkout-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="checkout-field checkout-field-full">
                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={event=>{
                                    setName(
                                        event.target.value
                                    );
                                }}
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={event=>{
                                    setPhone(
                                        event.target.value
                                    );
                                }}
                                required
                            />
                        </div>

                        <div className="checkout-field checkout-field-full">
                            <label htmlFor="address">
                                Address
                            </label>

                            <textarea
                                id="address"
                                value={address}
                                onChange={event=>{
                                    setAddress(
                                        event.target.value
                                    );
                                }}
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="city">
                                City
                            </label>

                            <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={event=>{
                                    setCity(
                                        event.target.value
                                    );
                                }}
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="state">
                                State
                            </label>

                            <input
                                id="state"
                                type="text"
                                value={state}
                                onChange={event=>{
                                    setState(
                                        event.target.value
                                    );
                                }}
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label htmlFor="pincode">
                                PIN Code
                            </label>

                            <input
                                id="pincode"
                                type="text"
                                inputMode="numeric"
                                value={pincode}
                                onChange={event=>{
                                    setPincode(
                                        event.target.value
                                    );
                                }}
                                required
                            />
                        </div>

                        {!useSavedAddress&&(
                            <label className="save-address-option">
                                <input
                                    type="checkbox"
                                    checked={saveNewAddress}
                                    onChange={event=>{
                                        setSaveNewAddress(
                                            event.target.checked
                                        );
                                    }}
                                />

                                <span>
                                    Save this address for future orders
                                </span>
                            </label>
                        )}

                        {error&&(
                            <div className="checkout-error-message">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="checkout-submit"
                            disabled={processing}
                        >
                            {processing
                                ?"Processing..."
                                :"Continue to Payment"}
                        </button>

                        <Link
                            to="/cart"
                            className="checkout-back"
                        >
                            ← Return to Bag
                        </Link>
                    </form>
                </section>

                <aside className="checkout-summary">
                    <div className="checkout-summary-header">
                        <p>
                            02
                        </p>

                        <h2>
                            Your order
                        </h2>
                    </div>

                    <div className="checkout-products">
                        {products.map(product=>{
                            const quantity=
                                items[product.id]?.quantity||0;

                            const subtotal=
                                product.price*quantity;

                            const image=
                                product.images?.[0];

                            return(
                                <Link
                                    to={`/products/${product.id}`}
                                    className="checkout-product"
                                    key={product.id}
                                >
                                    <div className="checkout-product-image">
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

                                    <div className="checkout-product-info">
                                        <h3>
                                            {product.name}
                                        </h3>

                                        <p>
                                            Qty {quantity}
                                        </p>
                                    </div>

                                    <strong>
                                        ₹{subtotal.toLocaleString("en-IN")}
                                    </strong>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="checkout-summary-divider"/>

                    <div className="checkout-total-row">
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹{total.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="checkout-total-row checkout-grand-total">
                        <span>
                            Total
                        </span>

                        <strong>
                            ₹{total.toLocaleString("en-IN")}
                        </strong>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;