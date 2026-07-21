interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  VALIDATED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Validated' },
  SUBMITTED: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Submitted' },
  ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
