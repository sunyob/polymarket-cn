export interface Market {
  id: string;
  title: string;
  category: string;
  volume: number;
  yesPrice: number;
  noPrice: number;
  endDate: string;
  resolved: boolean;
}

export const mockMarkets: Market[] = [];
