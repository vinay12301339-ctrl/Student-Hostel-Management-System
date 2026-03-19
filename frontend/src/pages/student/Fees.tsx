import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, AlertTriangle, Clock, Download, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface Fee {
  _id: string;
  month: number;
  year: number;
  roomRent: number;
  messFee: number;
  utilityCharges: number;
  extraCharges: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  invoiceNumber: string;
  lateFine: number;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FeesPage() {
  const queryClient = useQueryClient();
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const { data, isLoading } = useQuery({
    queryKey: ['my-fees'],
    queryFn: async () => {
      const response = await api.get('/fees/my');
      return response.data.data;
    },
  });

  const payMutation = useMutation({
    mutationFn: async ({ feeId, amount, method }: { feeId: string; amount: number; method: string }) => {
      const response = await api.post('/payments/process', { feeId, amount, method });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment successful! 🎉');
      setSelectedFee(null);
      queryClient.invalidateQueries({ queryKey: ['my-fees'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Payment failed');
    },
  });

  const fees: Fee[] = data?.fees || [];
  const summary = data?.summary || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fees & Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your fee payments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-red-50 border-red-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-red-600">Total Due</p>
              <p className="text-2xl font-bold text-red-700">₹{(summary.totalDue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-green-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-700">₹{(summary.totalPaid || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card bg-orange-50 border-orange-100">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-orange-600">Overdue Count</p>
              <p className="text-2xl font-bold text-orange-700">{summary.overdueCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fee list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Payment History</h3>
        </div>

        {fees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No fee records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                  <th className="pb-3 pr-4">Invoice #</th>
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Paid</th>
                  <th className="pb-3 pr-4">Due Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fees.map((fee) => (
                  <tr key={fee._id} className="text-sm">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-gray-600">{fee.invoiceNumber}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {months[fee.month - 1]} {fee.year}
                    </td>
                    <td className="py-3 pr-4 font-medium">₹{fee.totalAmount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-green-600">₹{fee.paidAmount.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        fee.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : fee.status === 'overdue'
                          ? 'bg-red-100 text-red-700'
                          : fee.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => setSelectedFee(fee)}
                            className="text-xs btn-primary py-1 px-3 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                        <button className="text-xs btn-secondary py-1 px-3 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {selectedFee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pay Fee</h3>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Period</span>
                <span className="font-medium">{months[selectedFee.month - 1]} {selectedFee.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Room Rent</span>
                <span>₹{selectedFee.roomRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mess Fee</span>
                <span>₹{selectedFee.messFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Utilities</span>
                <span>₹{selectedFee.utilityCharges.toLocaleString()}</span>
              </div>
              {selectedFee.lateFine > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Late Fine</span>
                  <span>₹{selectedFee.lateFine.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                <span>Amount Due</span>
                <span className="text-primary-600">
                  ₹{(selectedFee.totalAmount - selectedFee.paidAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI', icon: '📱' },
                  { id: 'bank_transfer', label: 'Bank', icon: '🏦' },
                  { id: 'wallet', label: 'Wallet', icon: '💰' },
                  { id: 'stripe', label: 'Card', icon: '💳' },
                  { id: 'razorpay', label: 'Razorpay', icon: '🔄' },
                  { id: 'cash', label: 'Cash', icon: '💵' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">{method.icon}</span>
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFee(null)}
                className="flex-1 btn-secondary"
                disabled={payMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  payMutation.mutate({
                    feeId: selectedFee._id,
                    amount: selectedFee.totalAmount - selectedFee.paidAmount,
                    method: paymentMethod,
                  })
                }
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? (
                  <div className="spinner w-4 h-4" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
