#!/usr/bin/env python3
"""
AddBrain CORE Dashboard Backend API Tests
Tests all the backend APIs for the WhatsApp-based knowledge management tool
"""

import requests
import json
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://card-kanban.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

print(f"🧪 Testing AddBrain CORE Dashboard Backend APIs")
print(f"📍 Base URL: {API_BASE}")
print(f"👤 Demo User: +919995554710")
print("=" * 60)

def test_get_cards():
    """Test GET /api/cards - Fetch all cards"""
    print("\n1️⃣ Testing GET /api/cards - Fetch all cards")
    
    try:
        response = requests.get(f"{API_BASE}/cards", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            cards = response.json()
            print(f"   ✅ Success: Retrieved {len(cards)} cards")
            
            if len(cards) > 0:
                # Check first card structure
                first_card = cards[0]
                required_fields = ['_id', 'content', 'summary', 'tags', 'status', 'sentiment', 'sourceType', 'capturedAt']
                missing_fields = [field for field in required_fields if field not in first_card]
                
                if missing_fields:
                    print(f"   ⚠️  Missing fields in card: {missing_fields}")
                else:
                    print(f"   ✅ Card structure valid")
                    print(f"   📋 Sample card: {first_card.get('content', '')[:50]}...")
                    print(f"   🏷️  Status: {first_card.get('status')}")
                    print(f"   😊 Sentiment: {first_card.get('sentiment')}")
                
                return cards[0]['_id']  # Return first card ID for later tests
            else:
                print(f"   ⚠️  No cards found - database might be empty")
                return None
        else:
            print(f"   ❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return None

def test_get_cards_with_filters():
    """Test GET /api/cards with query parameters"""
    print("\n2️⃣ Testing GET /api/cards with filters")
    
    # Test with status filter
    try:
        response = requests.get(f"{API_BASE}/cards?status=indexed", timeout=10)
        print(f"   Status=indexed: {response.status_code}")
        if response.status_code == 200:
            cards = response.json()
            print(f"   ✅ Retrieved {len(cards)} indexed cards")
        else:
            print(f"   ❌ Failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error with status filter: {str(e)}")
    
    # Test with inspect status
    try:
        response = requests.get(f"{API_BASE}/cards?status=inspect", timeout=10)
        print(f"   Status=inspect: {response.status_code}")
        if response.status_code == 200:
            cards = response.json()
            print(f"   ✅ Retrieved {len(cards)} inspect cards")
        else:
            print(f"   ❌ Failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error with inspect filter: {str(e)}")

def test_create_card():
    """Test POST /api/cards - Create new card"""
    print("\n3️⃣ Testing POST /api/cards - Create new card")
    
    test_content = "Test card - new feature idea for mobile app with AI integration and user analytics"
    
    try:
        payload = {
            "content": test_content
        }
        
        response = requests.post(
            f"{API_BASE}/cards", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 201:
            card = response.json()
            print(f"   ✅ Success: Card created with ID {card.get('_id')}")
            print(f"   📝 Content: {card.get('content')}")
            print(f"   📊 Summary: {card.get('summary', 'No summary')}")
            print(f"   🏷️  Tags: {card.get('tags', [])}")
            print(f"   😊 Sentiment: {card.get('sentiment')}")
            print(f"   🔄 Status: {card.get('status')}")
            
            # Check if AI enrichment worked
            if card.get('tags') and len(card.get('tags', [])) > 0:
                print(f"   ✅ AI enrichment worked - tags generated")
            else:
                print(f"   ⚠️  AI enrichment might not be working (no API key) - using defaults")
            
            return card.get('_id')
        else:
            print(f"   ❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return None

def test_update_card(card_id):
    """Test PATCH /api/cards/[id] - Update card"""
    print(f"\n4️⃣ Testing PATCH /api/cards/{card_id} - Update card")
    
    if not card_id:
        print("   ⚠️  Skipping - no card ID available")
        return
    
    try:
        payload = {
            "status": "implement"
        }
        
        response = requests.patch(
            f"{API_BASE}/cards/{card_id}",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            card = response.json()
            print(f"   ✅ Success: Card updated")
            print(f"   🔄 New Status: {card.get('status')}")
            print(f"   📅 Updated At: {card.get('updatedAt')}")
        else:
            print(f"   ❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def test_delete_card(card_id):
    """Test DELETE /api/cards/[id] - Archive card"""
    print(f"\n5️⃣ Testing DELETE /api/cards/{card_id} - Archive card")
    
    if not card_id:
        print("   ⚠️  Skipping - no card ID available")
        return
    
    try:
        response = requests.delete(f"{API_BASE}/cards/{card_id}", timeout=10)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: Card archived")
            print(f"   📋 Result: {result}")
            
            # Verify card doesn't appear in GET /api/cards
            print("   🔍 Verifying card is archived...")
            get_response = requests.get(f"{API_BASE}/cards", timeout=10)
            if get_response.status_code == 200:
                cards = get_response.json()
                archived_card = next((c for c in cards if c['_id'] == card_id), None)
                if archived_card is None:
                    print("   ✅ Confirmed: Card no longer appears in active cards")
                else:
                    print("   ⚠️  Card still appears in active cards - soft delete might not be working")
            
        else:
            print(f"   ❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def test_webhook_verification():
    """Test GET /api/webhook/whatsapp - Webhook verification"""
    print("\n6️⃣ Testing GET /api/webhook/whatsapp - Webhook verification")
    
    # Test without valid token (should return 403)
    try:
        params = {
            'hub.mode': 'subscribe',
            'hub.verify_token': 'test',
            'hub.challenge': 'hello'
        }
        
        response = requests.get(f"{API_BASE}/webhook/whatsapp", params=params, timeout=10)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 403:
            print(f"   ✅ Expected: Webhook verification failed (no valid token configured)")
            print(f"   📝 Response: {response.text}")
        elif response.status_code == 200:
            print(f"   ⚠️  Unexpected: Webhook verification succeeded - token might be configured")
            print(f"   📝 Challenge response: {response.text}")
        else:
            print(f"   ❌ Unexpected status: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def test_error_cases():
    """Test various error cases"""
    print("\n7️⃣ Testing Error Cases")
    
    # Test POST /api/cards without content
    try:
        response = requests.post(
            f"{API_BASE}/cards",
            json={},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"   Empty POST: {response.status_code}")
        if response.status_code == 400:
            print(f"   ✅ Correctly rejected empty content")
        else:
            print(f"   ⚠️  Unexpected response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error testing empty POST: {str(e)}")
    
    # Test PATCH with invalid card ID
    try:
        response = requests.patch(
            f"{API_BASE}/cards/invalid_id",
            json={"status": "implement"},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"   Invalid ID PATCH: {response.status_code}")
        if response.status_code in [404, 500]:
            print(f"   ✅ Correctly handled invalid ID")
        else:
            print(f"   ⚠️  Unexpected response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error testing invalid ID: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Starting AddBrain CORE Dashboard Backend Tests")
    
    # Test 1: Get all cards
    first_card_id = test_get_cards()
    
    # Test 2: Get cards with filters
    test_get_cards_with_filters()
    
    # Test 3: Create new card
    new_card_id = test_create_card()
    
    # Test 4: Update card (use new card if available, otherwise first card)
    test_card_id = new_card_id or first_card_id
    test_update_card(test_card_id)
    
    # Test 5: Delete/Archive card
    test_delete_card(test_card_id)
    
    # Test 6: Webhook verification
    test_webhook_verification()
    
    # Test 7: Error cases
    test_error_cases()
    
    print("\n" + "=" * 60)
    print("🏁 Backend API Testing Complete")
    print("📊 Check the results above for any issues")

if __name__ == "__main__":
    main()