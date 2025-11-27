import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'therapist' | 'patient' | 'visitor';
  created_at: string;
  status?: string;
  therapist_id?: string;
  created_by?: string;
}

export default function UsersManagement() {
  console.log('🔍 UsersManagement component loaded');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'therapist', cv_link: '' });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔍 Intentando cargar usuarios...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Respuesta de Supabase:', { data, error });
      
      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }
      
      console.log('✅ Usuarios cargados:', data?.length);
      setUsers(data || []);
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      therapist: 'bg-purple-100 text-purple-700 border-purple-200',
      patient: 'bg-blue-100 text-blue-700 border-blue-200',
      visitor: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    const labels = {
      admin: 'Administrador',
      therapist: 'Terapeuta',
      patient: 'Paciente',
      visitor: 'Visitante'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Solo admin puede crear therapist o admin
      if (newUser.role !== 'therapist' && newUser.role !== 'admin') {
        alert('Admin solo puede crear Terapeutas o Administradores. Los pacientes se registran públicamente.');
        return;
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Crear perfil
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: 'active',
          created_by: currentUser?.id,
          cv_link: newUser.role === 'therapist' ? newUser.cv_link : null
        });

        if (profileError) throw profileError;
      }

      alert(`✅ ${newUser.role === 'therapist' ? 'Terapeuta' : 'Administrador'} creado exitosamente`);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'therapist', cv_link: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('❌ Error al crear usuario: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${userName}?`)) return;
    
    try {
      // Soft delete - cambiar status a 'deleted'
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'deleted' })
        .eq('id', userId);

      if (error) throw error;
      
      alert('✅ Usuario eliminado correctamente');
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('❌ Error al eliminar usuario: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideIn 0.4s ease-out forwards; }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/adminDashboard" className="text-purple-600 hover:text-purple-700">
              ← Volver
            </Link>
            <div>
              <h1 className="text-2xl font-serif text-gray-800">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-600">Administra todos los usuarios del sistema</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Controles superiores */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 slide-in">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3 items-center">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="therapist">Terapeutas</option>
                <option value="patient">Pacientes</option>
                <option value="visitor">Visitantes</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl flex items-center gap-2"
              >
                <span className="text-xl">+</span> Crear Usuario
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-700 font-medium">Total</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'therapist').length}</div>
              <div className="text-sm text-purple-700 font-medium">Terapeutas</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{users.filter(u => u.role === 'patient').length}</div>
              <div className="text-sm text-green-700 font-medium">Pacientes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</div>
              <div className="text-sm text-red-700 font-medium">Admins</div>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha Registro</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-purple-50/50 transition-colors" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full slide-in">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif text-gray-800">Crear Nuevo Usuario</h2>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña temporal</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="therapist">Terapeuta</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">💡 Los pacientes se registran automáticamente desde el formulario público</p>
              </div>
              {newUser.role === 'therapist' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link CV / Hoja de vida (opcional)</label>
                  <input
                    type="url"
                    value={newUser.cv_link}
                    onChange={(e) => setNewUser({...newUser, cv_link: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
