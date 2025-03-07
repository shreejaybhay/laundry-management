import { adminAuth } from '@/middleware/adminAuth';
import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import User from '@/models/User';
import connectDB from '@/lib/db';

async function getDashboardStats(req) {
  try {
    await connectDB();

    // Get current date and date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();

    // Set to start of day (midnight UTC)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    // Set end date to end of current day
    now.setUTCHours(23, 59, 59, 999);

    // Get previous month's data for comparison
    const previousMonthStart = new Date(thirtyDaysAgo);
    previousMonthStart.setDate(previousMonthStart.getDate() - 30);

    // Debug: Log the dates with ISO strings for clarity
    console.log('Date ranges:', {
      now: now.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      previousMonthStart: previousMonthStart.toISOString()
    });

    // Get current month's PAID, PROCESSING, COMPLETED, and DELIVERED orders and revenue
    const currentMonthOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ["paid", "processing", "completed", "delivered"] }
    });

    // Get previous month's PAID, PROCESSING, COMPLETED, and DELIVERED orders and revenue
    const previousMonthOrders = await Order.find({
      createdAt: {
        $gte: previousMonthStart,
        $lt: thirtyDaysAgo
      },
      status: { $in: ["paid", "processing", "completed", "delivered"] }
    });

    // Calculate basic metrics
    const totalOrders = await Order.countDocuments({ 
      status: { $in: ["paid", "processing", "completed", "delivered"] },
      createdAt: { $gte: thirtyDaysAgo }
    });

    const processingOrders = await Order.countDocuments({ 
      status: { $in: ["pending", "processing"] }
    });

    const activeUsers = await Order.distinct('userId', { 
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ["paid", "processing"] } // Include both paid and processing
    }).then(users => users.length);

    // Calculate revenue
    const currentRevenue = Number(currentMonthOrders.reduce((sum, order) =>
      sum + (parseFloat(order.totalPrice) || 0), 0).toFixed(2));

    const previousRevenue = Number(previousMonthOrders.reduce((sum, order) =>
      sum + (parseFloat(order.totalPrice) || 0), 0).toFixed(2));

    // Calculate growth percentages
    const orderGrowth = previousMonthOrders.length > 0
      ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100
      : 0;

    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Get daily revenue data (only from paid orders)
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo, $lte: now },
          status: { $in: ["paid", "processing", "completed", "delivered"] }
        }
      },
      {
        $addFields: {
          // Convert to local date string in UTC
          localDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC"
            }
          }
        }
      },
      {
        $group: {
          _id: "$localDate",
          revenue: { $sum: { $toDouble: "$totalPrice" } }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          name: "$_id",
          revenue: { $round: ["$revenue", 2] },
          _id: 0
        }
      }
    ]);

    // Fill in missing dates with zero revenue
    const fillMissingDates = () => {
      const filledData = [];
      const currentDate = new Date(thirtyDaysAgo);
      const endDate = new Date(now);
      
      // Create a map of existing data
      const revenueMap = new Map(
        revenueData.map(item => [item.name, item.revenue])
      );

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        filledData.push({
          name: dateStr,
          revenue: revenueMap.get(dateStr) || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return filledData;
    };

    const completeRevenueData = fillMissingDates();

    // Calculate service distribution with numeric percentages
    const serviceData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["paid", "processing", "completed", "delivered"] }
        }
      },
      {
        $unwind: "$services"
      },
      {
        $group: {
          _id: "$services.name",
          count: { $sum: 1 },
          totalWeight: { $sum: { $toDouble: "$services.weight" } }
        }
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          weight: { $round: ["$totalWeight", 1] },
          _id: 0
        }
      },
      {
        $sort: { value: -1 }
      }
    ]);

    // Calculate percentages as numbers
    const totalServices = serviceData.reduce((sum, service) => sum + service.value, 0);
    const serviceDataWithPercentages = serviceData.map(service => ({
      ...service,
      weight: Number(service.weight.toFixed(1)),
      value: Number(service.value),
      percentage: Number(((service.value / totalServices) * 100).toFixed(1))
    }));

    // Sort by value in descending order
    serviceDataWithPercentages.sort((a, b) => b.value - a.value);

    // Debug log to verify service distribution
    console.log('Service Distribution:', serviceDataWithPercentages);

    // Debug: Log the results
    console.log('Dashboard stats:', {
      totalOrders,
      processingOrders,
      activeUsers,
      currentRevenue,
      previousRevenue,
      orderGrowth,
      revenueGrowth,
      revenueDataLength: revenueData.length,
      serviceDataLength: serviceData.length
    });

    // Ensure we return a properly formatted response even if data is missing
    return apiResponse({
      metrics: {
        totalOrders: totalOrders || 0,
        processing: processingOrders || 0,
        revenue: currentRevenue.toFixed(2),
        activeUsers: activeUsers || 0,
        orderGrowth: Math.round(orderGrowth),
        revenueGrowth: Math.round(revenueGrowth)
      },
      serviceData: serviceDataWithPercentages.map(service => ({
        ...service,
        weight: Number(service.weight.toFixed(1)),
        percentage: Number(service.percentage)
      })),
      revenueData: completeRevenueData.map(day => ({
        ...day,
        revenue: Number(day.revenue.toFixed(2))
      }))
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return apiResponse({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}

export const GET = adminAuth(getDashboardStats);
