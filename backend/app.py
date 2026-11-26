
import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import get_db_connection
from routes.product_routes import product_bp
from routes.order_routes import order_bp
from routes.auth_routes import auth_bp

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY")

if not app.secret_key:
    raise RuntimeError("SECRET_KEY is missing from the .env file")

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True
)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "https://cartify-peach.vercel.app"
            ]
        }
    },
    supports_credentials=True
)

app.register_blueprint(product_bp)
app.register_blueprint(order_bp)
app.register_blueprint(auth_bp)


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to Cartify API!",
        "status": "Running"
    })


@app.route("/api/db-test")
def database_test():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT current_database();")
        database_name = cursor.fetchone()[0]
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Database connected successfully!",
            "database": database_name
        })

    except Exception as error:
        return jsonify({
            "message": "Database connection failed",
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
