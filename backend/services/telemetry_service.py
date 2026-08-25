from backend.core.supabase_client import supabase


def insert_telemetry(telemetry_data):
    """
    Insert one telemetry observation into Supabase.
    """

    response = (
        supabase
        .table("telemetry")
        .insert(telemetry_data)
        .execute()
    )

    return response.data