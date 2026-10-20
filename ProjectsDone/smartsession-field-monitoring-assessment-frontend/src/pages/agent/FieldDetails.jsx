import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboardDesign/DashboardLayout';
import { FieldApi } from '../../features/api/FieldApi';
import { useParams, useNavigate } from 'react-router';
import { toast, Toaster } from 'sonner';

const FieldDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { data: fields, isLoading } = FieldApi.useGetAllFieldsQuery();
    const [updateField, { isLoading: isUpdating }] = FieldApi.useUpdateFieldStageAndNotesMutation();

    const [stage, setStage] = useState('');
    const [notes, setNotes] = useState('');

    const field = fields?.find(f => f.field_id === parseInt(id));

    useEffect(() => {
        if (field) {
            setStage(field.stage);
            setNotes(field.notes || '');
        }
    }, [field]);

    if (isLoading) return <DashboardLayout><div className="flex justify-center p-10"><span className="loading loading-spinner text-success"></span></div></DashboardLayout>;
    
    if (!field) return <DashboardLayout><div className="text-red-500">Field not found</div></DashboardLayout>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateField({ field_id: field.field_id, stage, notes }).unwrap();
            toast.success('Field updated successfully!');
            setTimeout(() => {
                navigate('/agent/my-fields');
            }, 1500);
        } catch (error) {
            toast.error('Failed to update field');
        }
    };

    return (
        <DashboardLayout>
            <Toaster position="top-right" richColors />
            
            <div className="mb-8 flex items-center gap-4">
                <button 
                    onClick={() => navigate('/agent/my-fields')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ← Back
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{field.name}</h1>
                    <p className="text-gray-600 mt-1">Update progress for {field.crop_type} planted on {field.planting_date}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage</label>
                            <select 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                value={stage}
                                onChange={e => setStage(e.target.value)}
                            >
                                <option value="Planted">Planted</option>
                                <option value="Growing">Growing</option>
                                <option value="Ready">Ready (For Harvest)</option>
                                <option value="Harvested">Harvested</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Observations</label>
                            <textarea 
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                placeholder="Add any observations about soil moisture, pest activity, growth rate, etc."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isUpdating}
                                className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                {isUpdating ? 'Saving...' : 'Save Updates'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FieldDetails;
