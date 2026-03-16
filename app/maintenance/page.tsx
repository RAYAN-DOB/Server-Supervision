"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  User,
  FileText,
  X,
  Save,
  CheckSquare,
  Square,
  Filter,
  Loader2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { useSitesReference } from "@/hooks/useSitesReference";

// ─── Types ────────────────────────────────────────────────────────────────────

type MaintenanceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
type MaintenancePriority = "low" | "medium" | "high" | "critical";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface MaintenanceTask {
  id: string;
  siteId: string;
  siteName: string;
  title: string;
  description: string;
  scheduledDate: string;
  estimatedDuration: number; // minutes
  assignedTo: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  checklist: ChecklistItem[];
  notes: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
}

// ─── Données initiales de démonstration ───────────────────────────────────────

const INITIAL_TASKS: MaintenanceTask[] = [
  {
    id: "maint-001",
    siteId: "site-2",
    siteName: "Palais des Sports",
    title: "Maintenance préventive climatisation",
    description:
      "Nettoyage et vérification des filtres climatisation de la salle serveur principale",
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    estimatedDuration: 120,
    assignedTo: "Technicien Martin",
    status: "scheduled",
    priority: "high",
    checklist: [
      { id: "c1", label: "Couper alimentation climatisation", completed: false },
      { id: "c2", label: "Nettoyer les filtres", completed: false },
      { id: "c3", label: "Vérifier les niveaux de fluide", completed: false },
      { id: "c4", label: "Tester le refroidissement", completed: false },
      { id: "c5", label: "Remettre en service", completed: false },
    ],
    notes: "",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "Admin DSI",
  },
  {
    id: "maint-002",
    siteId: "site-11",
    siteName: "Marché d'Intérêt National",
    title: "Remplacement onduleur baie 2",
    description:
      "L'onduleur de la baie 2 présente des anomalies. Remplacement planifié.",
    scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    estimatedDuration: 180,
    assignedTo: "Équipe réseau",
    status: "scheduled",
    priority: "critical",
    checklist: [
      { id: "c1", label: "Commander le nouvel onduleur", completed: true },
      { id: "c2", label: "Prévenir les utilisateurs", completed: true },
      { id: "c3", label: "Basculer sur alimentation de secours", completed: false },
      { id: "c4", label: "Remplacer l'onduleur", completed: false },
      { id: "c5", label: "Tester l'alimentation", completed: false },
      { id: "c6", label: "Rétablir la configuration", completed: false },
    ],
    notes: "Prévoir une coupure de 30 min sur la baie concernée.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdBy: "Admin DSI",
  },
  {
    id: "maint-003",
    siteId: "site-5",
    siteName: "Hôtel de Ville",
    title: "Audit câblage réseau salle serveur",
    description: "Inventaire et remise en ordre du câblage réseau",
    scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    estimatedDuration: 240,
    assignedTo: "Technicien Dubois",
    status: "completed",
    priority: "medium",
    checklist: [
      { id: "c1", label: "Inventorier tous les câbles", completed: true },
      { id: "c2", label: "Étiqueter les câbles non identifiés", completed: true },
      { id: "c3", label: "Documenter dans le CMDB", completed: true },
    ],
    notes: "Câblage nettoyé. 12 câbles orphelins retirés.",
    completedAt: new Date(Date.now() - 86400000 + 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdBy: "Admin DSI",
  },
  {
    id: "maint-004",
    siteId: "site-8",
    siteName: "Médiathèque",
    title: "Mise à jour firmware switches",
    description: "Mise à jour firmware sur les 3 switches Cisco de la baie",
    scheduledDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    estimatedDuration: 90,
    assignedTo: "Technicien Martin",
    status: "scheduled",
    priority: "medium",
    checklist: [
      { id: "c1", label: "Télécharger les firmwares", completed: false },
      { id: "c2", label: "Sauvegarder la config actuelle", completed: false },
      { id: "c3", label: "Appliquer la mise à jour", completed: false },
      { id: "c4", label: "Vérifier le fonctionnement", completed: false },
    ],
    notes: "",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: "Admin DSI",
  },
];

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  MaintenanceStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  scheduled: {
    label: "Planifiée",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  in_progress: {
    label: "En cours",
    icon: Loader2,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-500/10 border-gray-500/20",
  },
};

const PRIORITY_CONFIG: Record<
  MaintenancePriority,
  { label: string; color: string; dot: string }
> = {
  low: { label: "Basse", color: "text-gray-400", dot: "bg-gray-500" },
  medium: { label: "Moyenne", color: "text-blue-400", dot: "bg-blue-500" },
  high: { label: "Haute", color: "text-amber-400", dot: "bg-amber-500" },
  critical: { label: "Critique", color: "text-red-400", dot: "bg-red-500" },
};

// ─── Composant Modal création/édition ─────────────────────────────────────────

interface TaskModalProps {
  task?: MaintenanceTask | null;
  siteOptions: { id: string; name: string }[];
  onSave: (task: Omit<MaintenanceTask, "id" | "createdAt" | "createdBy">) => void;
  onClose: () => void;
}

function TaskModal({ task, siteOptions, onSave, onClose }: TaskModalProps) {
  const [form, setForm] = useState({
    siteId: task?.siteId ?? "",
    siteName: task?.siteName ?? "",
    title: task?.title ?? "",
    description: task?.description ?? "",
    scheduledDate: task?.scheduledDate
      ? new Date(task.scheduledDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    estimatedDuration: task?.estimatedDuration ?? 60,
    assignedTo: task?.assignedTo ?? "",
    status: (task?.status ?? "scheduled") as MaintenanceStatus,
    priority: (task?.priority ?? "medium") as MaintenancePriority,
    notes: task?.notes ?? "",
    checklist: task?.checklist ?? [] as ChecklistItem[],
    completedAt: task?.completedAt,
  });
  const [newCheckItem, setNewCheckItem] = useState("");

  const handleSiteChange = (siteId: string) => {
    const site = siteOptions.find((s) => s.id === siteId);
    setForm((f) => ({ ...f, siteId, siteName: site?.name ?? "" }));
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setForm((f) => ({
      ...f,
      checklist: [
        ...f.checklist,
        { id: `c${Date.now()}`, label: newCheckItem.trim(), completed: false },
      ],
    }));
    setNewCheckItem("");
  };

  const removeCheckItem = (id: string) => {
    setForm((f) => ({
      ...f,
      checklist: f.checklist.filter((c) => c.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siteId || !form.title || !form.scheduledDate) {
      toast.error("Remplissez les champs obligatoires");
      return;
    }
    onSave({
      ...form,
      scheduledDate: new Date(form.scheduledDate).toISOString(),
      completedAt:
        form.status === "completed" && !form.completedAt
          ? new Date().toISOString()
          : form.completedAt,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#080814] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header modal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wrench className="w-4.5 h-4.5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">
                  {task ? "Modifier la maintenance" : "Planifier une maintenance"}
                </h3>
                <p className="text-xs text-gray-500">Tous les champs marqués * sont obligatoires</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Site */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Site *
                </label>
                <select
                  value={form.siteId}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Sélectionner un site…</option>
                  {siteOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Priorité
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as MaintenancePriority,
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Titre *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="Ex : Maintenance préventive climatisation"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                placeholder="Détails de l'intervention…"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Date + Durée + Assigné + Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Date planifiée *
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledDate: e.target.value }))
                  }
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Durée estimée (min)
                </label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={form.estimatedDuration}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      estimatedDuration: parseInt(e.target.value) || 60,
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Assigné à
                </label>
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assignedTo: e.target.value }))
                  }
                  placeholder="Nom du technicien…"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Statut
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as MaintenanceStatus,
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="scheduled">Planifiée</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Checklist ({form.checklist.filter((c) => c.completed).length}/{form.checklist.length})
              </label>
              <div className="space-y-1.5 mb-2">
                {form.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          checklist: f.checklist.map((c) =>
                            c.id === item.id ? { ...c, completed: !c.completed } : c
                          ),
                        }))
                      }
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-xs",
                        item.completed
                          ? "line-through text-gray-600"
                          : "text-gray-300"
                      )}
                    >
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCheckItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCheckItem();
                    }
                  }}
                  placeholder="Ajouter une étape…"
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={addCheckItem}
                  className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                placeholder="Observations, consignes de sécurité…"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Actions modal */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {task ? "Enregistrer" : "Planifier"}
              </Button>
              <Button type="button" variant="glass" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_TASKS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<MaintenancePriority | "all">("all");

  const { sites: siteRefs } = useSitesReference();
  const siteOptions = useMemo(
    () =>
      siteRefs
        .filter((s) => s.likelyManagedByDSI)
        .map((s) => ({ id: s.id, name: s.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [siteRefs]
  );

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (filterPriority !== "all" && t.priority !== filterPriority) return false;
        return true;
      })
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const statusOrder = { in_progress: 0, scheduled: 1, completed: 2, cancelled: 3 };
        const byStatus =
          statusOrder[a.status] - statusOrder[b.status];
        if (byStatus !== 0) return byStatus;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, filterStatus, filterPriority]);

  const stats = useMemo(() => ({
    total: tasks.length,
    scheduled: tasks.filter((t) => t.status === "scheduled").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    critical: tasks.filter((t) => t.priority === "critical" && t.status !== "completed" && t.status !== "cancelled").length,
  }), [tasks]);

  const handleSave = (
    data: Omit<MaintenanceTask, "id" | "createdAt" | "createdBy">
  ) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...editingTask, ...data }
            : t
        )
      );
      toast.success("Maintenance mise à jour");
    } else {
      const newTask: MaintenanceTask = {
        ...data,
        id: `maint-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: "Utilisateur courant",
      };
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Maintenance planifiée avec succès");
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Maintenance supprimée");
  };

  const handleToggleChecklist = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checklist: t.checklist.map((c) =>
                c.id === itemId ? { ...c, completed: !c.completed } : c
              ),
            }
          : t
      )
    );
  };

  const handleQuickStatus = (taskId: string, status: MaintenanceStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedAt:
                status === "completed" ? new Date().toISOString() : t.completedAt,
            }
          : t
      )
    );
    toast.success(`Statut mis à jour : ${STATUS_CONFIG[status].label}`);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <Breadcrumbs />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-purple-400" />
            Gestion des Maintenances
          </h1>
          <p className="text-sm text-gray-500 font-light">
            Planification et suivi des interventions sur les sites municipaux
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle maintenance
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Planifiées", value: stats.scheduled, color: "text-blue-400" },
          { label: "En cours", value: stats.inProgress, color: "text-amber-400" },
          { label: "Terminées", value: stats.completed, color: "text-green-400" },
          { label: "Critiques", value: stats.critical, color: "text-red-400" },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="clean-card p-4 text-center"
          >
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500">Statut :</span>
        </div>
        {(["all", "scheduled", "in_progress", "completed", "cancelled"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                filterStatus === s
                  ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                  : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300"
              )}
            >
              {s === "all"
                ? "Toutes"
                : STATUS_CONFIG[s as MaintenanceStatus].label}
            </button>
          )
        )}
        <span className="mx-2 text-gray-700">|</span>
        <div className="flex items-center gap-1.5 mr-1">
          <span className="text-xs text-gray-500">Priorité :</span>
        </div>
        {(["all", "critical", "high", "medium", "low"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              filterPriority === p
                ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300"
            )}
          >
            {p === "all"
              ? "Toutes"
              : PRIORITY_CONFIG[p as MaintenancePriority].label}
          </button>
        ))}
      </div>

      {/* Liste des maintenances */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Wrench className="w-14 h-14 text-gray-700 mb-4" />
          <p className="text-gray-500 font-light">Aucune maintenance correspondante</p>
          <button
            onClick={() => {
              setFilterStatus("all");
              setFilterPriority("all");
            }}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task, i) => {
              const StatusIcon = STATUS_CONFIG[task.status].icon;
              const isExpanded = expandedId === task.id;
              const completedChecks = task.checklist.filter((c) => c.completed).length;
              const totalChecks = task.checklist.length;
              const progress =
                totalChecks > 0
                  ? Math.round((completedChecks / totalChecks) * 100)
                  : 0;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "rounded-2xl border overflow-hidden transition-all",
                    task.status === "completed"
                      ? "border-white/[0.04] bg-white/[0.01] opacity-75"
                      : task.status === "cancelled"
                      ? "border-white/[0.04] bg-white/[0.01] opacity-50"
                      : task.priority === "critical"
                      ? "border-red-500/20 bg-red-500/[0.03]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  )}
                >
                  {/* Row principale */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : task.id)
                    }
                  >
                    {/* Priority dot */}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        PRIORITY_CONFIG[task.priority].dot
                      )}
                    />

                    {/* Status icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0",
                        STATUS_CONFIG[task.status].bg
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          "w-4 h-4",
                          STATUS_CONFIG[task.status].color,
                          task.status === "in_progress" && "animate-spin"
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-white truncate">
                          {task.title}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-medium flex-shrink-0",
                            task.priority === "critical" &&
                              "bg-red-500/15 text-red-400",
                            task.priority === "high" &&
                              "bg-amber-500/15 text-amber-400",
                            task.priority === "medium" &&
                              "bg-blue-500/15 text-blue-400",
                            task.priority === "low" &&
                              "bg-gray-500/15 text-gray-400"
                          )}
                        >
                          {PRIORITY_CONFIG[task.priority].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-light">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {task.siteName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.scheduledDate)}
                        </span>
                        {task.assignedTo && (
                          <span className="flex items-center gap-1 hidden sm:flex">
                            <User className="w-3 h-3" />
                            {task.assignedTo}
                          </span>
                        )}
                        {totalChecks > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            {completedChecks}/{totalChecks}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions rapides + expand */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.status === "scheduled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatus(task.id, "in_progress");
                          }}
                          title="Démarrer"
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-colors"
                        >
                          Démarrer
                        </button>
                      )}
                      {task.status === "in_progress" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStatus(task.id, "completed");
                          }}
                          title="Terminer"
                          className="px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium transition-colors"
                        >
                          Terminer
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                          setModalOpen(true);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Détails expandés */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-white/[0.04]">
                          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Info colonne gauche */}
                            <div className="space-y-4">
                              {task.description && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">
                                    Description
                                  </p>
                                  <p className="text-sm text-gray-300 leading-relaxed">
                                    {task.description}
                                  </p>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">
                                    Durée estimée
                                  </p>
                                  <p className="text-sm text-white">
                                    {task.estimatedDuration >= 60
                                      ? `${Math.floor(task.estimatedDuration / 60)}h${task.estimatedDuration % 60 > 0 ? `${task.estimatedDuration % 60}min` : ""}`
                                      : `${task.estimatedDuration} min`}
                                  </p>
                                </div>
                                {task.completedAt && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-0.5">
                                      Terminée le
                                    </p>
                                    <p className="text-sm text-green-400">
                                      {formatDate(task.completedAt)}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">
                                    Créée par
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {task.createdBy}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">
                                    Créée le
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {formatRelativeTime(task.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {task.notes && (
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Notes
                                  </p>
                                  <p className="text-xs text-gray-400 leading-relaxed">
                                    {task.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Checklist colonne droite */}
                            {task.checklist.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-medium text-gray-500">
                                    Checklist d&apos;intervention
                                  </p>
                                  <span className="text-xs text-gray-600">
                                    {completedChecks}/{totalChecks} étapes
                                  </span>
                                </div>
                                {/* Progress bar */}
                                <div className="h-1.5 rounded-full bg-white/[0.06] mb-3 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      progress === 100
                                        ? "bg-green-500"
                                        : "bg-purple-500"
                                    )}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  {task.checklist.map((item) => (
                                    <button
                                      key={item.id}
                                      onClick={() =>
                                        handleToggleChecklist(task.id, item.id)
                                      }
                                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left group"
                                    >
                                      {item.completed ? (
                                        <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                                      ) : (
                                        <Square className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                                      )}
                                      <span
                                        className={cn(
                                          "text-xs",
                                          item.completed
                                            ? "line-through text-gray-600"
                                            : "text-gray-300"
                                        )}
                                      >
                                        {item.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal
            task={editingTask}
            siteOptions={siteOptions}
            onSave={handleSave}
            onClose={() => {
              setModalOpen(false);
              setEditingTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
