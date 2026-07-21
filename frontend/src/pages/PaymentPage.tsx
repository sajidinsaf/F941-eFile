import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { CreditCard, Check, Shield, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { paymentService, type Plan } from '@/services/paymentService';

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [config, plansData] = await Promise.all([
          paymentService.getConfig(),
          paymentService.getPlans(),
        ]);
        setStripePromise(loadStripe(config.publishableKey));
        setPlans(plansData);
        if (plansData.length > 0) {
          setSelectedPlan(plansData[0].id);
        }
      } catch {
        toast.error('Failed to load payment information');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleCheckout = async () => {
    if (!id || !selectedPlan) return;
    setIsProcessing(true);
    try {
      const session = await paymentService.createCheckoutSession(id, selectedPlan);
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch {
      toast.error('Failed to create checkout session');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size={40} text="Loading payment options..." />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/filings/${id}/form941`)}
          className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Form 941
        </button>

        <div className="text-center mb-8">
          <CreditCard className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900">Complete Your Filing</h1>
          <p className="text-gray-500 mt-2">
            Select a plan and complete payment to submit your Form 941 to the IRS.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`card text-left transition-all duration-200 ${
                selectedPlan === plan.id
                  ? 'border-2 border-primary-500 ring-2 ring-primary-100'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-navy-900">{plan.name}</h3>
                {selectedPlan === plan.id && (
                  <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-navy-900 mb-1">
                ${(plan.price / 100).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {plan.filingCount === 1 ? 'per filing' : `${plan.filingCount} filings`}
              </p>
              <ul className="space-y-1.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-500 mr-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="card text-center py-8 mb-8">
            <p className="text-gray-500">No plans available at the moment.</p>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Secure payment powered by Stripe. Your card information is never stored on our servers.</span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing || !selectedPlan || plans.length === 0}
          className="btn-primary w-full text-lg py-4"
        >
          {isProcessing ? (
            <LoadingSpinner size={24} />
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Proceed to Payment
            </>
          )}
        </button>
      </div>
    </Elements>
  );
};

export default PaymentPage;
