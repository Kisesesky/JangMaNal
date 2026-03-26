export type CartSummary = {
  totalAmount: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImageUrl: string | null;
    mart: string;
    price: number;
    quantity: number;
    amount: number;
  }>;
};
