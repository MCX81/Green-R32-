#!/usr/bin/env python3
"""
Test script to verify category hierarchy after restore
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'r32_database')

async def check_categories():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 80)
    print("VERIFICARE IERARHIE CATEGORII")
    print("=" * 80)
    print()
    
    # Get all categories
    all_cats = await db.categories.find({}).to_list(length=None)
    total = len(all_cats)
    
    print(f"📁 Total categorii în DB: {total}")
    print()
    
    if total == 0:
        print("⚠️  Nicio categorie găsită! Trebuie să faci restore la backup.")
        client.close()
        return
    
    # Separate root and child categories
    root_cats = [cat for cat in all_cats if not cat.get("parentId")]
    child_cats = [cat for cat in all_cats if cat.get("parentId")]
    
    print(f"📌 Categorii principale (root): {len(root_cats)}")
    print(f"📎 Subcategorii (cu parentId): {len(child_cats)}")
    print()
    
    # Display hierarchy
    print("🌳 STRUCTURA IERARHICĂ:")
    print("-" * 80)
    
    for root in root_cats:
        print(f"📁 {root['name']} (slug: {root['slug']}, _id: {root['_id']})")
        
        # Find direct children
        children = [cat for cat in all_cats if cat.get("parentId") == str(root["_id"])]
        for child in children:
            print(f"   ├─ {child['name']} (slug: {child['slug']}, parentId: {child.get('parentId')})")
            
            # Find grandchildren
            grandchildren = [cat for cat in all_cats if cat.get("parentId") == str(child["_id"])]
            for grandchild in grandchildren:
                print(f"      └─ {grandchild['name']} (slug: {grandchild['slug']})")
    
    print()
    print("=" * 80)
    
    # Check for broken references
    print("\n🔍 VERIFICARE REFERINȚE:")
    broken_refs = 0
    all_ids = {str(cat["_id"]) for cat in all_cats}
    
    for cat in child_cats:
        parent_id = cat.get("parentId")
        if parent_id not in all_ids:
            print(f"❌ Referință ruptă: '{cat['name']}' (parentId: {parent_id}) - părintele nu există!")
            broken_refs += 1
    
    if broken_refs == 0:
        print("✅ Toate referințele parentId sunt valide!")
    else:
        print(f"⚠️  {broken_refs} referințe rupte găsite!")
    
    print()
    client.close()

if __name__ == "__main__":
    asyncio.run(check_categories())
