import { POST as createCheckoutPOST } from '../create-checkout/route';

export async function POST(req: Request) {
  return createCheckoutPOST(req);
}
