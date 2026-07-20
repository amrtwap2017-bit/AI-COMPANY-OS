# P4 — Add Unit Tests for Critical Components
import os, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/p4.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write_test(path, content, label):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('P4 START — Add Unit Tests')

# Test setup
write_test(PORTAL+'/__tests__/setup.ts',
    '// @ts-nocheck' + chr(10) +
    '// Test setup' + chr(10) +
    'import "@testing-library/jest-dom";' + chr(10),
    '__tests__/setup.ts')

# Test: workOrder schema
write_test(PORTAL+'/__tests__/lib/workOrder.test.ts',
    '// @ts-nocheck' + chr(10) +
    'import { WorkOrderSchema, WO_PRIORITIES, WO_CATEGORIES } from "@/lib/schemas/workOrder";' + chr(10) +
    chr(10) +
    'describe("WorkOrderSchema", () => {' + chr(10) +
    '  it("validates a valid work order", () => {' + chr(10) +
    '    const result = WorkOrderSchema.safeParse({' + chr(10) +
    '      title: "HVAC Repair", priority: "high", category: "hvac"' + chr(10) +
    '    });' + chr(10) +
    '    expect(result.success).toBe(true);' + chr(10) +
    '  });' + chr(10) +
    '  it("rejects title too short", () => {' + chr(10) +
    '    const result = WorkOrderSchema.safeParse({ title: "AB" });' + chr(10) +
    '    expect(result.success).toBe(false);' + chr(10) +
    '  });' + chr(10) +
    '  it("has 5 priority levels", () => {' + chr(10) +
    '    expect(WO_PRIORITIES).toHaveLength(5);' + chr(10) +
    '  });' + chr(10) +
    '  it("has priority objects with value/color/label", () => {' + chr(10) +
    '    WO_PRIORITIES.forEach(p => {' + chr(10) +
    '      expect(p).toHaveProperty("value");' + chr(10) +
    '      expect(p).toHaveProperty("color");' + chr(10) +
    '      expect(p).toHaveProperty("label");' + chr(10) +
    '    });' + chr(10) +
    '  });' + chr(10) +
    '  it("sets priority default to medium", () => {' + chr(10) +
    '    const result = WorkOrderSchema.parse({ title: "Test Work" });' + chr(10) +
    '    expect(result.priority).toBe("medium");' + chr(10) +
    '  });' + chr(10) +
    '});' + chr(10),
    '__tests__/lib/workOrder.test.ts')

# Test: StatusPill component
write_test(PORTAL+'/__tests__/components/StatusPill.test.tsx',
    '// @ts-nocheck' + chr(10) +
    'import { render, screen } from "@testing-library/react";' + chr(10) +
    'import { StatusPill } from "@/components/ui/StatusPill";' + chr(10) +
    chr(10) +
    'describe("StatusPill", () => {' + chr(10) +
    '  it("renders active status", () => {' + chr(10) +
    '    render(<StatusPill status="active" />);' + chr(10) +
    '    expect(screen.getByText("active")).toBeInTheDocument();' + chr(10) +
    '  });' + chr(10) +
    '  it("renders pending status", () => {' + chr(10) +
    '    render(<StatusPill status="pending" />);' + chr(10) +
    '    expect(screen.getByText("pending")).toBeInTheDocument();' + chr(10) +
    '  });' + chr(10) +
    '  it("renders without crashing for unknown status", () => {' + chr(10) +
    '    render(<StatusPill status="unknown" />);' + chr(10) +
    '    expect(screen.getByText("unknown")).toBeInTheDocument();' + chr(10) +
    '  });' + chr(10) +
    '});' + chr(10),
    '__tests__/components/StatusPill.test.tsx')

# Test: utils
write_test(PORTAL+'/__tests__/lib/utils.test.ts',
    '// @ts-nocheck' + chr(10) +
    'import { cn } from "@/lib/utils";' + chr(10) +
    chr(10) +
    'describe("cn utility", () => {' + chr(10) +
    '  it("merges class names", () => {' + chr(10) +
    '    expect(cn("a", "b")).toBe("a b");' + chr(10) +
    '  });' + chr(10) +
    '  it("handles conditional classes", () => {' + chr(10) +
    '    expect(cn("a", false && "b")).toBe("a");' + chr(10) +
    '  });' + chr(10) +
    '  it("deduplicates tailwind classes", () => {' + chr(10) +
    '    const result = cn("px-2", "px-4");' + chr(10) +
    '    expect(result).toContain("px-4");' + chr(10) +
    '    expect(result).not.toContain("px-2 px-4");' + chr(10) +
    '  });' + chr(10) +
    '});' + chr(10),
    '__tests__/lib/utils.test.ts')

# Test: API error utilities
write_test(PORTAL+'/__tests__/lib/api-error.test.ts',
    '// @ts-nocheck' + chr(10) +
    'import { ApiError, getErrorMessage, isNotFound, isUnauthorized } from "@/lib/api-error";' + chr(10) +
    chr(10) +
    'describe("ApiError", () => {' + chr(10) +
    '  it("creates error with status", () => {' + chr(10) +
    '    const err = new ApiError("Not found", 404);' + chr(10) +
    '    expect(err.status).toBe(404);' + chr(10) +
    '    expect(err.message).toBe("Not found");' + chr(10) +
    '  });' + chr(10) +
    '  it("isNotFound returns true for 404", () => {' + chr(10) +
    '    expect(isNotFound(new ApiError("x",404))).toBe(true);' + chr(10) +
    '  });' + chr(10) +
    '  it("isUnauthorized returns true for 401", () => {' + chr(10) +
    '    expect(isUnauthorized(new ApiError("x",401))).toBe(true);' + chr(10) +
    '  });' + chr(10) +
    '  it("getErrorMessage handles unknown error", () => {' + chr(10) +
    '    expect(getErrorMessage(null)).toBe("An unexpected error occurred");' + chr(10) +
    '  });' + chr(10) +
    '});' + chr(10),
    '__tests__/lib/api-error.test.ts')

# Create jest config
jest_config = '{' + chr(10)
jest_config += '  "testEnvironment": "jsdom",' + chr(10)
jest_config += '  "setupFilesAfterFramework": ["<rootDir>/__tests__/setup.ts"],' + chr(10)
jest_config += '  "moduleNameMapper": {' + chr(10)
jest_config += '    "^@/(.*)$": "<rootDir>/$1"' + chr(10)
jest_config += '  },' + chr(10)
jest_config += '  "transform": {' + chr(10)
jest_config += '    "^.+\\.(ts|tsx)$": "ts-jest"' + chr(10)
jest_config += '  }' + chr(10)
jest_config += '}' + chr(10)
with open(PORTAL+'/jest.config.json','w') as f: f.write(jest_config)
log('  Created: jest.config.json')
results['created'].append('jest.config.json')

log(chr(10)+'='*40)
log('P4 COMPLETE — Created: '+str(len(results['created']))+' test files')
log('  NOTE: Run npm install --save-dev jest @testing-library/react ts-jest @testing-library/jest-dom to enable tests')
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/p4_result.json','w') as f:
    _j.dump(results,f,indent=2)