#!/usr/bin/env python3
"""
Debug script to identify JSON serialization issues in backup
"""

import asyncio
import aiohttp
import json

BASE_URL = "https://easycart-52.preview.emergentagent.com/api"
ADMIN_CREDENTIALS = {
    "email": "admin@r32.ro",
    "password": "admin123"
}

async def debug_backup():
    async with aiohttp.ClientSession() as session:
        # Login
        async with session.post(
            f"{BASE_URL}/admin/login",
            json=ADMIN_CREDENTIALS
        ) as response:
            if response.status != 200:
                print("Login failed")
                return
            data = await response.json()
            token = data["access_token"]
            
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get individual collections to see which one fails
        collections = ["categories", "products", "users", "orders", "reviews"]
        
        for collection in collections:
            try:
                print(f"Testing {collection}...")
                # This is a simplified test - we'll check the actual data
                async with session.get(f"{BASE_URL}/admin/backup/export", headers=headers) as response:
                    if response.status == 500:
                        error_text = await response.text()
                        print(f"Error in backup: {error_text}")
                        break
                    else:
                        print(f"Backup export status: {response.status}")
                        break
            except Exception as e:
                print(f"Exception testing {collection}: {e}")

if __name__ == "__main__":
    asyncio.run(debug_backup())