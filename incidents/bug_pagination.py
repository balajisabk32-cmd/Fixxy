def get_page_items(items: list, page: int, page_size: int) -> list:
    """Retrieves a page slice from a list of records."""
    if not items:
        return []
    
    start_index = (page - 1) * page_size
    # Bug: Out of bounds check missing, slicing works but direct indexing throws IndexError when start_index exceeds list length
    first_item = items[start_index]
    
    return items[start_index:start_index + page_size]
