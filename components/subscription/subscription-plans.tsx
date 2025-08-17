'use client';

import { useState } from 'react';
import { GlassmorphicButton } from '@/components/ui/buttons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/layout';
import { Input } from '@/components/ui/input';
import { Check, Star, ArrowLeft, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Plan {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  period: string;
  product: string;
  paymentProviders: any[];
  isEnabled: boolean;
  role: string;
  options: any;
}

interface SubscriptionPlansProps {
  plans: Plan[];
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  vatNumber?: string;
}

type Step = 'plans' | 'billing';

const formatPrice = (price: number, currency: string) => {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

const getPeriodText = (period: string) => {
  switch (period.toLowerCase()) {
    case 'monthly':
      return 'měsíčně';
    case 'yearly':
      return 'ročně';
    case 'weekly':
      return 'týdně';
    default:
      return period;
  }
};

const isPopularPlan = (plan: Plan, allPlans: Plan[]) => {
  // Označíme jako populární prostřední plán podle ceny
  const sortedByPrice = allPlans.sort((a, b) => a.price - b.price);
  const middleIndex = Math.floor(sortedByPrice.length / 2);
  return sortedByPrice[middleIndex]?.name === plan.name;
};

export function SubscriptionPlans({ plans }: SubscriptionPlansProps) {
  const [currentStep, setCurrentStep] = useState<Step>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: 'Jan',
    lastName: 'Novák',
    email: 'jan.novak@email.cz',
    company: '',
    address: 'Václavské náměstí 123',
    city: 'Praha',
    postalCode: '11000',
    country: 'Česká republika',
    vatNumber: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 text-lg">
          Momentálně nejsou k dispozici žádné plány.
        </p>
      </div>
    );
  }

  // Seřadíme plány podle ceny
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep('billing');
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan?.name,
          billingInfo,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result, "result");
        if (result.pay_url) {
          // Přesměrování na platební bránu v současném okně
          window.location.href = result.pay_url;
        } else {
          console.log('Platba byla úspěšně vytvořena:', result);
        }
      } else {
        const errorResult = await response.json();
        console.error('Chyba při zpracování platby:', errorResult.message);
        alert(`Chyba: ${errorResult.message}`);
      }
    } catch (error) {
      console.error('Síťová chyba:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateBillingInfo = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  if (currentStep === 'billing' && selectedPlan) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setCurrentStep('plans')}
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na výběr plánu
          </button>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-slate-900">
              <CreditCard className="w-6 h-6 mr-3" />
              Fakturační údaje
            </CardTitle>
            <CardDescription>
              Vybraný plán: <strong>{selectedPlan.displayName}</strong> - {formatPrice(selectedPlan.price, selectedPlan.currency)}/{getPeriodText(selectedPlan.period)}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleBillingSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jméno *
                  </label>
                  <Input
                    type="text"
                    required
                    value={billingInfo.firstName}
                    onChange={(e) => updateBillingInfo('firstName', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Příjmení *
                  </label>
                  <Input
                    type="text"
                    required
                    value={billingInfo.lastName}
                    onChange={(e) => updateBillingInfo('lastName', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  required
                  value={billingInfo.email}
                  onChange={(e) => updateBillingInfo('email', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Společnost (volitelné)
                </label>
                <Input
                  type="text"
                  value={billingInfo.company}
                  onChange={(e) => updateBillingInfo('company', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresa *
                </label>
                <Input
                  type="text"
                  required
                  value={billingInfo.address}
                  onChange={(e) => updateBillingInfo('address', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Město *
                  </label>
                  <Input
                    type="text"
                    required
                        value={billingInfo.city}
                    onChange={(e) => updateBillingInfo('city', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PSČ *
                  </label>
                  <Input
                    type="text"
                    required
                    value={billingInfo.postalCode}
                    onChange={(e) => updateBillingInfo('postalCode', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Země *
                </label>
                <Input
                  type="text"
                  required
                  value={billingInfo.country}
                  onChange={(e) => updateBillingInfo('country', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  DIČ (volitelné)
                </label>
                <Input
                  type="text"
                  value={billingInfo.vatNumber}
                  onChange={(e) => updateBillingInfo('vatNumber', e.target.value)}
                  className="w-full"
                  placeholder="CZ12345678"
                />
              </div>
            </CardContent>

            <CardFooter>
              <GlassmorphicButton
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? 'Zpracování...' : `Dokončit platbu - ${formatPrice(selectedPlan.price, selectedPlan.currency)}`}
              </GlassmorphicButton>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {sortedPlans.map((plan) => {
        const isPopular = isPopularPlan(plan, plans);
        
        return (
          <Card
            key={plan.name}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:scale-105",
              "backdrop-blur-sm bg-white/80 border border-white/20",
              "shadow-lg hover:shadow-xl",
              isPopular && "ring-2 ring-blue-500/50 shadow-blue-100"
            )}
          >
            {isPopular && (
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-bl-lg rounded-tr-lg px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Populární
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900">
                {plan.displayName}
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                {plan.description}
              </CardDescription>
              
              <div className="mt-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  <span className="text-slate-600 ml-2">
                    / {getPeriodText(plan.period)}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                {/* Zde budeme později přidávat konkrétní funkce podle typu plánu */}
                <div className="flex items-center text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Plný přístup ke všem funkcím</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>24/7 technická podpora</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Bezpečné cloudové uložiště</span>
                </div>
                {plan.price > 0 && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Prioritní zákaznická podpora</span>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-6">
              <GlassmorphicButton 
                className={cn(
                  "w-full py-3 font-semibold transition-all duration-200",
                  isPopular 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    : "bg-slate-900 hover:bg-slate-800"
                )}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.price === 0 ? 'Začít zdarma' : 'Vybrat plán'}
              </GlassmorphicButton>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
