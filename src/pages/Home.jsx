import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {getProducts} from "../services/products/productService";
import "./Home.css";

function Home(){
    const [products,setProducts]=useState([]);

    useEffect(()=>{
        async function loadProducts(){
            try{
                const data=await getProducts();

                setProducts(
                    data
                        .filter(product=>product.active===true)
                        .slice(0,4)
                );
            }catch(error){
                console.error(error);
            }
        }

        loadProducts();
    },[]);

    return(
        <main className="home">

            <section className="hero">
                <div className="hero-content">
                    <p className="hero-eyebrow">
                        THE ART OF JEWELLERY
                    </p>

                    <h1>
                        Jewellery,
                        <span>Refined.</span>
                    </h1>

                    <p className="hero-description">
                        Contemporary pieces crafted with intention,
                        designed to become part of your story.
                    </p>

                    <Link
                        to="/products"
                        className="hero-button"
                    >
                        Explore Collection
                    </Link>
                </div>

                <div className="hero-visual">
                    {/* <div className="hero-image-placeholder">
                        <span>
                            JEWELLERY
                        </span>
                    </div> */}
                    <div className="hero-image">
                        <img
                            src="/home/hero.webp"
                            alt="AURELIA jewellery collection"
                        />
                    </div>
                </div>
            </section>

            <section className="featured-section">
                <div className="featured-header">
                    <div>
                        <p className="section-eyebrow">
                            THE COLLECTION
                        </p>

                        <h2>
                            Pieces worth keeping.
                        </h2>
                    </div>

                    <Link
                        to="/products"
                        className="section-link"
                    >
                        View All →
                    </Link>
                </div>

                <div className="featured-grid">
                    {products.map(product=>{
                        const image=product.images?.[0];

                        return(
                            <Link
                                to={`/products/${product.id}`}
                                className="featured-product"
                                key={product.id}
                            >
                                <div className="featured-product-image">
                                    {image?(
                                        <img
                                            src={image}
                                            alt={product.name}
                                        />
                                    ):(
                                        <div>
                                            NO IMAGE
                                        </div>
                                    )}
                                </div>

                                <div className="featured-product-info">
                                    <div>
                                        <p>
                                            {product.category}
                                        </p>

                                        <h3>
                                            {product.name}
                                        </h3>
                                    </div>

                                    <strong>
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="categories-section">
                <div className="categories-header">
                    <p className="section-eyebrow">
                        FIND YOUR PIECE
                    </p>

                    <h2>
                        Explore by category.
                    </h2>
                </div>

                <div className="categories-grid">
                    <Link
                        to="/products"
                        className="category-card"
                    >
                        <span>
                            Rings
                        </span>

                        <strong>
                            →
                        </strong>
                    </Link>

                    <Link
                        to="/products"
                        className="category-card"
                    >
                        <span>
                            Necklaces
                        </span>

                        <strong>
                            →
                        </strong>
                    </Link>

                    <Link
                        to="/products"
                        className="category-card"
                    >
                        <span>
                            Earrings
                        </span>

                        <strong>
                            →
                        </strong>
                    </Link>

                    <Link
                        to="/products"
                        className="category-card"
                    >
                        <span>
                            Bracelets
                        </span>

                        <strong>
                            →
                        </strong>
                    </Link>
                </div>
            </section>

            <section className="story-section">
                <div className="story-visual">
                    <div className="story-image-placeholder">
                        <span>
                            AURELIA
                        </span>
                    </div>
                </div>

                <div className="story-content">
                    <p className="section-eyebrow">
                        THE AURELIA PHILOSOPHY
                    </p>

                    <h2>
                        Designed with intention.
                    </h2>

                    <p>
                        Jewellery should not simply complete an
                        outfit. It should become part of the moments
                        you remember.
                    </p>

                    <p>
                        AURELIA brings together timeless materials,
                        considered proportions and contemporary
                        design to create pieces made for everyday
                        life and the occasions that matter.
                    </p>

                    <Link
                        to="/products"
                        className="story-link"
                    >
                        Discover AURELIA →
                    </Link>
                </div>
            </section>

            <section className="editorial-section">
                <div className="editorial-content">
                    <p className="section-eyebrow">
                        MADE TO LAST
                    </p>

                    <h2>
                        Quiet luxury,
                        <span> beautifully considered.</span>
                    </h2>

                    <p>
                        From delicate everyday pieces to jewellery
                        designed for special occasions, every piece
                        is selected with a focus on proportion,
                        material and enduring style.
                    </p>
                </div>

                <div className="editorial-panel">
                    <span>
                        CRAFTED
                    </span>

                    <strong>
                        FOR YOUR
                    </strong>

                    <em>
                        story.
                    </em>
                </div>
            </section>

            <section className="home-intro">
                <p className="section-eyebrow">
                    DISCOVER THE COLLECTION
                </p>

                <h2>
                    Designed to be remembered.
                </h2>

                <p>
                    Explore carefully selected pieces crafted to
                    bring understated elegance to every occasion.
                </p>

                <Link to="/products">
                    View Collection →
                </Link>
            </section>

        </main>
    );
}

export default Home;