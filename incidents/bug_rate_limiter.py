import threading
import time

lock = threading.Lock()
request_counters = {}

def process_rate_limited_request(client_ip: str, limit: int = 100) -> bool:
    """Enforces per-IP sliding window rate limit with thread lock safety."""
    lock.acquire()
    
    # Bug: If exception occurs during dict lookup or parsing, lock is NEVER released!
    count = request_counters.get(client_ip, 0)
    
    if count >= limit:
        raise ValueError(f"Rate limit exceeded for IP {client_ip}") # Exception before release!
        
    request_counters[client_ip] = count + 1
    lock.release()
    return True
