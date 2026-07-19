"""Create Qdrant collections for Triangle Black workspace."""
import asyncio
import sys
sys.path.insert(0, "/home/amr/AI-COMPANY-OS")

async def main():
    import httpx
    
    qdrant_url = "http://localhost:6333"
    collection_name = "triangle-black_knowledge"
    
    print("=" * 60)
    print(" QDRANT SETUP — Triangle Black")
    print("=" * 60)

    async with httpx.AsyncClient(timeout=30.0) as client:

        # 1. Check health
        try:
            resp = await client.get(f"{qdrant_url}/health")
            print(f"\n[1] Qdrant Health: {resp.text}")
        except Exception as e:
            print(f"\n[1] Qdrant UNREACHABLE: {e}")
            print("    Run: docker start ai-qdrant")
            return

        # 2. List existing collections
        resp = await client.get(f"{qdrant_url}/collections")
        collections = resp.json().get("result", {}).get("collections", [])
        existing = [c["name"] for c in collections]
        print(f"\n[2] Existing collections: {existing}")

        # 3. Create triangle-black_knowledge if missing
        if collection_name not in existing:
            print(f"\n[3] Creating collection: {collection_name}")
            resp = await client.put(
                f"{qdrant_url}/collections/{collection_name}",
                json={
                    "vectors": {
                        "size": 768,
                        "distance": "Cosine"
                    }
                }
            )
            result = resp.json()
            print(f"    Result: {result}")
        else:
            print(f"\n[3] Collection already exists: {collection_name}")

        # 4. Also create triangle-black_memory
        memory_col = "triangle-black_memory"
        if memory_col not in existing:
            print(f"\n[4] Creating collection: {memory_col}")
            resp = await client.put(
                f"{qdrant_url}/collections/{memory_col}",
                json={"vectors": {"size": 768, "distance": "Cosine"}}
            )
            print(f"    Result: {resp.json()}")
        else:
            print(f"\n[4] Collection exists: {memory_col}")

        # 5. Also create triangle-black_code
        code_col = "triangle-black_code"
        if code_col not in existing:
            print(f"\n[5] Creating collection: {code_col}")
            resp = await client.put(
                f"{qdrant_url}/collections/{code_col}",
                json={"vectors": {"size": 768, "distance": "Cosine"}}
            )
            print(f"    Result: {resp.json()}")

        # 6. Verify all collections now exist
        resp = await client.get(f"{qdrant_url}/collections")
        collections = resp.json().get("result", {}).get("collections", [])
        print(f"\n[6] All collections: {[c['name'] for c in collections]}")

    print("\n" + "=" * 60)
    print(" QDRANT SETUP COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
