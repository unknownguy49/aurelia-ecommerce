import {useEffect,useState} from "react";
import {getProducts} from "../services/products/productService";
import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products(){
    const [products,setProducts]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>{
        async function loadProducts(){
            try{
                const data=await getProducts();
                setProducts(data.filter(product=>product.active===true));
            }catch(error){
                setError("Unable to load products.");
            }finally{
                setLoading(false);
            }
        }

        loadProducts();
    },[]);

    if(loading){
        return(
            <main className="products-page">
                <div className="products-state">
                    Loading collection...
                </div>
            </main>
        );
    }

    if(error){
        return(
            <main className="products-page">
                <div className="products-state products-error">
                    {error}
                </div>
            </main>
        );
    }

    return(
        <main className="products-page">
            <section className="products-header">
                <p className="section-eyebrow">
                    THE COLLECTION
                </p>

                <h1>
                    Jewellery, thoughtfully chosen.
                </h1>

                <p>
                    Explore our collection of contemporary pieces
                    crafted for everyday elegance and special moments.
                </p>
            </section>

            <section className="products-grid">
                {products.map(product=>(
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </section>
        </main>
    );
}

export default Products;