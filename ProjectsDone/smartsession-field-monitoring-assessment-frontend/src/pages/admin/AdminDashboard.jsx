import React from 'react';
import AdminDashboardLayout from '../../dashboardDesign/AdminDashboardLayout';
import { Sprout, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { FieldApi } from '../../features/api/FieldApi';
import { getFieldStatus } from '../../utils/fieldStatus';

const AdminDashboard = () => {
    const { data: fields, isLoading, error } = FieldApi.useGetAllFieldsQuery();

    if (isLoading) return <AdminDashboardLayout><div className="flex justify-center p-10"><span className="loading loading-spinner text-success"></span></div></AdminDashboardLayout>;
    if (error) return <AdminDashboardLayout><div className="text-red-500">Error loading fields</div></AdminDashboardLayout>;

    const totalFields = fields?.length || 0;
    
    // Calculate statuses
    let active = 0;
    let atRisk = 0;
    let completed = 0;

    fields?.forEach(field => {
        const status = getFieldStatus(field);
        if (status === 'Active') active++;
        if (status === 'At Risk') atRisk++;
        if (status === 'Completed') completed++;
    });

    return (
        <AdminDashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Coordinator Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of all tracked fields and crop progress.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Sprout className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Fields</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalFields}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active</p>
                        <h3 className="text-2xl font-bold text-gray-900">{active}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">At Risk</p>
                        <h3 className="text-2xl font-bold text-gray-900">{atRisk}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="bg-gray-100 p-3 rounded-lg mr-4">
                        <CheckCircle className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Completed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{completed}</h3>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Recent Field Updates</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th>Field Name</th>
                                <th>Crop Type</th>
                                <th>Current Stage</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields?.slice().sort((a,b) => new Date(b.last_updated) - new Date(a.last_updated)).map((field) => (
                                <tr key={field.field_id} className="hover:bg-gray-50">
                                    <td className="font-medium">{field.name}</td>
                                    <td>{field.crop_type}</td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${field.stage === 'Planted' ? 'bg-blue-100 text-blue-800' :
                                            field.stage === 'Growing' ? 'bg-green-100 text-green-800' :
                                            field.stage === 'Ready' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                            {field.stage}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${getFieldStatus(field) === 'Active' ? 'bg-green-100 text-green-800' :
                                            getFieldStatus(field) === 'At Risk' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                            {getFieldStatus(field)}
                                        </span>
                                    </td>
                                    <td className="text-gray-500 text-sm">{field.last_updated}</td>
                                </tr>
                            ))}
                            {fields?.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No fields tracked yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminDashboardLayout>
    );
};

export default AdminDashboard;