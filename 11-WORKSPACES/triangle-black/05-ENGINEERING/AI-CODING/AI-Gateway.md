# AI-001 — AI Gateway

## Architecture

The AI Gateway is a lightweight service within the API that manages AI agent interactions. In V1, this is a simple abstraction layer over basic rule-based engines and (in V2) LLM providers.

## `apps/api/src/modules/ai/ai.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { LeadScoreService } from './services/lead-score.service';
import { PipelineForecastService } from './services/pipeline-forecast.service';

@Module({
  providers: [AiGatewayService, LeadScoreService, PipelineForecastService],
  exports: [AiGatewayService, LeadScoreService],
})
export class AiModule {}
```

## `apps/api/src/modules/ai/ai-gateway.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

type AiProvider = 'rule-based' | 'openai' | 'anthropic' | 'ollama';

@Injectable()
export class AiGatewayService {
  private activeProvider: AiProvider = 'rule-based';

  async execute<TInput, TOutput>(
    agent: string,
    input: TInput,
  ): Promise<{ output: TOutput; provider: AiProvider; latency: number }> {
    const start = Date.now();

    let output: TOutput;

    switch (this.activeProvider) {
      case 'rule-based':
        output = await this.executeRuleBased(agent, input);
        break;
      case 'openai':
      case 'anthropic':
      case 'ollama':
        output = await this.executeLlm(agent, input);
        break;
      default:
        throw new Error(`Unknown AI provider: ${this.activeProvider}`);
    }

    return {
      output,
      provider: this.activeProvider,
      latency: Date.now() - start,
    };
  }

  private async executeRuleBased<TInput, TOutput>(
    agent: string,
    input: TInput,
  ): Promise<TOutput> {
    // Route to the appropriate rule engine
    switch (agent) {
      case 'lead-scorer':
        return this.leadScoreService.score(input as any) as TOutput;
      case 'pipeline-forecast':
        return this.pipelineService.forecast(input as any) as TOutput;
      default:
        throw new Error(`Unknown rule-based agent: ${agent}`);
    }
  }

  private async executeLlm<TInput, TOutput>(
    agent: string,
    input: TInput,
  ): Promise<TOutput> {
    // V2: abstracted LLM call
    throw new Error('LLM providers not configured in V1');
  }

  setProvider(provider: AiProvider) {
    this.activeProvider = provider;
  }
}
```

## `apps/api/src/modules/ai/services/lead-score.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

interface LeadInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  source: string;
  notes?: string;
}

interface LeadScoreOutput {
  score: number;
  priority: 'low' | 'medium' | 'high' | 'hot';
  rationale: string[];
}

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'mail.com', 'aol.com', 'live.com', 'icloud.com',
];

const SENIOR_TITLES = ['director', 'manager', 'head', 'vp', 'vice president', 'c-level', 'owner', 'ceo', 'cto'];

@Injectable()
export class LeadScoreService {
  score(input: LeadInput): LeadScoreOutput {
    let score = 0;
    const rationale: string[] = [];

    // Phone
    if (input.phone) {
      score += 15;
      rationale.push('Phone provided (+15)');
    }

    // Company name
    if (input.companyName) {
      score += 10;
      rationale.push('Company provided (+10)');
    }

    // Business email
    if (input.email) {
      const domain = input.email.split('@')[1];
      if (domain && !FREE_EMAIL_DOMAINS.includes(domain.toLowerCase())) {
        score += 20;
        rationale.push('Business email (+20)');
      }
    }

    // Senior title
    if (input.jobTitle) {
      const title = input.jobTitle.toLowerCase();
      if (SENIOR_TITLES.some((t) => title.includes(t))) {
        score += 15;
        rationale.push('Senior title (+15)');
      }
    }

    // Source weighting
    const sourceScores: Record<string, number> = {
      referral: 25,
      event: 15,
      website: 10,
      cold_outreach: 5,
      other: 5,
    };
    score += sourceScores[input.source] || 5;
    rationale.push(`Source: ${input.source} (+${sourceScores[input.source] || 5})`);

    // Notes
    if (input.notes && input.notes.length > 50) {
      score += 5;
      rationale.push('Detailed notes (+5)');
    }

    const clamped = Math.min(score, 100);

    let priority: LeadScoreOutput['priority'] = 'low';
    if (clamped >= 86) priority = 'hot';
    else if (clamped >= 61) priority = 'high';
    else if (clamped >= 31) priority = 'medium';

    return { score: clamped, priority, rationale };
  }
}
```
