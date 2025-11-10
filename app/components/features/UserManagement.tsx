"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, UserPlus, Edit, KeyRound, UserCheck, UserX, Loader2, CheckCircle, AlertTriangle 
} from 'lucide-react';

// --- IMPORTANDO TUS COMPONENTES DE UI ---
import Button from '../ui/Button';
import Table, { ColumnDef } from '../ui/Table';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input'; // Necesario para el formulario

// --- Tipos (TypeScript) ---
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};
type UserFormData = Omit<User, 'id' | 'status'>;

// Estado para los modales
type ModalState = {
  type: 'create' | 'edit' | 'deactivate' | 'reactivate' | 'reset_password' | null;
  data: User | null;
};

// --- Mock Data (reemplazar con llamada a API) ---
const DUMMY_USERS: User[] = [
  { id: 'u1', name: 'Ana García', email: 'ana.garcia@empresa.com', role: 'Administrador', status: 'active' },
  { id: 'u2', name: 'Carlos López', email: 'carlos.lopez@empresa.com', role: 'Vendedor', status: 'active' },
  { id: 'u4', name: 'David Martínez', email: 'david.martinez@empresa.com', role: 'Bodeguero', status: 'inactive' },
];

// ====================================================================
// Componente Reutilizable: Formulario de Usuario
// (Movido aquí para simplicidad, pero idealmente estaría en UserForm.tsx)
// ====================================================================
const UserForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null;
}> = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '', email: '', role: 'Vendedor',
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!user;

  useEffect(() => {
    if (user && isOpen) {
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else if (!isOpen) {
      setFormData({ name: '', email: '', role: 'Vendedor' });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API
    setIsLoading(false);
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        {isEditMode ? "Editar Usuario" : "Registrar Nuevo Usuario"}
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Input
            id="name"
            label="Nombre Completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            id="email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            >
              <option>Vendedor</option>
              <option>Bodeguero</option>
              <option>Administrador</option>
            </select>
          </div>
          {!isEditMode && (
            <p className="text-sm text-gray-500">
              La contraseña se generará y enviará al email.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : (isEditMode ? 'Guardar Cambios' : 'Crear Usuario')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// ====================================================================
// Componente Reutilizable: Diálogo de Confirmación
// (Movido aquí, pero idealmente en ConfirmationDialog.tsx)
// ====================================================================
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, variant = 'primary', isLoading }) => {
  const Icon = variant === 'danger' ? AlertTriangle : CheckCircle;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>{title}</Modal.Header>
      <Modal.Body>
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
            variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Icon className={`h-6 w-6 ${variant === 'danger' ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <p className="text-gray-600 pt-1.5">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="button" variant={variant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


// ====================================================================
// Componente Principal de la Feature: UserManagement
// ====================================================================
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [modal, setModal] = useState<ModalState>({ type: null, data: null });
  const [isLoading, setIsLoading] = useState(false); // Para acciones de API

  const filteredUsers = useMemo(() => {
    return users.filter(user => user.status === activeTab);
  }, [users, activeTab]);

  // --- Handlers (Lógica de API simulada) ---
  const handleCreateUser = (formData: UserFormData) => {
    const newUser: User = { id: `u${users.length + 1}`, status: 'active', ...formData };
    setUsers(prev => [newUser, ...prev]);
    setModal({ type: null, data: null });
    setActiveTab('active');
  };

  const handleUpdateUser = (formData: UserFormData) => {
    setUsers(prev => prev.map(u => 
      u.id === modal.data!.id ? { ...u, ...formData } : u
    ));
    setModal({ type: null, data: null });
  };

  const handleToggleStatus = (userId: string, newStatus: 'active' | 'inactive') => {
    setIsLoading(true);
    setTimeout(() => { // Simula API
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u)));
      setModal({ type: null, data: null });
      setIsLoading(false);
    }, 1000);
  };

  const handleResetPassword = () => {
    setIsLoading(true);
    setTimeout(() => { // Simula API
      alert(`Correo de restitución enviado a ${modal.data!.email}`);
      setModal({ type: null, data: null });
      setIsLoading(false);
    }, 1000);
  };

  // --- Definición de Columnas para tu <Table> ---
  const columns: ColumnDef<User>[] = [
    {
      header: 'Nombre',
      accessor: 'name',
      render: (user) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{user.name}</span>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
      )
    },
    {
      header: 'Rol',
      accessor: 'role',
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (user) => (
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setModal({ type: 'edit', data: user })} className="py-1 px-3 text-sm">
            <Edit size={16} className="mr-1" /> Editar
          </Button>
          
          {activeTab === 'active' ? (
            <Button variant="danger" onClick={() => setModal({ type: 'deactivate', data: user })} className="py-1 px-3 text-sm">
              <UserX size={16} className="mr-1" /> Desactivar
            </Button>
          ) : (
            <Button variant="success" onClick={() => setModal({ type: 'reactivate', data: user })} className="py-1 px-3 text-sm">
              <UserCheck size={16} className="mr-1" /> Reactivar
            </Button>
          )}

          <Button variant="secondary" onClick={() => setModal({ type: 'reset_password', data: user })} className="py-1 px-3 text-sm">
            <KeyRound size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Administrar Usuarios</h1>
        <Button variant="primary" onClick={() => setModal({ type: 'create', data: null })}>
          <UserPlus size={20} className="mr-2" />
          Registrar Usuario
        </Button>
      </div>

      {/* Pestañas (Activos / Inactivos) */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activos ({users.filter(u => u.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inactive'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inactivos ({users.filter(u => u.status === 'inactive').length})
          </button>
        </nav>
      </div>

      {/* Tabla de Usuarios (Usando tu componente Table) */}
      <Table
        columns={columns}
        data={filteredUsers}
        emptyStateMessage={`No se encontraron usuarios ${activeTab}.`}
      />

      {/* --- Modales --- */}
      <UserForm
        isOpen={modal.type === 'create' || modal.type === 'edit'}
        onClose={() => setModal({ type: null, data: null })}
        onSubmit={modal.type === 'create' ? handleCreateUser : handleUpdateUser}
        user={modal.data}
      />

      <ConfirmationDialog
        isOpen={modal.type === 'deactivate'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={() => handleToggleStatus(modal.data!.id, 'inactive')}
        title="Desactivar Usuario"
        message={`¿Estás seguro de que quieres desactivar a ${modal.data?.name}?`}
        confirmText="Sí, desactivar"
        variant="danger"
        isLoading={isLoading}
      />
      
      <ConfirmationDialog
        isOpen={modal.type === 'reactivate'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={() => handleToggleStatus(modal.data!.id, 'active')}
        title="Reactivar Usuario"
        message={`¿Estás seguro de que quieres reactivar a ${modal.data?.name}?`}
        confirmText="Sí, reactivar"
        variant="success"
        isLoading={isLoading}
      />
      
      <ConfirmationDialog
        isOpen={modal.type === 'reset_password'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={handleResetPassword}
        title="Restituir Contraseña"
        message={`Se enviará un correo para restituir la contraseña a ${modal.data?.email}. ¿Estás seguro?`}
        confirmText="Sí, enviar"
        variant="primary"
        isLoading={isLoading}
      />
    </div>
  );
};

export default UserManagement;