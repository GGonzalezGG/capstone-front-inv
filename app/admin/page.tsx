"use client";
import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/ui/Header";
import Card from "../components/ui/Card";
import Table, { ColumnDef } from "../components/ui/Table";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

// --- TIPOS DE DATOS ---
type AdminTab = "users" | "patients";
type SubTab = "active" | "inactive"; // Para los paneles separados

type UserRole = "ADMIN" | "MANAGER" | "NURSE";
interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
interface BackendPatient {
  id: string;
  name: string;
  rut: string;
  isActive: boolean;
}

// --- PÁGINA PRINCIPAL DE ADMINISTRACIÓN ---
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [userSubTab, setUserSubTab] = useState<SubTab>("active");
  const [patientSubTab, setPatientSubTab] = useState<SubTab>("active");

  const { token, user, isLoading } = useAuth(); // Obtenemos isLoading (corregido)
  const router = useRouter();

  // Estados para Usuarios
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isUserCreateModalOpen, setUserCreateModalOpen] = useState(false); // <-- NUEVO
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false); // <-- NUEVO
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);

  // Estados para Pacientes
  const [patients, setPatients] = useState<BackendPatient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isPatientModalOpen, setPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<BackendPatient | null>(
    null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA DE FILTRADO PARA PANELES SEPARADOS ---
  const activeUsers = useMemo(() => users.filter((u) => u.isActive), [users]);
  const inactiveUsers = useMemo(
    () => users.filter((u) => !u.isActive),
    [users]
  );
  const activePatients = useMemo(
    () => patients.filter((p) => p.isActive),
    [patients]
  );
  const inactivePatients = useMemo(
    () => patients.filter((p) => !p.isActive),
    [patients]
  );

  // --- EFECTOS DE CARGA DE DATOS ---

  // Cargar Usuarios
  const fetchUsers = async () => {
    if (!token || user?.role !== "ADMIN") return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar los usuarios");
      const data = await res.json();
      setUsers(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Cargar Pacientes
  const fetchPatients = async () => {
    if (!token) return;
    setIsLoadingPatients(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("No se pudo cargar los pacientes");
      const data = await res.json();
      setPatients(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Cargar datos al montar o al cambiar de pestaña
  useEffect(() => {
    if (activeTab === "users" && user?.role === "ADMIN") {
      fetchUsers();
    } else if (activeTab === "patients") {
      fetchPatients();
    }
  }, [token, user, activeTab]);

  // (useEffect de redirección - Corregido)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (user?.role === "NURSE") {
      router.push("/dashboard");
    }
    if (user?.role === "MANAGER" && activeTab === "users") {
      setActiveTab("patients");
    }
  }, [user, isLoading, router, activeTab]);

  // --- HANDLERS PARA USUARIOS ---

  const handleEditUser = (user: BackendUser) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleToggleUserStatus = async (user: BackendUser) => {
    const action = user.isActive ? "deactivate" : "reactivate";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}${
      action === "reactivate" ? "/reactivate" : ""
    }`;
    const method = action === "deactivate" ? "DELETE" : "PUT";

    if (
      !confirm(
        `¿Estás seguro de que deseas ${
          action === "deactivate" ? "desactivar" : "reactivar"
        } a ${user.name}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      await fetchUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveUser = async (formData: {
    name: string;
    email: string;
    role: UserRole;
  }) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setUserModalOpen(false);
      await fetchUsers();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NUEVO: Handler para CREAR Usuario ---
  const handleCreateUser = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Usamos el endpoint público de registro
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), //
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setUserCreateModalOpen(false);
      await fetchUsers(); // Recargar la lista de usuarios
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NUEVO: Handler para ABRIR modal de contraseña ---
  const handleOpenPasswordReset = (user: BackendUser) => {
    setSelectedUser(user);
    setUserModalOpen(false); // Cierra el modal de edición
    setPasswordModalOpen(true); // Abre el modal de contraseña
  };

  // --- NUEVO: Handler para GUARDAR contraseña (Placeholder) ---
  const handleResetPassword = async (newPassword: string) => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    // --- LÓGICA FALTANTE DEL BACKEND ---
    // No existe un endpoint para esto.
    console.log(
      `Simulando reseteo de contraseña para ${selectedUser.email} con pass: ${newPassword}`
    );
    alert(
      "Funcionalidad no implementada en el backend.\nSe necesita un endpoint (ej: PUT /api/v1/users/:id/password) protegido para Admins."
    );
    // --- Fin lógica faltante ---

    setIsSubmitting(false);
    setPasswordModalOpen(false);
  };

  // --- HANDLERS PARA PACIENTES (Sin cambios) ---

  const handleEditPatient = (patient: BackendPatient) => {
    setSelectedPatient(patient);
    setPatientModalOpen(true);
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setPatientModalOpen(true);
  };

  const handleTogglePatientStatus = async (patient: BackendPatient) => {
    const action = patient.isActive ? "deactivate" : "reactivate";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/patients/${patient.id}${
      action === "reactivate" ? "/reactivate" : ""
    }`;
    const method = action === "deactivate" ? "DELETE" : "PUT";

    if (
      !confirm(
        `¿Estás seguro de que deseas ${
          action === "deactivate" ? "desactivar" : "reactivar"
        } a ${patient.name}?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      await fetchPatients();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSavePatient = async (formData: { name: string; rut: string }) => {
    setIsSubmitting(true);
    const isEditing = !!selectedPatient;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/patients/${selectedPatient.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/patients`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setPatientModalOpen(false);
      await fetchPatients();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERIZADO ---
  if (isLoading || !user || user.role === "NURSE") {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <div className="p-8 pt-24 flex justify-center items-center">
          <Spinner label="Cargando..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Panel de Administración
          </h1>

          {/* Pestañas Principales */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {user.role === "ADMIN" && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "users"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Gestionar Usuarios
                </button>
              )}
              <button
                onClick={() => setActiveTab("patients")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "patients"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Gestionar Pacientes
              </button>
            </nav>
          </div>

          {/* === GESTIÓN DE USUARIOS (Solo ADMIN) === */}
          {activeTab === "users" && user.role === "ADMIN" && (
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl text-white font-semibold">
                    Usuarios del Sistema
                  </h2>
                  <Button
                    variant="primary"
                    onClick={() => setUserCreateModalOpen(true)}
                  >
                    + Crear Usuario
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {/* Pestañas Secundarias (Activos/Inactivos) */}
                <nav className="flex space-x-4 border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setUserSubTab("active")}
                    className={`pb-2 px-1 font-medium ${
                      userSubTab === "active"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Activos ({activeUsers.length})
                  </button>
                  <button
                    onClick={() => setUserSubTab("inactive")}
                    className={`pb-2 px-1 font-medium ${
                      userSubTab === "inactive"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Inactivos ({inactiveUsers.length})
                  </button>
                </nav>

                {/* Mostrar tabla correspondiente */}
                {userSubTab === "active" && (
                  <UserTable
                    users={activeUsers}
                    isLoading={isLoadingUsers}
                    onEdit={handleEditUser}
                    onToggleStatus={handleToggleUserStatus}
                  />
                )}
                {userSubTab === "inactive" && (
                  <UserTable
                    users={inactiveUsers}
                    isLoading={isLoadingUsers}
                    onEdit={handleEditUser}
                    onToggleStatus={handleToggleUserStatus}
                  />
                )}
              </Card.Body>
            </Card>
          )}

          {/* === GESTIÓN DE PACIENTES (ADMIN y MANAGER) === */}
          {activeTab === "patients" && (
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl text-white font-semibold">
                    Pacientes Registrados
                  </h2>
                  <Button variant="primary" onClick={handleCreatePatient}>
                    + Crear Paciente
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {/* Pestañas Secundarias (Activos/Inactivos) */}
                <nav className="flex space-x-4 border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setPatientSubTab("active")}
                    className={`pb-2 px-1 font-medium ${
                      patientSubTab === "active"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Activos ({activePatients.length})
                  </button>
                  <button
                    onClick={() => setPatientSubTab("inactive")}
                    className={`pb-2 px-1 font-medium ${
                      patientSubTab === "inactive"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Inactivos ({inactivePatients.length})
                  </button>
                </nav>

                {/* Mostrar tabla correspondiente */}
                {patientSubTab === "active" && (
                  <PatientTable
                    patients={activePatients}
                    isLoading={isLoadingPatients}
                    onEdit={handleEditPatient}
                    onToggleStatus={handleTogglePatientStatus}
                  />
                )}
                {patientSubTab === "inactive" && (
                  <PatientTable
                    patients={inactivePatients}
                    isLoading={isLoadingPatients}
                    onEdit={handleEditPatient}
                    onToggleStatus={handleTogglePatientStatus}
                  />
                )}
              </Card.Body>
            </Card>
          )}
        </div>
      </main>

      {/* === MODALES === */}

      {/* Modal para Editar Usuario (Ahora con botón de contraseña) */}
      <UserEditModal
        isOpen={isUserModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        isSubmitting={isSubmitting}
        onOpenPasswordReset={() => handleOpenPasswordReset(selectedUser!)}
      />

      {/* NUEVO: Modal para Crear Usuario */}
      <UserCreateModal
        isOpen={isUserCreateModalOpen}
        onClose={() => setUserCreateModalOpen(false)}
        onSave={handleCreateUser}
        isSubmitting={isSubmitting}
      />

      {/* NUEVO: Modal para Restituir Contraseña */}
      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        user={selectedUser}
        onSave={handleResetPassword}
        isSubmitting={isSubmitting}
      />

      {/* Modal para Crear/Editar Paciente (Sin cambios) */}
      <PatientEditModal
        isOpen={isPatientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        patient={selectedPatient}
        onSave={handleSavePatient}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminPage;

// ===============================================
// --- SUB-COMPONENTES (EN EL MISMO ARCHIVO) ---
// ===============================================

// --- TABLA DE USUARIOS (Sin cambios) ---
interface UserTableProps {
  users: BackendUser[];
  isLoading: boolean;
  onEdit: (user: BackendUser) => void;
  onToggleStatus: (user: BackendUser) => void;
}
const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onEdit,
  onToggleStatus,
}) => {
  const columns: ColumnDef<BackendUser>[] = [
    {
      header: "Nombre",
      accessor: "name",
      render: (user) => <span className="font-medium">{user.name}</span>,
    },
    { header: "Email", accessor: "email" },
    {
      header: "Rol",
      accessor: "role",
      render: (user) => (
        <Badge
          variant={
            user.role === "ADMIN"
              ? "danger"
              : user.role === "MANAGER"
              ? "info"
              : "default"
          }
        >
          {user.role}
        </Badge>
      ),
    },
    {
      header: "Estado",
      accessor: "isActive",
      render: (user) => (
        <Badge variant={user.isActive ? "success" : "default"}>
          {user.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: "id",
      render: (user) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onEdit(user)}
            className="py-1 px-3 text-sm"
          >
            Editar
          </Button>
          <Button
            variant={user.isActive ? "danger" : "success"}
            onClick={() => onToggleStatus(user)}
            className="py-1 px-3 text-sm"
          >
            {user.isActive ? "Desactivar" : "Reactivar"}
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Spinner label="Cargando usuarios..." />;
  return (
    <Table
      columns={columns}
      data={users}
      emptyStateMessage="No se encontraron usuarios."
    />
  );
};

// --- MODAL DE EDICIÓN DE USUARIO (MODIFICADO) ---
interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: BackendUser | null;
  onSave: (data: { name: string; email: string; role: UserRole }) => void;
  isSubmitting: boolean;
  onOpenPasswordReset: () => void; // <-- NUEVO
}
const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isSubmitting,
  onOpenPasswordReset,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("NURSE");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, role });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Editar Usuario</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <Input
              id="name"
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                Rol
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSubmitting}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="NURSE">Enfermera (NURSE)</option>
                <option value="MANAGER">Gestor (MANAGER)</option>
                <option value="ADMIN">Admin (ADMIN)</option>
              </select>
            </div>
            {/* --- NUEVO BOTÓN DE CONTRASEÑA --- */}
            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onOpenPasswordReset}
              >
                Restituir Contraseña
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// --- NUEVO: MODAL PARA CREAR USUARIO ---
interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isSubmitting: boolean;
}
const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("NURSE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, password, role });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Crear Nuevo Usuario</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <Input
              id="create-name"
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              id="create-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              id="create-password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <div>
              <label
                htmlFor="create-role"
                className="block text-sm font-medium mb-1"
              >
                Rol
              </label>
              <select
                id="create-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSubmitting}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="NURSE">Enfermera (NURSE)</option>
                <option value="MANAGER">Gestor (MANAGER)</option>
                <option value="ADMIN">Admin (ADMIN)</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Crear Usuario"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// --- NUEVO: MODAL PARA RESTITUIR CONTRASEÑA ---
interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: BackendUser | null;
  onSave: (password: string) => void;
  isSubmitting: boolean;
}
const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isSubmitting,
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(password);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Restituir Contraseña</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="mb-4">
            Estás cambiando la contraseña para{" "}
            <span className="font-semibold">{user?.email}</span>.
          </p>
          <Input
            id="new-password"
            label="Nueva Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Establecer Contraseña"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// --- TABLA DE PACIENTES (Sin cambios) ---
interface PatientTableProps {
  patients: BackendPatient[];
  isLoading: boolean;
  onEdit: (patient: BackendPatient) => void;
  onToggleStatus: (patient: BackendPatient) => void;
}
const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  isLoading,
  onEdit,
  onToggleStatus,
}) => {
  const columns: ColumnDef<BackendPatient>[] = [
    {
      header: "Nombre",
      accessor: "name",
      render: (patient) => <span className="font-medium">{patient.name}</span>,
    },
    { header: "RUT", accessor: "rut" },
    {
      header: "Estado",
      accessor: "isActive",
      render: (patient) => (
        <Badge variant={patient.isActive ? "success" : "default"}>
          {patient.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: "id",
      render: (patient) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onEdit(patient)}
            className="py-1 px-3 text-sm"
          >
            Editar
          </Button>
          <Button
            variant={patient.isActive ? "danger" : "success"}
            onClick={() => onToggleStatus(patient)}
            className="py-1 px-3 text-sm"
          >
            {patient.isActive ? "Desactivar" : "Reactivar"}
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Spinner label="Cargando pacientes..." />;
  return (
    <Table
      columns={columns}
      data={patients}
      emptyStateMessage="No se encontraron pacientes."
    />
  );
};

// --- MODAL DE CREAR/EDICIÓN DE PACIENTE (Sin cambios) ---
interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: BackendPatient | null;
  onSave: (data: { name: string; rut: string }) => void;
  isSubmitting: boolean;
}
const PatientEditModal: React.FC<PatientEditModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const isEditing = !!patient;

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setRut(patient.rut);
    } else {
      setName("");
      setRut("");
    }
  }, [patient, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, rut });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        {isEditing ? "Editar Paciente" : "Crear Nuevo Paciente"}
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <Input
              id="patient-name"
              label="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              id="patient-rut"
              label="RUT"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Paciente"
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
