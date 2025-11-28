import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';

interface Content {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article' | 'exercise';
  url: string;
  duration?: number;
  category: string;
  created_at: string;
  created_by: string;
  status: 'active' | 'draft' | 'archived';
}

export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'video' as const,
    url: '',
    duration: 0,
    category: 'mindfulness',
    status: 'active' as const
  });

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error loading contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         content.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      video: '🎥',
      audio: '🎧',
      article: '📄',
      exercise: '🧘'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      video: 'bg-red-100 text-red-700 border-red-200',
      audio: 'bg-green-100 text-green-700 border-green-200',
      article: 'bg-blue-100 text-blue-700 border-blue-200',
      exercise: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    const labels = {
      video: 'Video',
      audio: 'Audio',
      article: 'Artículo',
      exercise: 'Ejercicio'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('contents').insert({
        ...newContent,
        created_by: user?.id
      });

      if (error) throw error;

      alert('✅ Contenido creado exitosamente');
      setShowCreateModal(false);
      setNewContent({
        title: '',
        description: '',
        type: 'video',
        url: '',
        duration: 0,
        category: 'mindfulness',
        status: 'active'
      });
      loadContents();
    } catch (error: any) {
      console.error('Error creating content:', error);
      alert('❌ Error al crear contenido: ' + error.message);
    }
  };

  const handleDeleteContent = async (contentId: string, title: string) => {
    if (!confirm(`¿Estás seguro de archivar "${title}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('contents')
        .update({ status: 'archived' })
        .eq('id', contentId);

      if (error) throw error;
      
      alert('✅ Contenido archivado correctamente');
      loadContents();
    } catch (error: any) {
      console.error('Error archiving content:', error);
      alert('❌ Error al archivar contenido: ' + error.message);
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
              <h1 className="text-2xl font-serif text-gray-800">Gestión de Contenido y Recursos</h1>
              <p className="text-sm text-gray-600">Administra videos, audios, artículos y ejercicios terapéuticos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total', value: filteredContents.length, icon: '📚', color: 'text-blue-600' },
            { label: 'Videos', value: filteredContents.filter(c => c.type === 'video').length, icon: '🎥', color: 'text-red-600' },
            { label: 'Audios', value: filteredContents.filter(c => c.type === 'audio').length, icon: '🎧', color: 'text-green-600' },
            { label: 'Ejercicios', value: filteredContents.filter(c => c.type === 'exercise').length, icon: '🧘', color: 'text-purple-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">Todos los tipos</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
              <option value="article">Artículos</option>
              <option value="exercise">Ejercicios</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">Todas las categorías</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="meditation">Meditación</option>
              <option value="breathing">Respiración</option>
              <option value="therapy">Terapia</option>
              <option value="education">Educación</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Crear Contenido
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando contenido...</p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">No hay contenido disponible</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              Crear primer contenido
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content, index) => (
              <div key={content.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{getTypeIcon(content.type)}</span>
                    {getTypeBadge(content.type)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{content.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      {content.category}
                    </span>
                    {content.duration && (
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {content.duration} min
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Ver contenido
                    </a>
                    <button
                      onClick={() => handleDeleteContent(content.id, content.title)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Archivar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Crear Contenido */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full slide-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif text-gray-800">Crear Nuevo Contenido</h2>
            </div>
            <form onSubmit={handleCreateContent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({...newContent, type: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="article">Artículo</option>
                    <option value="exercise">Ejercicio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={newContent.category}
                    onChange={(e) => setNewContent({...newContent, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="mindfulness">Mindfulness</option>
                    <option value="meditation">Meditación</option>
                    <option value="breathing">Respiración</option>
                    <option value="therapy">Terapia</option>
                    <option value="education">Educación</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL del contenido</label>
                <input
                  type="url"
                  value={newContent.url}
                  onChange={(e) => setNewContent({...newContent, url: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos, opcional)</label>
                <input
                  type="number"
                  value={newContent.duration}
                  onChange={(e) => setNewContent({...newContent, duration: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  min="0"
                />
              </div>
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
                  Crear Contenido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
