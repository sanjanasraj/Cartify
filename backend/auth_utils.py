
from functools import wraps
from flask import session, jsonify


def login_required(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Please log in first"}), 401

        return function(*args, **kwargs)

    return decorated_function


def admin_required(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Please log in first"}), 401

        if session.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403

        return function(*args, **kwargs)

    return decorated_function
