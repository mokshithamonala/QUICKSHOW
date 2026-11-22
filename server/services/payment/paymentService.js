import { devSimulatedAdapter } from "./devSimulatedAdapter.js";
import {
  razorpayAdapter,
  razorpayLiveAdapter,
  isRazorpayConfigured,
  isRazorpayTestModeReady,
  isRazorpayLiveKey,
  isRazorpayWebhookConfigured,
} from "./razorpayAdapter.js";

/**
 * Modular payment provider selector.
 * - PAYMENT_MODE=razorpay_test (when rzp_test_* credentials are configured): Razorpay Test Mode
 * - PAYMENT_MODE=razorpay_live (future production switch via env only with rzp_live_* keys)
 * - PAYMENT_MODE=simulated (offline development fallback with no Razorpay keys)
 */
export const getPaymentAdapter = () => {
  const requestedMode = (process.env.PAYMENT_MODE || "razorpay_test").trim().toLowerCase();

  if (requestedMode === "simulated" || requestedMode === "dev_simulated") {
    return devSimulatedAdapter;
  }

  if (requestedMode === "razorpay_live" && isRazorpayConfigured() && isRazorpayLiveKey()) {
    return razorpayLiveAdapter;
  }

  if (requestedMode === "razorpay_test" && isRazorpayTestModeReady()) {
    return razorpayAdapter;
  }

  // Fallback safely to simulated adapter if Razorpay credentials are missing
  return devSimulatedAdapter;
};

export const getPaymentStatusInfo = () => {
  const adapter = getPaymentAdapter();
  const isTestMode = Boolean(adapter.isTestMode || adapter.provider === "razorpay_test");

  return {
    paymentMode: adapter.provider,
    provider: adapter.provider,
    mode: adapter.mode,
    isSimulated: Boolean(adapter.isSimulated),
    isTestMode,
    isRealTransaction: Boolean(adapter.isRealTransaction),
    razorpayConfigured: isRazorpayConfigured(),
    razorpayTestModeReady: isRazorpayTestModeReady(),
    webhookSecretConfigured: isRazorpayWebhookConfigured(),
    webhookEndpoint: "/api/razorpay/webhook",
  };
};
