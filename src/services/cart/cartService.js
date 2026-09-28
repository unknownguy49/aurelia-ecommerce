import {doc,getDoc,setDoc} from "firebase/firestore";
import db from "../firebase/firestore";

function getCartReference(userId){
    return doc(db,"carts",userId);
}

export async function getCart(userId){
    const snapshot=await getDoc(getCartReference(userId));

    if(!snapshot.exists()){
        return {};
    }

    return snapshot.data().items||{};
}

export async function saveCart(userId,items){
    await setDoc(getCartReference(userId),{
        items:items
    });
}