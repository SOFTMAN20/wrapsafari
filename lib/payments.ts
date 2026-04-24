/**
 * Payment Provider Abstraction Layer
 * 
 * Supports multiple payment providers (Snippe.sh, AzamPay, Stripe)
 * with a unified interface for SafariWrap.
 */

// Payment provider types
export type PaymentProvider = 'snippesh' | 'azampay' | 'stripe';

// Webhook event structure (provider-agnostic)
export interface WebhookEvent {
  provider: PaymentProvider;
  eventType: 'payment.completed' | 'payment.failed' | 'payment.pending' | 'payment.refunded';
  paymentId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  customer: {
    email: string;
    phone?: string;
    name?: string;
  };
  metadata?: Record<string, any>;
  completedAt?: Date;
  rawEvent: any;
}

// Provider configuration
export interface ProviderConfig {
  apiKey: string;
  webhookSecret: string;
  environment: 'test' | 'production';
}

// Payment provider interface
export interface IPaymentProvider {
  name: PaymentProvider;
  verifyWebhookSignature(body: string, signature: string, secret: string): boolean;
  parseWebhookEvent(body: string): WebhookEvent;
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResponse>;
}

// Checkout session parameters
export interface CheckoutSessionParams {
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
}

// Checkout session response
export interface CheckoutSessionResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Get the configured payment provider
 */
export function getPaymentProvider(): IPaymentProvider {
  const provider = (process.env.PAYMENT_PROVIDER || 'snippesh') as PaymentProvider;
  
  switch (provider) {
    case 'snippesh':
      return new SnippeShProvider();
    case 'azampay':
      return new AzamPayProvider();
    case 'stripe':
      return new StripeProvider();
    default:
      return new SnippeShProvider();
  }
}

/**
 * Get provider configuration from environment
 */
export function getProviderConfig(): ProviderConfig {
  return {
    apiKey: process.env.PAYMENT_API_KEY || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
    environment: (process.env.PAYMENT_ENVIRONMENT || 'test') as 'test' | 'production',
  };
}

/**
 * Snippe.sh Payment Provider
 */
class SnippeShProvider implements IPaymentProvider {
  name: PaymentProvider = 'snippesh';

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    // Snippe.sh signature verification
    // TODO: Implement actual signature verification based on Snippe.sh docs
    if (!signature || !secret) return false;
    
    // For now, basic check (replace with actual HMAC verification)
    return signature.length > 0;
  }

  parseWebhookEvent(body: string): WebhookEvent {
    const event = JSON.parse(body);
    
    // Map Snippe.sh event to our unified format
    return {
      provider: 'snippesh',
      eventType: this.mapEventType(event.type || event.event),
      paymentId: event.payment_id || event.id,
      amount: event.amount,
      currency: event.currency || 'TZS',
      status: this.mapStatus(event.status),
      customer: {
        email: event.customer?.email || event.email,
        phone: event.customer?.phone || event.phone,
        name: event.customer?.name || event.name,
      },
      metadata: event.metadata,
      completedAt: event.completed_at ? new Date(event.completed_at) : undefined,
      rawEvent: event,
    };
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResponse> {
    const config = getProviderConfig();
    
    try {
      const response = await fetch('https://api.snippe.sh/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
          metadata: params.metadata,
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create checkout session',
        };
      }

      return {
        success: true,
        checkoutUrl: data.checkout_url,
        sessionId: data.session_id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  private mapEventType(type: string): WebhookEvent['eventType'] {
    const typeMap: Record<string, WebhookEvent['eventType']> = {
      'payment.completed': 'payment.completed',
      'payment.succeeded': 'payment.completed',
      'payment.failed': 'payment.failed',
      'payment.pending': 'payment.pending',
      'payment.refunded': 'payment.refunded',
    };
    return typeMap[type] || 'payment.pending';
  }

  private mapStatus(status: string): WebhookEvent['status'] {
    const statusMap: Record<string, WebhookEvent['status']> = {
      'completed': 'completed',
      'succeeded': 'completed',
      'failed': 'failed',
      'pending': 'pending',
      'refunded': 'refunded',
    };
    return statusMap[status] || 'pending';
  }
}

/**
 * AzamPay Payment Provider
 */
class AzamPayProvider implements IPaymentProvider {
  name: PaymentProvider = 'azampay';

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    // AzamPay signature verification
    // TODO: Implement based on AzamPay docs
    return signature.length > 0;
  }

  parseWebhookEvent(body: string): WebhookEvent {
    const event = JSON.parse(body);
    
    return {
      provider: 'azampay',
      eventType: this.mapEventType(event.transactionStatus),
      paymentId: event.transactionId,
      amount: event.amount,
      currency: event.currency || 'TZS',
      status: this.mapStatus(event.transactionStatus),
      customer: {
        email: event.customerEmail,
        phone: event.customerPhone,
        name: event.customerName,
      },
      metadata: event.metadata,
      completedAt: event.completedAt ? new Date(event.completedAt) : undefined,
      rawEvent: event,
    };
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResponse> {
    // TODO: Implement AzamPay checkout session creation
    return {
      success: false,
      error: 'AzamPay integration not yet implemented',
    };
  }

  private mapEventType(status: string): WebhookEvent['eventType'] {
    const typeMap: Record<string, WebhookEvent['eventType']> = {
      'success': 'payment.completed',
      'failed': 'payment.failed',
      'pending': 'payment.pending',
    };
    return typeMap[status] || 'payment.pending';
  }

  private mapStatus(status: string): WebhookEvent['status'] {
    const statusMap: Record<string, WebhookEvent['status']> = {
      'success': 'completed',
      'failed': 'failed',
      'pending': 'pending',
    };
    return statusMap[status] || 'pending';
  }
}

/**
 * Stripe Payment Provider
 */
class StripeProvider implements IPaymentProvider {
  name: PaymentProvider = 'stripe';

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    // Stripe signature verification
    // TODO: Use Stripe SDK for proper verification
    return signature.length > 0;
  }

  parseWebhookEvent(body: string): WebhookEvent {
    const event = JSON.parse(body);
    
    return {
      provider: 'stripe',
      eventType: this.mapEventType(event.type),
      paymentId: event.data.object.id,
      amount: event.data.object.amount / 100, // Stripe uses cents
      currency: event.data.object.currency.toUpperCase(),
      status: this.mapStatus(event.data.object.status),
      customer: {
        email: event.data.object.receipt_email || event.data.object.customer_email,
      },
      metadata: event.data.object.metadata,
      completedAt: event.data.object.created ? new Date(event.data.object.created * 1000) : undefined,
      rawEvent: event,
    };
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResponse> {
    // TODO: Implement Stripe checkout session creation
    return {
      success: false,
      error: 'Stripe integration not yet implemented',
    };
  }

  private mapEventType(type: string): WebhookEvent['eventType'] {
    const typeMap: Record<string, WebhookEvent['eventType']> = {
      'payment_intent.succeeded': 'payment.completed',
      'payment_intent.payment_failed': 'payment.failed',
      'payment_intent.processing': 'payment.pending',
      'charge.refunded': 'payment.refunded',
    };
    return typeMap[type] || 'payment.pending';
  }

  private mapStatus(status: string): WebhookEvent['status'] {
    const statusMap: Record<string, WebhookEvent['status']> = {
      'succeeded': 'completed',
      'failed': 'failed',
      'processing': 'pending',
      'requires_payment_method': 'pending',
    };
    return statusMap[status] || 'pending';
  }
}
