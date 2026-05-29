"use client";

import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal } from "lucide-react";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";

import { Task, Subtask } from "@/types/tasks";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  dict: any;
  onAddTask: (status: string) => void;
  onTaskClick: (task: Task) => void;
  colorClass: string;
  onToggleComplete?: (task: Task) => void;
}

const KanbanColumn = ({ 
  id, 
  title, 
  tasks, 
  dict, 
  onAddTask, 
  onTaskClick,
  colorClass,
  onToggleComplete
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col flex-1 min-w-0 bg-slate-50/40 rounded-2xl border border-slate-100 p-3 min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2 h-2 rounded-full", colorClass)} />
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">{title}</h2>
          <span className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-[9px] font-black text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 text-slate-300 hover:text-zinc-900 hover:bg-white rounded-lg transition-all">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "flex-1 transition-all duration-200 rounded-xl",
              snapshot.isDraggingOver && "bg-white/50 ring-2 ring-zinc-900/5"
            )}
          >
            <div className="min-h-[10px] space-y-0.5">
              {tasks.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter max-w-[120px]">
                     {dict.tasks.empty}
                   </p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index} 
                    dict={dict} 
                    onClick={onTaskClick}
                    onToggleComplete={onToggleComplete}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

    </div>
  );
};

export default KanbanColumn;
 

