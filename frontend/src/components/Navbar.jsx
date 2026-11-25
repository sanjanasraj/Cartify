
import "./Navbar.css";

function Navbar({
  cartCount,
  setPage,
  user,
  onLogin,
  onLogout,
}) {
  return (
    <nav className="navbar">
      <div className="logo" onClick={() => setPage("home")}>
        Cartify<span>.</span>
      </div>

      <div className="nav-links">
        <a href="#" onClick={(e) => {
          e.preventDefault();
          setPage("home");
        }}>
          Home
        </a>

        <a href="#products" onClick={() => setPage("home")}>
          Products
        </a>

        <a href="#categories" onClick={() => setPage("home")}>
          Categories
        </a>

        {user?.role === "admin" && (
          <a href="#" onClick={(e) => {
            e.preventDefault();
            setPage("admin");
          }}>
            Admin
          </a>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="welcome-user">
              Hi, {user.full_name}
            </span>

            <button className="login-btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn" onClick={onLogin}>
            Login
          </button>
        )}

        <a href="#cart" className="cart-btn">
          🛒 Cart <span className="cart-count">{cartCount}</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;


