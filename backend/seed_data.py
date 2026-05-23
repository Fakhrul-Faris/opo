import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_ROLE')
if not url or not service_key:
    raise SystemExit('Missing SUPABASE_URL or SERVICE_ROLE')
client = create_client(url, service_key)

# Sample campaigns
campaigns = [
    {
        "name": "Spring Launch",
        "objective": "User acquisition",
        "channel": "TikTok",
        "status": "active",
        "start_date": "2026-04-01",
        "end_date": "2026-06-30",
        "budget": 5000,
        "compliance_dependent": False,
        "ai_indexed": False,
    },
    {
        "name": "Summer Promo",
        "objective": "Brand awareness",
        "channel": "Instagram",
        "status": "draft",
        "start_date": "2026-07-01",
        "end_date": "2026-08-31",
        "budget": 3000,
        "compliance_dependent": False,
        "ai_indexed": False,
    },
]

# Insert campaigns
res = client.table('campaigns').insert(campaigns).execute()
print('Inserted campaigns:', res.data if hasattr(res, 'data') else res)

# Sample content assets
contents = [
    {
        "campaign_id": res.data[0]['id'] if res.data else None,
        "title": "Launch teaser video",
        "type": "video",
        "platform": "TikTok",
        "theme": "Launch",
        "body": "A short teaser video for the spring launch.",
        "status": "active",
        "source": "https://example.com/video1.mp4",
        "published_date": "2026-04-15",
    },
    {
        "campaign_id": res.data[0]['id'] if res.data else None,
        "title": "Banner image",
        "type": "image",
        "platform": "Instagram",
        "theme": "Promo",
        "body": "Banner image for summer promo.",
        "status": "active",
        "source": "https://example.com/image1.jpg",
        "published_date": "2026-07-01",
    },
]
res_content = client.table('content_assets').insert(contents).execute()
print('Inserted content assets:', res_content.data if hasattr(res_content, 'data') else res_content)

# Sample referrals
referrals = [
    {
        "source": "user_123",
        "clicks": 0,
        "conversions": 0,
    },
]
res_ref = client.table('referrals').insert(referrals).execute()
print('Inserted referrals:', res_ref.data if hasattr(res_ref, 'data') else res_ref)
