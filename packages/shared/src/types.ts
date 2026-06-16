export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
