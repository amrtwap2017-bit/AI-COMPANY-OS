from hub.core.loader import platform_layer

class QualityGate:
    """Enforces that code meets Hospitality Enterprise standards."""
    
    def __init__(self):
        self.reviewer = platform_layer("agents").reviewer.ReviewerAgent()
        self.security = platform_layer("agents").security.SecurityAgent()

    async def verify(self, code: str, language: str):
        scorecard = await self.reviewer.score(code, language)
        sec_report = await self.security.scan(code, "internal_scan", language)
        
        passed = scorecard['passed_gate'] and sec_report['passed']
        
        return {
            "passed": passed,
            "quality_score": scorecard['overall_score'],
            "security_issues": sec_report['high_count'],
            "feedback": self.reviewer.generate_feedback(scorecard)
        }