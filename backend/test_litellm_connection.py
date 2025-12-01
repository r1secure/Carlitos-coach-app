import os
import sys
from litellm import completion
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration (matching backend/config.py)
API_BASE = "https://litellm2stech-internal-prod.cbp-generalprod.com/"
API_KEY = "sk-2108"
MODEL = "bedrock-claude-4-5-sonnet"
PROVIDER = "openai"

def test_completion():
    print(f"Testing LiteLLM connection...")
    print(f"Endpoint: {API_BASE}")
    print(f"Model: {MODEL}")
    print(f"Provider: {PROVIDER}")
    
    try:
        response = completion(
            model=MODEL,
            messages=[
                {"role": "user", "content": "Hello, are you working?"}
            ],
            api_base=API_BASE,
            api_key=API_KEY,
            custom_llm_provider=PROVIDER
        )
        
        print("\nSuccess! Response:")
        print("-" * 50)
        print(response.choices[0].message.content)
        print("-" * 50)
        
    except Exception as e:
        print("\nError occurred:")
        print("-" * 50)
        print(e)
        print("-" * 50)

import httpx

def list_models():
    print(f"\nListing available models...")
    # Ensure URL ends with /
    base = API_BASE if API_BASE.endswith("/") else f"{API_BASE}/"
    url = f"{base}v1/models"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    try:
        response = httpx.get(url, headers=headers, timeout=10.0)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            models = response.json()
            print("Available models:")
            for m in models.get('data', []):
                print(f" - {m.get('id')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
    test_completion()
