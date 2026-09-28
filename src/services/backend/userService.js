import {backendRequest} from "./backendClient";

export async function saveCustomerProfile(
    name,
    phone,
    shippingAddress
){
    return await backendRequest(
        "/api/users/save-profile",
        {
            method:"POST",
            body:JSON.stringify({
                name:name,
                phone:phone,
                shippingAddress:shippingAddress
            })
        }
    );
}