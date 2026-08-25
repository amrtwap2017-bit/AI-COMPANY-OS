# DISCOVERY-002 — hub/mcp/server.mjs Does Not Exist

Discovered: 2026-08-25
Session: AI Engineering OS bootstrap
Classification: BROKEN_REFERENCE

## Details
~/.config/opencode/config.json references:
  "hub": { "command": ["node", "/home/amr/AI-COMPANY-OS/hub/mcp/server.mjs"] }

hub/mcp/ directory exists but server.mjs does not.

The hub/ directory is a Python AI Engineering Hub (not Node.js).
The MCP server was planned or deleted.

## Impact
OpenCode may silently fail to start the hub MCP server each session.
All other MCP servers (filesystem, git, postgres, memory, thinking, fetch) are unaffected.

## Resolution Options
Option A: Build hub/mcp/server.mjs as a lightweight Node.js MCP bridge to hub/
Option B: Remove hub entry from OpenCode config until rebuilt
Option C: Port hub capabilities to Python MCP server

## Disposition
DEFERRED — document and monitor. Does not block current work.
