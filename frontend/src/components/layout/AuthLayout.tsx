import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary-50 via-white to-navy-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <FileText className="h-10 w-10 text-primary-600" />
          <span className="text-2xl font-bold text-navy-900">F941 eFile</span>
        </Link>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
