import {doc,getDoc,setDoc} from "firebase/firestore";
import db from "../firebase/firestore";

export async function getUserProfile(userId){
    const reference=doc(db,"users",userId);
    const snapshot=await getDoc(reference);

    if(!snapshot.exists()){
        return null;
    }

    return{
        id:snapshot.id,
        ...snapshot.data()
    };
}

export async function updateUserProfile(userId,data){
    const reference=doc(db,"users",userId);

    await setDoc(
        reference,
        data,
        {
            merge:true
        }
    );
}