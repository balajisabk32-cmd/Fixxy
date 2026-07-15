def calculate_discount(total_amount: float, total_items: int) -> float:
    """Calculates average discount per item for bulk orders."""
    if total_amount < 0:
        raise ValueError("Total amount cannot be negative")
        
    # Bug: Division by zero when total_items is 0
    average_price = total_amount / total_items
    if average_price > 100:
        return total_amount * 0.15
    return total_amount * 0.05
