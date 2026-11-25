
from flask import Blueprint, request, jsonify
from config import get_db_connection
from auth_utils import admin_required

product_bp = Blueprint("products", __name__)


# GET: View all products
@product_bp.route("/api/products", methods=["GET"])
def get_products():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, name, description, category, price, image_url, stock
        FROM products
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    products = []

    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "category": row[3],
            "price": float(row[4]),
            "image_url": row[5],
            "stock": row[6]
        })

    cursor.close()
    connection.close()

    return jsonify(products)


# POST: Add a new product
@product_bp.route("/api/products", methods=["POST"])
@admin_required
def add_product():
    data = request.get_json()

    required_fields = ["name", "category", "price", "stock"]

    if not data or any(field not in data for field in required_fields):
        return jsonify({"error": "Missing required product details"}), 400

    try:
        price = float(data["price"])
        stock = int(data["stock"])

        if price < 0 or stock < 0:
            return jsonify({"error": "Price and stock cannot be negative"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO products
            (name, description, category, price, image_url, stock)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data["name"],
            data.get("description", ""),
            data["category"],
            price,
            data.get("image_url", ""),
            stock
        ))

        product_id = cursor.fetchone()[0]

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Product added successfully",
            "product_id": product_id
        }), 201

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid price or stock value"}), 400

# PUT: Update an existing product
@product_bp.route("/api/products/<int:product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    data = request.get_json()

    required_fields = ["name", "category", "price", "stock"]

    if not data or any(field not in data for field in required_fields):
        return jsonify({"error": "Missing required product details"}), 400

    try:
        price = float(data["price"])
        stock = int(data["stock"])

        if price < 0 or stock < 0:
            return jsonify({"error": "Price and stock cannot be negative"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE products
            SET name = %s,
                description = %s,
                category = %s,
                price = %s,
                image_url = %s,
                stock = %s
            WHERE id = %s
            RETURNING id
        """, (
            data["name"],
            data.get("description", ""),
            data["category"],
            price,
            data.get("image_url", ""),
            stock,
            product_id
        ))

        result = cursor.fetchone()

        connection.commit()
        cursor.close()
        connection.close()

        if result is None:
            return jsonify({"error": "Product not found"}), 404

        return jsonify({"message": "Product updated successfully"})

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid price or stock value"}), 400

# DELETE: Remove a product
@product_bp.route("/api/products/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM products
            WHERE id = %s
            RETURNING id
        """, (product_id,))

        result = cursor.fetchone()

        connection.commit()
        cursor.close()
        connection.close()

        if result is None:
            return jsonify({"error": "Product not found"}), 404

        return jsonify({"message": "Product deleted successfully"})

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500
