import { useEffect, useState } from "react";
import "./Home.css";
import API_URL from "../api";

function Home({ cart, addToCart, updateQuantity, removeFromCart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = async (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    setCheckoutMessage("Your cart is empty.");
    return;
  }

  setPlacingOrder(true);
  setCheckoutMessage("");
  setOrderConfirmation(null);

  const orderedItems = cart.map((item) => ({
    ...item,
  }));

  const orderedTotal = subtotal;

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: customerEmail,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to place order.");
    }

    setOrderConfirmation({
      orderId: data.order_id,
      items: orderedItems,
      total: data.total_amount ?? orderedTotal,
      status: data.order_status || "Pending",
    });

    setCustomerName("");
    setCustomerEmail("");

    orderedItems.forEach((item) => removeFromCart(item.id));

   } catch (error) {
     setCheckoutMessage(error.message || "Server connection failed.");
   } finally {
     setPlacingOrder(false);
   }
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">WELCOME TO CARTIFY</p>
          <h1>Your Shopping,<br /><span>Simplified.</span></h1>
          <p className="hero-description">
            Discover products you'll love. Shop your favourites
            with a smooth and simple shopping experience.
          </p>
          <a href="#products" className="shop-btn">Shop Now →</a>
        </div>

        <div className="hero-visual">
          <div className="shopping-icon">🛍️</div>
          <p>Everything you need, in one place.</p>
        </div>
      </section>

      <section className="categories" id="categories">
        <h2>Shop by Category</h2>
        <div className="category-list">
          <div className="category-card">👕<p>Fashion</p></div>
          <div className="category-card">💻<p>Electronics</p></div>
          <div className="category-card">🏠<p>Home & Living</p></div>
          <div className="category-card">⌚<p>Accessories</p></div>
        </div>
      </section>

      <section className="products-section" id="products">
        <h2>Featured Products</h2>
        <p>Explore our collection of popular picks.</p>

        <input
          className="search-input"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-list">
          {["All", "Fashion", "Electronics", "Home & Living", "Accessories"].map((item) => (
            <button
              key={item}
              className={category === item ? "filter-btn active" : "filter-btn"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <img src={product.image_url} alt={product.name} />

                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="product-price">₹{product.price}</p>
                  <button
                    className="add-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </section>

      <section className="cart-section" id="cart">
        <h2>Your Shopping Cart 🛒</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty. Start shopping!</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image_url} alt={item.name} />

                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>₹{item.price} each</p>

                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)}>
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <strong>₹{item.price * item.quantity}</strong>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <h3>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</h3>
              <p>Shipping and taxes will be calculated at checkout.</p>
              <form className="checkout-form" onSubmit={handleCheckout}>
                <h3>Customer Details</h3>

                <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Enter your email address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="checkout-btn"
                >
                    Place Order
                </button>

                {checkoutMessage && (
                    <p className="checkout-message">{checkoutMessage}</p>
                )}
                </form>
            </div>
          </>
        )}
            </section>

            {orderConfirmation && (
              <section className="order-confirmation">
                <h2>🎉 Order Placed Successfully!</h2>

                <p>
                  Thank you for shopping with Cartify.
                </p>

                <div className="confirmation-details">
                  <p>
                    <strong>Order ID:</strong> #{orderConfirmation.orderId}
                  </p>

                  <p>
                    <strong>Order Status:</strong> {orderConfirmation.status}
                  </p>

                  <h3>Order Summary</h3>

                  {orderConfirmation.items.map((item) => (
                    <div className="confirmation-item" key={item.id}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <strong>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}

                  <h3>
                    Total: ₹
                    {Number(orderConfirmation.total).toLocaleString("en-IN")}
                  </h3>
                </div>
              </section>
            )}

          </main>
  );
}

export default Home;

