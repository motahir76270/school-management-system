
import Easebuzz, {initializeEasebuzzCheckout }  from 'react-native-easebuzz-sdk';

export const EasebuzzTransaction = async (data: any) => {
  try {
    // The SDK only needs the access key and pay mode as strings
    const accessKey = data.key
    const payMode = "tes"
    const txnid = data.id;
    const amount = data.amount


    // const option ={
    //    accessKey:String(data.key),
    //    payMode:"test",
    //    txnid:data.order_id,
    //    amount : data?.amount
    // }

    
 
    // Correct: Passing strings, not an object
    const response = await initializeEasebuzzCheckout(accessKey , payMode);
    
    const parsedData = await JSON.parse(response as any);
    console.log(parsedData);
    
    
    return {
      success: parsedData?.payment_response?.success,
      data:parsedData?.payment_response,
    };
  } catch (error: any) {
    let errorMessage = "Payment was cancelled.";
    console.log(error);

    switch (error?.code) {
      case "PAYMENT_CANCELLED":
        errorMessage = "Payment was cancelled by the user.";
        break;

      case "NETWORK_ERROR":
        errorMessage = "Network error. Please check your internet connection.";
        break;

      case "PAYMENT_FAILED":
        errorMessage = error?.message || "Payment failed. Please try again.";
        break;

      default:
        errorMessage = error?.message || error?.description || "Something went wrong.";
    }

    return {
      success: false,
      error: {
        code: error?.code ?? "UNKNOWN_ERROR",
        message: errorMessage,
        details: error,
      },
    };
  }
};