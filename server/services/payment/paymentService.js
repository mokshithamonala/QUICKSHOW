import { devSimulatedAdapter } from "./devSimulatedAdapter.js";
import { razorpayAdapter, isRazorpayConfigured } from "./razorpayAdapter.js";

/**
 * Modular payment provider selector.
 * Currently defaults exclusively to Development Simulated Mode unless
 * PAYMENT_MODE="razorpay_test" is explicitly set AND Razorpay test keys exist.
 */
export const getPaymentAdapter = () => {
  const requestedMode = (process.env.PAYMENT_MODE || "dev_simulated").toLowerCase();

  if (requestedMode === "razorpay_test" && isRazorpayConfigured()) {
    return razorpayAdapter;
  }

  return devSimulatedAdapter;
};

export const getPaymentStatusInfo = () => {
  const adapter = getPaymentAdapter();
  return {
    provider: adapter.provider,
    mode: adapter.mode,
    isSimulated: adapter.isSimulated,
    razorpayConfigured: isRazorpayConfigured(),
  };
};
