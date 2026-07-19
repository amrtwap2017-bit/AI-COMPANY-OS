"""
app/context/assembler.py
────────────────────────────────────────────────────────────────
Builds the final prompt string from an AgentContext.

Takes the structured AgentContext and converts it
into a clean prompt string ready to send to the model.
"""

from __future__ import annotations

from context.builder import AgentContext


class PromptAssembler:

    def assemble(self, context: AgentContext) -> str:
        """Build final prompt string from ranked context items."""
        sections: list[str] = []

        system_items = context.by_source("system")
        if system_items:
            sections.append(system_items[0].content)

        memory_items = context.by_source("memory")
        if memory_items:
            memory_block = "\n".join(
                f"- {item.content}" for item in memory_items
            )
            sections.append(
                f"[Relevant Memory]\n{memory_block}"
            )

        conv_items = context.by_source("conversation")
        if conv_items:
            conv_block = "\n".join(
                item.content for item in conv_items
            )
            sections.append(
                f"[Conversation History]\n{conv_block}"
            )

        sections.append(f"[Current Task]\n{context.task}")

        return "\n\n".join(sections)

    def assemble_messages(
        self, context: AgentContext
    ) -> list[dict[str, str]]:
        """
        Build OpenAI-style message list from context.
        Used when the model API accepts a messages array.
        """
        messages: list[dict[str, str]] = []

        system_parts: list[str] = []

        system_items = context.by_source("system")
        if system_items:
            system_parts.append(system_items[0].content)

        memory_items = context.by_source("memory")
        if memory_items:
            memory_block = "\n".join(
                f"- {item.content}" for item in memory_items
            )
            system_parts.append(
                f"Relevant memory:\n{memory_block}"
            )

        if system_parts:
            messages.append({
                "role": "system",
                "content": "\n\n".join(system_parts),
            })

        conv_items = context.by_source("conversation")
        for item in conv_items:
            if ": " in item.content:
                role, content = item.content.split(": ", 1)
                role = role.strip().lower()
                if role not in ("user", "assistant", "system"):
                    role = "user"
                messages.append({"role": role, "content": content})

        messages.append({
            "role": "user",
            "content": context.task,
        })

        return messages
