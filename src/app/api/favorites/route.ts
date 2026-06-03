import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

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
      data: userData.favorites,
    });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取失败',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, market } = await request.json();

    if (!userId || !market) {
      return NextResponse.json({
        success: false,
        message: '参数错误',
      }, { status: 400 });
    }

    const userData = serverDb.addFavorite(userId, {
      ...market,
      addedAt: new Date().toISOString().split('T')[0],
    });

    if (!userData) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '收藏成功',
      data: userData.favorites,
    });
  } catch (error) {
    console.error('收藏失败:', error);
    return NextResponse.json({
      success: false,
      message: '收藏失败',
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const marketId = searchParams.get('marketId');

    if (!userId || !marketId) {
      return NextResponse.json({
        success: false,
        message: '参数错误',
      }, { status: 400 });
    }

    const userData = serverDb.removeFavorite(userId, marketId);

    if (!userData) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '取消收藏',
      data: userData.favorites,
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({
      success: false,
      message: '取消失败',
    }, { status: 500 });
  }
}
