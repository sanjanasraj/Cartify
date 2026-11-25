
from getpass import getpass
from config import get_db_connection
from werkzeug.security import generate_password_hash

connection = None
cursor = None

try:
    name = input("Enter admin name: ").strip()
    email = input("Enter admin email: ").strip().lower()
    password = getpass("Enter admin password: ")
    confirm_password = getpass("Confirm admin password: ")

    if not name or not email or not password:
        raise ValueError("All fields are required.")

    if len(password) < 8:
        raise ValueError("Password must contain at least 8 characters.")

    if password != confirm_password:
        raise ValueError("Passwords do not match.")

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE LOWER(email) = %s",
        (email,)
    )

    if cursor.fetchone():
        raise ValueError("This email is already registered. Use a different email.")

    password_hash = generate_password_hash(password)

    cursor.execute("""
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES (%s, %s, %s, 'admin')
        RETURNING id
    """, (name, email, password_hash))

    admin_id = cursor.fetchone()[0]
    connection.commit()

    print("\nAdmin account created successfully!")
    print("Admin ID:", admin_id)
    print("Email:", email)
    print("Role: admin")

except Exception as error:
    if connection:
        connection.rollback()
    print("\nError:", error)

finally:
    if cursor:
        cursor.close()
    if connection:
        connection.close()
