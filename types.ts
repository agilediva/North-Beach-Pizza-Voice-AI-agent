export type PizzaSize = 'Slice' | 'Whole Pie';

export interface OrderItem {
  pizzaName: string;
  size: PizzaSize;
  quantity: number;
  price: number;
}

export interface OrderState {
  customerName: string;
  items: OrderItem[];
  paymentMethod: 'Cash' | 'Credit Card' | null;
  status: 'Greeting' | 'Ordering' | 'Confirming' | 'Completed';
  total: number;
}

export interface MenuItem {
  name: string;
  description: string;
}

export interface VisualizerState {
  isSpeaking: boolean;
  volume: number;
}