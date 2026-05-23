import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.main import app

client = TestClient(app)


class TestHealth:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestAuth:
    def test_login_missing_credentials(self):
        response = client.post("/auth/login", json={"email": "", "password": ""})
        assert response.status_code in [400, 401]

    def test_login_invalid_credentials(self):
        response = client.post(
            "/auth/login",
            json={"email": "test@example.com", "password": "wrongpassword"}
        )
        assert response.status_code in [401, 500]  # Depends on Supabase


class TestCampaigns:
    def test_list_campaigns(self):
        response = client.get("/campaigns/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_campaign_missing_token(self):
        response = client.post(
            "/campaigns/",
            json={
                "name": "Test Campaign",
                "objective": "Awareness",
                "channel": "TikTok",
                "start_date": "2026-06-01"
            }
        )
        assert response.status_code in [403, 401, 500]


class TestContent:
    def test_list_content(self):
        response = client.get("/content/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestReferrals:
    def test_list_referrals(self):
        response = client.get("/referrals/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestSettings:
    def test_get_settings(self):
        response = client.get("/settings/")
        assert response.status_code == 200
        data = response.json()
        assert "ai_provider" in data
        assert "ai_api_key" in data


class TestAI:
    def test_execute_ai_missing_api_key(self):
        response = client.post(
            "/ai/execute",
            json={"prompt": "Test prompt"}
        )
        # Should fail without API key configured
        assert response.status_code in [400, 500]

    def test_execute_ai_invalid_prompt(self):
        response = client.post(
            "/ai/execute",
            json={}
        )
        assert response.status_code == 422  # Validation error
