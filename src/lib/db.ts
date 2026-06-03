import { User, VerificationCode, UserData, FavoriteMarket, Bet, Transaction } from '@/types/auth';

const DB_KEYS = {
  USERS: 'pm_users',
  VERIFICATION_CODES: 'pm_verification_codes',
  USER_DATA: 'pm_user_data',
};

export class Database {
  private getStore(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setStore(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // 用户管理
  createUser(phone: string): User {
    const users = this.getStore(DB_KEYS.USERS);
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const user: User = {
      id,
      phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users[id] = user;
    this.setStore(DB_KEYS.USERS, users);

    // 初始化用户数据
    const userData: UserData = {
      user,
      balance: 5000, // 初始资金
      favorites: [],
      bets: [],
      transactions: [
        {
          id: Date.now().toString(36),
          type: 'deposit',
          amount: 5000,
          description: '新用户注册赠送',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    const userDataStore = this.getStore(DB_KEYS.USER_DATA);
    userDataStore[id] = userData;
    this.setStore(DB_KEYS.USER_DATA, userDataStore);

    return user;
  }

  getUserByPhone(phone: string): User | null {
    const users = this.getStore(DB_KEYS.USERS);
    return (Object.values(users).find((u: any) => u.phone === phone) as User) || null;
  }

  getUserById(id: string): User | null {
    const users = this.getStore(DB_KEYS.USERS);
    return users[id] || null;
  }

  // 验证码管理
  saveVerificationCode(phone: string, code: string): void {
    const codes = this.getStore(DB_KEYS.VERIFICATION_CODES);
    codes[phone] = {
      phone,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5分钟过期
    };
    this.setStore(DB_KEYS.VERIFICATION_CODES, codes);
  }

  verifyCode(phone: string, code: string): boolean {
    const codes = this.getStore(DB_KEYS.VERIFICATION_CODES);
    const stored = codes[phone];
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) return false;
    return stored.code === code;
  }

  // 用户数据管理
  getUserData(userId: string): UserData | null {
    const userDataStore = this.getStore(DB_KEYS.USER_DATA);
    return userDataStore[userId] || null;
  }

  updateUserData(userId: string, update: Partial<UserData>): UserData | null {
    const userDataStore = this.getStore(DB_KEYS.USER_DATA);
    if (!userDataStore[userId]) return null;
    userDataStore[userId] = {
      ...userDataStore[userId],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    this.setStore(DB_KEYS.USER_DATA, userDataStore);
    return userDataStore[userId];
  }

  // 收藏管理
  addFavorite(userId: string, market: FavoriteMarket): UserData | null {
    const userData = this.getUserData(userId);
    if (!userData) return null;
    if (userData.favorites.find(f => f.id === market.id)) return userData;
    userData.favorites.push(market);
    return this.updateUserData(userId, { favorites: userData.favorites });
  }

  removeFavorite(userId: string, marketId: string): UserData | null {
    const userData = this.getUserData(userId);
    if (!userData) return null;
    userData.favorites = userData.favorites.filter(f => f.id !== marketId);
    return this.updateUserData(userId, { favorites: userData.favorites });
  }

  // 下注管理
  placeBet(userId: string, bet: Omit<Bet, 'id' | 'createdAt'>): UserData | null {
    const userData = this.getUserData(userId);
    if (!userData) return null;
    if (userData.balance < bet.amount) return null;

    const newBet: Bet = {
      ...bet,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
    };
    userData.bets.push(newBet);
    userData.balance -= bet.amount;
    
    userData.transactions.push({
      id: Date.now().toString(36),
      type: 'bet',
      amount: -bet.amount,
      description: `下注 ${bet.marketTitle} - ${bet.type}`,
      createdAt: new Date().toISOString(),
    });

    return this.updateUserData(userId, userData);
  }

  // 余额管理
  updateBalance(userId: string, amount: number, description: string): UserData | null {
    const userData = this.getUserData(userId);
    if (!userData) return null;
    userData.balance += amount;
    userData.transactions.push({
      id: Date.now().toString(36),
      type: amount > 0 ? 'deposit' : 'withdraw',
      amount,
      description,
      createdAt: new Date().toISOString(),
    });
    return this.updateUserData(userId, userData);
  }
}

export const db = new Database();
