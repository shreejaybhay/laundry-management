import { auth } from '@/middleware/auth';
import { apiResponse } from "@/lib/apiResponse";
import Order from "@/models/Order";
import connectDB from "@/lib/db";
import { ObjectId } from 'mongodb';
import { format } from 'date-fns';

async function getUserStats(req) {
  try {
    await connectDB();

    if (!req.user?.id) {
      return apiResponse({ error: 'User not authenticated' }, { status: 401 });
    }

    const userId = req.user.id;

    if (!ObjectId.isValid(userId)) {
      return apiResponse({ error: 'Invalid user ID' }, { status: 400 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Set time to midnight UTC
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(23, 59, 59, 999);

    // Get daily order history with proper UTC date handling
    const orderHistoryData = await Order.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          createdAt: { 
            $gte: thirtyDaysAgo,
            $lte: now
          },
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
          orders: { $sum: 1 },
          revenue: { $sum: { $toDouble: "$totalPrice" } },
          orderDetails: {
            $push: {
              id: "$_id",
              createdAt: "$createdAt",
              totalPrice: "$totalPrice"
            }
          }
        }
      },
      {
        $project: {
          name: "$_id",
          orders: 1,
          revenue: { $round: ["$revenue", 2] },
          orderDetails: 1,
          _id: 0
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Fill in missing dates with zero values
    const filledOrderHistory = [];
    const currentDate = new Date(thirtyDaysAgo);
    
    // Create a map of existing data
    const orderDataMap = new Map(
      orderHistoryData.map(item => [item.name, item])
    );

    // Fill in all dates including today
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const formattedDate = format(currentDate, 'MMM d, yyyy');
      const existingData = orderDataMap.get(dateStr) || {
        name: dateStr,
        orders: 0,
        revenue: 0,
        orderDetails: []
      };
      filledOrderHistory.push({
        ...existingData,
        displayDate: formattedDate
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get current month's orders and revenue
    const currentMonthOrders = await Order.find({
      userId: new ObjectId(userId),
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ["paid", "processing", "completed", "delivered"] }
    });

    // Calculate current revenue with proper number handling
    const currentRevenue = currentMonthOrders.reduce((sum, order) => {
      const price = Number(order.totalPrice) || 0;
      return sum + price;
    }, 0);

    // Get previous month's orders for growth calculation
    const previousMonthStart = new Date(thirtyDaysAgo);
    previousMonthStart.setDate(previousMonthStart.getDate() - 30);

    const previousMonthOrders = await Order.find({
      userId: new ObjectId(userId),
      createdAt: {
        $gte: previousMonthStart,
        $lt: thirtyDaysAgo
      },
      status: { $in: ["paid", "processing", "completed", "delivered"] }
    });

    // Calculate previous revenue with proper number handling
    const previousRevenue = previousMonthOrders.reduce((sum, order) => {
      const price = Number(order.totalPrice) || 0;
      return sum + price;
    }, 0);

    // Calculate growth percentages
    const orderGrowth = previousMonthOrders.length > 0
      ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100
      : 0;

    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Get processing orders count
    const processingOrders = await Order.countDocuments({
      userId: new ObjectId(userId),
      status: { $in: ["processing", "washing", "drying", "folding"] }
    });

    // Debug log to verify dates
    console.log('Date ranges:', {
      now: now.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      todayOrders: filledOrderHistory[filledOrderHistory.length - 1]
    });

    return apiResponse({
      metrics: {
        totalOrders: currentMonthOrders.length,
        processing: processingOrders,
        revenue: Number(currentRevenue).toFixed(2),
        orderGrowth: Math.round(orderGrowth),
        revenueGrowth: Math.round(revenueGrowth)
      },
      orderHistory: filledOrderHistory.map(day => ({
        name: day.name,
        displayDate: day.displayDate,
        orders: day.orders || 0,
        revenue: Number(day.revenue || 0).toFixed(2)
      }))
    });

  } catch (error) {
    console.error('Error in getUserStats:', error);
    return apiResponse({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = auth(getUserStats);
