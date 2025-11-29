


import React, { useState } from 'react';
import UserManagement from '../shared/UserManagement';
import ContentManagement from '../shared/ContentManagement';
import { Role, User } from "../../../types"
import PatientDetailView from './PatientDetailView';
import PromotionalItemsManagement from '../shared/PromotionalItemsManagement';

const TherapistDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('patients');
    const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

    const handleSelectPatient = (patient: User) => {
        setSelectedPatient(patient);
    };

    const handleBackToList = () => {
        setSelectedPatient(null);
    };

    const renderPatientView = () => {
        if (selectedPatient) {
            return <PatientDetailView patient={selectedPatient} onBack={handleBackToList} />;
        }
        return <UserManagement manageableRole={Role.Patient} onSelectPatient={handleSelectPatient} />;
    };

    return (
        <div>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => {
                            setActiveTab('patients');
                            setSelectedPatient(null); // Reset patient view when switching tabs
                        }}
                        className={`${activeTab === 'patients' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                    >
                        Mis Pacientes
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
                </nav>
            </div>
            
            {activeTab === 'patients' && renderPatientView()}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'promotions' && <PromotionalItemsManagement />}

        </div>
    );
};

export default TherapistDashboard;