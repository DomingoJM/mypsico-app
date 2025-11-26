

import React, { useState } from 'react';
import UserManagement from '../shared/UserManagement';
import ContentManagement from '../shared/ContentManagement';
import { Role } from '../../../../types';
import PromotionalItemsManagement from '../shared/PromotionalItemsManagement';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');

    const GlobalReports = () => (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-brand-dark">Reportes Globales</h2>
        <p className="mt-2 text-slate-600">Esta función está en desarrollo. Aquí podrá ver estadísticas de uso de la aplicación y descargar informes globales.</p>
        <button disabled className="mt-4 px-4 py-2 bg-slate-400 text-white rounded-lg font-semibold cursor-not-allowed">
          Generar Reporte Global
        </button>
      </div>
    );

    return (
        <div>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                    >
                        Gestionar Usuarios
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`${activeTab === 'content' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                    >
                        Gestionar Contenido
                    </button>
                    <button
                        onClick={() => setActiveTab('promotions')}
                        className={`${activeTab === 'promotions' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                    >
                        Gestionar Promociones
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`${activeTab === 'reports' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                    >
                        Reportes Globales
                    </button>
                </nav>
            </div>
            
            {activeTab === 'users' && <UserManagement manageableRole={Role.Admin} />}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'promotions' && <PromotionalItemsManagement />}
            {activeTab === 'reports' && <GlobalReports />}
        </div>
    );
};

export default AdminDashboard;