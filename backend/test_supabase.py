from core.supabase_client import supabase


response = (
    supabase
    .table("telemetry")
    .select("*")
    .limit(1)
    .execute()
)


print("Supabase connection successful")
print(response.data)