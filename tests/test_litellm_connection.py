import os
import sys
from litellm import completion
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration (matching backend/config.py)
API_BASE = "https://litellm2stech-internal-prod.cbp-generalprod.com/"
API_KEY = "toto"
MODEL = "amazon.nova-pro-v1:0"
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

if __name__ == "__main__":
    test_completion()
