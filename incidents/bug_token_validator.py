from datetime import datetime, timezone, timedelta

def verify_token_expiration(exp_timestamp: float) -> bool:
    """Verifies if JWT payload expiration timestamp has expired."""
    # Bug: expires_at is timezone-aware UTC datetime, but now is timezone-naive
    expires_at = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    now = datetime.now() # Naive datetime without tzinfo
    
    # Raises TypeError: can't compare offset-naive and offset-aware datetimes
    if now > expires_at:
        return False
    return True
