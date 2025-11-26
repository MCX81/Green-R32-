#!/usr/bin/env python3
"""
Generate a secure JWT secret key for production use
"""
import secrets

if __name__ == "__main__":
    secret = secrets.token_urlsafe(32)
    print("=" * 60)
    print("🔐 Generated JWT Secret Key:")
    print("=" * 60)
    print(f"\n{secret}\n")
    print("=" * 60)
    print("Copy this value and use it as JWT_SECRET_KEY in backend/.env")
    print("=" * 60)
