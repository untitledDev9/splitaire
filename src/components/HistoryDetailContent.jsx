import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit2, Share2, CheckCircle, XCircle, Loader, ArrowLeft, Copy, Check } from "lucide-react";
import { useBill, useMarkPayment } from "../hooks/useBills";
import { useAuth } from "../hooks/useAuth";

const HistoryDetailContent = () => {
  const {
    billId
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    bill,
    loading,
    error,
    refetch
  } = useBill(billId);
  const {
    markPayment,
    loading: markingPayment
  } = useMarkPayment();
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!billId) {
      navigate('/dashboard/history');
    }
  }, [billId, navigate]);
  const handleMarkPayment = async (participantEmail, currentStatus) => {
    const newStatus = !currentStatus;
    const response = await markPayment(billId, {
      participantEmail,
      isPaid: newStatus
    });
    if (response.success) {
      refetch();
      alert(newStatus ? 'Payment marked as complete!' : 'Payment marked as incomplete');
    } else {
      alert('Failed to update payment status: ' + response.message);
    }
  };
  const handleShare = () => {
    const shareLink = `${window.location.origin}/bill/${billId}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const getInitials = name => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const calculateOwes = () => {
    if (!bill || !bill.participants) return [];
    return bill.participants.map(participant => ({
      person: participant.name,
      email: participant.email,
      amount: participant.amountOwed,
      isPaid: participant.isPaid,
      paidAt: participant.paidAt
    }));
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base sm:text-lg">Loading bill details...</p>
        </div>
      </div>;
  }
  if (error || !bill) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Bill Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error || 'The bill you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/dashboard/history')} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm sm:text-base">
            Back to History
          </button>
        </div>
      </div>;
  }
  const splits = calculateOwes();
  const settledCount = splits.filter(s => s.isPaid).length;
  const totalParticipants = splits.length;
  return <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 bg-gray-50 p-3 sm:p-4 lg:p-8 flex items-start justify-center">
          <div className="w-full max-w-4xl">
            {/* Back Button */}
            <button onClick={() => navigate('/dashboard/history')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 font-medium transition-colors text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to History</span>
            </button>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-200 p-4 sm:p-6 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                      {bill.billName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full ${bill.isSettled ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {bill.isSettled ? '✓ Settled' : '⏳ Pending'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {settledCount} of {totalParticipants} paid
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={handleShare} className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors whitespace-nowrap">
                      {copied ? <>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Copied!</span>
                        </> : <>
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Copy Link</span>
                        </>}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {["summary", "participants"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 sm:px-6 py-2 rounded-lg font-medium capitalize transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === tab ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      {tab}
                    </button>)}
                </div>
              </div>

              {/* Summary Tab */}
              {activeTab === "summary" && <div className="p-4 sm:p-6 bg-emerald-50">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                      Bill Summary
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Overview of the bill and payment status
                    </p>
                  </div>

                  {/* Total Amount Card */}
                  <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6 mb-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 pb-4 border-b border-gray-200 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">
                        Total Bill Amount:
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                        ₦{bill.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Currency</span>
                        <span className="text-gray-900">NGN</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Split Method</span>
                        <span className="text-gray-900 capitalize">{bill.splitMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Created</span>
                        <span className="text-gray-900">{formatDate(bill.createdAt)}</span>
                      </div>
                      {bill.isSettled && bill.settledAt && <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Settled On</span>
                          <span className="text-emerald-600 font-semibold">{formatDate(bill.settledAt)}</span>
                        </div>}
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Payment Breakdown</h4>
                    <div className="space-y-3">
                      {splits.map((split, index) => <div key={index} className="flex flex-col xs:flex-row xs:justify-between xs:items-center py-3 border-b border-gray-100 last:border-0 gap-2 xs:gap-0">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0 ${split.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                              {getInitials(split.person)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{split.person}</p>
                              <p className="text-xs text-gray-500 break-all">{split.email}</p>
                            </div>
                          </div>
                          <div className="xs:text-right pl-11 xs:pl-0">
                            <p className={`font-bold text-base sm:text-lg ${split.isPaid ? 'text-emerald-600' : 'text-orange-600'}`}>
                              ₦{split.amount.toFixed(2)}
                            </p>
                            {split.isPaid && split.paidAt && <p className="text-xs text-gray-500">Paid {formatDate(split.paidAt)}</p>}
                          </div>
                        </div>)}
                    </div>
                  </div>

                  {/* Notes */}
                  {bill.notes && <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6 mt-4 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Notes</h4>
                      <p className="text-gray-700 text-xs sm:text-sm break-words">{bill.notes}</p>
                    </div>}
                </div>}

              {/* Participants Tab */}
              {activeTab === "participants" && <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                      Participants ({totalParticipants})
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Manage payment status for each participant
                    </p>
                  </div>

                  <div className="space-y-3">
                    {splits.map((split, index) => <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${split.isPaid ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                            {getInitials(split.person)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{split.person}</p>
                            <p className="text-xs sm:text-sm text-gray-500 break-all">{split.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <p className={`text-sm font-bold ${split.isPaid ? 'text-emerald-600' : 'text-orange-600'}`}>
                                ₦{split.amount.toFixed(2)}
                              </p>
                              {split.isPaid ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                  ✓ Paid
                                </span> : <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                  ⏳ Pending
                                </span>}
                            </div>
                          </div>
                        </div>
                        
                        <button onClick={() => handleMarkPayment(split.email, split.isPaid)} disabled={markingPayment} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${split.isPaid ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'} ${markingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {markingPayment ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : split.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </div>)}
                  </div>

                  {/* Settlement Progress */}
                  <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Settlement Progress</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {settledCount} / {totalParticipants} paid
                        </p>
                      </div>
                      {bill.isSettled ? <div className="flex items-center space-x-2 bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-full">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-semibold text-sm sm:text-base">Fully Settled!</span>
                        </div> : <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-emerald-600 flex items-center justify-center">
                          <span className="text-lg sm:text-xl font-bold text-emerald-600">
                            {Math.round(settledCount / totalParticipants * 100)}%
                          </span>
                        </div>}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-white rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{
                      width: `${settledCount / totalParticipants * 100}%`
                    }}></div>
                      </div>
                    </div>
                  </div>
                </div>}
            </div>
          </div>
        </main>
      </div>
    </div>;
};

export default HistoryDetailContent;