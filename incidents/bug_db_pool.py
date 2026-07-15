class DatabaseConnectionPool:
    def __init__(self, max_connections: int = 5):
        self.max_connections = max_connections
        self.active_connections = 0

    def get_connection(self):
        if self.active_connections >= self.max_connections:
            raise RuntimeError(f"ConnectionPoolExhausted: All {self.max_connections} DB pool slots are in use.")
        self.active_connections += 1
        return f"Conn_{self.active_connections}"

    def release_connection(self, conn_id):
        if self.active_connections > 0:
            self.active_connections -= 1

db_pool = DatabaseConnectionPool(max_connections=5)

def fetch_user_orders(user_id: int) -> dict:
    """Queries user order history from database pool."""
    conn = db_pool.get_connection()
    
    # Simulating data query
    if user_id <= 0:
        # Bug: Early return on invalid ID without releasing the connection back to pool!
        raise ValueError("Invalid user_id provided")
        
    db_pool.release_connection(conn)
    return {"user_id": user_id, "orders": ["order_101", "order_102"]}
