"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Database,
  Bell,
  Save,
  RefreshCw,
  Shield,
  Trash2,
  Edit,
  UserPlus,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Info,
  Server,
  Eye,
  EyeOff,
  Key,
  X,
  Lock,
  Unlock,
  KeyRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

// ─── Types locaux ─────────────────────────────────────────────────────────────

type UserRole = "super_admin" | "admin" | "tech" | "viewer";

interface ApiUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
}

interface ZabbixTestResult {
  connected: boolean;
  useMock: boolean;
  apiVersion?: string;
  error?: string;
  hostsCount: number;
  triggersActive: number;
}

// ─── Helpers d'affichage ──────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  tech: "Technicien",
  viewer: "Observateur",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "critical",
  admin: "warning",
  tech: "info",
  viewer: "ok",
};

// ─── Modal édition utilisateur ────────────────────────────────────────────────

interface EditUserModalProps {
  user: ApiUser;
  currentUserRole: UserRole;
  onClose: () => void;
  onSaved: () => void;
}

function EditUserModal({
  user,
  currentUserRole,
  onClose,
  onSaved,
}: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [role, setRole] = useState<UserRole>(user.role);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(
    user.mustChangePassword
  );
  const [saving, setSaving] = useState(false);

  const canChangeRole = currentUserRole === "super_admin";

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        department: department.trim(),
        phone: phone.trim(),
        mustChangePassword,
      };

      if (canChangeRole) body.role = role;
      if (newPassword) {
        if (newPassword.length < 12) {
          toast.error("Le mot de passe doit faire au moins 12 caractères");
          setSaving(false);
          return;
        }
        body.password = newPassword;
      }

      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la modification");
        return;
      }

      toast.success(`Compte de ${user.name} mis à jour`);
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#0c0c1a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula-violet to-nebula-cyan flex items-center justify-center text-white font-semibold text-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold">{user.name}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
            />
          </div>

          {/* Département */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Département
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="DSI - Supervision"
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
            />
          </div>

          {/* Rôle (super_admin uniquement) */}
          {canChangeRole && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
              >
                <option value="super_admin">Super Admin — accès total</option>
                <option value="admin">Administrateur — peut gérer les comptes</option>
                <option value="tech">Technicien — lecture + interventions</option>
                <option value="viewer">Observateur — lecture seule</option>
              </select>
            </div>
          )}

          {/* Réinitialisation mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nouveau mot de passe{" "}
              <span className="text-gray-600 font-light">(laisser vide pour ne pas changer)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 12 caractères, majuscule, chiffre, spécial"
                className="w-full pl-10 pr-12 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {newPassword && (
              <p className="mt-1 text-xs text-amber-400">
                ⚠ L'utilisateur devra changer ce mot de passe à sa prochaine connexion.
              </p>
            )}
          </div>

          {/* Forcer changement MDP */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <button
              type="button"
              onClick={() => setMustChangePassword(!mustChangePassword)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                mustChangePassword
                  ? "bg-gradient-to-r from-nebula-violet to-nebula-magenta"
                  : "bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  mustChangePassword ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <div>
              <p className="text-sm text-gray-300">
                Forcer le changement de mot de passe
              </p>
              <p className="text-xs text-gray-600">
                L'utilisateur devra changer son mot de passe à la prochaine connexion
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/[0.06]">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-nebula-violet to-nebula-magenta"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
          <Button onClick={onClose} variant="ghost" className="flex-1">
            Annuler
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { zabbixConfig, setZabbixConfig, currentUser } = useStore();

  // ── Onglet Zabbix ──
  const [apiUrl, setApiUrl] = useState(zabbixConfig.apiUrl || "");
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<ZabbixTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [localToken, setLocalToken] = useState("");

  // ── Onglet Utilisateurs ──
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);

  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
    role: "tech" as UserRole,
    department: "",
    phone: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // ── Onglet Audit ──
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const canManageUsers =
    currentUser?.role === "super_admin" || currentUser?.role === "admin";

  // ── Charger les utilisateurs ──

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/auth/users");
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setUsers(data.users);
    } catch {
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch("/api/auth/audit");
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setAuditLogs(data.logs ?? []);
    } catch {
      toast.error("Impossible de charger le journal d'audit");
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
      loadAuditLogs();
    }
  }, [canManageUsers, loadUsers, loadAuditLogs]);

  // ── Créer un utilisateur ──

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.username || !newUser.name || !newUser.password) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    setSavingUser(true);
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la création");
        return;
      }
      toast.success(`Compte créé pour ${data.user.name}`);
      setShowCreateForm(false);
      setNewUser({
        email: "",
        username: "",
        name: "",
        password: "",
        role: "tech",
        department: "",
        phone: "",
      });
      await loadUsers();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSavingUser(false);
    }
  };

  // ── Activer / Désactiver ──

  const handleToggleActive = async (user: ApiUser) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      toast.success(user.isActive ? "Compte désactivé" : "Compte activé");
      await loadUsers();
    } catch {
      toast.error("Erreur réseau");
    }
  };

  // ── Déverrouiller un compte ──

  const handleUnlockAccount = async (user: ApiUser) => {
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockedUntil: null, failedLoginAttempts: 0 }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      toast.success(`Compte de ${user.name} déverrouillé`);
      await loadUsers();
    } catch {
      toast.error("Erreur réseau");
    }
  };

  // ── Supprimer un utilisateur ──

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Supprimer le compte de ${userName} ?`)) return;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Compte supprimé");
      await loadUsers();
    } catch {
      toast.error("Erreur réseau");
    }
  };

  // ── Test connexion Zabbix ──

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/zabbix/status");
      const data = await res.json();
      setTestResult(data);
      if (data.connected && !data.useMock) {
        toast.success(`Connexion Zabbix réussie ! API v${data.apiVersion}`);
      } else if (data.useMock) {
        toast.warning("Mode démonstration — Zabbix non configuré côté serveur");
      } else {
        toast.error("Connexion échouée : " + (data.error ?? "Erreur"));
      }
    } catch {
      toast.error("Impossible de joindre l'API");
      setTestResult({
        connected: false,
        useMock: true,
        error: "Erreur réseau",
        hostsCount: 0,
        triggersActive: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveZabbixConfig = () => {
    setZabbixConfig({
      apiUrl,
      connected: testResult?.connected ?? false,
      lastSync: new Date().toISOString(),
    });
    toast.success("URL Zabbix sauvegardée (le token reste côté serveur)");
  };

  // ─── Rendu ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1">
      {/* Modal édition utilisateur */}
      <AnimatePresence>
        {editingUser && (
          <EditUserModal
            user={editingUser}
            currentUserRole={(currentUser?.role as UserRole) ?? "viewer"}
            onClose={() => setEditingUser(null)}
            onSaved={loadUsers}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Administration
          </h1>
          <p className="text-gray-500 font-light">
            Configuration système et gestion des accès — DSI Maisons-Alfort
          </p>
        </motion.div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="bg-white/[0.03] border-white/[0.06]">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white/[0.08]"
            >
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger
              value="zabbix"
              className="data-[state=active]:bg-white/[0.08]"
            >
              <Database className="w-4 h-4 mr-2" />
              Zabbix API
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-white/[0.08]"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="data-[state=active]:bg-white/[0.08]"
              onClick={loadAuditLogs}
            >
              <Activity className="w-4 h-4 mr-2" />
              Audit
            </TabsTrigger>
          </TabsList>

          {/* ══ ONGLET UTILISATEURS ══════════════════════════════════════════ */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Gestion des Comptes
                </h2>
                <p className="text-sm text-gray-500 font-light">
                  {users.length} compte{users.length > 1 ? "s" : ""} ·{" "}
                  {users.filter((u) => u.isActive).length} actif
                  {users.filter((u) => u.isActive).length > 1 ? "s" : ""} ·{" "}
                  {users.filter((u) => u.mustChangePassword).length} en attente
                  de changement MDP
                </p>
              </div>
              {canManageUsers && (
                <div className="flex gap-2">
                  <Button
                    onClick={loadUsers}
                    variant="ghost"
                    size="icon"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateForm(!showCreateForm);
                      setEditingUser(null);
                    }}
                    className="bg-gradient-to-r from-nebula-violet to-nebula-magenta"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouveau compte
                  </Button>
                </div>
              )}
            </div>

            {/* ── Formulaire de création ── */}
            <AnimatePresence>
              {showCreateForm && canManageUsers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="border-nebula-violet/20 bg-nebula-violet/5">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Key className="w-5 h-5 text-nebula-violet" />
                        Créer un nouveau compte
                      </CardTitle>
                      <CardDescription>
                        L'email doit être @maisons-alfort.fr. L'utilisateur
                        devra changer son mot de passe à la première connexion.
                        Min. 12 caractères avec majuscule, chiffre et caractère
                        spécial.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          {
                            label: "Nom complet *",
                            key: "name",
                            placeholder: "Jean Dupont",
                          },
                          {
                            label: "Nom d'utilisateur *",
                            key: "username",
                            placeholder: "jean.dupont",
                          },
                          {
                            label: "Email * (@maisons-alfort.fr)",
                            key: "email",
                            placeholder: "jean.dupont@maisons-alfort.fr",
                            type: "email",
                          },
                          {
                            label: "Département",
                            key: "department",
                            placeholder: "DSI - Support",
                          },
                          {
                            label: "Téléphone",
                            key: "phone",
                            placeholder: "+33 1 23 45 67 89",
                          },
                        ].map(({ label, key, placeholder, type }) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              {label}
                            </label>
                            <input
                              type={type ?? "text"}
                              value={newUser[key as keyof typeof newUser]}
                              onChange={(e) =>
                                setNewUser({ ...newUser, [key]: e.target.value })
                              }
                              placeholder={placeholder}
                              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Mot de passe temporaire *
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newUser.password}
                              onChange={(e) =>
                                setNewUser({
                                  ...newUser,
                                  password: e.target.value,
                                })
                              }
                              placeholder="Min. 12 car. + majuscule + chiffre + spécial"
                              className="w-full px-4 py-2.5 pr-10 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Rôle
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              role: e.target.value as UserRole,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
                        >
                          {currentUser?.role === "super_admin" && (
                            <option value="super_admin">
                              Super Admin — accès total
                            </option>
                          )}
                          <option value="admin">
                            Administrateur — peut gérer les comptes
                          </option>
                          <option value="tech">
                            Technicien — lecture + interventions
                          </option>
                          <option value="viewer">
                            Observateur — lecture seule
                          </option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleCreateUser}
                          disabled={savingUser}
                          className="bg-gradient-to-r from-nebula-violet to-nebula-magenta"
                        >
                          {savingUser ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          Créer le compte
                        </Button>
                        <Button
                          onClick={() => setShowCreateForm(false)}
                          variant="ghost"
                        >
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Liste des utilisateurs ── */}
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Chargement...
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => {
                  const isLocked =
                    user.lockedUntil && new Date(user.lockedUntil) > new Date();

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card
                        className={`border-white/[0.06] bg-white/[0.02] transition-opacity ${
                          !user.isActive && "opacity-50"
                        } ${isLocked ? "border-red-500/20" : ""}`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Avatar */}
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-nebula-violet to-nebula-cyan flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>

                              {/* Infos */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-white text-sm">
                                    {user.name}
                                  </span>
                                  <Badge
                                    variant={
                                      ROLE_COLORS[
                                        user.role
                                      ] as
                                        | "ok"
                                        | "warning"
                                        | "critical"
                                        | "info"
                                        | "default"
                                    }
                                    className="text-xs"
                                  >
                                    {ROLE_LABELS[user.role]}
                                  </Badge>
                                  {!user.isActive && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-gray-700"
                                    >
                                      Désactivé
                                    </Badge>
                                  )}
                                  {user.mustChangePassword && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    >
                                      <KeyRound className="w-3 h-3 mr-1" />
                                      MDP à changer
                                    </Badge>
                                  )}
                                  {isLocked && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-red-500/20 text-red-400 border-red-500/30"
                                    >
                                      <Lock className="w-3 h-3 mr-1" />
                                      Verrouillé
                                    </Badge>
                                  )}
                                  {user.id === currentUser?.id && (
                                    <span className="text-xs text-nebula-cyan">
                                      (vous)
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-0.5 text-xs text-gray-500 font-light">
                                  <p>{user.email}</p>
                                  {user.department && <p>{user.department}</p>}
                                  {user.lastLogin && (
                                    <p className="text-gray-600">
                                      Dernière connexion :{" "}
                                      {new Date(user.lastLogin).toLocaleString(
                                        "fr-FR"
                                      )}
                                    </p>
                                  )}
                                  {isLocked && user.lockedUntil && (
                                    <p className="text-red-400">
                                      Verrouillé jusqu'à :{" "}
                                      {new Date(
                                        user.lockedUntil
                                      ).toLocaleString("fr-FR")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            {canManageUsers && user.id !== currentUser?.id && (
                              <div className="flex gap-1 flex-shrink-0">
                                {isLocked && (
                                  <Button
                                    onClick={() => handleUnlockAccount(user)}
                                    variant="ghost"
                                    size="icon"
                                    title="Déverrouiller le compte"
                                    className="text-green-500 hover:text-green-400"
                                  >
                                    <Unlock className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleToggleActive(user)}
                                  variant="ghost"
                                  size="icon"
                                  title={
                                    user.isActive ? "Désactiver" : "Activer"
                                  }
                                  className={
                                    user.isActive
                                      ? "text-yellow-500 hover:text-yellow-400"
                                      : "text-green-500 hover:text-green-400"
                                  }
                                >
                                  <Shield className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => setEditingUser(user)}
                                  variant="ghost"
                                  size="icon"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {!user.id.startsWith("dsi-") && (
                                  <Button
                                    onClick={() =>
                                      handleDeleteUser(user.id, user.name)
                                    }
                                    variant="ghost"
                                    size="icon"
                                    title="Supprimer"
                                    className="text-red-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {!canManageUsers && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400 mb-1">
                      Permissions limitées
                    </p>
                    <p className="text-xs text-gray-400 font-light">
                      Votre rôle ({currentUser?.role}) ne permet pas de gérer
                      les comptes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ══ ONGLET ZABBIX ════════════════════════════════════════════════ */}
          <TabsContent value="zabbix" className="space-y-6">
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      Configuration Zabbix API
                    </CardTitle>
                    <CardDescription>
                      Le token API reste côté serveur (variable Netlify
                      ZABBIX_API_TOKEN). Seule l'URL est sauvegardée ici.
                    </CardDescription>
                  </div>
                  <Database className="w-6 h-6 text-nebula-cyan" />
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    URL de l'API Zabbix
                  </label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://192.168.X.X/zabbix/api_jsonrpc.php"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                  />
                  <p className="text-xs text-gray-600 mt-1.5 font-light">
                    Variable d'env serveur :{" "}
                    <code className="text-nebula-cyan">ZABBIX_API_URL</code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Token d'API{" "}
                    <span className="text-gray-600 font-light">
                      (aperçu local — non persisté)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={localToken}
                      onChange={(e) => setLocalToken(e.target.value)}
                      placeholder="Configuré via ZABBIX_API_TOKEN dans Netlify"
                      className="w-full px-4 py-3 pr-12 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-amber-400 mt-1.5 font-light">
                    ⚠ Le token n'est jamais sauvegardé dans le navigateur.
                    Configurez ZABBIX_API_TOKEN dans les variables Netlify.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    variant="glass"
                    className="min-w-[160px]"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tester la connexion
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSaveZabbixConfig}
                    className="bg-gradient-to-r from-nebula-violet to-nebula-magenta"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder l'URL
                  </Button>
                </div>

                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${
                      testResult.connected && !testResult.useMock
                        ? "border-green-500/30 bg-green-500/5"
                        : testResult.useMock
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {testResult.connected && !testResult.useMock ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : testResult.useMock ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <p
                          className={`font-medium text-sm ${
                            testResult.connected && !testResult.useMock
                              ? "text-green-400"
                              : testResult.useMock
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {testResult.connected && !testResult.useMock
                            ? `Connecté à Zabbix ${testResult.apiVersion}`
                            : testResult.useMock
                            ? "Mode démonstration actif"
                            : "Connexion échouée"}
                        </p>
                        {testResult.error && (
                          <p className="text-xs text-gray-400 font-light">
                            {testResult.error}
                          </p>
                        )}
                        {testResult.connected && !testResult.useMock && (
                          <div className="flex gap-4 text-xs text-gray-400 mt-2">
                            <span>
                              <Server className="w-3 h-3 inline mr-1" />
                              {testResult.hostsCount} hôtes
                            </span>
                            <span>
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {testResult.triggersActive} triggers actifs
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Guide */}
            <Card className="border-nebula-cyan/10 bg-nebula-cyan/[0.02]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-nebula-cyan" />
                  <CardTitle className="text-white text-base">
                    Guide de déploiement Zabbix
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-400 font-light">
                {[
                  {
                    n: 1,
                    title: "Créer la VM Zabbix",
                    text: "Debian 12 + Zabbix 7.x + MySQL. 2 vCPU, 2 Go RAM min.",
                    code: "wget https://repo.zabbix.com/zabbix/7.0/debian/pool/main/z/zabbix-release/zabbix-release_latest_7.0+debian12_all.deb",
                  },
                  {
                    n: 2,
                    title: "Générer un token API",
                    text: "Zabbix Web → Administration → API tokens → Créer. Copier le token (affiché une seule fois).",
                    code: null,
                  },
                  {
                    n: 3,
                    title: "Variables Netlify",
                    text: "Site configuration → Environment variables :",
                    code: "ZABBIX_API_URL=http://IP_VM/zabbix/api_jsonrpc.php\nZABBIX_API_TOKEN=votre_token\nINITIAL_DSI_PASSWORD=MotDePasseTemporaire2026!\nAUTH_SECRET=$(openssl rand -base64 32)",
                  },
                  {
                    n: 4,
                    title: "Ajouter les hôtes",
                    text: "Installer l'agent Zabbix sur chaque machine, l'ajouter dans Zabbix Web → Hosts → Create host.",
                    code: null,
                  },
                ].map(({ n, title, text, code }) => (
                  <div key={n} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-nebula-violet/20 text-nebula-violet text-xs flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">
                      {n}
                    </span>
                    <div>
                      <p className="text-gray-300 font-medium mb-1">{title}</p>
                      <p>{text}</p>
                      {code && (
                        <pre className="mt-1.5 text-xs text-nebula-cyan bg-white/[0.03] px-3 py-2 rounded-lg overflow-x-auto whitespace-pre-wrap">
                          {code}
                        </pre>
                      )}
                      {n === 3 && (
                        <p className="text-xs text-yellow-400 mt-2">
                          ⚠ Redéployez le site après avoir ajouté les variables.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ ONGLET NOTIFICATIONS ═════════════════════════════════════════ */}
          <TabsContent value="notifications">
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-white">
                  Paramètres de Notification
                </CardTitle>
                <CardDescription>
                  Disponible après connexion avec Zabbix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Notifications sonores", enabled: true },
                  { label: "Alertes par email", enabled: true },
                  { label: "Alertes SMS (urgences)", enabled: false },
                  { label: "Notifications Slack", enabled: false },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="font-medium text-gray-200">
                      {setting.label}
                    </span>
                    <button
                      onClick={() =>
                        toast.info(
                          `${setting.label} — disponible après connexion Zabbix`
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled
                          ? "bg-gradient-to-r from-nebula-violet to-nebula-magenta"
                          : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ ONGLET AUDIT ═════════════════════════════════════════════════ */}
          <TabsContent value="audit">
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      Journal d'Audit
                    </CardTitle>
                    <CardDescription>
                      Historique des actions — {auditLogs.length} événement
                      {auditLogs.length > 1 ? "s" : ""} enregistré
                      {auditLogs.length > 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={loadAuditLogs}
                    variant="ghost"
                    size="icon"
                    disabled={loadingAudit}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingAudit ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAudit ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun événement enregistré</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-nebula-cyan" />
                            <span className="font-medium text-white text-sm">
                              {log.action}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {new Date(log.timestamp).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 font-light">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>
                            Par :{" "}
                            <span className="text-gray-500">
                              {log.userName}
                            </span>
                          </span>
                          {log.ipAddress && (
                            <span>
                              IP :{" "}
                              <span className="text-gray-500">
                                {log.ipAddress}
                              </span>
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
