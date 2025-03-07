export const runtime = 'nodejs'; // Use Node.js runtime for JWT and MongoDB support
import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import connectDB from '@/lib/db';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await auth(req);
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days')) || 30;
    
    const now = new Date();
    const endDate = endOfDay(now);
    const startDate = startOfDay(subDays(now, days - 1));

    await connectDB();

    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered', 'paid', 'processing'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          orders: { $sum: 1 },
          revenue: { $sum: { $toDouble: '$totalPrice' } }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          orders: 1,
          revenue: 1,
          avgOrderValue: {
            $cond: [
              { $eq: ['$orders', 0] },
              0,
              { $divide: ['$revenue', '$orders'] }
            ]
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fill in missing dates with zero values
    const trends = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const existingData = dailyData.find(d => d.date === dateStr) || {
        orders: 0,
        revenue: 0,
        avgOrderValue: 0
      };

      trends.push({
        date: dateStr,
        orders: existingData.orders,
        revenue: existingData.revenue,
        avgOrderValue: existingData.avgOrderValue
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return apiResponse(trends);
  } catch (error) {
    console.error('Trends API Error:', error);
    return apiResponse({ error: 'Failed to fetch trends data' }, 500);
  }
}
