const orderModel = require("../models/order-model"); // adjust path

// utils/revenueHelper.js
const getRevenueStats = async () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);

  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);

  const totalRevenueAgg = await orderModel.aggregate([
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const weeklyRevenueAgg = await orderModel.aggregate([
    { $match: { createdAt: { $gte: startOfWeek } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const monthlyRevenueAgg = await orderModel.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const yearlyRevenueAgg = await orderModel.aggregate([
    { $match: { createdAt: { $gte: startOfYear } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  return {
    weeklyRevenue: weeklyRevenueAgg[0]?.total || 0,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    yearlyRevenue: yearlyRevenueAgg[0]?.total || 0,
    totalRevenue: totalRevenueAgg.length ? totalRevenueAgg[0].total : 0,
  };
};

module.exports = { getRevenueStats };
