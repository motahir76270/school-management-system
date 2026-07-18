import { images } from "@/constants/string";
import { Colors } from "@/constants/theme";
import RazorpayCheckout from "react-native-razorpay";


export const RazzorPayTransaction = async (data: any) => {
  try {
    // Validate required fields
    if (!data?.key) {
      throw new Error("Razorpay key is required");
    }
    // Get primary color from theme
    const primaryColor = Colors?.light?.primary || Colors?.dark?.primary || "#0D6EFD";

    const options = {
      currency: data?.currency || 'INR',
      image:images.assignment,
      key: data?.key,
      amount: Math.round(Number(data.amount) * 100),
      name: data?.school_name,
      order_id: data?.order_id,
      description: data?.fee_name,
      theme: {
        color: primaryColor
      },
     prefill: {
        email: 'user@example.com',
        contact: '9999999999',
      },
    };
    
    
    // Open Razorpay checkout and wait for response
    const paymentData: any = await RazorpayCheckout.open(options as any);
     
    // Return the payment data
    return {
      success: true,
      data: paymentData
    };
    
  } catch (error: any) {
    // Handle different error types
    let errorMessage = "Payment was cancelled by user"
    if (error?.code) {
      switch (error.code) {
        case "UNKNOWN_ERROR":
          errorMessage = "Payment was cancelled by user";
          break;
        case "NETWORK_ERROR":
          errorMessage = "Network error. Please check your internet connection";
          break;
        case "PAYMENT_FAILED":
          errorMessage = error.description || "Payment failed. Please try again";
          break;
        default:
          errorMessage = error.description || error.message || errorMessage;
      }
    }
    
    // Return error object
    return {
      success: false,
      error: {
        code: error?.code || "UNKNOWN_ERROR",
        message: errorMessage,
        details: error
      }
    };
  }
};

