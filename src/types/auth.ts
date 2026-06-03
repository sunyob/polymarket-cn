export interface User {
  id: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithBalance extends User {
  balance: number;
}

export interface VerificationCode {
  phone: string;
  code: string;
  expiresAt: number;
}

export interface FavoriteMarket {
  id: string;
  title: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  endDate: string;
  addedAt: string;
  resolved: boolean;
}

export interface Bet {
  id: string;
  marketId: string;
  marketTitle: string;
  type: 'YES' | 'NO';
  amount: number;
  price: number;
  shares: number;
  status: 'active' | 'won' | 'lost';
  createdAt: string;
  resolvedAt?: string;
  profit?: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'bet' | 'win' | 'withdraw';
  amount: number;
  description: string;
  createdAt: string;
}

export interface UserData {
  updatedAt?: string;
  user: User;
  balance: number;
  favorites: FavoriteMarket[];
  bets: Bet[];
  transactions: Transaction[];
}
