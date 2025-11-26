#!/usr/bin/env python3
"""
Check if production configuration is ready for deployment
"""
import os
import sys
from pathlib import Path

def check_env_file(env_path, required_vars):
    """Check if .env file exists and has required variables"""
    if not os.path.exists(env_path):
        return False, f"❌ File not found: {env_path}"
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    missing_vars = []
    warnings = []
    
    for var in required_vars:
        if f"{var}=" not in content:
            missing_vars.append(var)
        else:
            # Extract value
            for line in content.split('\n'):
                if line.startswith(f"{var}="):
                    value = line.split('=', 1)[1].strip()
                    
                    # Check for placeholder values
                    if 'CHANGE' in value.upper() or 'USERNAME' in value or 'PASSWORD' in value:
                        warnings.append(f"⚠️  {var} appears to have placeholder value")
                    elif var == 'JWT_SECRET_KEY' and len(value) < 32:
                        warnings.append(f"⚠️  {var} should be at least 32 characters")
                    elif var == 'REACT_APP_BACKEND_URL' and 'localhost' in value:
                        warnings.append(f"⚠️  {var} is still pointing to localhost")
                    elif var == 'CORS_ORIGINS' and 'localhost' in value and 'r32.ro' not in value:
                        warnings.append(f"⚠️  {var} should include production domain (r32.ro)")
    
    if missing_vars:
        return False, f"❌ Missing variables: {', '.join(missing_vars)}"
    
    if warnings:
        return True, warnings
    
    return True, "✅ All variables present and configured"

def main():
    print("=" * 60)
    print("🔍 R32 Production Configuration Check")
    print("=" * 60)
    print()
    
    root_dir = Path(__file__).parent.parent
    
    # Check backend .env
    print("📦 Backend Configuration:")
    backend_env = root_dir / "backend" / ".env"
    backend_required = ["MONGO_URL", "DB_NAME", "JWT_SECRET_KEY", "CORS_ORIGINS"]
    
    success, result = check_env_file(backend_env, backend_required)
    if isinstance(result, list):
        print("✅ File found and variables present")
        for warning in result:
            print(f"   {warning}")
    else:
        print(f"   {result}")
    print()
    
    # Check frontend .env
    print("🎨 Frontend Configuration:")
    frontend_env = root_dir / "frontend" / ".env"
    frontend_required = ["REACT_APP_BACKEND_URL"]
    
    success2, result2 = check_env_file(frontend_env, frontend_required)
    if isinstance(result2, list):
        print("✅ File found and variables present")
        for warning in result2:
            print(f"   {warning}")
    else:
        print(f"   {result2}")
    print()
    
    # Check backup files
    print("💾 Backup Files:")
    backup_full = root_dir / "frontend" / "public" / "r32_backup.json"
    backup_small = root_dir / "frontend" / "public" / "r32_backup_small.json"
    
    if backup_full.exists():
        size_mb = backup_full.stat().st_size / (1024 * 1024)
        print(f"   ✅ r32_backup.json ({size_mb:.2f} MB)")
    else:
        print(f"   ❌ r32_backup.json not found")
    
    if backup_small.exists():
        size_kb = backup_small.stat().st_size / 1024
        print(f"   ✅ r32_backup_small.json ({size_kb:.2f} KB)")
    else:
        print(f"   ⚠️  r32_backup_small.json not found (optional)")
    print()
    
    # Final verdict
    print("=" * 60)
    if success and success2:
        print("✅ Configuration looks ready for deployment!")
        print()
        print("📋 Next steps:")
        print("   1. Review and fix any warnings above")
        print("   2. Make sure MongoDB Atlas is configured")
        print("   3. Deploy through Emergent")
        print("   4. Test the application")
        print("   5. Populate database using backup/restore")
        print()
        print("📖 See DEPLOYMENT.md for detailed instructions")
    else:
        print("❌ Configuration is NOT ready for deployment")
        print("   Please fix the issues above before deploying")
    print("=" * 60)

if __name__ == "__main__":
    main()
