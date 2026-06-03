import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { Transaction } from '@/types/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '未登录',
      }, { status: 401 });
    }

    const userData = serverDb.getUserData(userId);
    if (!userData) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取失败',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || !amount) {
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

    const newTransaction: Transaction = {
      id: Date.now().toString(36),
      type: 'deposit',
      amount: amount,
      description: '用户充值',
      createdAt: new Date().toISOString(),
    };

    const userData = serverDb.updateUserData(userId, {
      balance: (currentUserData.balance || 0) + amount,
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
      message: '充值成功',
      data: userData,
    });
  } catch (error) {
    console.error('更新用户数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新失败',
    }, { status: 500 });
  }
}
