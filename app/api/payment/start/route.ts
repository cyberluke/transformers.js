import { NextRequest, NextResponse } from 'next/server';
import { frontendPaymentSchema, type FrontendPaymentRequest } from '@/lib/types/payment';
import sdk from '@/lib/server/casdoor/main';
import { getUserIdFromAPI } from '@/lib/server/auth/api-auth';

export async function POST(request: NextRequest) {
  try {
    // Validace session a získání user ID
    const userIdResult = await getUserIdFromAPI(request);
    if (typeof userIdResult !== 'string') {
      return userIdResult; // Error response
    }
    const userId = userIdResult;

    // Parsování a validace dat z frontendu
    const body = await request.json();
    const validatedData = frontendPaymentSchema.parse(body);
    const { planId, billingInfo } = validatedData;

    // Načtení plánu z Casdoor pro získání ceny
    const { data: rawPlan } = await sdk.getPlan(planId);
    const selectedPlan = rawPlan.data as any;

    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plán nebyl nalezen nebo není aktivní' },
        { status: 404 }
      );
    }

    // Konverze ceny na haléře (pokud je v korunách)
    const amountInHalere = String(selectedPlan.price * 100);

    // Příprava dat pro externí ThePay API
    const paymentData = {
      amount: amountInHalere,
      name: selectedPlan.displayName,
      customer: {
        name: billingInfo.firstName,
        surname: billingInfo.lastName,
        email: billingInfo.email,
        billing_address: {
          city: billingInfo.city,
          zip: billingInfo.postalCode,
          street: billingInfo.address,
        }
      },
      success_url: `${process.env.PAY_SUCCESS_URL}/api/payment/finish`,
      description_for_merchant: `Předplatné ${selectedPlan.displayName}`,
      detail: JSON.stringify({
        user_id: userId,
        plan_id: planId,
      }),
    };

    // Volání externího ThePay API
    const apiKey = process.env.PAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chybí konfigurace API klíče' },
        { status: 500 }
      );
    }

    const externalResponse = await fetch(`${process.env.PAY_API_URL}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(paymentData),
    });

    if (!externalResponse.ok) {
      const errorData = await externalResponse.json().catch(() => ({}));
      console.error('ThePay API error:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Chyba při vytváření platby',
          message: errorData.error || 'Neočekávaná chyba'
        },
        { status: externalResponse.status }
      );
    }

    const paymentResult = await externalResponse.json();

    // Vrácení dat frontendu (zejména pay_url)
    return NextResponse.json({
      success: true,
      order_id: paymentResult.order_id,
      pay_url: paymentResult.pay_url,
    });

  } catch (error) {
    console.error('Payment start error:', error);

    // Zod validation error
    if (error instanceof Error && 'issues' in error) {
      const zodError = error as any;
      return NextResponse.json(
        {
          error: 'Neplatná vstupní data',
          details: zodError.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}
