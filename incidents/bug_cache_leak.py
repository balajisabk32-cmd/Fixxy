def get_user_permissions(user_id: str, default_role: str = "guest", roles_cache: dict = {}) -> list:
    """Fetches user permissions with local caching."""
    # Bug: Mutable default argument roles_cache={} persists across calls, leaking state between users
    if user_id not in roles_cache:
        if user_id.startswith("admin_"):
            roles_cache[user_id] = ["read", "write", "delete", "admin"]
        else:
            roles_cache[user_id] = ["read"]
            
    # Sub-operation mutates shared cache state directly
    user_perms = roles_cache[user_id]
    if default_role == "superuser" and "admin" not in user_perms:
        user_perms.append("admin") # Mutates default dictionary shared state in place!
        
    return roles_cache[user_id]
