import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { Transaction } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const { userId, marketId, marketTitle, betType, amount, price } = await request.json();

    if (!userId || !marketId || !betType || !amount || !price) {
      return NextResponse.json({
        success: false,
        message: '参数错误',
      }, { status: 400 });
    }

    const currentUserData = serverDb.getUserData(userId);
    if (!currentUserData) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
      }, { status: 404 });
    }

    if (currentUserData.balance < amount) {
      return NextResponse.json({
        success: false,
        message: '余额不足',
      }, { status: 400 });
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(36),
      type: 'bet',
      amount: amount,
      description: `下注「${marketTitle}」${betType === 'YES' ? '买是' : '买否'} @¥${price}`,
      createdAt: new Date().toISOString(),
    };

    const userData = serverDb.updateUserData(userId, {
      balance: currentUserData.balance - amount,
      transactions: [...currentUserData.transactions, newTransaction],
    });

    if (!userData) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '下注成功',
      data: userData,
    });
  } catch (error) {
    console.error('下注失败:', error);
    return NextResponse.json({
      success: false,
      message: '下注失败',
    }, { status: 500 });
  }
}
