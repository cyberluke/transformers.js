import sdk from '@/lib/server/casdoor/main';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';

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

export default async function SubscriptionPage() {
  try {
    const rawData = await sdk.getPlans();
    const data = rawData.data;
    const rawPlans = data.data;
    const plans = Array.isArray(rawPlans) ? rawPlans : [];
    
    // Filtrujeme pouze aktivní plány
    const activePlans = plans.filter(plan => plan.isEnabled);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Vyberte si váš plán
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Najděte perfektní plán pro vaše potřeby. Všechny plány zahrnují nejmodernější funkce a plnou podporu.
            </p>
          </div>
          
          <SubscriptionPlans plans={activePlans} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Chyba při načítání plánů:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Chyba při načítání plánů
          </h1>
          <p className="text-slate-600">
            Omlouváme se, nepodařilo se načíst dostupné plány. Zkuste to prosím později.
          </p>
        </div>
      </div>
    );
  }
}
