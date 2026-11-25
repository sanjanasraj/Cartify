
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import OrderManagement from "./pages/OrderManagement";
import Auth from "./pages/Auth";
import "./App.css";
import API_URL from "./api";

function App() {
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check whether a user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/me`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("home");
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setPage("home");
    } catch (error) {
      console.error(error);
      alert("Unable to log out. Please try again.");
    }
  };

  if (checkingSession) {
    return <p style={{ textAlign: "center", padding: "40px" }}>
      Loading Cartify...
    </p>;
  }

  return (
    <>
      <Navbar
        cartCount={cart.reduce(
          (total, item) => total + item.quantity,
          0
        )}
        setPage={setPage}
        user={user}
        onLogin={() => setPage("auth")}
        onLogout={handleLogout}
      />

      {page === "auth" ? (
        <Auth
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setPage("home")}
        />
      ) : page === "admin" && user?.role === "admin" ? (
        <>
          <Admin />
          <OrderManagement />
        </>
      ) : (
        <Home
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      )}
    </>
  );
}

export default App;

