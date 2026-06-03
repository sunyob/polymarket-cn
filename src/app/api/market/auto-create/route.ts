import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Market {
  id: string;
  title: string;
  category: string;
  volume: number;
  yesPrice: number;
  noPrice: number;
  endDate: string;
  resolved: boolean;
}

function generateId(): string {
  return 'm' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function generateRandomVolume(): number {
  return Math.floor(Math.random() * 60000) + 10000;
}

function generateRandomPrice(): { yesPrice: number; noPrice: number } {
  const yesPrice = Math.round((Math.random() * 0.6 + 0.2) * 100) / 100;
  return { yesPrice, noPrice: Math.round((1 - yesPrice) * 100) / 100 };
}

function generateEndDate(): string {
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
  return futureDate.toISOString().split('T')[0];
}

async function generateMarketsWithGemini(count: number = 30): Promise<Market[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `你是一个预测市场的AI助手。请生成${count}个独特的、有新闻价值的预测市场问题。

要求：
1. 问题要涉及全球热点话题（科技、经济、政治、体育、娱乐等）
2. 每个问题必须是未来可能发生的事件
3. 问题要简洁明了，控制在25字以内
4. 只返回JSON数组，不要任何其他文字

返回格式必须是JSON数组，每个元素格式如下：
{
  "title": "问题内容",
  "category": "分类"
}

只返回JSON数组，不要markdown代码块标记，直接返回纯JSON。`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonStr = text.trim();
    // 移除可能的 markdown 代码块标记
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      throw new Error('Parsed result is not an array');
    }

    return parsed.slice(0, count).map((item: any) => {
      const prices = generateRandomPrice();
      return {
        id: generateId(),
        title: item.title || item.question || String(item),
        category: item.category || '综合',
        volume: generateRandomVolume(),
        yesPrice: prices.yesPrice,
        noPrice: prices.noPrice,
        endDate: generateEndDate(),
        resolved: false,
      };
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    // 如果 Gemini 调用失败，使用备用数据
    return getFallbackMarkets();
  }
}

function getFallbackMarkets(): Market[] {
  return [
    { id: generateId(), title: '比特币能否在 2026 年底前突破 10 万美元？', category: '加密货币', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '美联储能否在 2026 年下半年开始降息？', category: '宏观经济', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '2026 年全球新能源汽车销量能否突破 4000 万辆？', category: '新能源', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '特斯拉能否在 2026 年实现年产 2000 万辆？', category: '新能源', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '中国 GDP 增速能否在 2026 年达到 5.5% 以上？', category: '宏观经济', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '国产 AI 芯片能否在 2026 年实现 7nm 量产？', category: '科技/半导体', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '苹果公司能否在 2026 年底前发布首款 AR 头显？', category: '科技/消费电子', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: 'OpenAI 能否在 2026 年推出 GPT-5 模型？', category: 'AI/大模型', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '2026 年中国出境游人数能否恢复至疫情前水平？', category: '旅游', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '英伟达下季度财报营收能否突破 400 亿美元？', category: '科技/半导体', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '小米汽车能否在 2026 年实现年销量 30 万辆？', category: '新能源', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: 'Meta 能否在 2026 年实现元宇宙业务盈利？', category: '科技/元宇宙', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '国际高科技出口管制磋商能否在 2026 年 9 月前达成妥协？', category: '宏观经济', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '2028 洛杉矶奥运会能否如期举办？', category: '体育', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: 'SpaceX 星舰下一次轨道试飞能否成功实现完全回收？', category: '航天航空', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '欧盟碳边境税能否在 2026 年正式生效？', category: '政策/环保', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '2026 年世界杯冠军能否是南美球队？', category: '体育', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '亚马逊股价能否在 2026 年底前创新高？', category: '股票', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '自动驾驶能否在 2026 年实现大规模商业化落地？', category: '科技/自动驾驶', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '人民币汇率能否在 2026 年底前回升至 6.5 以下？', category: '宏观经济', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: 'TikTok 能否在 2026 年保持全球短视频市场第一？', category: '科技/互联网', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '中国股市能否在 2026 年突破 4000 点？', category: '股票', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '全球 5G 用户数量能否在 2026 年突破 50 亿？', category: '科技/通信', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '量子计算能否在 2026 年实现商业化突破？', category: '科技/量子计算', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '2026 年全球智能手机出货量能否恢复正增长？', category: '科技/消费电子', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '英国能否在 2026 年再次公投脱欧问题？', category: '政治', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '绿色能源能否在 2026 年占全球能源消费 40%？', category: '政策/环保', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '全球 AI 专利申请数量能否在 2026 年翻倍？', category: 'AI/大模型', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '2026 年中国电影票房能否突破 800 亿？', category: '娱乐', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
    { id: generateId(), title: '全球 VR/AR 设备销量能否在 2026 年突破 1 亿台？', category: '科技/元宇宙', volume: generateRandomVolume(), ...generateRandomPrice(), endDate: generateEndDate(), resolved: false },
  ];
}

// 缓存生成的 markets
let cachedMarkets: Market[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟缓存

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);

  // 检查缓存
  const now = Date.now();
  if (!cachedMarkets || now - cacheTime > CACHE_DURATION) {
    cachedMarkets = await generateMarketsWithGemini(30);
    cacheTime = now;
  }

  const allMarkets = cachedMarkets;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  const sorted = [...allMarkets].sort((a, b) => b.volume - a.volume);
  const pagedData = sorted.slice(start, end);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  return NextResponse.json({
    success: true,
    message: 'OK',
    data: pagedData,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: sorted.length,
      itemsPerPage: ITEMS_PER_PAGE,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
}
