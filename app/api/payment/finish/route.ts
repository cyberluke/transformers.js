import { NextRequest, NextResponse } from 'next/server';
import { paymentFinishWebhookSchema } from '@/lib/types/payment';
import { addUserTokens, getUserById } from '@/lib/db/actions/users';

export async function POST(request: NextRequest) {
  try {
    // Parsování a validace dat z externího serveru
    const body = await request.json();
    console.log('Raw payment webhook received:', body);

    const validatedData = paymentFinishWebhookSchema.parse(body);
    const { order_id, detail, apiKey } = validatedData;

    // Validace API klíče
    const expectedApiKey = process.env.PAY_API_KEY;
    if (!expectedApiKey) {
      console.error('PAY_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (apiKey !== expectedApiKey) {
      console.error('Invalid API key provided:', { provided: apiKey, expected: expectedApiKey });
      return NextResponse.json(
        { error: 'Neautorizovaný přístup' },
        { status: 401 }
      );
    }

    // Parsování detail JSON
    let parsedDetail;
    try {
      parsedDetail = JSON.parse(detail);
      console.log('Parsed payment detail:', parsedDetail);
    } catch (parseError) {
      console.error('Failed to parse detail JSON:', detail, parseError);
      return NextResponse.json(
        { error: 'Invalid detail format' },
        { status: 400 }
      );
    }

    console.log('Payment webhook processed successfully:', {
      order_id,
      parsedDetail,
      timestamp: new Date().toISOString(),
    });

    // Zkontroluj jestli parsed detail má user_id a plan_id
    if (parsedDetail && typeof parsedDetail === 'object' && 
        'user_id' in parsedDetail && 'plan_id' in parsedDetail) {
      
      const { user_id, plan_id } = parsedDetail;
      
      console.log('Processing token addition:', { user_id, plan_id });

      // Pokud je plan_id === "plan_first", přidej 10,000 tokenů
      if (plan_id === 'plan_first') {
        try {
          // Zkontroluj jestli uživatel existuje
          const user = await getUserById(user_id);
          if (user) {
            console.log(`Adding 10,000 tokens to user ${user_id} for plan_first`);
            
            const updatedUser = await addUserTokens(user_id, 10000);
            
            console.log(`Successfully added tokens. New balance: ${updatedUser.tokenBalance}`);
          } else {
            console.error(`User ${user_id} not found, cannot add tokens`);
          }
        } catch (tokenError) {
          console.error('Error adding tokens:', tokenError);
          // Pokračovat i přes chybu s tokeny - platba byla úspěšná
        }
      } else {
        console.log(`Plan ${plan_id} is not plan_first, no tokens added`);
      }
    } else {
      console.log('parsed detail is missing user_id or plan_id:', parsedDetail);
    }

    return NextResponse.json({ 
      status: 'ok',
      message: 'Payment processed successfully',
      url: process.env.PAY_SUCCESS_URL 
    });

  } catch (error) {
    console.error('Payment webhook error:', error);

    // Zod validation error
    if (error instanceof Error && 'issues' in error) {
      const zodError = error as any;
      console.error('Validation error:', zodError.issues);
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}