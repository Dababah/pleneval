"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  DragDropContext, 
  DropResult, 
  Droppable 
} from "@hello-pangea/dnd";
import { 
  Search, 
  Filter, 
  Plus, 
  Layout, 
  List, 
  Layers,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import ArchiveSection from "./ArchiveSection";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { format } from "date-fns";

import { Task, Subtask } from "@/types/tasks";

interface KanbanBoardProps {
  dict: any;
  lang: string;
}

const COLUMNS = [
  { id: 'todo', title: 'todo', color: 'bg-slate-400' },
  { id: 'in_progress', title: 'in_progress', color: 'bg-blue-500' },
  { id: 'done', title: 'done', color: 'bg-green-500' },
  { id: 'cancelled', title: 'cancelled', color: 'bg-red-400' }
];

const KanbanBoard = ({ dict, lang }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetStatus, setTargetStatus] = useState("todo");
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const isSameColumn = source.droppableId === destination.droppableId;

    // Build fresh sorted arrays for source and dest columns
    const srcTasks = tasks
      .filter(t => t.status === source.droppableId && !t.isArchived)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    const destTasks = isSameColumn
      ? [...srcTasks]
      : tasks
          .filter(t => t.status === destination.droppableId && !t.isArchived)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Find and remove the moved task from source
    const movedIndex = srcTasks.findIndex(t => t.id === draggableId);
    if (movedIndex === -1) return;
    const [movedTask] = srcTasks.splice(movedIndex, 1);

    // Insert into destination with updated status
    const updatedTask = { ...movedTask, status: destination.droppableId };
    if (isSameColumn) {
      srcTasks.splice(destination.index, 0, updatedTask);
    } else {
      destTasks.splice(destination.index, 0, updatedTask);
    }

    // Assign new positions
    const reorderedSrc = (isSameColumn ? srcTasks : srcTasks).map((t, i) => ({ ...t, position: i }));
    const reorderedDest = isSameColumn ? reorderedSrc : destTasks.map((t, i) => ({ ...t, position: i }));

    // Merge back into full task list (replace only affected tasks)
    const affectedIds = new Set([...reorderedSrc.map(t => t.id), ...reorderedDest.map(t => t.id)]);
    const updatedAll = [
      ...tasks.filter(t => !affectedIds.has(t.id)),
      ...reorderedSrc,
      ...(isSameColumn ? [] : reorderedDest),
    ];

    // Optimistic update — set state immediately before API call
    setTasks(updatedAll);

    // Build API payload
    const allReordered = isSameColumn ? reorderedSrc : [...reorderedSrc, ...reorderedDest];
    const payload = allReordered.map(t => ({ id: t.id, status: t.status, position: t.position }));

    try {
      await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(error);
      fetchTasks(); // Rollback on failure
    }
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      const isEdit = !!taskData.id;
      const url = isEdit ? `/api/tasks/${taskData.id}` : '/api/tasks';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDeleteId(id);
    setIsDelConfirmOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDeleteId) return;
    try {
      const res = await fetch(`/api/tasks/${taskToDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTaskToDeleteId(null);
    }
  };

  const handleArchiveTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/archive`, { method: 'PATCH' });
      if (res.ok) fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/restore`, { method: 'PATCH' });
      if (res.ok) fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    // Update locally / optimistically
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error(error);
      fetchTasks(); // Rollback on error
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return !t.isArchived && matchesSearch && matchesPriority && matchesCategory;
  });

  const archivedTasks = tasks.filter(t => t.isArchived);

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  return (
    <div className="w-full space-y-8">
      {/* Top Navigation - Simplified */}
      <div className="flex items-center justify-between gap-6 pb-6 border-b border-slate-100">
         <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Task Manager</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organize your objectives.</p>
         </div>

         <div className="flex items-center gap-3">
             <button 
               onClick={() => { setEditingTask(null); setTargetStatus("todo"); setIsModalOpen(true); }}
               className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-[0.2em]"
             >
               <Plus size={16} strokeWidth={3} />
               <span>{dict.tasks.addBtn}</span>
             </button>
         </div>
      </div>

      {/* Kanban Board Area */}
      {loading && tasks.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-6">
           <div className="w-12 h-12 rounded-2xl border-4 border-slate-50 border-t-zinc-900 animate-spin shadow-lg" />
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Syncing Neural Grid...</p>
        </div>
      ) : (
        <div className="relative">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 px-1">
              {COLUMNS.map((col) => (
                <KanbanColumn 
                  key={col.id}
                  id={col.id}
                  title={dict.tasks.columns[col.title]}
                  colorClass={col.color}
                  tasks={filteredTasks.filter(t => t.status === col.id).sort((a, b) => (a.position || 0) -(b.position || 0))}
                  dict={dict}
                  onAddTask={(status) => { setTargetStatus(status); setEditingTask(null); setIsModalOpen(true); }}
                  onTaskClick={(task) => { setEditingTask(task); setIsModalOpen(true); }}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          </DragDropContext>
          
        </div>
      )}

      {/* Archive Section */}
      <ArchiveSection 
        tasks={archivedTasks}
        dict={dict}
        onRestore={handleRestoreTask}
        onDelete={handleDeleteTask}
        onClear={() => {}} // TODO
      />

      {/* Task Modal */}
      <TaskModal 
        isOpen={isModalOpen}
        task={editingTask}
        initialStatus={targetStatus}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        dict={dict}
      />

      <ConfirmModal
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDeleteTask}
        title={dict.tasks.deleteModalTitle || (lang === 'id' ? "Hapus Tugas" : "Delete Task")}
        message={dict.tasks.deleteConfirm || (lang === 'id' ? "Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan." : "Are you sure you want to delete this task? This action cannot be undone.")}
        variant="danger"
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;
 

