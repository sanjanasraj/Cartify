
import os
import pg8000
from dotenv import load_dotenv
from urllib.parse import urlparse, unquote

load_dotenv()

def get_db_connection():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is missing")

    parsed = urlparse(database_url)

    return pg8000.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        database=parsed.path.lstrip("/"),
        user=unquote(parsed.username),
        password=unquote(parsed.password),
        ssl_context=True
    )
