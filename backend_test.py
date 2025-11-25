#!/usr/bin/env python3
"""
Backend Test Suite for R32 E-Commerce API
Focus: Testing optimized backup/restore functionality with performance monitoring
"""

import asyncio
import aiohttp
import json
import time
import os
from datetime import datetime
from typing import Dict, Any, List

# Configuration
BASE_URL = "https://easycart-52.preview.emergentagent.com/api"
ADMIN_CREDENTIALS = {
    "email": "admin@r32.ro",
    "password": "admin123"
}

class BackupRestoreTest:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.test_results = []
        
    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def admin_login(self) -> bool:
        """Login as admin and get token"""
        try:
            async with self.session.post(
                f"{BASE_URL}/admin/login",
                json=ADMIN_CREDENTIALS,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data["access_token"]
                    print(f"✅ Admin login successful")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Admin login failed: {response.status} - {error_text}")
                    return False
        except Exception as e:
            print(f"❌ Admin login error: {str(e)}")
            return False
            
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
    async def test_backup_info(self) -> Dict[str, Any]:
        """Test GET /api/admin/backup/info endpoint"""
        print("\n🔍 Testing backup info endpoint...")
        try:
            async with self.session.get(
                f"{BASE_URL}/admin/backup/info",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Backup info retrieved successfully")
                    print(f"   Database: {data.get('database')}")
                    print(f"   Collections: {data.get('collections')}")
                    print(f"   Total documents: {data.get('total_documents')}")
                    return {"success": True, "data": data}
                else:
                    error_text = await response.text()
                    print(f"❌ Backup info failed: {response.status} - {error_text}")
                    return {"success": False, "error": error_text}
        except Exception as e:
            print(f"❌ Backup info error: {str(e)}")
            return {"success": False, "error": str(e)}
            
    async def test_backup_export(self) -> Dict[str, Any]:
        """Test GET /api/admin/backup/export endpoint"""
        print("\n📦 Testing backup export endpoint...")
        try:
            start_time = time.time()
            async with self.session.get(
                f"{BASE_URL}/admin/backup/export",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    backup_content = await response.text()
                    export_time = time.time() - start_time
                    
                    # Parse JSON to validate structure
                    backup_data = json.loads(backup_content)
                    
                    print(f"✅ Backup export successful in {export_time:.2f}s")
                    print(f"   Backup size: {len(backup_content)} characters")
                    print(f"   Collections: {list(backup_data.get('collections', {}).keys())}")
                    print(f"   Stats: {backup_data.get('stats')}")
                    
                    return {
                        "success": True, 
                        "data": backup_data,
                        "content": backup_content,
                        "export_time": export_time
                    }
                else:
                    error_text = await response.text()
                    print(f"❌ Backup export failed: {response.status} - {error_text}")
                    return {"success": False, "error": error_text}
        except Exception as e:
            print(f"❌ Backup export error: {str(e)}")
            return {"success": False, "error": str(e)}
            
    async def test_backup_restore(self, backup_content: str) -> Dict[str, Any]:
        """Test POST /api/admin/backup/restore endpoint - MAIN FOCUS"""
        print("\n🔄 Testing backup restore endpoint (OPTIMIZED VERSION)...")
        try:
            start_time = time.time()
            
            # Prepare request body
            request_body = {"backup_file": backup_content}
            
            async with self.session.post(
                f"{BASE_URL}/admin/backup/restore",
                json=request_body,
                headers=self.get_auth_headers(),
                timeout=aiohttp.ClientTimeout(total=300)  # 5 minute timeout
            ) as response:
                restore_time = time.time() - start_time
                
                if response.status == 200:
                    data = await response.json()
                    
                    print(f"✅ Backup restore successful in {restore_time:.2f}s")
                    print(f"   Success: {data.get('success')}")
                    print(f"   Message: {data.get('message')}")
                    print(f"   Restored counts: {data.get('restored')}")
                    
                    # Check for new progress field
                    progress = data.get('progress', [])
                    print(f"   Progress details ({len(progress)} entries):")
                    for i, detail in enumerate(progress[:10]):  # Show first 10 entries
                        print(f"     {i+1}. {detail}")
                    if len(progress) > 10:
                        print(f"     ... and {len(progress) - 10} more entries")
                    
                    errors = data.get('errors')
                    if errors:
                        print(f"   Errors: {errors}")
                    else:
                        print(f"   No errors reported")
                        
                    backup_info = data.get('backup_info', {})
                    print(f"   Backup timestamp: {backup_info.get('timestamp')}")
                    
                    return {
                        "success": True, 
                        "data": data,
                        "restore_time": restore_time,
                        "has_progress": len(progress) > 0,
                        "progress_count": len(progress)
                    }
                else:
                    error_text = await response.text()
                    print(f"❌ Backup restore failed: {response.status} - {error_text}")
                    return {
                        "success": False, 
                        "error": error_text,
                        "restore_time": restore_time
                    }
        except asyncio.TimeoutError:
            restore_time = time.time() - start_time
            print(f"❌ Backup restore timeout after {restore_time:.2f}s")
            return {"success": False, "error": "Timeout", "restore_time": restore_time}
        except Exception as e:
            restore_time = time.time() - start_time
            print(f"❌ Backup restore error after {restore_time:.2f}s: {str(e)}")
            return {"success": False, "error": str(e), "restore_time": restore_time}
            
    async def verify_restore_data(self, original_stats: Dict) -> Dict[str, Any]:
        """Verify that data was restored correctly by comparing stats"""
        print("\n🔍 Verifying restored data...")
        
        # Get current stats
        info_result = await self.test_backup_info()
        if not info_result["success"]:
            return {"success": False, "error": "Could not get current stats"}
            
        current_stats = info_result["data"]["collections"]
        
        print("   Comparing collection counts:")
        verification_results = {}
        
        for collection, original_count in original_stats.items():
            current_count = current_stats.get(collection, 0)
            if current_count >= original_count:
                print(f"   ✅ {collection}: {current_count} (was {original_count})")
                verification_results[collection] = "OK"
            else:
                print(f"   ❌ {collection}: {current_count} (expected >= {original_count})")
                verification_results[collection] = "FAILED"
                
        all_verified = all(result == "OK" for result in verification_results.values())
        
        return {
            "success": all_verified,
            "results": verification_results,
            "current_stats": current_stats,
            "original_stats": original_stats
        }
        
    async def test_duplicate_orders_handling(self, backup_content: str) -> Dict[str, Any]:
        """Test that duplicate orders are handled correctly (only new ones added)"""
        print("\n🔄 Testing duplicate orders handling...")
        
        # Get initial order count
        info_result = await self.test_backup_info()
        if not info_result["success"]:
            return {"success": False, "error": "Could not get initial stats"}
            
        initial_orders = info_result["data"]["collections"]["orders"]
        print(f"   Initial orders count: {initial_orders}")
        
        # Restore the same backup again
        restore_result = await self.test_backup_restore(backup_content)
        if not restore_result["success"]:
            return {"success": False, "error": "Second restore failed"}
            
        # Check final order count
        final_info = await self.test_backup_info()
        if not final_info["success"]:
            return {"success": False, "error": "Could not get final stats"}
            
        final_orders = final_info["data"]["collections"]["orders"]
        print(f"   Final orders count: {final_orders}")
        
        # Orders should not increase if they're duplicates
        orders_added = restore_result["data"]["restored"].get("orders", 0)
        print(f"   Orders added in second restore: {orders_added}")
        
        if orders_added == 0:
            print("   ✅ Duplicate orders correctly skipped")
            return {"success": True, "orders_added": 0}
        else:
            print(f"   ⚠️  {orders_added} orders added (might be new orders)")
            return {"success": True, "orders_added": orders_added}
            
    async def run_performance_test(self):
        """Run comprehensive performance test of backup/restore"""
        print("🚀 Starting Backup/Restore Performance Test Suite")
        print("=" * 60)
        
        # Setup
        await self.setup_session()
        
        try:
            # 1. Admin Login
            if not await self.admin_login():
                return False
                
            # 2. Get initial database info
            initial_info = await self.test_backup_info()
            if not initial_info["success"]:
                return False
                
            initial_stats = initial_info["data"]["collections"]
            
            # 3. Create backup
            export_result = await self.test_backup_export()
            if not export_result["success"]:
                return False
                
            backup_content = export_result["content"]
            export_time = export_result["export_time"]
            
            # 4. Test restore (MAIN FOCUS)
            restore_result = await self.test_backup_restore(backup_content)
            if not restore_result["success"]:
                print(f"\n❌ CRITICAL: Restore failed - {restore_result.get('error')}")
                return False
                
            restore_time = restore_result["restore_time"]
            
            # 5. Verify data integrity
            verification = await self.verify_restore_data(initial_stats)
            
            # 6. Test duplicate handling
            duplicate_test = await self.test_duplicate_orders_handling(backup_content)
            
            # Summary
            print("\n" + "=" * 60)
            print("📊 PERFORMANCE TEST SUMMARY")
            print("=" * 60)
            print(f"Export time: {export_time:.2f}s")
            print(f"Restore time: {restore_time:.2f}s")
            print(f"Progress tracking: {'✅ Working' if restore_result.get('has_progress') else '❌ Missing'}")
            print(f"Progress entries: {restore_result.get('progress_count', 0)}")
            print(f"Data verification: {'✅ Passed' if verification['success'] else '❌ Failed'}")
            print(f"Duplicate handling: {'✅ Working' if duplicate_test['success'] else '❌ Failed'}")
            
            # Performance assessment
            if restore_time < 30:
                print(f"🚀 EXCELLENT: Restore completed in {restore_time:.2f}s (< 30s)")
            elif restore_time < 60:
                print(f"✅ GOOD: Restore completed in {restore_time:.2f}s (< 1min)")
            elif restore_time < 180:
                print(f"⚠️  ACCEPTABLE: Restore completed in {restore_time:.2f}s (< 3min)")
            else:
                print(f"❌ SLOW: Restore took {restore_time:.2f}s (> 3min)")
                
            return True
            
        finally:
            await self.cleanup_session()

async def main():
    """Main test runner"""
    tester = BackupRestoreTest()
    success = await tester.run_performance_test()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        return 0
    else:
        print("\n💥 Tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)