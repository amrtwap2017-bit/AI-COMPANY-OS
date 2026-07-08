from domain.lead import Lead

class QualificationService:
    def qualify(self, lead: Lead) -> Lead:
        # Implement qualification logic here
        if 'example.com' in lead.email:
            lead.score += 1.0
        return lead