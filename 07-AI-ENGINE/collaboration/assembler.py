"""
app/collaboration/assembler.py
────────────────────────────────────────────────────────────────
Combines outputs from multiple agents into a single
coherent final response.

Strategy:
  - If a writer agent ran → use its output as the base
  - If an evaluator ran → append its feedback
  - Otherwise → concatenate all successful outputs with attribution
"""

from __future__ import annotations

from collaboration.models import AgentOutput

# Agents whose output should be the primary response
PRIMARY_AGENTS = {"writer", "backend", "frontend", "developer"}

# Agents whose output should be appended as metadata
META_AGENTS = {"evaluator", "reviewer", "tester"}


class CollaborationAssembler:

    def assemble(
        self,
        goal: str,
        outputs: list[AgentOutput],
    ) -> str:
        """
        Combine agent outputs into one final response.
        """
        successful = [o for o in outputs if o.success and o.output.strip()]

        if not successful:
            failed = [o for o in outputs if not o.success]
            errors = [f"{o.agent_name}: {o.error}" for o in failed]
            return (
                f"All agents failed for goal: {goal}\n\n"
                + "\n".join(errors)
            )

        # Find primary agent output
        primary = self._find_primary(successful)

        if primary:
            result = self._build_with_primary(goal, primary, successful)
        else:
            result = self._build_concatenated(goal, successful)

        return result

    def _find_primary(
        self,
        outputs: list[AgentOutput],
    ) -> AgentOutput | None:
        """Find the output that should be the main response."""
        for output in outputs:
            if output.agent_name in PRIMARY_AGENTS:
                return output
        # Last successful agent is primary if no dedicated writer
        return outputs[-1] if outputs else None

    def _build_with_primary(
        self,
        goal: str,
        primary: AgentOutput,
        all_outputs: list[AgentOutput],
    ) -> str:
        """Use primary agent output as base, append meta."""
        sections = [primary.output]

        # Append evaluator/reviewer feedback if present
        meta = [
            o for o in all_outputs
            if o.agent_name in META_AGENTS
            and o.agent_name != primary.agent_name
        ]

        if meta:
            sections.append("\n---\n## Quality Review")
            for m in meta:
                sections.append(
                    f"**{m.agent_name.title()} feedback:**\n{m.output[:800]}"
                )

        return "\n\n".join(sections)

    def _build_concatenated(
        self,
        goal: str,
        outputs: list[AgentOutput],
    ) -> str:
        """Concatenate all outputs with agent attribution."""
        sections = [f"# Collaboration Result\n**Goal:** {goal}\n"]

        for output in outputs:
            sections.append(
                f"## {output.agent_name.title()}\n{output.output}"
            )

        return "\n\n".join(sections)


assembler = CollaborationAssembler()
