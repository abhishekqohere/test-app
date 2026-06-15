type CheckoutInput = {
  userId: string;
  planId: string;
  amountCents: number;
};

type CheckoutSession = {
  provider: "stripe";
  checkoutUrl: string;
  amountCents: number;
  status: "pending";
};

const billingLedger: CheckoutSession[] = [];

export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<CheckoutSession> {
  const session: CheckoutSession = {
    provider: "stripe",
    checkoutUrl: `https://checkout.example.test/${input.userId}/${input.planId}`,
    amountCents: input.amountCents,
    status: "pending",
  };

  billingLedger.push(session);

  return session;
}

export function listCheckoutSessions() {
  return billingLedger;
}
