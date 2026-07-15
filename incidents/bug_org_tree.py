org_hierarchy = {
    "emp_1": "emp_2", # emp_1 reports to emp_2
    "emp_2": "emp_3", # emp_2 reports to emp_3
    "emp_3": "emp_1", # Bug: Cyclic reporting loop (emp_3 reports back to emp_1)
}

def get_reporting_chain(employee_id: str) -> list:
    """Traverses corporate reporting graph upwards to find executive chain."""
    if employee_id not in org_hierarchy:
        return [employee_id]
        
    manager_id = org_hierarchy[employee_id]
    # Bug: Unbounded recursion with no visited-set tracking to catch cycles
    return [employee_id] + get_reporting_chain(manager_id)
