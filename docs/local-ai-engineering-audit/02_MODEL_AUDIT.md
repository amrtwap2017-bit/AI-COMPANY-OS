# OLLAMA MODEL AUDIT
## Generated: Wed Aug 26 15:40:00 UTC 2026

## Available Models
NAME                        ID              SIZE      MODIFIED    
qwen2.5-coder-32k:latest    cf0e39a496ed    4.7 GB    6 weeks ago    
qwen2.5-coder:7b            dae161e27b0e    4.7 GB    6 weeks ago    
nomic-embed-text:latest     0a109f422b47    274 MB    7 weeks ago    
qwen3.5:4b                  2a654d98e6fb    3.4 GB    7 weeks ago    
bge-m3:latest               790764642607    1.2 GB    7 weeks ago    
granite-embedding:latest    eb4c533ba6f7    62 MB     7 weeks ago    
deepseek-r1:8b              6995872bfe4c    5.2 GB    7 weeks ago    
llama3.2:3b                 a80c4f17acd5    2.0 GB    7 weeks ago    

## Ollama Service Status
● ollama.service - Ollama Service
     Loaded: loaded (/etc/systemd/system/ollama.service; enabled; preset: enabled)
    Drop-In: /etc/systemd/system/ollama.service.d
             └─override.conf
     Active: active (running) since Sun 2026-08-02 09:36:58 PDT; 3 weeks 2 days ago
 Invocation: f13c6ec38a434114b3dbb1d6b8b97806
   Main PID: 433 (ollama)
      Tasks: 20 (limit: 14341)
     Memory: 503.2M (peak: 10.1G, swap: 4.8M, swap peak: 13.8M)
        CPU: 15h 53min 23.742s
     CGroup: /system.slice/ollama.service
             └─433 /usr/local/bin/ollama serve

Aug 26 08:02:40 DESKTOP-72LMGCC ollama[433]: slot      release: id  0 | task 0 | stop processing: n_tokens = 511, truncated = 0
Aug 26 08:02:40 DESKTOP-72LMGCC ollama[433]: srv  update_slots: all slots are idle
Aug 26 08:02:40 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:02:40 | 200 |  22.67855379s |       127.0.0.1 | POST     "/api/generate"
Aug 26 08:07:40 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:07:40 | 404 |      5.9809ms |       127.0.0.1 | POST     "/api/generate"
Aug 26 08:16:05 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:16:05 | 404 |       930.1µs |       127.0.0.1 | POST     "/api/generate"
Aug 26 08:25:11 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:25:11 | 404 |         739µs |       127.0.0.1 | POST     "/api/generate"
Aug 26 08:28:03 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:28:03 | 404 |   16.991214ms |       127.0.0.1 | POST     "/api/generate"
Aug 26 08:37:42 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:37:42 | 200 |       236.8µs |       127.0.0.1 | GET      "/api/version"
Aug 26 08:40:00 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:40:00 | 200 |       137.1µs |       127.0.0.1 | HEAD     "/"
Aug 26 08:40:00 DESKTOP-72LMGCC ollama[433]: [GIN] 2026/08/26 - 08:40:00 | 200 |      3.9909ms |       127.0.0.1 | GET      "/api/tags"

