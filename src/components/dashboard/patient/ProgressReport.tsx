import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProgressData } from '../../../../types';
import * as supabaseService from '../../../services/supabaseService';
// @ts-ignore
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// @ts-ignore
const { jsPDF } = window.jspdf;

const ProgressReport: React.FC<{ userId: string }> = ({ userId }) => {
  const [data, setData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await supabaseService.getProgressData(userId);
      setData(result);
    } catch (err: unknown) {
      console.error("Error fetching progress data:", err);
      let errorMessage = "No se pudo cargar el reporte de progreso. Inténtalo de nuevo más tarde.";
      if (err instanceof Error) {
          // This will correctly display the custom timeout message from the service
          errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
          // This handles Supabase and other library errors that might not be instances of Error
          errorMessage = String((err as { message: string }).message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const downloadPdf = () => {
    if (reportRef.current) {
      const doc = new jsPDF({
          orientation: 'p',
          unit: 'px',
          format: [reportRef.current.offsetWidth, reportRef.current.offsetHeight]
      });
      doc.html(reportRef.current, {
        callback: function (doc) {
          doc.save('mi_progreso.pdf');
        },
        x: 0,
        y: 0,
        html2canvas: {
            scale: 0.75, // Adjust scale to fit content better
        }
      });
    }
  };

  if (loading) return <div>Cargando reporte...</div>;

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Reporte de Progreso</h2>
        <div className="text-center p-8 bg-red-50 text-red-800 rounded-lg">
          <p className="font-semibold">Ocurrió un error al cargar tu progreso</p>
          <p className="mt-2 text-sm">{error}</p>
          <button onClick={loadData} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors">
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif text-brand-dark">Reporte de Progreso</h2>
        <button onClick={downloadPdf} className="px-4 py-2 bg-brand-secondary text-brand-dark rounded-lg font-semibold hover:opacity-90 transition-colors">
          Descargar PDF
        </button>
      </div>
      <div ref={reportRef} className="p-4 border rounded-md bg-white">
        <h3 className="text-xl font-bold text-center mb-4 text-brand-dark">Resumen de los Últimos 30 Días</h3>
        <p className="text-center text-slate-500 mb-8">Visualiza la tendencia de tu bienestar a lo largo del tiempo.</p>
        
        {data.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="mood" name="Estado de Ánimo" stroke="#6B7A8F" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="anxiety" name="Ansiedad" stroke="#F7C59F" strokeWidth={2} activeDot={{ r: 8 }}/>
                <Line type="monotone" dataKey="stress" name="Estrés" stroke="#D8A7B1" strokeWidth={2} activeDot={{ r: 8 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-lg">
            <p className="text-lg text-slate-600">No hay suficientes datos para mostrar el gráfico.</p>
            <p className="text-slate-500 text-md mt-2">Completa algunas actividades para empezar a ver tu progreso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressReport;