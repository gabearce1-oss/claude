"""Emit signed events to n8n webhook."""
import json
import hmac
import hashlib
import uuid
import os
from datetime import datetime
from typing import Dict, Any
import requests
import sys


def sign_payload(payload: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature."""
    return hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()


def emit_event(
    event_type: str,
    payload: Dict[str, Any],
    webhook_url: str,
    webhook_secret: str,
) -> bool:
    """
    Emit a signed event to the n8n webhook.
    
    Args:
        event_type: One of the event types from webhook_contract.json
        payload: Event payload dict
        webhook_url: n8n endpoint URL
        webhook_secret: Shared secret for HMAC
    
    Returns:
        True if successfully sent (200/202 response)
    """
    event_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Build event envelope
    envelope = {
        "event_id": event_id,
        "event_type": event_type,
        "timestamp": timestamp,
        "payload": payload,
    }
    
    # Serialize to JSON
    event_json = json.dumps(envelope, separators=(",", ":"), sort_keys=True)
    
    # Sign
    signature = sign_payload(event_json, webhook_secret)
    
    # Send
    headers = {
        "X-Event-ID": event_id,
        "X-Event-Type": event_type,
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "X-Source": "github-ci-pipeline",
        "Content-Type": "application/json",
    }
    
    try:
        resp = requests.post(
            webhook_url,
            data=event_json,
            headers=headers,
            timeout=30,
        )
        
        if resp.status_code in (200, 202):
            print(f"✓ Event '{event_type}' sent (status {resp.status_code})")
            return True
        else:
            print(f"✗ Event '{event_type}' failed (status {resp.status_code})")
            print(f"  Response: {resp.text}")
            return False
    
    except requests.RequestException as e:
        print(f"✗ Failed to send event: {e}")
        return False


if __name__ == "__main__":
    # Parse CLI args
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--event_type", required=True)
    parser.add_argument("--build_sha", default="")
    parser.add_argument("--build_ref", default="")
    parser.add_argument("--webhook_secret", required=True)
    
    args = parser.parse_args()
    
    # Get webhook URL from env
    webhook_url = os.getenv("N8N_WEBHOOK_URL")
    if not webhook_url:
        print("Error: N8N_WEBHOOK_URL environment variable not set")
        sys.exit(1)
    
    # Build payload
    payload = {
        "build_sha": args.build_sha,
        "build_ref": args.build_ref,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    # Emit
    success = emit_event(
        args.event_type,
        payload,
        webhook_url,
        args.webhook_secret,
    )
    
    sys.exit(0 if success else 1)