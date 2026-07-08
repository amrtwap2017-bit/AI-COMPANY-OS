# ENG-001 — Repository Setup

## Root `package.json`

```json
{
  "name": "triangle-black",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,json,md}\"",
    "format:write": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "db:generate": "pnpm --filter @tb/database db:generate",
    "db:migrate": "pnpm --filter @tb/database db:migrate",
    "db:push": "pnpm --filter @tb/database db:push",
    "db:seed": "pnpm --filter @tb/database db:seed",
    "db:studio": "pnpm --filter @tb/database db:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.2.0",
    "typescript": "^5.5.0"
  },
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=10.0.0"
  },
  "packageManager": "pnpm@10.0.0"
}
```

## `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "inputs": ["src/**", "tsconfig.json", "package.json"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

## `tsconfig/base.json` (root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false
  }
}
```

## `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

## `.gitignore`

```
node_modules/
dist/
.next/
.env
.env.local
*.log
.turbo/
coverage/
.DS_Store
*.tsbuildinfo
docker/volumes/
uploads/
```
