import json
import logging
import urllib.request
import urllib.error
from typing import Any

logger = logging.getLogger(__name__)

OLLAMA_URL  = "http://localhost:11434/api/chat"
MODEL_NAME  = "qwen2.5:1.5b"

def get_structured_answer(messages: list[dict[str, str]]) -> dict:
    """
    Calls local Ollama and expects a JSON response.
    """
    payload = json.dumps({
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        "format": "json", 
    }).encode("utf-8")

    req = urllib.request.Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw_data = resp.read().decode("utf-8")
            response_json = json.loads(raw_data)
            content = response_json.get("message", {}).get("content", "{}")
            
            # Clean content
            content = content.strip()
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            return json.loads(content)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        logger.error(f"Ollama returned error: {error_body}")
        return {"error": "Ollama Server Error", "raw": error_body}
    except Exception as exc:
        # If standard parsing fails, try to extract JSON from the text using regex
        try:
            import re
            # Extract raw_data from the outer scope if possible, or use the exception context
            # In this scope, we still have access to 'content' if the error happened at json.loads(content)
            match = re.search(r'(\{.*\})', str(exc), re.DOTALL)
            if not match and 'content' in locals():
                match = re.search(r'(\{.*\})', content, re.DOTALL)
                
            if match:
                return json.loads(match.group(1))
        except:
            pass

        logger.error(f"Failed to get response: {exc}")
        return {"error": "Connection Failed", "raw": str(exc)}