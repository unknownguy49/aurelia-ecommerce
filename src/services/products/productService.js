import {collection,getDocs,doc,getDoc} from "firebase/firestore";
import db from "../firebase/firestore";

const productImages={
    "RNG-001":"/products/RNG-001.webp",
    "RNG-002":"/products/RNG-002.webp",
    "NCK-001":"/products/NCK-001.webp",
    "NCK-002":"/products/NCK-002.webp",
    "ERG-001":"/products/ERG-001.webp",
    "ERG-002":"/products/ERG-002.webp",
    "BRC-001":"/products/BRC-001.webp",
    "CHN-001":"/products/CHN-001.webp"
};

function attachProductImage(product){
    return{
        ...product,
        images:
            productImages[product.id]
                ?[productImages[product.id]]
                :product.images||[]
    };
}

export async function getProducts(){
    const snapshot=await getDocs(collection(db,"products"));

    return snapshot.docs.map(document=>
        attachProductImage({
            id:document.id,
            ...document.data()
        })
    );
}

export async function getProductById(id){
    const reference=doc(db,"products",id);
    const snapshot=await getDoc(reference);

    if(!snapshot.exists()){
        return null;
    }

    return attachProductImage({
        id:snapshot.id,
        ...snapshot.data()
    });
}