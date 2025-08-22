#!/usr/bin/env python3
"""
Focused test for rate limiting functionality
"""

import asyncio
import aiohttp
import json
import os
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

async def test_rate_limiting():
    """Test rate limiting with detailed logging"""
    test_url = "https://httpbin.org/html"
    payload = {"url": test_url}
    
    async with aiohttp.ClientSession() as session:
        print("Testing rate limiting with detailed responses...")
        
        for i in range(5):
            try:
                print(f"\n--- Request {i+1} ---")
                async with session.post(
                    f"{API_BASE}/seo/analyze", 
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    
                    print(f"Status: {response.status}")
                    
                    try:
                        data = await response.json()
                        print(f"Response: {json.dumps(data, indent=2)}")
                    except:
                        text = await response.text()
                        print(f"Response text: {text}")
                        
            except Exception as e:
                print(f"Request {i+1} failed: {str(e)}")
                
            await asyncio.sleep(0.5)

if __name__ == "__main__":
    asyncio.run(test_rate_limiting())