#!/usr/bin/env python3
"""
OpenAI API Key Setup Script

This script helps you set up your OpenAI API key for use in Jupyter notebooks.
"""

import os
import sys

def setup_openai_key():
    """Interactive setup for OpenAI API key"""
    
    print("🔧 OpenAI API Key Setup")
    print("=" * 40)
    
    # Check if already set
    if os.environ.get("OPENAI_API_KEY"):
        print("✅ OPENAI_API_KEY is already set!")
        return True
    
    print("\n📋 Instructions:")
    print("1. Go to https://platform.openai.com/")
    print("2. Sign up or log in to your account")
    print("3. Navigate to API Keys section")
    print("4. Create a new API key")
    print("5. Copy the key (it starts with 'sk-')")
    
    print("\n🔑 Enter your OpenAI API key (or press Enter to skip):")
    api_key = input("API Key: ").strip()
    
    if not api_key:
        print("\n⚠️  No API key provided. You'll need to set it manually.")
        print("\nTo set it manually:")
        print("1. In your terminal: export OPENAI_API_KEY='your_key_here'")
        print("2. Or create a .env file with: OPENAI_API_KEY=your_key_here")
        print("3. Or set it directly in your notebook (less secure)")
        return False
    
    if not api_key.startswith("sk-"):
        print("\n❌ Invalid API key format. OpenAI API keys start with 'sk-'")
        return False
    
    # Set the environment variable
    os.environ["OPENAI_API_KEY"] = api_key
    print("\n✅ API key set successfully!")
    print("Note: This is only set for the current session.")
    print("For permanent setup, add to your shell profile or create a .env file.")
    
    return True

def test_connection():
    """Test the OpenAI API connection"""
    try:
        import openai
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        
        if not openai.api_key:
            print("❌ No API key available for testing")
            return False
        
        # Test with a simple request
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello!"}],
            max_tokens=10
        )
        
        print("✅ API connection successful!")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except ImportError:
        print("❌ OpenAI package not installed. Run: pip install openai")
        return False
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

if __name__ == "__main__":
    if setup_openai_key():
        print("\n🧪 Testing API connection...")
        test_connection()
    
    print("\n📝 Next steps:")
    print("1. Restart your Jupyter kernel")
    print("2. Run your notebook cells again")
    print("3. The OPENAI_API_KEY should now be available") 