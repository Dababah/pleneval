"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { 
  Calendar, 
  Flag, 
  Clock, 
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isPast, differenceInDays } from "date-fns";

import { Task, Subtask } from "@/types/tasks";

interface TaskCardProps {
  task: Task;
  index: number;
  dict: any;
  onClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
}

const TaskCard = ({ task, index, dict, onClick, onToggleComplete }: TaskCardProps) => {
  const getDeadlineInfo = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    
    if (task.status === 'done') {
      return {
        label: dict.tasks.deadline.completedAt.replace('{date}', format(date, 'dd MMM')),
        variant: 'success'
      };
    }

    if (isToday(date)) {
      return {
        label: dict.tasks.deadline.today,
        variant: 'warning'
      };
    }

    if (isPast(date)) {
      const days = differenceInDays(new Date(), date);
      return {
        label: dict.tasks.deadline.overdue.replace('{days}', days.toString()),
        variant: 'danger'
      };
    }

    const days = differenceInDays(date, new Date());
    return {
      label: dict.tasks.deadline.daysLeft.replace('{days}', days.toString()),
      variant: 'default'
    };
  };

  const deadline = getDeadlineInfo();

  return (
    <Draggable draggableId={task.id || ""} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
          onClick={() => onClick(task)}
          className={cn(
            "group relative p-3.5 mb-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md active:scale-[0.98] cursor-pointer",
            snapshot.isDragging && "!shadow-2xl !border-zinc-900/20 !ring-4 !ring-zinc-900/5 !z-[100] !bg-white !opacity-100 scale-105"
          )}
        >
          {/* Priority & Top Actions */}
          <div className="flex items-center justify-between mb-2">
            <div className={cn(
              "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
              task.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" : 
              task.priority === 'medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
              "bg-blue-50 text-blue-600 border-blue-100"
            )}>
              {task.priority === 'high' ? dict.tasks.priority.high : 
               task.priority === 'medium' ? dict.tasks.priority.medium : 
               dict.tasks.priority.low}
            </div>
            <button className="p-1 text-slate-300 hover:text-zinc-900 hover:bg-slate-50 rounded-lg transition-all">
              <MoreVertical size={14} />
            </button>
          </div>

          {/* Title & Desc */}
          <div className="space-y-1 mb-3">
            <h3 className={cn(
              "text-xs md:text-sm font-bold text-zinc-900 leading-snug line-clamp-2",
              (task.status === 'done' || task.status === 'cancelled') && "line-through text-slate-300"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-[10px] text-slate-400 font-medium line-clamp-1 leading-relaxed">
                {task.description}
              </p>
            )}
            {task.status !== 'done' && onToggleComplete && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task);
                }}
                className="w-full mt-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black tracking-widest uppercase transition-all shadow-sm active:scale-[0.97] text-center cursor-pointer"
              >
                Tandai Selesai
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50/50">
            {deadline && (
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold",
                deadline.variant === 'danger' ? "text-red-600 bg-red-50" :
                deadline.variant === 'warning' ? "text-amber-600 bg-amber-50" :
                deadline.variant === 'success' ? "text-green-600 bg-green-50" :
                "text-slate-400 bg-slate-50"
              )}>
                {deadline.variant === 'danger' ? <AlertCircle size={10} /> : <Calendar size={10} />}
                {deadline.label}
              </div>
            )}
            
            {task.category && (
              <div className="text-[9px] font-bold text-slate-300 bg-slate-50/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                #{task.category}
              </div>
            )}

            {task.status === 'in_progress' && (
              <div className="ml-auto flex items-center gap-1 text-[9px] font-bold text-blue-500 animate-pulse">
                <Clock size={10} />
                LIVE
              </div>
            )}
          </div>

          {/* Subtle status indicator bar */}
          <div className={cn(
            "absolute top-0 left-0 bottom-0 w-1 rounded-l-xl transition-all",
            task.status === 'done' ? "bg-green-500" :
            task.status === 'in_progress' ? "bg-blue-500" :
            task.status === 'cancelled' ? "bg-red-400/50" :
            "bg-transparent group-hover:bg-slate-200"
          )} />
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
 

