import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import {
    useGetSponsorApplicationQuery,
    useGetMySponsorshipQuery
} from '../../features/Api/newSystemsApi';

const ProductsSection = () => {
    const user = useSelector(selectCurrentUser);

    const { data: applicationData, isLoading: appLoading } = useGetSponsorApplicationQuery();
    const { data: sponsorshipData, isLoading: sponsorLoading } = useGetMySponsorshipQuery();

    const application = applicationData?.application;
    const sponsorships = sponsorshipData?.sponsorships || [];

    if (appLoading || sponsorLoading) {
        return (
            <div className="p-10 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    // If no application exists yet
    if (!application) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Sponsorship Status</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center">
                    <Briefcase className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Application Submitted</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven't submitted a sponsor application yet. Submit your application to get started.
                    </p>
                    <Link
                        to="/sponsors/apply"
                        className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        );
    }

    const statusIcons = {
        pending: <Clock className="w-6 h-6 text-gray-500" />,
        under_review: <Clock className="w-6 h-6 text-yellow-500" />,
        approved: <CheckCircle className="w-6 h-6 text-green-600" />,
        rejected: <XCircle className="w-6 h-6 text-red-600" />
    };

    const statusColors = {
        pending: 'bg-gray-100 text-gray-700 border-gray-200',
        under_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        approved: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Sponsorship Dashboard</h2>

            {/* Application Status */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border/50 shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Application Status</h3>
                <div className="flex items-center gap-4">
                    {statusIcons[application.status]}
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Company: {application.company_name}</p>
                        <p className="text-sm text-muted-foreground">Contact: {application.contact_email}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${statusColors[application.status]}`}>
                        {application.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
                {application.admin_notes && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Admin Notes:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{application.admin_notes}</p>
                    </div>
                )}
            </div>

            {/* Active Sponsorships */}
            {sponsorships.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border/50 shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4">Active Sponsorships</h3>
                    <div className="space-y-3">
                        {sponsorships.map((sponsorship) => (
                            <div key={sponsorship.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div>
                                    <p className="font-bold text-foreground">{sponsorship.package_type}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(sponsorship.start_date).toLocaleDateString()} - {new Date(sponsorship.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${sponsorship.status === 'active' ? 'bg-green-100 text-green-700' :
                                        sponsorship.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {sponsorship.status.toUpperCase()}
                                    </span>
                                    <p className="text-sm font-bold text-green-600 mt-1">
                                        KES {sponsorship.amount?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Active Sponsorships Message */}
            {application.status === 'approved' && sponsorships.length === 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Application Approved!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your application has been approved. An admin will create a sponsorship contract for you soon.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductsSection;
