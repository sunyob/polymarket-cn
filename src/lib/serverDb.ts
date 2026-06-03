import { User, VerificationCode, UserData, FavoriteMarket } from '@/types/auth';

interface ServerStore {
  users: Record<string, User>;
  verificationCodes: Record<string, VerificationCode>;
  userData: Record<string, UserData>;
}

// 服务器端内存存储（生产环境应该使用数据库）
let store: ServerStore = {
  users: {},
  verificationCodes: {},
  userData: {},
};

export class ServerDatabase {
  // 用户管理
  createUser(phone: string): User {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const user: User = {
      id,
      phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users[id] = user;

    // 初始化用户数据
    const userData: UserData = {
      user,
      balance: 5000,
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
    store.userData[id] = userData;

    return user;
  }

  getUserByPhone(phone: string): User | null {
    return Object.values(store.users).find(u => u.phone === phone) || null;
  }

  getUserById(id: string): User | null {
    return store.users[id] || null;
  }

  // 验证码管理
  saveVerificationCode(phone: string, code: string): void {
    store.verificationCodes[phone] = {
      phone,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
  }

  verifyCode(phone: string, code: string): boolean {
    const stored = store.verificationCodes[phone];
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) return false;
    return stored.code === code;
  }

  // 用户数据管理
  getUserData(userId: string): UserData | null {
    return store.userData[userId] || null;
  }

  updateUserData(userId: string, update: Partial<UserData>): UserData | null {
    if (!store.userData[userId]) return null;
    store.userData[userId] = {
      ...store.userData[userId],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return store.userData[userId];
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
}

export const serverDb = new ServerDatabase();
