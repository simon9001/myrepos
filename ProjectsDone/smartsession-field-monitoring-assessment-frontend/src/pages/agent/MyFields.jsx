import React from 'react';
import DashboardLayout from '../../dashboardDesign/DashboardLayout';
import { FieldApi } from '../../features/api/FieldApi';
import { getFieldStatus } from '../../utils/fieldStatus';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

const MyFields = () => {
    const { user } = useSelector((state) => state.authSlice);
    const { data: fields, isLoading, error } = FieldApi.useGetFieldsByAgentIdQuery(user?.user_id);

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Fields</h1>
                <p className="text-gray-600 mt-2">View and update the fields assigned to you.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th>Field Name</th>
                                <th>Crop Type</th>
                                <th>Current Stage</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <span className="loading loading-spinner text-success"></span>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-red-500">Error loading fields</td>
                                </tr>
                            ) : fields?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">No fields assigned to you yet.</td>
                                </tr>
                            ) : (
                                fields?.map((field) => (
                                    <tr key={field.field_id} className="hover:bg-gray-50">
                                        <td className="font-medium text-gray-900">{field.name}</td>
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
                                        <td>
                                            <Link 
                                                to={`/agent/field/${field.field_id}`}
                                                className="text-green-700 hover:text-green-900 font-medium text-sm"
                                            >
                                                Update
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyFields;
