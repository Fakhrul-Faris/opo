import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
if not url or not key:
    print('Missing env variables')
    raise SystemExit(1)
client = create_client(url, key)
try:
    response = client.table('campaigns').select('*').limit(1).execute()
    print('Response status:', getattr(response, 'status_code', 'N/A'))
    print('Data:', response.data if hasattr(response, 'data') else response)
except Exception as e:
    print('Error during request:', e)
