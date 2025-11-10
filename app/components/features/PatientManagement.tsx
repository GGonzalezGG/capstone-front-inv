"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building, PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertTriangle 
} from 'lucide-react';

// --- IMPORTANDO TUS COMPONENTES DE UI ---
import Button from '../ui/Button';
import Table, { ColumnDef } from '../ui/Table';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';

// --- Tipos (TypeScript) ---
type Patient = {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: 'active' | 'inactive';
};
type PatientFormData = Omit<Patient, 'id' | 'status'>;

// Estado para los modales
type ModalState = {
  type: 'create' | 'edit' | 'deactivate' | 'reactivate' | null;
  data: Patient | null;
};

// --- Mock Data ---
const DUMMY_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Clínica Las Condes', contact: 'Juan Pérez', email: 'jperez@clc.cl', status: 'active' },
  { id: 'p2', name: 'Hospital del Trabajador', contact: 'María Soto', email: 'msoto@hdt.cl', status: 'active' },
  { id: 'p3', name: 'RedSalud Vitacura', contact: 'Pedro Morales', email: 'pmorales@redsalud.cl', status: 'inactive' },
];

// ====================================================================
// Componente Reutilizable: Formulario de Paciente
// (Idealmente en PatientForm.tsx)
// ====================================================================
const PatientForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  patient?: Patient | null;
}> = ({ isOpen, onClose, onSubmit, patient }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '', contact: '', email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!patient;

  useEffect(() => {
    if (patient && isOpen) {
      setFormData({ name: patient.name, contact: patient.contact, email: patient.email });
    } else if (!isOpen) {
      setFormData({ name: '', contact: '', email: '' });
    }
  }, [patient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        {isEditMode ? "Editar Paciente" : "Agregar Nuevo Paciente"}
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Input
            id="name"
            label="Nombre del Paciente (Clínica/Hospital)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            id="contact"
            label="Nombre de Contacto"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            id="email"
            label="Email de Contacto"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : (isEditMode ? 'Guardar Cambios' : 'Agregar Paciente')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// ====================================================================
// Componente Reutilizable: Diálogo de Confirmación
// (Importado desde UserManagement, ya que es idéntico)
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
// Componente Principal de la Feature: PatientManagement
// ====================================================================
const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(DUMMY_PATIENTS);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [modal, setModal] = useState<ModalState>({ type: null, data: null });
  const [isLoading, setIsLoading] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => p.status === activeTab);
  }, [patients, activeTab]);

  // --- Handlers (Lógica de API simulada) ---
  const handleCreatePatient = (formData: PatientFormData) => {
    const newPatient: Patient = { id: `p${patients.length + 1}`, status: 'active', ...formData };
    setPatients(prev => [newPatient, ...prev]);
    setModal({ type: null, data: null });
    setActiveTab('active');
  };

  const handleUpdatePatient = (formData: PatientFormData) => {
    setPatients(prev => prev.map(p => 
      p.id === modal.data!.id ? { ...p, ...formData } : p
    ));
    setModal({ type: null, data: null });
  };

  const handleToggleStatus = (patientId: string, newStatus: 'active' | 'inactive') => {
    setIsLoading(true);
    setTimeout(() => { // Simula API
      setPatients(prev => prev.map(p => (p.id === patientId ? { ...p, status: newStatus } : p)));
      setModal({ type: null, data: null });
      setIsLoading(false);
    }, 1000);
  };

  // --- Definición de Columnas para tu <Table> ---
  const columns: ColumnDef<Patient>[] = [
    {
      header: 'Nombre Paciente',
      accessor: 'name',
      render: (patient) => (
        <span className="font-medium text-gray-900">{patient.name}</span>
      )
    },
    {
      header: 'Contacto',
      accessor: 'contact',
      render: (patient) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{patient.contact}</span>
          <span className="text-sm text-gray-500">{patient.email}</span>
        </div>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (patient) => (
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => setModal({ type: 'edit', data: patient })} className="py-1 px-3 text-sm">
            <Edit size={16} className="mr-1" /> Editar
          </Button>
          
          {activeTab === 'active' ? (
            <Button variant="danger" onClick={() => setModal({ type: 'deactivate', data: patient })} className="py-1 px-3 text-sm">
              <Trash2 size={16} className="mr-1" /> Desactivar
            </Button>
          ) : (
            <Button variant="success" onClick={() => setModal({ type: 'reactivate', data: patient })} className="py-1 px-3 text-sm">
              <CheckCircle size={16} className="mr-1" /> Reactivar
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Administrar Pacientes</h1>
        <Button variant="primary" onClick={() => setModal({ type: 'create', data: null })}>
          <PlusCircle size={20} className="mr-2" />
          Agregar Paciente
        </Button>
      </div>

      {/* Pestañas (Activos / Inactivos) */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activos ({patients.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inactive'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inactivos ({patients.filter(p => p.status === 'inactive').length})
          </button>
        </nav>
      </div>

      {/* Tabla de Pacientes */}
      <Table
        columns={columns}
        data={filteredPatients}
        emptyStateMessage={`No se encontraron pacientes ${activeTab}.`}
      />

      {/* --- Modales --- */}
      <PatientForm
        isOpen={modal.type === 'create' || modal.type === 'edit'}
        onClose={() => setModal({ type: null, data: null })}
        onSubmit={modal.type === 'create' ? handleCreatePatient : handleUpdatePatient}
        patient={modal.data}
      />

      <ConfirmationDialog
        isOpen={modal.type === 'deactivate'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={() => handleToggleStatus(modal.data!.id, 'inactive')}
        title="Desactivar Paciente"
        message={`¿Estás seguro de que quieres desactivar a ${modal.data?.name}?`}
        confirmText="Sí, desactivar"
        variant="danger"
        isLoading={isLoading}
      />
      
      <ConfirmationDialog
        isOpen={modal.type === 'reactivate'}
        onClose={() => setModal({ type: null, data: null })}
        onConfirm={() => handleToggleStatus(modal.data!.id, 'active')}
        title="Reactivar Paciente"
        message={`¿Estás seguro de que quieres reactivar a ${modal.data?.name}?`}
        confirmText="Sí, reactivar"
        variant="success"
        isLoading={isLoading}
      />
    </div>
  );
};

export default PatientManagement;