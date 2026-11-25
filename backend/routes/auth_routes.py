
from flask import Blueprint, request, jsonify, session
from config import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)


# REGISTER
@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid registration data"}), 400

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not full_name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must contain at least 8 characters"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE LOWER(email) = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({"error": "Email is already registered"}), 409

        password_hash = generate_password_hash(password)

        cursor.execute("""
            INSERT INTO users (full_name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (full_name, email, password_hash))

        user_id = cursor.fetchone()[0]
        connection.commit()

        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": user_id,
                "full_name": full_name,
                "email": email,
                "role": "user"
            }
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({"error": "Registration failed"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# LOGIN
@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid login data"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, full_name, email, password_hash, role
            FROM users
            WHERE LOWER(email) = %s
        """, (email,))

        user = cursor.fetchone()

        if not user or not check_password_hash(user[3], password):
            return jsonify({"error": "Invalid email or password"}), 401

        session.clear()
        session["user_id"] = user[0]
        session["role"] = user[4]

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "role": user[4]
            }
        })

    except Exception:
        return jsonify({"error": "Login failed"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# LOGOUT
@auth_bp.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})


# CHECK CURRENT LOGIN
@auth_bp.route("/api/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"user": None}), 200

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, full_name, email, role
            FROM users
            WHERE id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            session.clear()
            return jsonify({"user": None}), 200

        return jsonify({
            "user": {
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "role": user[3]
            }
        })

    except Exception:
        return jsonify({"error": "Could not check login status"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
