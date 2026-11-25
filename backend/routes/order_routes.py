
from flask import Blueprint, request, jsonify
from config import get_db_connection
from auth_utils import admin_required

order_bp = Blueprint("orders", __name__)


@order_bp.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid order data"}), 400

    customer_name = data.get("customer_name")
    customer_email = data.get("customer_email")
    items = data.get("items")

    if not customer_name or not customer_email or not items:
        return jsonify({"error": "Missing customer or order details"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        total_amount = 0
        order_items = []

        # Validate products and calculate total
        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity")

            if not isinstance(product_id, int) or not isinstance(quantity, int) or quantity <= 0:
                connection.rollback()
                return jsonify({"error": "Invalid product or quantity"}), 400

            cursor.execute("""
                SELECT name, price, stock
                FROM products
                WHERE id = %s
                FOR UPDATE
            """, (product_id,))

            product = cursor.fetchone()

            if product is None:
                connection.rollback()
                return jsonify({"error": f"Product {product_id} not found"}), 404

            name, price, stock = product

            if stock < quantity:
                connection.rollback()
                return jsonify({
                    "error": f"Insufficient stock for {name}"
                }), 400

            subtotal = price * quantity
            total_amount += subtotal

            order_items.append({
                "product_id": product_id,
                "name": name,
                "price": price,
                "quantity": quantity,
                "subtotal": subtotal
            })

        # Create the order
        cursor.execute("""
            INSERT INTO orders
            (customer_name, customer_email, total_amount)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (customer_name, customer_email, total_amount))

        order_id = cursor.fetchone()[0]

        # Save items and update stock
        for item in order_items:
            cursor.execute("""
                INSERT INTO order_items
                (order_id, product_id, product_name, quantity, price, subtotal)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                item["product_id"],
                item["name"],
                item["quantity"],
                item["price"],
                item["subtotal"]
            ))

            cursor.execute("""
                UPDATE products
                SET stock = stock - %s
                WHERE id = %s
            """, (item["quantity"], item["product_id"]))

        connection.commit()

        return jsonify({
            "message": "Order placed successfully",
            "order_id": order_id,
            "total_amount": float(total_amount),
            "order_status": "Pending"
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "error": "Failed to place order",
            "details": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# GET: View all customer orders
@order_bp.route("/api/orders", methods=["GET"])
@admin_required
def get_orders():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, customer_name, customer_email,
                   total_amount, order_status, created_at
            FROM orders
            ORDER BY created_at DESC
        """)

        order_rows = cursor.fetchall()

        cursor.execute("""
            SELECT order_id, product_id, product_name,
                   quantity, price, subtotal
            FROM order_items
            ORDER BY order_id
        """)

        item_rows = cursor.fetchall()

        orders = []

        for row in order_rows:
            order = {
                "id": row[0],
                "customer_name": row[1],
                "customer_email": row[2],
                "total_amount": float(row[3]),
                "order_status": row[4],
                "created_at": str(row[5]),
                "items": []
            }

            for item in item_rows:
                if item[0] == row[0]:
                    order["items"].append({
                        "product_id": item[1],
                        "product_name": item[2],
                        "quantity": item[3],
                        "price": float(item[4]),
                        "subtotal": float(item[5])
                    })

            orders.append(order)

        return jsonify(orders)

    except Exception as error:
        return jsonify({
            "error": "Failed to fetch orders",
            "details": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# PUT: Update order status
@order_bp.route("/api/orders/<int:order_id>/status", methods=["PUT"])
@admin_required
def update_order_status(order_id):
    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({"error": "Order status is required"}), 400

    allowed_statuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered"
    ]

    status = data["status"]

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid order status"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE orders
            SET order_status = %s
            WHERE id = %s
            RETURNING id
        """, (status, order_id))

        result = cursor.fetchone()
        connection.commit()

        if result is None:
            return jsonify({"error": "Order not found"}), 404

        return jsonify({
            "message": "Order status updated successfully",
            "order_id": order_id,
            "status": status
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "error": "Failed to update order status",
            "details": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()