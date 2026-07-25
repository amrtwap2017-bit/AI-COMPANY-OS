// @ts-nocheck
"use client";

import { useState } from "react";
import { PageWrapper, PageHeader, SectionCard, EmptyState } from "@/components/ui";

const EngineeringAIPage = () => {
  const [question, setQuestion] = useState("");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  return (
    <PageWrapper>
      <PageHeader title="Engineering AI Assistant" description="Ask questions about your engineering operations." />
      <div className="flex flex-col gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your engineering operations..."
            rows={4}
            className="w-full border-gray-300 rounded-md px-4 py-2 focus:outline-none"
          />
          <button onClick={() => setSelectedExample(question)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Ask
          </button>
        </div>
        <SectionCard title="Example Questions">
          <ul className="space-y-4">
            {[
              "Which assets have the most corrective work orders?",
              "What is the current HVAC maintenance status?",
              "Show me technicians with capacity available",
              "Which PM plans are overdue?",
            ].map((example, index) => (
              <li
                key={index}
                onClick={() => {
                  setQuestion(example);
                  setSelectedExample(example);
                }}
                className={`cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 ${
                  selectedExample === example ? "bg-blue-500 text-white" : ""
                }`}
              >
                {example}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Example Responses">
          <EmptyState
            icon="/path/to/icon.svg"
            title="Connect AI Engine to enable real-time responses"
            description="Powered by Triangle Black AI Engine — /api/v1/ai/signals"
          />
        </SectionCard>
        <div className="grid grid-cols-3 gap-4">
          <SectionCard title="Asset Health" href="/maintenance/assets/360" />
          <SectionCard title="PM Schedule" href="/maintenance/pm-plans" />
          <SectionCard title="Engineering Actions" href="/engineering/actions" />
        </div>
      </div>
    </PageWrapper>
  );
};

export default EngineeringAIPage;