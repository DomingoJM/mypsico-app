import React, { useState, useEffect, useContext, useRef } from 'react';
import { TodoItem } from '../../../types';
import { supabaseService } from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import { TrashIcon, BellIcon, CloseIcon } from '../../shared/Icons';

// Reminder Modal Component
const ReminderModal: React.FC<{
    todo: TodoItem;
    onClose: () => void;
    onSave: (todoId: string, reminderDate: string | null, reminderType: 'push' | 'email' | null) => void;
}> = ({ todo, onClose, onSave }) => {
    const getInitialDateTime = () => {
        const d = todo.reminder_at ? new Date(todo.reminder_at) : new Date(Date.now() + 60 * 60 * 1000);
        // Format to yyyy-MM-ddThh:mm which is required by datetime-local
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [dateTime, setDateTime] = useState(getInitialDateTime());
    const [reminderType, setReminderType] = useState<'push' | 'email'>(todo.reminder_type || 'push');

    const handleSave = () => {
        const selectedDate = new Date(dateTime);
        if (selectedDate > new Date()) {
            onSave(todo.id, selectedDate.toISOString(), reminderType);
        } else {
            alert("Por favor, selecciona una fecha y hora en el futuro.");
        }
    };
    
    const handleRemove = () => {
        onSave(todo.id, null, null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-dark">Establecer Recordatorio</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <main className="p-6 space-y-6">
                    <p className="text-slate-600">Recibirás una notificación para la tarea: <strong className="text-brand-dark">{todo.text}</strong></p>
                    <div>
                        <label htmlFor="reminder-time" className="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            id="reminder-time"
                            value={dateTime}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="block text-sm font-medium text-slate-700">Tipo de recordatorio</p>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="reminderType"
                                    value="push"
                                    checked={reminderType === 'push'}
                                    onChange={() => setReminderType('push')}
                                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                                />
                                <span className="ml-2 text-sm text-slate-600">Notificación Push</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="reminderType"
                                    value="email"
                                    checked={reminderType === 'email'}
                                    onChange={() => setReminderType('email')}
                                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary"
                                />
                                <span className="ml-2 text-sm text-slate-600">Correo Electrónico</span>
                            </label>
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-between items-center">
                     <button
                        onClick={handleRemove}
                        className="px-4 py-2 bg-transparent text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                        Eliminar Recordatorio
                    </button>
                    <div>
                         <button
                            onClick={onClose}
                            className="mr-2 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                        >
                            Guardar
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const TodoList: React.FC = () => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reminderModalTodo, setReminderModalTodo] = useState<TodoItem | null>(null);
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const auth = useContext(AuthContext);
    const reminderTimeouts = useRef<Map<string, number>>(new Map());
    const editInputRef = useRef<HTMLInputElement>(null);

    // Request notification permission on component mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
    
    // Focus input when editing starts
    useEffect(() => {
        if (editingTodoId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingTodoId]);

    // Schedule and clear reminders when todos change
    useEffect(() => {
        // Clear all existing timeouts to avoid duplicates
        reminderTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
        reminderTimeouts.current.clear();

        todos.forEach(todo => {
            // Schedule a push notification if it's set, in the future, and not completed.
            // Provides backward compatibility for reminders set before type was introduced.
            if (todo.reminder_at && !todo.completed && (todo.reminder_type === 'push' || !todo.reminder_type)) {
                const reminderTime = new Date(todo.reminder_at).getTime();
                const now = new Date().getTime();
                const delay = reminderTime - now;

                if (delay > 0) {
                    const timeoutId = window.setTimeout(() => {
                        if (Notification.permission === 'granted') {
                            new Notification('Recordatorio de Tarea: DOM+M', {
                                body: todo.text,
                                // icon: '/favicon.ico' // Optional: if you have an icon
                            });
                        }
                    }, delay);
                    reminderTimeouts.current.set(todo.id, timeoutId);
                }
            }
        });

        // Cleanup function to clear timeouts when the component unmounts
        return () => {
            reminderTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, [todos]);

    useEffect(() => {
        const fetchTodos = async () => {
            if (auth?.user?.id) {
                setLoading(true);
                setError(null);
                try {
                    const data = await supabaseService.getTodosForUser(auth.user.id);
                    setTodos(data);
                } catch (err: unknown) {
                    console.error("Failed to fetch todos:", err);
                    const errorMessage = err instanceof Error ? err.message : "No se pudieron cargar las tareas.";
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // No user, not loading.
            }
        };
        fetchTodos();
    }, [auth?.user?.id]);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() === '' || !auth?.user?.id) return;
        setError(null);
        try {
            const newTodo = await supabaseService.addTodo(newTodoText, auth.user.id);
            setTodos([...todos, newTodo]);
            setNewTodoText('');
        } catch (err: unknown) {
            console.error("Failed to add todo:", err);
            setError(err instanceof Error ? err.message : "No se pudo añadir la tarea.");
        }
    };

    const handleToggleTodo = async (id: string, completed: boolean) => {
        setError(null);
        try {
            const updatedTodo = await supabaseService.updateTodo(id, completed);
            setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo));
        } catch (err: unknown) {
            console.error("Failed to update todo:", err);
            setError(err instanceof Error ? err.message : "No se pudo actualizar la tarea.");
        }
    };

    const handleDeleteTodo = async (id: string) => {
        setError(null);
        try {
            await supabaseService.deleteTodo(id);
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (err: unknown) {
            console.error("Failed to delete todo:", err);
            setError(err instanceof Error ? err.message : "No se pudo eliminar la tarea.");
        }
    };

    const handleSaveReminder = async (todoId: string, reminderDate: string | null, reminderType: 'push' | 'email' | null) => {
        setError(null);
        try {
            const updatedTodo = await supabaseService.setTodoReminder(todoId, reminderDate, reminderType);
            setTodos(todos.map(t => (t.id === todoId ? updatedTodo : t)));
            setReminderModalTodo(null);
        } catch (err: unknown) {
             console.error("Failed to set reminder:", err);
            setError(err instanceof Error ? err.message : "No se pudo guardar el recordatorio.");
        }
    };

    const handleStartEditing = (todo: TodoItem) => {
        setEditingTodoId(todo.id);
        setEditingText(todo.text);
    };

    const handleCancelEditing = () => {
        setEditingTodoId(null);
        setEditingText('');
    };

    const handleSaveText = async () => {
        if (!editingTodoId) return;

        const originalTodo = todos.find(t => t.id === editingTodoId);
        // Do nothing if text is empty or unchanged
        if (!originalTodo || editingText.trim() === '' || editingText.trim() === originalTodo.text) {
            handleCancelEditing();
            return;
        }
        
        setError(null);
        try {
            const updatedTodo = await supabaseService.updateTodoText(editingTodoId, editingText.trim());
            setTodos(todos.map(t => (t.id === editingTodoId ? updatedTodo : t)));
        } catch (err: unknown) {
            console.error("Failed to update todo text:", err);
            setError(err instanceof Error ? err.message : "No se pudo guardar la tarea.");
        } finally {
            handleCancelEditing();
        }
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveText();
        } else if (e.key === 'Escape') {
            handleCancelEditing();
        }
    };

    const formatReminderDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });
    };

    if (loading) return <div>Cargando tareas...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold font-serif text-brand-dark mb-4">Mis Tareas Diarias</h2>
            
            {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
            
            <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Añadir una nueva tarea..."
                    className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button type="submit" className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors">Añadir</button>
            </form>
            <ul className="space-y-3">
                {todos.map(todo => (
                    <li key={todo.id} className={`flex items-center justify-between p-3 rounded-lg transition-all hover:bg-slate-100 ${todo.completed ? 'bg-green-50' : 'bg-white shadow-sm'}`}>
                        <div className="flex items-center flex-grow min-w-0">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodo(todo.id, !todo.completed)}
                                className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary flex-shrink-0"
                            />
                            <div className="ml-3 truncate flex-grow">
                                {editingTodoId === todo.id ? (
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        onBlur={handleSaveText}
                                        onKeyDown={handleEditKeyDown}
                                        className="w-full px-2 py-1 border border-brand-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-brand-text"
                                    />
                                ) : (
                                    <span 
                                        className={`text-brand-text cursor-pointer ${todo.completed ? 'line-through text-slate-500' : ''}`}
                                        onDoubleClick={() => !todo.completed && handleStartEditing(todo)}
                                        title={todo.completed ? "No se puede editar una tarea completada" : "Doble clic para editar"}
                                    >
                                        {todo.text}
                                    </span>
                                )}
                                {todo.reminder_at && !todo.completed && (
                                    <p className="text-xs text-brand-primary font-medium">
                                       Recordatorio ({todo.reminder_type === 'email' ? 'Email' : 'Push'}): {formatReminderDate(todo.reminder_at)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <button onClick={() => setReminderModalTodo(todo)} className="text-slate-400 hover:text-brand-primary p-1 rounded-full" aria-label="Establecer recordatorio">
                                <BellIcon className={`w-5 h-5 ${todo.reminder_at && !todo.completed ? 'text-brand-primary' : ''}`} />
                            </button>
                            <button onClick={() => handleDeleteTodo(todo.id)} className="text-slate-400 hover:text-brand-accent p-1 rounded-full" aria-label="Eliminar tarea">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
             {todos.length === 0 && !error && (
                <p className="text-center text-slate-500 py-4">No tienes tareas pendientes. ¡Añade una para empezar!</p>
            )}
             {reminderModalTodo && (
                <ReminderModal
                    todo={reminderModalTodo}
                    onClose={() => setReminderModalTodo(null)}
                    onSave={handleSaveReminder}
                />
            )}
        </div>
    );
};

export default TodoList;