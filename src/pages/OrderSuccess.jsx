import {Link,useLocation} from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess(){
    const {state}=useLocation();

    const orderId=state?.orderId;
    const totalAmount=state?.totalAmount;

    return(
        <main className="order-success-page">
            <section className="order-success">
                <p className="order-success-eyebrow">
                    ORDER CONFIRMED
                </p>

                <div className="order-success-mark">
                    ✓
                </div>

                <h1>
                    Thank you for your order.
                </h1>

                <p className="order-success-message">
                    Your payment was successfully processed.
                    We are preparing your jewellery for delivery.
                </p>

                {orderId&&(
                    <div className="order-success-details">
                        <div>
                            <span>
                                Order ID
                            </span>

                            <strong>
                                {orderId}
                            </strong>
                        </div>

                        {totalAmount!==undefined&&(
                            <div>
                                <span>
                                    Amount Paid
                                </span>

                                <strong>
                                    ₹{totalAmount.toLocaleString("en-IN")}
                                </strong>
                            </div>
                        )}
                    </div>
                )}

                <Link
                    to="/products"
                    className="order-success-button"
                >
                    Continue Shopping
                </Link>
            </section>
        </main>
    );
}

export default OrderSuccess;