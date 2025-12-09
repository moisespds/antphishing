#!/usr/bin/env python3
"""
Native Messaging Host para Extensão Anti-Phishing
Comunica entre a extensão Chrome e o servidor Node.js local
"""

import sys
import json
import struct
import urllib.request
import urllib.error

# Porta do servidor Node.js
SERVER_URL = "http://localhost:3000/api/validateDomain"

def send_message(message):
    """Envia mensagem para a extensão Chrome"""
    encoded = json.dumps(message).encode('utf-8')
    length = struct.pack('I', len(encoded))
    sys.stdout.buffer.write(length)
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()

def read_message():
    """Lê mensagem da extensão Chrome"""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    message_length = struct.unpack('I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def validate_url(url):
    """Comunica com servidor Node.js para validar URL"""
    try:
        payload = json.dumps({"url": url}).encode('utf-8')
        req = urllib.request.Request(
            SERVER_URL,
            data=payload,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return {"error": str(e), "status": "error"}

def main():
    """Loop principal de Native Messaging"""
    while True:
        try:
            message = read_message()
            if not message:
                break
            
            if message.get("action") == "validateUrl":
                url = message.get("url")
                result = validate_url(url)
                send_message({"success": True, "data": result})
            else:
                send_message({"success": False, "error": "Ação desconhecida"})
        except Exception as e:
            send_message({"success": False, "error": str(e)})

if __name__ == "__main__":
    main()
