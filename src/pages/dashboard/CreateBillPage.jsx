import React, { useState } from "react";
import {
  Plus,
  X,
  User,
  FileText,
  Users,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader,
  Mail,
  CreditCard,
  Building2,
  Percent,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCreateBill } from "../../hooks/useBills";
import { FaNairaSign } from "react-icons/fa6";

const CreateBillPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createBill, loading } = useCreateBill();
  
  const [formData, setFormData] = useState({
    billName: "",
    totalAmount: "",
    currency: "NGN",
    notes: "",
  });
  
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    paymentHandle: "",
  });
  
  const [splitType, setSplitType] = useState("equal");
  
  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: isAuthenticated ? user?.fullName || "Me" : "",
      email: isAuthenticated ? user?.email || "" : "",
      isMe: true,
    },
    {
      id: 2,
      name: "",
      email: "",
      isMe: false,
    },
  ]);
  
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [items, setItems] = useState([
    {
      id: 1,
      name: "",
      price: "",
      assignedTo: [],
    },
  ]);
  
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Helper function to format currency with commas
  const formatCurrency = (amount) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const addParticipant = () => {
    const newId = Date.now();
    setParticipants([
      ...participants,
      {
        id: newId,
        name: "",
        email: "",
        isMe: false,
      },
    ]);
  };

  const removeParticipant = (id) => {
    if (participants.length > 2) {
      setParticipants(participants.filter((p) => p.id !== id));
      const participantEmail = participants.find((p) => p.id === id)?.email;
      if (participantEmail) {
        if (customSplits[participantEmail]) {
          const newSplits = { ...customSplits };
          delete newSplits[participantEmail];
          setCustomSplits(newSplits);
        }
        if (percentageSplits[participantEmail]) {
          const newSplits = { ...percentageSplits };
          delete newSplits[participantEmail];
          setPercentageSplits(newSplits);
        }
      }
    }
  };

  const updateParticipant = (id, field, value) => {
    setParticipants(
      participants.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: value,
            }
          : p
      )
    );
    if (validationErrors[`participant_${id}_${field}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`participant_${id}_${field}`];
      setValidationErrors(newErrors);
    }
  };

  const updateCustomSplit = (email, value) => {
    setCustomSplits({
      ...customSplits,
      [email]: value,
    });
  };

  const updatePercentageSplit = (email, value) => {
    setPercentageSplits({
      ...percentageSplits,
      [email]: value,
    });
  };

  const updateAccountDetails = (field, value) => {
    setAccountDetails({
      ...accountDetails,
      [field]: value,
    });
  };

  const addItem = () => {
    const newId = Date.now();
    setItems([
      ...items,
      {
        id: newId,
        name: "",
        price: "",
        assignedTo: [],
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const toggleItemAssignment = (itemId, participantEmail) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const assignedTo = item.assignedTo.includes(participantEmail)
            ? item.assignedTo.filter((email) => email !== participantEmail)
            : [...item.assignedTo, participantEmail];
          return {
            ...item,
            assignedTo,
          };
        }
        return item;
      })
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.billName.trim()) {
      errors.billName = "Bill name is required";
    } else if (formData.billName.trim().length < 3) {
      errors.billName = "Bill name must be at least 3 characters";
    }

    const amount = parseFloat(formData.totalAmount);
    if (!formData.totalAmount) {
      errors.totalAmount = "Total amount is required";
    } else if (isNaN(amount) || amount <= 0) {
      errors.totalAmount = "Amount must be greater than 0";
    }

    const validParticipants = participants.filter(
      (p) => p.name.trim() && p.email.trim()
    );
    if (validParticipants.length < 2) {
      errors.participants = "At least 2 participants are required";
    }

    participants.forEach((p) => {
      if (!p.name.trim()) {
        errors[`participant_${p.id}_name`] = "Name is required";
      }
      if (!p.email.trim()) {
        errors[`participant_${p.id}_email`] = "Email is required";
      } else if (
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(p.email)
      ) {
        errors[`participant_${p.id}_email`] = "Invalid email";
      }
    });

    const emails = participants
      .map((p) => p.email.toLowerCase().trim())
      .filter((e) => e);
    const duplicates = emails.filter(
      (email, index) => emails.indexOf(email) !== index
    );
    if (duplicates.length > 0) {
      errors.participants = "Duplicate email addresses found";
    }

    if (splitType === "custom") {
      const totalCustom = Object.values(customSplits).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      if (Math.abs(totalCustom - amount) > 0.01) {
        errors.customSplits = `Custom amounts must add up to ₦${formatCurrency(amount)}. Current total: ₦${formatCurrency(totalCustom)}`;
      }
    }

    if (splitType === "percentage") {
      const totalPercent = Object.values(percentageSplits).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      if (Math.abs(totalPercent - 100) > 0.1) {
        errors.percentageSplits = `Percentages must add up to 100%. Current: ${totalPercent.toFixed(1)}%`;
      }
    }

    if (splitType === "itemBased") {
      const validItems = items.filter((item) => item.name.trim() && item.price);
      if (validItems.length === 0) {
        errors.items = "At least one item is required";
      }
      items.forEach((item) => {
        if (item.name.trim() && !item.price) {
          errors[`item_${item.id}_price`] = "Price is required";
        }
        if (item.price && item.assignedTo.length === 0) {
          errors[`item_${item.id}_assigned`] = "Assign to at least one person";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      setError("Please fix the errors below");
      return;
    }

    try {
      const participantsData = participants
        .filter((p) => p.name.trim() && p.email.trim())
        .map((p) => ({
          name: p.name.trim(),
          email: p.email.trim().toLowerCase(),
        }));

      const billData = {
        billName: formData.billName.trim(),
        totalAmount: parseFloat(formData.totalAmount),
        currency: formData.currency,
        participants: participantsData,
        splitMethod: splitType,
        notes: formData.notes.trim(),
        accountDetails: {
          bankName: accountDetails.bankName.trim(),
          accountNumber: accountDetails.accountNumber.trim(),
          accountHolderName: accountDetails.accountHolderName.trim(),
          paymentHandle: accountDetails.paymentHandle.trim(),
          currency: formData.currency,
        },
      };

      if (splitType === "custom") {
        billData.customSplits = participantsData.map((p) => ({
          participantEmail: p.email,
          amount: parseFloat(customSplits[p.email] || 0),
        }));
      } else if (splitType === "percentage") {
        billData.customSplits = participantsData.map((p) => ({
          participantEmail: p.email,
          percentage: parseFloat(percentageSplits[p.email] || 0),
        }));
      } else if (splitType === "itemBased") {
        billData.items = items
          .filter((item) => item.name.trim() && item.price)
          .map((item) => ({
            name: item.name.trim(),
            price: parseFloat(item.price),
            assignedTo: item.assignedTo,
          }));
      }

      if (!isAuthenticated) {
        billData.createdByName = participantsData[0].name;
        billData.createdByEmail = participantsData[0].email;
      }

      const response = await createBill(billData);
      if (response.success) {
        const billId = response.data.bill.billId;
        navigate(`/bill/${billId}`);
      } else {
        setError(response.message || "Failed to create bill");
        if (response.errors && Array.isArray(response.errors)) {
          const backendErrors = {};
          response.errors.forEach((err) => {
            backendErrors[err.field] = err.message;
          });
          setValidationErrors(backendErrors);
        }
      }
    } catch (err) {
      console.error("Create bill error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const calculateEqualSplit = () => {
    const amount = parseFloat(formData.totalAmount);
    if (!isNaN(amount) && amount > 0 && participants.length > 0) {
      return (amount / participants.length).toFixed(2);
    }
    return "0.00";
  };

  const calculatePercentageAmount = (email) => {
    const amount = parseFloat(formData.totalAmount);
    const percentage = parseFloat(percentageSplits[email] || 0);
    if (!isNaN(amount) && !isNaN(percentage)) {
      return ((amount * percentage) / 100).toFixed(2);
    }
    return "0.00";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">Quick & Easy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Create a Bill
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Split expenses effortlessly with your friends and family
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Bill Details */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Bill Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Bill Name *
                  </label>
                  <div className="relative">
                    <FileText
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                        validationErrors.billName
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="e.g., Weekend Brunch"
                      value={formData.billName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          billName: e.target.value,
                        });
                        if (validationErrors.billName) {
                          const newErrors = { ...validationErrors };
                          delete newErrors.billName;
                          setValidationErrors(newErrors);
                        }
                      }}
                      disabled={loading}
                      className={`w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium ${
                        validationErrors.billName
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-500"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {validationErrors.billName && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{validationErrors.billName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <FaNairaSign
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                        validationErrors.totalAmount
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.totalAmount}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          totalAmount: e.target.value,
                        });
                        if (validationErrors.totalAmount) {
                          const newErrors = { ...validationErrors };
                          delete newErrors.totalAmount;
                          setValidationErrors(newErrors);
                        }
                      }}
                      disabled={loading}
                      className={`w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium ${
                        validationErrors.totalAmount
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-500"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {validationErrors.totalAmount && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{validationErrors.totalAmount}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Payment Details (Optional)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Add your payment information so participants know where to send their payments
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={accountDetails.accountHolderName}
                      onChange={(e) =>
                        updateAccountDetails("accountHolderName", e.target.value)
                      }
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., GTBank"
                      value={accountDetails.bankName}
                      onChange={(e) =>
                        updateAccountDetails("bankName", e.target.value)
                      }
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="0123456789"
                      value={accountDetails.accountNumber}
                      onChange={(e) =>
                        updateAccountDetails("accountNumber", e.target.value)
                      }
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Payment Handle
                  </label>
                  <div className="relative">
                    <FaNairaSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="@username or mobile number"
                      value={accountDetails.paymentHandle}
                      onChange={(e) =>
                        updateAccountDetails("paymentHandle", e.target.value)
                      }
                      disabled={loading}
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Split Method Selection */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                How to Split?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${
                    splitType === "equal"
                      ? "bg-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Equal</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitType("percentage")}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${
                    splitType === "percentage"
                      ? "bg-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Percentage</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitType("custom")}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${
                    splitType === "custom"
                      ? "bg-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <FaNairaSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Custom</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitType("itemBased")}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${
                    splitType === "itemBased"
                      ? "bg-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Item-Based</span>
                  </div>
                </button>
              </div>

              {splitType === "equal" && formData.totalAmount && (
                <p className="mt-3 text-xs sm:text-sm text-gray-600 text-center">
                  Each person pays:{" "}
                  <span className="font-bold text-emerald-600">
                    ₦{calculateEqualSplit()}
                  </span>
                </p>
              )}
              {validationErrors.customSplits && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{validationErrors.customSplits}</span>
                </p>
              )}
              {validationErrors.percentageSplits && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{validationErrors.percentageSplits}</span>
                </p>
              )}
              {validationErrors.items && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{validationErrors.items}</span>
                </p>
              )}
            </div>

            {/* Item-Based Split */}
            {splitType === "itemBased" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Items</h2>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    {items.length} items
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border-2 border-gray-200 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                        <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(item.id, "name", e.target.value)
                            }
                            className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                          />
                          <div className="relative">
                            <FaNairaSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Price"
                              value={item.price}
                              onChange={(e) =>
                                updateItem(item.id, "price", e.target.value)
                              }
                              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                            />
                          </div>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {validationErrors[`item_${item.id}_price`] && (
                        <p className="text-xs text-red-600 mb-2">
                          {validationErrors[`item_${item.id}_price`]}
                        </p>
                      )}
                      {validationErrors[`item_${item.id}_assigned`] && (
                        <p className="text-xs text-red-600 mb-2">
                          {validationErrors[`item_${item.id}_assigned`]}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {participants.map(
                          (participant) =>
                            participant.email && (
                              <button
                                key={participant.id}
                                type="button"
                                onClick={() =>
                                  toggleItemAssignment(
                                    item.id,
                                    participant.email
                                  )
                                }
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                                  item.assignedTo.includes(participant.email)
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}>
                                {participant.name || participant.email}
                              </button>
                            )
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-sm sm:text-base">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            )}

            {/* Participants Section for item-based */}
            {splitType === "itemBased" && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Participants
                </h2>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={participant.name}
                          onChange={(e) =>
                            updateParticipant(
                              participant.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={participant.email}
                          onChange={(e) =>
                            updateParticipant(
                              participant.id,
                              "email",
                              e.target.value
                            )
                          }
                          className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm sm:text-base"
                        />
                      </div>
                      {!participant.isMe && participants.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeParticipant(participant.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 text-xs sm:text-sm">
                    + Add Participant
                  </button>
                </div>
              </div>
            )}

            {/* Participants Section for other split types */}
            {splitType !== "itemBased" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Who's Splitting?
                    </h2>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    {participants.length} people
                  </span>
                </div>

                {validationErrors.participants && (
                  <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{validationErrors.participants}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="space-y-2">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="flex-1 space-y-2">
                          <div className="relative">
                            <User
                              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                                validationErrors[
                                  `participant_${participant.id}_name`
                                ]
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Name"
                              value={participant.name}
                              onChange={(e) =>
                                updateParticipant(
                                  participant.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              disabled={loading}
                              className={`w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none transition-colors font-medium text-sm sm:text-base ${
                                participant.isMe
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 focus:border-emerald-500"
                                  : validationErrors[
                                      `participant_${participant.id}_name`
                                    ]
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-200 bg-white text-gray-900 focus:border-purple-500"
                              } ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            />
                            {participant.isMe && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          {validationErrors[
                            `participant_${participant.id}_name`
                          ] && (
                            <p className="text-xs text-red-600 ml-1">
                              {
                                validationErrors[
                                  `participant_${participant.id}_name`
                                ]
                              }
                            </p>
                          )}

                          <div className="relative">
                            <Mail
                              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                                validationErrors[
                                  `participant_${participant.id}_email`
                                ]
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={participant.email}
                              onChange={(e) =>
                                updateParticipant(
                                  participant.id,
                                  "email",
                                  e.target.value
                                )
                              }
                              disabled={loading}
                              className={`w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none transition-colors font-medium text-sm sm:text-base ${
                                participant.isMe
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 focus:border-emerald-500"
                                  : validationErrors[
                                      `participant_${participant.id}_email`
                                    ]
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-200 bg-white text-gray-900 focus:border-purple-500"
                              } ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            />
                          </div>
                          {validationErrors[
                            `participant_${participant.id}_email`
                          ] && (
                            <p className="text-xs text-red-600 ml-1">
                              {
                                validationErrors[
                                  `participant_${participant.id}_email`
                                ]
                              }
                            </p>
                          )}

                          {/* Custom Amount Input */}
                          {splitType === "custom" && participant.email && (
                            <div className="relative">
                              <FaNairaSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Amount"
                                value={customSplits[participant.email] || ""}
                                onChange={(e) =>
                                  updateCustomSplit(
                                    participant.email,
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium"
                              />
                            </div>
                          )}

                          {/* Percentage Input */}
                          {splitType === "percentage" && participant.email && (
                            <div className="relative">
                              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="Percentage"
                                value={
                                  percentageSplits[participant.email] || ""
                                }
                                onChange={(e) =>
                                  updatePercentageSplit(
                                    participant.email,
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                className="w-full pl-10 sm:pl-11 pr-12 sm:pr-16 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-900 font-medium"
                              />
                              {percentageSplits[participant.email] &&
                                formData.totalAmount && (
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-emerald-600">
                                    ₦{calculatePercentageAmount(participant.email)}
                                  </span>
                                )}
                            </div>
                          )}
                        </div>

                        {!participant.isMe && participants.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeParticipant(participant.id)}
                            disabled={loading}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addParticipant}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add Participant</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Optional Notes
              </h2>
              <textarea
                placeholder="Add any additional details about this bill..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
                  })
                }
                disabled={loading}
                rows="4"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none text-sm sm:text-base text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-2xl hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Creating Bill...</span>
                </>
              ) : (
                <>
                  <span>Create Bill</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-xl sm:text-2xl mb-2">⚡</div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Instant calculation
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-xl sm:text-2xl mb-2">🔒</div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Secure & private
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-xl sm:text-2xl mb-2">📱</div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Easy to share</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBillPage;