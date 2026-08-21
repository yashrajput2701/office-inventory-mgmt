export type Role = 'CREATOR' | 'PURCHASER';
export type OrderStatus = 'DRAFT' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED';

export interface OrderItem {
  id: number | null;
  itemName: string;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  expiryDate: string;
  createdAt: string;
  submittedAt: string | null;
  resolvedAt: string | null;
  createdByUsername: string;
  createdByFullName: string;
  createdById: number;
  resolvedByUsername: string | null;
  txnReference: string | null;
  purchaserNote: string | null;
  items: OrderItem[];
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  role: Role;
}

export interface CurrentUser {
  userId: number;
  username: string;
  fullName: string;
  role: Role;
}
