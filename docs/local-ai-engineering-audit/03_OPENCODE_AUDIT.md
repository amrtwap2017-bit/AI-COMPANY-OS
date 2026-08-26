# OPENCODE CONFIGURATION AUDIT
## Generated: Wed Aug 26 15:40:28 UTC 2026

## OpenCode Binary Location
/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/opencode

## OpenCode Global Config
{
  "$schema": "https://opencode.ai/config.json",
  "model": "ollama/qwen2.5-coder-32k",
  "autoshare": false,
  "theme": "opencode",
  "mcp": {
    "hub": {
      "type": "local",
      "command": ["node", "/home/amr/AI-COMPANY-OS/hub/mcp/server.mjs"]
    },
    "filesystem": {
      "type": "local",
      "command": [
        "npx", "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/amr/AI-COMPANY-OS",
        "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
      ]
    },
    "git": {
      "type": "local",
      "command": [
        "npx", "-y",
        "@modelcontextprotocol/server-git",
        "--repository", "/home/amr/AI-COMPANY-OS"
      ]
    },
    "postgres": {
      "type": "local",
      "command": [
        "npx", "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://ai:ai123@localhost:5432/triangle_black"
      ]
    },
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"]
    },
    "thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "fetch": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}

## OpenCode Project Config (opencode.json)
{
  "$schema": "https://opencode.ai/config.json",
  "model": "ollama/qwen2.5-coder-32k",
  "instructions": "AGENTS.md"
}

## OpenCode Project Config (.opencode.json)
NOT FOUND IN PROJECT ROOT

## MCP Configuration
NO MCP CONFIG FOUND
