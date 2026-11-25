
import { useEffect, useState } from "react";
import "./Admin.css";
import API_URL from "../api";

function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    image_url: "",
    stock: ""
  });

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  // Add or update a product
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const isEditing = editingId !== null;

    try {
      const response = await fetch(
        isEditing
          ? `${API_URL}/api/products/${editingId}`
          : `${API_URL}/api/products/${id}`,
        {
          method: isEditing ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stock: Number(form.stock)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Operation failed.");
        return;
      }

      setMessage(
        isEditing
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setEditingId(null);

      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        image_url: "",
        stock: ""
      });

      await fetchProducts();
    } catch (error) {
      setMessage("Server connection failed.");
    }
  };

  // Load product details into the form for editing
  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      image_url: product.image_url || "",
      stock: product.stock
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to delete product.");
        return;
      }

      if (editingId === id) {
        setEditingId(null);
        setForm({
          name: "",
          description: "",
          category: "",
          price: "",
          image_url: "",
          stock: ""
        });
      }

      setMessage("Product deleted successfully!");
      await fetchProducts();
    } catch (error) {
      setMessage("Server connection failed.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);

    setForm({
      name: "",
      description: "",
      category: "",
      price: "",
      image_url: "",
      stock: ""
    });

    setMessage("");
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <p>Manage your Cartify products</p>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <h3>Total Products</h3>
          <h2>{products.length}</h2>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

        <form onSubmit={handleSubmit} className="product-form">
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price (₹)"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />

          <input
            name="image_url"
            placeholder="Product Image URL"
            value={form.image_url}
            onChange={handleChange}
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock Quantity"
            value={form.stock}
            onChange={handleChange}
            min="0"
            required
          />

          <button type="submit">
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel Edit
            </button>
          )}
        </form>

        {message && <p className="admin-message">{message}</p>}
      </div>

      <div className="admin-products">
        <h2>Product Management</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>

                  <td>
                    <button onClick={() => handleEdit(product)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;

