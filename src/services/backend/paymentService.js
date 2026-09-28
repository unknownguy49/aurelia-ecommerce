import {backendRequest} from "./backendClient";

export async function createOrder(
    items,
    shippingAddress
){
    return await backendRequest(
        "/api/payments/create-order",
        {
            method:"POST",
            body:JSON.stringify({
                items:items,
                shippingAddress:shippingAddress
            })
        }
    );
}

export async function verifyPayment(
    paymentData
){
    return await backendRequest(
        "/api/payments/verify-payment",
        {
            method:"POST",
            body:JSON.stringify(
                paymentData
            )
        }
    );
}