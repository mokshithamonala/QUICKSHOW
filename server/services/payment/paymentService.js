import { devSimulatedAdapter } from "./devSimulatedAdapter.js";
import { razorpayAdapter, isRazorpayConfigured } from "./razorpayAdapter.js";

/**
 * Modular payment provider selector.
 * Configured via PAYMENT_MODE=simulated (default) so no Razorpay credentials
 * are required in development. Simulated transactions are strictly isolated
 * and can never be treated as real Razorpay transactions.
 */
export const getPaymentAdapter = () => {
  const requestedMode = (process.env.PAYMENT_MODE || "simulated").trim().toLowerCase();

  if (requestedMode === "simulated" || requestedMode === "dev_simulated") {
    return devSimulatedAdapter;
  }

  if (requestedMode === "razorpay_test" && isRazorpayConfigured()) {
    return razorpayAdapter;
  }

  return devSimulatedAdapter;
};

export const getPaymentStatusInfo = () => {
  const adapter = getPaymentAdapter();
  return {
    paymentMode: adapter.isSimulated ? "simulated" : "razorpay_test",
    provider: adapter.provider,
    mode: adapter.mode,
    isSimulated: adapter.isSimulated,
    isRealTransaction: !adapter.isSimulated,
    razorpayConfigured: isRazorpayConfigured(),
  };
};
