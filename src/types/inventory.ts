
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
