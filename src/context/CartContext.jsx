import {createContext,useContext,useEffect,useState} from "react";
import {useAuth} from "./AuthContext";
import {getCart,saveCart} from "../services/cart/cartService";

const CartContext=createContext();

export function CartProvider({children}){
    const {user}=useAuth();
    const [items,setItems]=useState({});
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        async function loadCart(){
            if(!user){
                setItems({});
                setLoading(false);
                return;
            }

            try{
                const cart=await getCart(user.uid);
                setItems(cart);
            }catch(error){
                console.error(error);
                setItems({});
            }finally{
                setLoading(false);
            }
        }

        setLoading(true);
        loadCart();
    },[user]);

    async function updateCart(newItems){
        if(!user){
            return;
        }

        setItems(newItems);
        await saveCart(user.uid,newItems);
    }

    async function addToCart(productId){
        const newItems={...items};

        if(newItems[productId]){
            newItems[productId]={
                quantity:newItems[productId].quantity+1
            };
        }else{
            newItems[productId]={
                quantity:1
            };
        }

        await updateCart(newItems);
    }

    async function removeFromCart(productId){
        const newItems={...items};

        delete newItems[productId];

        await updateCart(newItems);
    }

    async function updateQuantity(productId,quantity){
        if(quantity<=0){
            await removeFromCart(productId);
            return;
        }

        const newItems={
            ...items,
            [productId]:{
                quantity:quantity
            }
        };

        await updateCart(newItems);
    }

    async function clearCart(){
        if(!user){
            setItems({});
            return;
        }

        setItems({});
        await saveCart(user.uid,{});
    }

    return(
        <CartContext.Provider
            value={{
                items,
                loading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart(){
    return useContext(CartContext);
}