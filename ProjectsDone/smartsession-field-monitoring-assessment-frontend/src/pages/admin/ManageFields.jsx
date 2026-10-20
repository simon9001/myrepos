import React, { useState } from 'react';
import AdminDashboardLayout from '../../dashboardDesign/AdminDashboardLayout';
import { FieldApi } from '../../features/api/FieldApi';
import { userApi } from '../../features/api/UserApi';
import { toast, Toaster } from 'sonner';

const ManageFields = () => {
    const { data: fields, isLoading } = FieldApi.useGetAllFieldsQuery();
    const { data: users } = userApi.useGetAllUsersQuery();
    const [createField, { isLoading: isCreating }] = FieldApi.useCreateFieldMutation();
    const [assignField, { isLoading: isAssigning }] = FieldApi.useAssignFieldMutation();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);

    // Form states
    const [newField, setNewField] = useState({ name: '', crop_type: '', planting_date: '' });
    const [selectedAgent, setSelectedAgent] = useState('');

    const agents = users?.filter(u => u.user_type === 'agent') || [];

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createField(newField).unwrap();
            toast.success('Field created successfully!');
            setIsCreateModalOpen(false);
            setNewField({ name: '', crop_type: '', planting_date: '' });
        } catch (error) {
            toast.error('Failed to create field');
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await assignField({ field_id: selectedField.field_id, agent_id: parseInt(selectedAgent) }).unwrap();
            toast.success('Field assigned successfully!');
            setIsAssignModalOpen(false);
            setSelectedField(null);
            setSelectedAgent('');
        } catch (error) {
            toast.error('Failed to assign field');
        }
    };

    const openAssignModal = (field) => {
        setSelectedField(field);
        setSelectedAgent(field.agent_id || '');
        setIsAssignModalOpen(true);
    };

    return (
        <AdminDashboardLayout>
            <Toaster position="top-right" richColors />
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Fields</h1>
                    <p className="text-gray-600 mt-2">Create new fields and assign them to agents.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    + Add New Field
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th>Field Name</th>
                                <th>Crop Type</th>
                                <th>Planting Date</th>
                                <th>Assigned Agent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        <span className="loading loading-spinner text-success"></span>
                                    </td>
                                </tr>
                            ) : fields?.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No fields available.</td>
                                </tr>
                            ) : (
                                fields?.map((field) => {
                                    const agent = agents.find(a => a.user_id === field.agent_id);
                                    return (
                                        <tr key={field.field_id} className="hover:bg-gray-50">
                                            <td className="font-medium text-gray-900">{field.name}</td>
                                            <td>{field.crop_type}</td>
                                            <td>{field.planting_date}</td>
                                            <td>
                                                {agent ? (
                                                    <span className="text-gray-700">{agent.first_name} {agent.last_name}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => openAssignModal(field)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    {agent ? 'Reassign' : 'Assign'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Field Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Field</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    value={newField.name}
                                    onChange={e => setNewField({...newField, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    value={newField.crop_type}
                                    onChange={e => setNewField({...newField, crop_type: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    value={newField.planting_date}
                                    onChange={e => setNewField({...newField, planting_date: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isCreating}
                                    className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    {isCreating ? 'Saving...' : 'Save Field'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {isAssignModalOpen && selectedField && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Field</h2>
                        <p className="text-gray-600 mb-6">Select an agent for <strong>{selectedField.name}</strong></p>
                        
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Agent</label>
                                <select 
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    value={selectedAgent}
                                    onChange={e => setSelectedAgent(e.target.value)}
                                >
                                    <option value="" disabled>Select an agent...</option>
                                    {agents.map(agent => (
                                        <option key={agent.user_id} value={agent.user_id}>
                                            {agent.first_name} {agent.last_name} ({agent.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isAssigning}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    {isAssigning ? 'Assigning...' : 'Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminDashboardLayout>
    );
};

export default ManageFields;
