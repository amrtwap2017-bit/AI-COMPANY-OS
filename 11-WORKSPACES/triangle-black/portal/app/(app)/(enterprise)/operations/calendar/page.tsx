"use client";

import { useState } from "react";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Button,
} from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import fetch from "node-fetch";

const getPMPlans = async () => {
  const response = await fetch("/api/v1/maintenance/pm-plans", {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

const getWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: pmPlans, isLoading: isPMLoading, isError: isPMError } = useQuery(
    ["pm-plans"],
    getPMPlans
  );

  const { data: workOrders, isLoading: isWorkLoading, isError: isWorkError } =
    useQuery(["work-orders"], getWorkOrders);

  if (isPMLoading || isWorkLoading) return <LoadingState />;
  if (isPMError || isWorkError) return <EmptyState />;

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 13);

  const pmPlansDueThisWeek = pmPlans.filter((plan: any) => {
    const dueDate = new Date(plan.next_due_date);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });

  const workOrdersDueThisWeek = workOrders.filter((wo: any) => {
    const dueDate = new Date(wo.due_date);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });

  const overdueItems = [...pmPlans, ...workOrders].filter((item: any) => {
    const dueDate = item.type === "PM" ? new Date(item.next_due_date) : new Date(item.due_date);
    return dueDate < today;
  });

  const next14DaysTotal = pmPlans.length + workOrders.length;

  const renderDayPills = (date: Date) => {
    const dayOfWeek = date.getDay();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;

    return (
      <div
        key={date.toISOString()}
        className={`flex flex-col items-center justify-center ${
          isToday ? "bg-gray-700" : isPast ? "text-gray-500" : ""
        }`}
      >
        {dayOfWeek === 0 && <span>sun</span>}
        {dayOfWeek === 1 && <span>mon</span>}
        {dayOfWeek === 2 && <span>tue</span>}
        {dayOfWeek === 3 && <span>wed</span>}
        {dayOfWeek === 4 && <span>thu</span>}
        {dayOfWeek === 5 && <span>fri</span>}
        {dayOfWeek === 6 && <span>sat</span>}
        <div className="mt-2">
          {pmPlansDueThisWeek
            .filter((plan: any) => {
              const dueDate = new Date(plan.next_due_date);
              return dueDate.toDateString() === date.toDateString();
            })
            .map((plan: any, index: number) => (
              <div key={index} className="bg-blue-500 text-white px-2 py-1 rounded-full mb-1 truncate">
                {plan.title.slice(0, 20)}
              </div>
            ))}
          {workOrdersDueThisWeek
            .filter((wo: any) => {
              const dueDate = new Date(wo.due_date);
              return dueDate.toDateString() === date.toDateString();
            })
            .map((wo: any, index: number) => (
              <div key={index} className="bg-amber-500 text-white px-2 py-1 rounded-full mb-1 truncate">
                {wo.title.slice(0, 20)}
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const days = [];
    for (let i = 0; i < 21; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      days.push(renderDayPills(date));
    }
    return (
      <div className="grid grid-cols-7 gap-4">
        {days}
      </div>
    );
  };

  const renderSelectedDayDetail = () => {
    const itemsDueOnDate = [...pmPlans, ...workOrders].filter((item: any) => {
      const dueDate = item.type === "PM" ? new Date(item.next_due_date) : new Date(item.due_date);
      return dueDate.toDateString() === selectedDate.toDateString();
    });

    if (itemsDueOnDate.length === 0) return <EmptyState />;

    return (
      <div>
        {itemsDueOnDate.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between mb-2">
            <span>{item.title}</span>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageWrapper>
      <PageHeader title="Calendar" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "WOs Due This Week", value: workOrdersDueThisWeek.length },
            { label: "PM Plans Due This Week", value: pmPlansDueThisWeek.length },
            { label: "Overdue Items", value: overdueItems.length },
            { label: "Next 14 Days Total", value: next14DaysTotal },
          ]}
        />
      </SectionCard>
      <div className="flex">
        <div className="w-1/3">{renderCalendarGrid()}</div>
        <div className="w-2/3 p-4">
          {renderSelectedDayDetail()}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CalendarPage;