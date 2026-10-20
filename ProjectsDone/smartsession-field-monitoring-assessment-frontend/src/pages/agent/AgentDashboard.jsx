import React from 'react';
import DashboardLayout from '../../dashboardDesign/DashboardLayout';
import { Sprout, AlertCircle, CheckCircle, Activity, Map } from 'lucide-react';
import { FieldApi } from '../../features/api/FieldApi';
import { getFieldStatus } from '../../utils/fieldStatus';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

const AgentDashboard = () => {
    const { user } = useSelector((state) => state.authSlice);
    const { data: fields, isLoading, error } = FieldApi.useGetFieldsByAgentIdQuery(user?.user_id);

    if (isLoading) return <DashboardLayout><div className="flex justify-center p-10"><span className="loading loading-spinner text-success"></span></div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="text-red-500">Error loading fields</div></DashboardLayout>;

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
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Here is an overview of the fields assigned to you.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Map className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">My Fields</p>
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

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/agent/my-fields" className="flex items-center justify-center gap-2 bg-green-50 text-green-800 hover:bg-green-100 p-4 rounded-lg font-medium transition-colors">
                        <Sprout className="w-5 h-5" />
                        Update Field Stage
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AgentDashboard;
