import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import connectDB from '@/lib/db';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function GET(req) {
  try {
    await auth(req);
    await connectDB();

    // Get date from query params or use current date
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    // Calculate date ranges for current and previous periods
    const endDate = endOfDay(date);
    const startDate = startOfDay(subDays(date, 30));
    const previousEndDate = startOfDay(subDays(date, 31));
    const previousStartDate = startOfDay(subDays(date, 60));

    console.log('Date ranges:', {
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    });

    // Add this right after connectDB();
    const sampleOrder = await Order.findOne({
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
    console.log('Sample Order:', JSON.stringify(sampleOrder, null, 2));

    // First, let's check if we have any orders at all
    const totalOrders = await Order.countDocuments({});
    console.log('Total orders in database:', totalOrders);

    // Check orders within our date range
    const ordersInRange = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    console.log('Orders in current date range:', ordersInRange);

    // Check orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Orders by status:', ordersByStatus);

    // Get current period data
    const currentPeriodData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered', 'paid', 'processing'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$totalPrice' } },
          completedOrders: { $sum: 1 },
          totalReviews: { 
            $sum: { 
              $cond: [{ $gt: ['$rating', 0] }, 1, 0]
            }
          },
          totalRating: { 
            $sum: { 
              $cond: [{ $gt: ['$rating', 0] }, '$rating', 0]
            }
          }
        }
      }
    ]);
    console.log('Current period data:', currentPeriodData);

    // Get service performance
    const services = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered', 'paid', 'processing'] }
        }
      },
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.name',
          orders: { $sum: 1 },
          revenue: { 
            $sum: { $toDouble: '$services.subtotal' }
          },
          processingTime: { 
            $avg: {
              $cond: [
                { $and: [
                  { $ne: ['$completedAt', null] },
                  { $ne: ['$startedAt', null] }
                ]},
                { $divide: [
                  { $subtract: ['$completedAt', '$startedAt'] },
                  3600000 // Convert to hours
                ]},
                null
              ]
            }
          },
          totalRating: {
            $sum: { $cond: [{ $gt: ['$rating', 0] }, '$rating', 0] }
          },
          ratedOrders: {
            $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] }
          },
          // Debug fields
          totalWeight: { $sum: { $toDouble: '$services.weight' } },
          subtotals: { $push: '$services.subtotal' }
        }
      },
      {
        $project: {
          name: '$_id',
          orders: 1,
          revenue: { $round: ['$revenue', 2] },
          processingTime: { $round: ['$processingTime', 1] },
          rating: {
            $cond: [
              { $gt: ['$ratedOrders', 0] },
              { $round: [{ $divide: ['$totalRating', '$ratedOrders'] }, 1] },
              0
            ]
          },
          // Debug fields
          debug: {
            totalWeight: '$totalWeight',
            subtotals: '$subtotals'
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Add debug logging
    console.log('Services aggregation result:', JSON.stringify(services, null, 2));

    // Get previous period data
    const previousPeriodData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lte: previousEndDate },
          status: { $in: ['completed', 'delivered', 'paid', 'processing'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$totalPrice' } },
          completedOrders: { $sum: 1 }
        }
      }
    ]);

    const current = currentPeriodData[0] || { 
      totalRevenue: 0, 
      completedOrders: 0,
      totalReviews: 0,
      totalRating: 0
    };
    
    const previous = previousPeriodData[0] || { 
      totalRevenue: 0, 
      completedOrders: 0 
    };

    // Calculate changes
    const revenueChange = previous.totalRevenue > 0
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue * 100)
      : 0;

    const orderChange = previous.completedOrders > 0
      ? ((current.completedOrders - previous.completedOrders) / previous.completedOrders * 100)
      : 0;

    const averageOrderValue = current.completedOrders > 0
      ? current.totalRevenue / current.completedOrders
      : 0;

    const previousAverageOrderValue = previous.completedOrders > 0
      ? previous.totalRevenue / previous.completedOrders
      : 0;

    const aovChange = previousAverageOrderValue > 0
      ? ((averageOrderValue - previousAverageOrderValue) / previousAverageOrderValue * 100)
      : 0;

    const response = {
      totalRevenue: current.totalRevenue,
      completedOrders: current.completedOrders,
      averageOrderValue: current.completedOrders ? current.totalRevenue / current.completedOrders : 0,
      satisfaction: current.totalReviews ? (current.totalRating / current.totalReviews) : 0,
      totalReviews: current.totalReviews,
      revenueChange: previous.totalRevenue ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0,
      orderChange: previous.completedOrders ? ((current.completedOrders - previous.completedOrders) / previous.completedOrders) * 100 : 0,
      aovChange: previousAverageOrderValue > 0 ? ((averageOrderValue - previousAverageOrderValue) / previousAverageOrderValue) * 100 : 0,
      services,
      ordersByStatus: ordersByStatus
    };
    
    console.log('Final response:', response);
    return apiResponse(response);
  } catch (error) {
    console.error('Reports API Error:', error);
    return apiResponse({ error: 'Failed to fetch report data' }, 500);
  }
}
