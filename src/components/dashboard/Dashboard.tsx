import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import { Role } from '../../types'; // ✅ CAMBIADO
import AdminDashboard from './admin/AdminDashboard';
import TherapistDashboard from './therapist/TherapistDashboard';
import PatientDashboard from './patient/PatientDashboard';
import Header from './Header';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);

  const renderDashboardByRole = () => {
    switch (auth?.user?.role) {
      case Role.Admin:
        return <AdminDashboard />;
      case Role.Therapist:
        return <TherapistDashboard />;
      case Role.Patient:
        return <PatientDashboard />;
      default:
        return <div className="p-8">Rol de usuario no reconocido.</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderDashboardByRole()}
      </main>
    </div>
  );
};

export default Dashboard;