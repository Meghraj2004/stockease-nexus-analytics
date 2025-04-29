
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  reorderLevel: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Helper function for rupee formatting
export const formatToRupees = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};
