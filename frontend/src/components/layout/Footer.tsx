import { FileText } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FileText className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-semibold text-navy-900">F941 eFile</span>
          </div>

          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Support
            </a>
          </div>

          <p className="text-sm text-gray-400">
            &copy; {currentYear} F941 eFile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
