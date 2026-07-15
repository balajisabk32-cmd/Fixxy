def generate_invoice_summary(client_name: str, invoice_id: int, total_amount: float) -> str:
    """Generates text line summary for email notifications."""
    # Bug: Implicit string concatenation with non-string integer invoice_id
    header = "Invoice #" + invoice_id + " for " + client_name
    footer = f"Total Due: ${total_amount:.2f}"
    return header + "\n" + footer
