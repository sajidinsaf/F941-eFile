import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  FileText,
  FilePlus,
  UserCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { filingService, type Filing } from '@/services/filingService';
import toast from 'react-hot-toast';

interface DashboardSummary {
  total: number;
  draft: number;
  submitted: number;
  accepted: number;
  rejected: number;
}

const DashboardPage = () => {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    total: 0,
    draft: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await filingService.list(1, 10);
        setFilings(response.filings);

        const stats: DashboardSummary = {
          total: response.total,
          draft: 0,
          submitted: 0,
          accepted: 0,
          rejected: 0,
        };

        response.filings.forEach((filing) => {
          switch (filing.status) {
            case 'DRAFT':
            case 'VALIDATED':
              stats.draft++;
              break;
            case 'SUBMITTED':
              stats.submitted++;
              break;
            case 'ACCEPTED':
              stats.accepted++;
              break;
            case 'REJECTED':
              stats.rejected++;
              break;
          }
        });
        setSummary(stats);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Filings',
      value: summary.total,
      icon: FileText,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Drafts',
      value: summary.draft,
      icon: Clock,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      label: 'Submitted',
      value: summary.submitted,
      icon: Send,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Accepted',
      value: summary.accepted,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size={40} text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your Form 941 filings and track their status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/profile" className="btn-secondary text-sm px-4 py-2">
            <UserCircle className="h-4 w-4 mr-2" />
            View Profile
          </Link>
          <Link to="/filings/new" className="btn-primary text-sm px-4 py-2">
            <FilePlus className="h-4 w-4 mr-2" />
            New Filing
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Filings Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy-900">Recent Filings</h2>
        </div>

        {filings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No filings yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get started by creating your first Form 941 filing.
            </p>
            <Link to="/filings/new" className="btn-primary text-sm">
              <FilePlus className="h-4 w-4 mr-2" />
              Create Your First Filing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Year / Quarter
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filings.map((filing) => (
                  <tr
                    key={filing.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/filings/${filing.id}/form941`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {filing.taxYear} - Q{filing.quarter}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={filing.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {format(new Date(filing.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {format(new Date(filing.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {filing.status === 'REJECTED' && (
                        <AlertCircle className="h-4 w-4 text-red-500 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
