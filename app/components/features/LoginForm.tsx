"use client";

import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

/**
 * Propiedades para el formulario de login.
 * onLogin es una función que maneja la lógica de autenticación.
 */
interface LoginFormProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onLogin(email, password);
  };

  return (
    <Card className="max-w-md w-full">
      <form onSubmit={handleSubmit}>
        <Card.Header>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Iniciar Sesión
            </h2>
          </div>
        </Card.Header>
        
        <Card.Body className="space-y-6">
          <Input
            id="email"
            label="Correo Electrónico"
            name="email"
            type="email"
            placeholder="usuario@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<User className="w-5 h-5" />}
            disabled={isLoading}
            required
          />
          <Input
            id="password"
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            disabled={isLoading}
            required
          />
          {error && (
            <p className="text-sm text-red-600 text-center p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}
        </Card.Body>
        
        <Card.Footer>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>Validando...</span>
              </>
            ) : (
              <span>Acceder</span>
            )}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
};

export default LoginForm;