"use client"; // @ts-nocheck

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Button,
  Progress,
  Textarea,
  Input,
} from "@/components/ui";

const fetchWorkOrder = async (id: string) => {
  const response = await fetch(`/api/v1/work-orders/${id}`, { credentials: "include" });
  if (!response.ok) throw new Error("Not found");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  return response.json();
};

const updateWorkOrder = async (id: string, data: any) => {
  const response = await fetch(`/api/v1/work-orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return response.json();
};

const WorkOrderPage = () => {
  const params = useParams();
  const id = params?.id as string;

  const { data: workOrder, isLoading, isError } = useQuery(["workOrder", id], () => fetchWorkOrder(id));
  const { data: assets } = useQuery("assets", fetchAssets);

  const [notes, setNotes] = useState("");
  const [parts, setParts] = useState<{ name: string; quantity: number }[]>([]);

  const updateMutation = useMutation((data: any) => updateWorkOrder(id, data), {
    onSuccess: () => {
      alert("Progress saved!");
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Work Order Not Found" description="The work order you are looking for does not exist." />;

  const checklistItems = {
    hvac: [
      "Check refrigerant levels",
      "Inspect filters",
      "Test temperature output",
      "Check electrical connections",
      "Verify thermostat operation",
    ],
    electrical: [
      "Check circuit breakers",
      "Test voltage levels",
      "Inspect wiring",
      "Test emergency systems",
    ],
    plumbing: [
      "Check water pressure",
      "Inspect pipes for leaks",
      "Test fixtures",
      "Check valves",
    ],
    general: ["Inspect equipment", "Document findings", "Test operation", "Clean work area"],
  };

  const completedItems = checklistItems[workOrder.type].filter((item) => parts.some((part) => part.name === item));

  return (
    <PageWrapper>
      <PageHeader title={workOrder.title} />
      <SectionCard>
        <div className="flex items-center space-x-4">
          <StatusBadge status={workOrder.status} />
          <MetricStrip label="Priority" value={workOrder.priority} />
          <MetricStrip label="Type" value={workOrder.type} />
        </div>
        {new Date(workOrder.due_date) < new Date() && (
          <p className="text-red-500">Overdue</p>
        )}
        {workOrder.asset_id && (
          <div className="mt-4">
            <h3>Asset:</h3>
            <p>{assets.find((asset: any) => asset.id === workOrder.asset_id)?.name}</p>
            <p>{assets.find((asset: any) => asset.id === workOrder.asset_id)?.location_description}</p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Execution Checklist">
        <Progress value={(completedItems.length / checklistItems[workOrder.type].length) * 100} />
        <ul className="mt-4 space-y-2">
          {checklistItems[workOrder.type].map((item, index) => (
            <li key={index} className={`flex items-center justify-between ${parts.some((part) => part.name === item) ? "line-through" : ""}`}>
              <input
                type="checkbox"
                checked={parts.some((part) => part.name === item)}
                onChange={() =>
                  setParts(
                    parts.map((part) =>
                      part.name === item ? { ...part, quantity: part.quantity + 1 } : part
                    )
                  )
                }
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm">{`${completedItems.length} of ${checklistItems[workOrder.type].length} steps completed`}</p>
      </SectionCard>

      <SectionCard title="Field Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="mt-2 text-sm">{`${notes.length}/500 characters`}</div>
      </SectionCard>

      <SectionCard title="Parts Used">
        <Input
          type="text"
          placeholder="Search part name"
          onChange={(e) => {
            const query = e.target.value.toLowerCase();
            const suggestions = assets.filter((asset: any) =>
              asset.name.toLowerCase().includes(query)
            );
            console.log(suggestions);
          }}
        />
        <ul className="mt-4 space-y-2">
          {parts.map((part, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{part.name}</span>
              <Input
                type="number"
                value={part.quantity}
                onChange={(e) =>
                  setParts(
                    parts.map((p, i) =>
                      i === index ? { ...p, quantity: parseInt(e.target.value) } : p
                    )
                  )
                }
              />
              <Button onClick={() => setParts(parts.filter((_, i) => i !== index))}>Remove</Button>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Action Buttons">
        <div className="flex space-x-4">
          <Button
            variant="primary"
            onClick={() =>
              updateMutation.mutate({
                notes,
                status: workOrder.status,
              })
            }
          >
            Save Progress
          </Button>
          <Button
            variant="success"
            onClick={() =>
              updateMutation.mutate({
                notes,
                status: "completed",
                completed_at: new Date().toISOString(),
              })
            }
          >
            Mark Complete
          </Button>
        </div>
      </SectionCard>
    </PageWrapper>
  );
};

export default WorkOrderPage;