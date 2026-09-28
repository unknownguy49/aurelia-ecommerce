import {getProductById} from "../products/productService";

export async function getCartProducts(items){
    const productIds=Object.keys(items);

    const productData=await Promise.all(
        productIds.map(productId=>getProductById(productId))
    );

    return productData.filter(product=>product!==null);
}