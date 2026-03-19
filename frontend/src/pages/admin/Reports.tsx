import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../utils/api';

export default function AdminReports() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', year],
    queryFn: async () => {
      const response = await api.get(`/admin/reports/financial?year=${year}`);
      return response.data.data;
    },
  });

  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const feeChartData = (data?.feeStats || []).map((stat: { _id: number; totalBilled: number; totalPaid: number; count: number }) => ({
    month: months[stat._id],
    billed: stat.totalBilled,
    paid: stat.totalPaid,
    count: stat.count,
  }));

  const methodData = (data?.paymentMethods || []).map((m: { _id: string; total: number; count: number }) => ({
    name: m._id.replace('_', ' '),
    amount: m.total,
    count: m.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Track revenue and payment analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="input-field w-auto"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Fee billing vs payment */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Fee Billing vs Collections ({year})</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            {feeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="billed" fill="#bfdbfe" name="Billed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="#3b82f6" name="Collected" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No data for {year}</p>
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Methods Breakdown</h3>
              {methodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={methodData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-400">No payment data</div>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Collection Summary</h3>
              {feeChartData.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Total Billed',
                        value: feeChartData.reduce((s: number, d: { billed: number }) => s + d.billed, 0),
                        color: 'text-blue-600',
                      },
                      {
                        label: 'Total Collected',
                        value: feeChartData.reduce((s: number, d: { paid: number }) => s + d.paid, 0),
                        color: 'text-green-600',
                      },
                      {
                        label: 'Outstanding',
                        value: feeChartData.reduce((s: number, d: { billed: number; paid: number }) => s + (d.billed - d.paid), 0),
                        color: 'text-red-600',
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={`font-bold ${item.color}`}>
                          ₹{item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700">
                      Collection rate:{' '}
                      <span className="font-bold">
                        {feeChartData.length > 0
                          ? Math.round(
                              (feeChartData.reduce((s: number, d: { paid: number }) => s + d.paid, 0) /
                                feeChartData.reduce((s: number, d: { billed: number }) => s + d.billed, 0)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">No data for this year</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
