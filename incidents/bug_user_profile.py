def format_user_badge(user_data: dict) -> str:
    """Formats a user display badge for community profiles."""
    username = user_data.get("username", "Anonymous")
    
    # Bug: Directly accessing dictionary key without get() or check
    role = user_data["role"]
    
    return f"[{role.upper()}] {username}"