## Ollama API Test
{
    "models": [
        {
            "name": "qwen2.5-coder-32k:latest",
            "model": "qwen2.5-coder-32k:latest",
            "modified_at": "2026-07-10T16:08:32.463186078-07:00",
            "size": 4683087653,
            "digest": "cf0e39a496ed6a66b219be2d822bf4380478fc6a15306c0a72d7472580c60d47",
            "details": {
                "parent_model": "qwen2.5-coder:7b",
                "format": "gguf",
                "family": "qwen2",
                "families": [
                    "qwen2"
                ],
                "parameter_size": "7.6B",
                "quantization_level": "Q4_K_M",
                "context_length": 32768,
                "embedding_length": 3584
            },
            "capabilities": [
                "completion",
                "tools",
                "insert"
            ]
        },
        {
            "name": "qwen2.5-coder:7b",
            "model": "qwen2.5-coder:7b",
            "modified_at": "2026-07-09T10:41:00.20188684-07:00",
            "size": 4683087561,
            "digest": "dae161e27b0e90dd1856c8bb3209201fd6736d8eb66298e75ed87571486f4364",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "qwen2",
                "families": [
                    "qwen2"
                ],
                "parameter_size": "7.6B",
                "quantization_level": "Q4_K_M",
                "context_length": 32768,
                "embedding_length": 3584
            },
            "capabilities": [
                "completion",
                "tools",
                "insert"
            ]
        },
        {
            "name": "nomic-embed-text:latest",
            "model": "nomic-embed-text:latest",
            "modified_at": "2026-07-04T10:53:23.658194239-07:00",
            "size": 274302450,
            "digest": "0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "nomic-bert",
                "families": [
                    "nomic-bert"
                ],
                "parameter_size": "137M",
                "quantization_level": "F16",
                "context_length": 2048,
                "embedding_length": 768
            },
            "capabilities": [
                "embedding"
            ]
        },
        {
            "name": "qwen3.5:4b",
            "model": "qwen3.5:4b",
            "modified_at": "2026-07-03T18:39:00.380553197-07:00",
            "size": 3389983735,
            "digest": "2a654d98e6fba55d452b7043684e9b57a947e393bbffa62485a7aac05ee4eefd",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "qwen35",
                "families": [
                    "qwen35"
                ],
                "parameter_size": "4.7B",
                "quantization_level": "Q4_K_M",
                "context_length": 262144,
                "embedding_length": 2560
            },
            "capabilities": [
                "vision",
                "completion",
                "tools",
                "thinking"
            ]
        },
        {
            "name": "bge-m3:latest",
            "model": "bge-m3:latest",
            "modified_at": "2026-07-03T18:08:01.272520098-07:00",
            "size": 1157672605,
            "digest": "7907646426070047a77226ac3e684fbbe8410524f7b4a74d02837e43f2146bab",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "bert",
                "families": [
                    "bert"
                ],
                "parameter_size": "566.70M",
                "quantization_level": "F16",
                "context_length": 8192,
                "embedding_length": 1024
            },
            "capabilities": [
                "embedding"
            ]
        },
        {
            "name": "granite-embedding:latest",
            "model": "granite-embedding:latest",
            "modified_at": "2026-07-02T21:23:15.853053777-07:00",
            "size": 62534804,
            "digest": "eb4c533ba6f7983afdc681a327251a34667340567bb160adfde1a3e07c468ec7",
            "details": {
                "parent_model": "/Users/administrator/.ollama/models/blobs/sha256-27d24c87a53d110b95abecbff83f966206857a9dc0ba1efd336d08dbd0afc833",
                "format": "gguf",
                "family": "bert",
                "families": [
                    "bert"
                ],
                "parameter_size": "30.15M",
                "quantization_level": "F16",
                "context_length": 512,
                "embedding_length": 384
            },
            "capabilities": [
                "embedding"
            ]
        },
        {
            "name": "deepseek-r1:8b",
            "model": "deepseek-r1:8b",
            "modified_at": "2026-07-02T21:15:23.297063613-07:00",
            "size": 5225376047,
            "digest": "6995872bfe4c521a67b32da386cd21d5c6e819b6e0d62f79f64ec83be99f5763",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "qwen3",
                "families": [
                    "qwen3"
                ],
                "parameter_size": "8.2B",
                "quantization_level": "Q4_K_M",
                "context_length": 131072,
                "embedding_length": 4096
            },
            "capabilities": [
                "completion",
                "thinking"
            ]
        },
        {
            "name": "llama3.2:3b",
            "model": "llama3.2:3b",
            "modified_at": "2026-07-02T21:09:22.733077041-07:00",
            "size": 2019393189,
            "digest": "a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72",
            "details": {
                "parent_model": "",
                "format": "gguf",
                "family": "llama",
                "families": [
                    "llama"
                ],
                "parameter_size": "3.2B",
                "quantization_level": "Q4_K_M",
                "context_length": 131072,
                "embedding_length": 3072
            },
            "capabilities": [
                "completion",
                "tools"
            ]
        }
    ]
}
