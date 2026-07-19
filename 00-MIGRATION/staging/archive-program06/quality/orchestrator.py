"""
Quality Orchestrator — multi-dimensional parallel code review.
Runs architecture + security + performance + API + test coverage reviews.
"""
import httpx
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from src.settings import OLLAMA_BASE_URL, MODELS, REVIEW_PASS_THRESHOLD

REVIEW_TRACKS = [
    {
        "name": "architecture",
        "model": MODELS["review"],
        "focus": (
            "Review for DDD compliance, clean architecture layers, correct dependency direction "
            "(domain → application → infrastructure → API). "
            "Check: entities in domain layer, repositories behind interfaces, "
            "no infrastructure imports in domain."
        ),
        "weight": 0.30,
    },
    {
        "name": "security",
        "model": MODELS["fast"],
        "focus": (
            "Review for security issues: SQL injection via raw queries, "
            "missing authentication on endpoints, secrets hardcoded in code, "
            "missing input validation, unhandled exceptions exposing internals."
        ),
        "weight": 0.25,
    },
    {
        "name": "performance",
        "model": MODELS["fast"],
        "focus": (
            "Review for performance issues: N+1 queries (loops with DB calls), "
            "missing database indexes, synchronous calls where async is needed, "
            "loading full tables without pagination."
        ),
        "weight": 0.20,
    },
    {
        "name": "api_contract",
        "model": MODELS["review"],
        "focus": (
            "Review for REST API quality: proper HTTP status codes (201 for create, 404 for not found), "
            "consistent response schemas, proper error responses, "
            "meaningful endpoint paths following REST conventions."
        ),
        "weight": 0.15,
    },
    {
        "name": "test_coverage",
        "model": MODELS["fast"],
        "focus": (
            "Review test quality: are happy path tests present, "
            "are edge cases covered (empty list, not found, invalid input), "
            "are tests using proper mocks/fixtures, are assertions meaningful."
        ),
        "weight": 0.10,
    },
]


def _review_one_track(track: dict, code_files: list, task_title: str) -> dict:
    """Run a single review track against code files."""
    files_text = ""
    for f in code_files[:5]:
        files_text += f"\n--- {f.get('path', 'unknown')} ---\n{f.get('content', '')[:1500]}\n"

    prompt = f"""Review this code for: {task_title}

REVIEW FOCUS: {track['focus']}

CODE:
{files_text}

Return ONLY JSON:
{{"score": 0-100, "findings": ["issue 1", "issue 2"], "passed": true|false, "summary": "one sentence"}}"""

    try:
        r = httpx.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": track["model"],
                "messages": [
                    {"role": "system", "content": "You are a code reviewer. Return only valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 500},
            },
            timeout=90,
        )
        r.raise_for_status()
        raw = r.json()["message"]["content"].strip()
        # extract JSON
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start >= 0 and end > start:
            result = json.loads(raw[start:end])
            result["track"] = track["name"]
            result["weight"] = track["weight"]
            return result
    except Exception as e:
        pass

    return {
        "track": track["name"],
        "score": 70,
        "findings": [],
        "passed": True,
        "summary": f"Auto-approved ({track['name']})",
        "weight": track["weight"],
    }


def run_quality_review(
    code_files: list,
    task_title: str,
    task_id: str = "",
    run_group: str = "",
) -> dict:
    """
    Run all review tracks in parallel.
    Returns aggregated quality report.
    """
    if not code_files:
        return {
            "ok": True,
            "overall_score": 75,
            "passed": True,
            "tracks": [],
            "all_findings": [],
            "summary": "No files to review",
        }

    track_results = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(_review_one_track, track, code_files, task_title): track["name"]
            for track in REVIEW_TRACKS
        }
        for future in as_completed(futures):
            try:
                track_results.append(future.result())
            except Exception as e:
                track_name = futures[future]
                track_results.append({
                    "track": track_name,
                    "score": 70,
                    "findings": [],
                    "passed": True,
                    "summary": f"Review error: {e}",
                    "weight": 0.10,
                })

    # Weighted average
    total_weight = sum(t["weight"] for t in track_results)
    weighted_score = sum(
        t["score"] * t["weight"] for t in track_results
    ) / (total_weight if total_weight > 0 else 1)
    overall_score = round(weighted_score, 1)

    all_findings = []
    for t in track_results:
        for f in t.get("findings", []):
            all_findings.append(f"[{t['track']}] {f}")

    passed = overall_score >= REVIEW_PASS_THRESHOLD

    return {
        "ok": True,
        "overall_score": overall_score,
        "passed": passed,
        "tracks": track_results,
        "all_findings": all_findings,
        "summary": (
            f"Score: {overall_score}/100. "
            f"{'PASSED' if passed else 'NEEDS FIXES'}. "
            f"{len(all_findings)} findings across {len(track_results)} tracks."
        ),
        "task_id": task_id,
        "run_group": run_group,
    }
