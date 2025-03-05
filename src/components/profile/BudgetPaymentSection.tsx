
import React from 'react';

interface BudgetPaymentSectionProps {
  budgetPerHour: number;
  paymentMethod: string;
  onBudgetChange: (budget: number) => void;
  onPaymentMethodChange: (method: string) => void;
}

const BudgetPaymentSection: React.FC<BudgetPaymentSectionProps> = ({
  budgetPerHour,
  paymentMethod,
  onBudgetChange,
  onPaymentMethodChange
}) => {
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onBudgetChange(value);
    }
  };

  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">Budget & Payment</h2>
      
      <div className="space-y-8">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium mb-2">
            Budget per Hour (USD)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              $
            </span>
            <input
              id="budget"
              type="number"
              min="0"
              step="1"
              value={budgetPerHour}
              onChange={handleBudgetChange}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              aria-label="Budget per hour in USD"
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Set your hourly budget for developer help
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Stripe', 'PayPal'].map(method => (
              <div key={method} className="relative">
                <input
                  type="radio"
                  id={`payment-${method}`}
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => onPaymentMethodChange(method)}
                  className="sr-only"
                />
                <label
                  htmlFor={`payment-${method}`}
                  className={`block w-full px-4 py-3 text-center rounded-lg cursor-pointer border transition-all ${
                    paymentMethod === method
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10'
                      : 'border-border hover:border-primary/30 hover:bg-secondary'
                  }`}
                >
                  {method}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPaymentSection;
