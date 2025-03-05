
import React from 'react';

interface BudgetPaymentSectionProps {
  budgetPerHour: number;
  paymentMethod: string;
  onChange: (field: string, value: any) => void;
}

const BudgetPaymentSection: React.FC<BudgetPaymentSectionProps> = ({
  budgetPerHour,
  paymentMethod,
  onChange
}) => {
  const paymentOptions = ["Stripe", "PayPal"];
  
  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h3 className="font-medium text-lg mb-4">Budget & Payment</h3>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="budgetPerHour" className="block text-sm font-medium mb-1">
            Budget Per Hour (USD)
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="budgetPerHour"
              id="budgetPerHour"
              min="0"
              value={budgetPerHour}
              onChange={(e) => onChange('budgetPerHour', Number(e.target.value))}
              className="w-full pl-7 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Set your hourly budget for developer help
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Payment Method
          </label>
          <div className="flex flex-wrap gap-2">
            {paymentOptions.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => onChange('paymentMethod', method)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose your preferred payment method
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPaymentSection;
