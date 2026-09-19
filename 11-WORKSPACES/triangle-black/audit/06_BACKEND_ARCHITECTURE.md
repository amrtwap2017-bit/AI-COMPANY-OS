# 06 Backend Architecture

Actual launch is `src.main:app` (8,970 lines); root `main.py` (254 lines) is a competing legacy app. Runtime: 225 route objects; source: 961 decorators across 173 route files. The main file is a God-file registrar with broad exception swallowing, duplicate middleware/imports and conditional routers. `CustomerDataScope` has no production consumer. Risks: silent missing routers, duplicate entrypoints and dynamic schema creation.
