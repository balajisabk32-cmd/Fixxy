import time

active_sessions = {
    "sess_101": {"user_id": 1, "last_active": time.time() - 3600},
    "sess_102": {"user_id": 2, "last_active": time.time() - 50},
    "sess_103": {"user_id": 3, "last_active": time.time() - 4000},
}

def evict_expired_sessions(ttl_seconds: int = 1800) -> int:
    """Removes sessions older than ttl_seconds from global active_sessions."""
    current_time = time.time()
    evicted_count = 0
    
    # Bug: Directly mutating dictionary during iteration over keys
    for session_id, data in active_sessions.items():
        if current_time - data["last_active"] > ttl_seconds:
            del active_sessions[session_id]
            evicted_count += 1
            
    return evicted_count
