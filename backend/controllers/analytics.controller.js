import User from "../models/user.model.js";
import Product from "../models/product.model.js"
import Order from "../models/order.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 *60 * 60 * 1000) 

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({
      analyticsData,
      dailySalesData
    })
  } catch (error) {
    console.log(`Error in getAnalytics controller ${error.message}`);
    res.status(500).json({ message: "Internal Server Error"});
  }
}

async function getAnalyticsData() {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: {$sum: 1}, // count all document 
        totalRevenue: {$sum: "$totalAmount"} // sum of totalAmount field 
      }
    }
  ])  

  const {totalSales, totalRevenue} = salesData[0] || {totalSales:0, totalRevenue: 0};

  return {
    users: totalUsers,
    Products: totalProducts,
    totalSales,
    totalRevenue
  }
}

async function getDailySalesData(startDate, endDate) {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ])
  
    const dateArray = getDateInRange(startDate, endDate);
  
    return dateArray.map(date => {
      const foundData = dailySalesData.find(item => item._id === date); // id มาจาก dailySalesData ข้างบน
  
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0
      }
    })
  } catch (error) {
    console.log(`Error in getDailySalesData controller ${error.message}`);
    res.status(500).json({ message: "Internal Server Error"});
  }
}

function getDateInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while(currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}