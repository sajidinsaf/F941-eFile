import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  FileText,
  Shield,
  CheckCircle,
  Zap,
  ArrowRight,
  Building2,
  Lock,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'e-File Form 941',
    description:
      'Electronically file your quarterly federal tax return directly with the IRS through our secure MeF platform.',
  },
  {
    icon: Shield,
    title: 'Secure Encryption',
    description:
      'Your sensitive tax data is protected with bank-grade AES-256 encryption at rest and TLS 1.3 in transit.',
  },
  {
    icon: CheckCircle,
    title: 'IRS Compliance',
    description:
      'Built-in validation ensures your Form 941 meets all IRS requirements before submission.',
  },
  {
    icon: Zap,
    title: 'Quick Submission',
    description:
      'Complete and submit your quarterly payroll tax return in minutes, not hours. Get instant acknowledgment.',
  },
];

const benefits = [
  {
    icon: Building2,
    title: 'Built for Businesses',
    description: 'Whether you have 5 or 5,000 employees, our platform scales to your needs.',
  },
  {
    icon: Lock,
    title: 'SOC 2 Compliant',
    description: 'Enterprise-grade security controls to protect your business and employee data.',
  },
  {
    icon: Clock,
    title: 'Real-time Status',
    description: 'Track your filing status in real-time. Know exactly when the IRS accepts your return.',
  },
];

const HomePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-navy-900">F941 eFile</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-navy-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-1.5" />
              IRS Authorized e-File Provider
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight">
              File IRS Form 941{' '}
              <span className="text-primary-600">Electronically</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The fastest, most secure way to file your Employer&apos;s Quarterly Federal Tax Return.
              Auto-calculate taxes, validate data, and submit directly to the IRS.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={isAuthenticated ? '/filings/new' : '/register'}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Filing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="btn-secondary text-lg px-8 py-4"
              >
                {isAuthenticated ? 'View Dashboard' : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy-900">
              Everything You Need to File Form 941
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform streamlines the entire quarterly payroll tax filing process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Why Choose F941 eFile?</h2>
            <p className="mt-4 text-lg text-navy-200 max-w-2xl mx-auto">
              Trusted by thousands of businesses for secure, compliant quarterly tax filing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 rounded-2xl bg-navy-800/50 border border-navy-700"
              >
                <div className="h-12 w-12 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-navy-300 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to File Your Form 941?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of businesses that trust F941 eFile for their quarterly payroll tax filing.
          </p>
          <div className="mt-8">
            <Link
              to={isAuthenticated ? '/filings/new' : '/register'}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-700 transition-colors duration-200"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold text-white">F941 eFile</span>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-sm text-navy-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-navy-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-navy-400 hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-navy-800 text-center">
            <p className="text-sm text-navy-500">
              &copy; {new Date().getFullYear()} F941 eFile. All rights reserved. Not affiliated with the IRS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
