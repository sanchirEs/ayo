// Error message mapping for authentication and validation errors
export const errorMessages = {
  // NextAuth specific errors - only translate these technical errors
  'CredentialsSignin': 'Нэвтрэх мэдээлэл буруу байна',
  'invalid_credentials': 'Нэвтрэх мэдээлэл буруу байна',
  'Validation error': 'Оруулсан мэдээлэл буруу байна',
  'ValidationError': 'Оруулсан мэдээлэл буруу байна',
  
  // Validation error messages (English to Mongolian)
  'Password must contain at least one special character': 'Нууц үг дор хаяж 1 тусгай тэмдэгттэй байх ёстой',
  'Password must contain at least one uppercase letter': 'Нууц үг дор хаяж 1 том үсэгтэй байх ёстой',
  'Password must contain at least one number': 'Нууц үг дор хаяж 1 тоотой байх ёстой',
  'Password must be at least 6 characters long': 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой',
  'Email is required': 'И-мэйл заавал шаардлагатай',
  'Email must be a valid email': 'И-мэйл буруу байна',
  'Username is required': 'Хэрэглэгчийн нэр заавал шаардлагатай',
  'Username must be at least 3 characters': 'Хэрэглэгчийн нэр хамгийн багадаа 3 тэмдэгт',
  'First name is required': 'Нэр заавал шаардлагатай',
  'Last name is required': 'Овог заавал шаардлагатай',
  'Phone number is required': 'Утасны дугаар заавал шаардлагатай',
  'Phone number must be at least 8 characters': 'Утасны дугаар хамгийн багадаа 8 тэмдэгт',
  
  // Network and system errors
  'Network Error': 'Сүлжээний алдаа гарлаа',
  'Failed to fetch': 'Сервертэй холбогдох боломжгүй байна',
  'BACKEND_URL is not configured': 'Серверийн тохиргоо дутуу байна',
  'Authentication required': 'Нэвтрэх шаардлагатай',
  'Invalid TOKEN': 'Хүчинтэй бус токен',
  
  // Generic fallbacks
  'Server error': 'Серверийн алдаа гарлаа',
  'Internal server error': 'Серверийн дотоод алдаа',
  'Bad Request': 'Буруу хүсэлт',
  'Unauthorized': 'Эрх байхгүй',
  'Forbidden': 'Хандах эрх байхгүй',
  'Not Found': 'Олдсонгүй',
  'Method Not Allowed': 'Зөвшөөрөгдөөгүй арга',
  'Request Timeout': 'Хүсэлт хэт удаан',
  'Too Many Requests': 'Хэт олон хүсэлт',
  'Service Unavailable': 'Үйлчилгээ ашиглах боломжгүй',
};

// Function to get localized error message
export function getLocalizedErrorMessage(error) {
  if (!error) return 'Тодорхойгүй алдаа гарлаа';
  
  // If it's an error object, try to extract the message
  let errorMessage = error;
  if (typeof error === 'object') {
    // Check for NextAuth error structure: { error: 'CredentialsSignin', code: 'Backend message' }
    errorMessage = error.code || error.message || error.error || error.toString();
  }
  
  // Convert to string and trim
  errorMessage = String(errorMessage).trim();
  
  // FIRST: Check if it's already in Mongolian (Cyrillic characters)
  if (/[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]/.test(errorMessage)) {
    // Contains Cyrillic characters (likely Mongolian) - return as is
    return errorMessage;
  }
  
  // SECOND: Check if we have a direct mapping for technical errors
  if (errorMessages[errorMessage]) {
    return errorMessages[errorMessage];
  }
  
  // THIRD: Check for partial matches (case insensitive) for technical errors
  const lowerErrorMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(errorMessages)) {
    if (key.toLowerCase().includes(lowerErrorMessage) || lowerErrorMessage.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // FOURTH: If no mapping found and not Mongolian, provide a generic fallback
  return 'Алдаа гарлаа. Дахин оролдоно уу.';
}

// Function to handle API errors specifically
export function handleApiError(error) {
  console.error('API Error:', error);
  
  // Handle different types of errors - prioritize backend messages
  if (error?.response?.data?.message) {
    return getLocalizedErrorMessage(error.response.data.message);
  }
  
  if (error?.response?.data?.error) {
    return getLocalizedErrorMessage(error.response.data.error);
  }
  
  if (error?.message) {
    return getLocalizedErrorMessage(error.message);
  }
  
  if (typeof error === 'string') {
    return getLocalizedErrorMessage(error);
  }
  
  return 'Тодорхойгүй алдаа гарлаа';
}
