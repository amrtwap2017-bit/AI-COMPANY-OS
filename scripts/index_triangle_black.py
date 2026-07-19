import asyncio
import os
import sys
from uuid import UUID

# Set path so we can import hub
sys.path.insert(0, os.getcwd())

from hub.intelligence.indexer import BrainIndexer

async def main():
    # Bootstrap ID for Triangle Black
    TB_WORKSPACE_ID = UUID("00000000-0000-0000-0000-000000000001")
    
    indexer = BrainIndexer(TB_WORKSPACE_ID, "triangle-black")
    await indexer.index_brains()

if __name__ == "__main__":
    asyncio.run(main())