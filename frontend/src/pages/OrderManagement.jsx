
import { useEffect, useState } from "react";
import "./OrderManagement.css";
import API_URL from "../api";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setMessage("Unable to load orders. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("OrderManagement component loaded!");
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Status update failed");
      }

      setMessage(`Order #${orderId} status updated successfully!`);
      await fetchOrders();

    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return <p className="orders-loading">Loading orders...</p>;
  }

  return (
    <section className="order-management">
      <div className="orders-heading">
        <h2>Order Management</h2>
        <p>View and manage customer orders.</p>
      </div>

      <div className="order-stats">
        <div className="order-stat-card">
          <h3>Total Orders</h3>
          <h2>{orders.length}</h2>
        </div>

        <div className="order-stat-card">
          <h3>Pending Orders</h3>
          <h2>
            {orders.filter(
              (order) => order.order_status === "Pending"
            ).length}
          </h2>
        </div>

        <div className="order-stat-card">
          <h3>Delivered Orders</h3>
          <h2>
            {orders.filter(
              (order) => order.order_status === "Delivered"
            ).length}
          </h2>
        </div>
      </div>

      {message && (
        <p className="orders-message">{message}</p>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <h3>No Orders Yet</h3>
          <p>Customer orders will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>

              <div className="order-card-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>

                <span className={`order-status ${order.order_status.toLowerCase()}`}>
                  {order.order_status}
                </span>
              </div>

              <div className="order-customer">
                <p>
                  <strong>Customer:</strong> {order.customer_name}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer_email}
                </p>
              </div>

              <div className="order-items">
                <h4>Ordered Products</h4>

                {order.items.map((item, index) => (
                  <div
                    className="order-item"
                    key={`${item.product_id}-${index}`}
                  >
                    <span>{item.product_name}</span>
                    <span>
                      {item.quantity} × ₹
                      {item.price.toLocaleString("en-IN")}
                    </span>
                    <strong>
                      ₹{item.subtotal.toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <h3>
                  Total: ₹
                  {order.total_amount.toLocaleString("en-IN")}
                </h3>

                <div className="status-control">
                  <label>Update Status:</label>

                  <select
                    value={order.order_status}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderManagement;