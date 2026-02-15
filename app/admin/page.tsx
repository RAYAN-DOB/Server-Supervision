"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Users, 
  Database, 
  Bell, 
  Save,
  RefreshCw,
  Shield,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Key,
  Activity,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import type { User, AuditLog } from "@/types";

export default function AdminPage() {
  const { zabbixConfig, setZabbixConfig, currentUser } = useStore();
  const [apiUrl, setApiUrl] = useState(zabbixConfig.apiUrl || "");
  const [apiToken, setApiToken] = useState(zabbixConfig.apiToken || "");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    role: "viewer" as User["role"],
    department: "",
  });

  // Mock users data
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "admin_dsi",
      email: "admin@maisons-alfort.fr",
      name: "Admin DSI",
      role: "super_admin",
      department: "Direction des Systèmes d'Information",
      phone: "+33 1 23 45 67 89",
      createdAt: "2024-01-15T10:00:00Z",
      lastLogin: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "2",
      username: "martin_tech",
      email: "martin@maisons-alfort.fr",
      name: "Technicien Martin",
      role: "tech",
      department: "DSI - Support",
      createdAt: "2024-03-20T14:30:00Z",
      lastLogin: "2026-02-14T16:20:00Z",
      isActive: true,
      createdBy: "admin_dsi",
    },
    {
      id: "3",
      username: "viewer_public",
      email: "viewer@maisons-alfort.fr",
      name: "Viewer Public",
      role: "viewer",
      department: "DSI",
      createdAt: "2024-06-10T09:00:00Z",
      lastLogin: "2026-02-10T11:15:00Z",
      isActive: true,
      createdBy: "admin_dsi",
    },
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      userId: "1",
      userName: "Admin DSI",
      action: "Création utilisateur",
      targetType: "user",
      targetId: "2",
      details: "Créé l'utilisateur 'Technicien Martin'",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      userId: "1",
      userName: "Admin DSI",
      action: "Modification configuration",
      targetType: "config",
      details: "Mise à jour URL API Zabbix",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      ipAddress: "192.168.1.100",
    },
    {
      id: "3",
      userId: "2",
      userName: "Technicien Martin",
      action: "Acquittement alerte",
      targetType: "alert",
      targetId: "alert-1",
      details: "Alerte température acquittée",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      ipAddress: "192.168.1.105",
    },
  ]);

  const handleSaveZabbixConfig = () => {
    setZabbixConfig({
      apiUrl,
      apiToken,
      connected: true,
      lastSync: new Date().toISOString(),
    });
    toast.success("Configuration Zabbix sauvegardée");
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.email || !newUser.name) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      createdAt: new Date().toISOString(),
      isActive: true,
      createdBy: currentUser?.username,
    };

    setUsers([...users, user]);
    setShowCreateUser(false);
    setNewUser({ username: "", email: "", name: "", role: "viewer", department: "" });
    toast.success("Utilisateur créé avec succès");
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success("Utilisateur supprimé");
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast.success("Statut modifié");
  };

  const roleLabels = {
    super_admin: "Super Admin",
    admin: "Administrateur",
    tech: "Technicien",
    viewer: "Observateur",
  };

  const roleColors = {
    super_admin: "critical",
    admin: "warning",
    tech: "info",
    viewer: "ok",
  };

  const canManageUsers = currentUser?.role === "super_admin" || currentUser?.role === "admin";

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2 tracking-tight"
            >
              Administration
            </motion.h1>
            <p className="text-gray-500 font-light">Configuration système et gestion des accès</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-8">
            <TabsList className="bg-white/[0.03] border-white/[0.06]">
              <TabsTrigger value="users" className="data-[state=active]:bg-white/[0.08]">
                <Users className="w-4 h-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="zabbix" className="data-[state=active]:bg-white/[0.08]">
                <Database className="w-4 h-4 mr-2" />
                Zabbix API
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/[0.08]">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-white/[0.08]">
                <Activity className="w-4 h-4 mr-2" />
                Audit
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Gestion des Utilisateurs</h2>
                  <p className="text-sm text-gray-500 font-light">{users.length} utilisateur{users.length > 1 ? 's' : ''} · {users.filter(u => u.isActive).length} actif{users.filter(u => u.isActive).length > 1 ? 's' : ''}</p>
                </div>
                
                {canManageUsers && (
                  <Button
                    onClick={() => setShowCreateUser(!showCreateUser)}
                    className="bg-gradient-to-r from-nebula-violet to-nebula-magenta"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouvel Utilisateur
                  </Button>
                )}
              </div>

              {/* Create User Form */}
              {showCreateUser && canManageUsers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="border-white/[0.06] bg-white/[0.02]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Créer un Utilisateur</CardTitle>
                      <CardDescription>Les admins peuvent créer d'autres utilisateurs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Nom d'utilisateur</label>
                          <input
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="jean_dupont"
                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="jean.dupont@maisons-alfort.fr"
                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Nom complet</label>
                          <input
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Jean Dupont"
                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Département</label>
                          <input
                            value={newUser.department}
                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            placeholder="DSI - Support"
                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Rôle</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })}
                          className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-nebula-violet/50 transition-all"
                        >
                          {currentUser?.role === "super_admin" && (
                            <option value="super_admin">Super Admin (tous les droits)</option>
                          )}
                          <option value="admin">Administrateur (peut gérer utilisateurs)</option>
                          <option value="tech">Technicien (lecture + intervention)</option>
                          <option value="viewer">Observateur (lecture seule)</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleCreateUser} className="bg-gradient-to-r from-nebula-violet to-nebula-magenta">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Créer l'utilisateur
                        </Button>
                        <Button onClick={() => setShowCreateUser(false)} variant="ghost">
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Users List */}
              <div className="space-y-3">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-white/[0.06] bg-white/[0.02] ${!user.isActive && 'opacity-50'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nebula-violet to-nebula-cyan flex items-center justify-center text-white font-semibold text-lg">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-white">{user.name}</h3>
                                <Badge variant={roleColors[user.role] as any} className="text-xs">
                                  {roleLabels[user.role]}
                                </Badge>
                                {!user.isActive && <Badge variant="default" className="text-xs">Désactivé</Badge>}
                              </div>
                              <div className="space-y-1 text-sm text-gray-500 font-light">
                                <p>📧 {user.email}</p>
                                {user.department && <p>🏢 {user.department}</p>}
                                {user.phone && <p>📞 {user.phone}</p>}
                                {user.lastLogin && (
                                  <p className="text-xs text-gray-600">
                                    Dernière connexion : {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {canManageUsers && user.id !== currentUser?.id && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleToggleUserStatus(user.id)}
                                variant="ghost"
                                size="icon"
                                title={user.isActive ? "Désactiver" : "Activer"}
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => toast.info("Édition utilisateur")}
                                variant="ghost"
                                size="icon"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteUser(user.id)}
                                variant="ghost"
                                size="icon"
                                title="Supprimer"
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Permissions Info */}
              {!canManageUsers && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400 mb-1">Permissions limitées</p>
                      <p className="text-xs text-gray-400 font-light">
                        Vous n'avez pas les droits pour gérer les utilisateurs. Contactez un administrateur.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Zabbix Tab */}
            <TabsContent value="zabbix">
              <Card className="border-white/[0.06] bg-white/[0.02]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Configuration Zabbix</CardTitle>
                      <CardDescription>Paramètres de connexion à l'API Zabbix</CardDescription>
                    </div>
                    <Database className="w-6 h-6 text-nebula-cyan" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">URL de l'API</label>
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="http://localhost/zabbix/api_jsonrpc.php"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Token d'API</label>
                    <input
                      type="password"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Entrez votre token d'API Zabbix"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-nebula-violet/50 transition-all font-light"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveZabbixConfig} className="bg-gradient-to-r from-nebula-violet to-nebula-magenta">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button onClick={() => toast.success("Connexion testée !")} variant="glass">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tester la connexion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="border-white/[0.06] bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres de Notification</CardTitle>
                  <CardDescription>Configurez les alertes et notifications</CardDescription>
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
                      <span className="font-medium text-gray-200">{setting.label}</span>
                      <button
                        onClick={() => toast.success(`${setting.label} ${setting.enabled ? "désactivées" : "activées"}`)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? "bg-gradient-to-r from-nebula-violet to-nebula-magenta" : "bg-gray-700"
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

            {/* Audit Tab */}
            <TabsContent value="audit">
              <Card className="border-white/[0.06] bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-white">Journal d'Audit</CardTitle>
                  <CardDescription>Historique des actions administratives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-nebula-cyan" />
                            <span className="font-medium text-white text-sm">{log.action}</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {new Date(log.timestamp).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 font-light">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Par: <span className="text-gray-500">{log.userName}</span></span>
                          {log.ipAddress && <span>IP: <span className="text-gray-500">{log.ipAddress}</span></span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
