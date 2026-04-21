// Currency utility for Nigerian Naira (NGN)
export const USD_TO_NGN = 1500;

export const formatPrice = (
  priceInUSD: number,
  isFree: boolean = false,
): string => {
  if (isFree) return "Free";

  const priceInNaira = priceInUSD * USD_TO_NGN;
  return `₦${priceInNaira.toLocaleString("en-NG")}`;
};

// For courses without a price field, use default
export const getCoursePrice = (course: any): string => {
  if (course.isFree) return "Free";

  const priceInUSD = course.price || 49.99; // Default price if not set
  return formatPrice(priceInUSD, false);
};
