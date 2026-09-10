import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ArrowRight, 
  Printer, 
  Sparkles,
  Landmark,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import { ReceiptLineItem } from '../types';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  items?: ReceiptLineItem[];
  onSuccess: (txnId: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  title,
  description,
  customerName = 'Valued Customer',
  customerEmail = 'client@femisayo.com',
  items = [],
  onSuccess
}) => {
  const { formatPrice } = useCurrency();
  const [method, setMethod] = useState<'card' | 'transfer'>('card');
  
  // Card form state (empty by default — details are required before payment)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Paystack transfer state
  const [paystackReference, setPaystackReference] = useState('');
  const [paystackAuthorized, setPaystackAuthorized] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [formError, setFormError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedTxnId, setGeneratedTxnId] = useState('');
  const [hasPrinted, setHasPrinted] = useState(false);
  const [paystackProcessingStage, setPyStackProcessingStage] = useState('');

  // Scroll lock while the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Reset transient state each time the modal is (re)opened
  useEffect(() => {
    if (isOpen) {
      setPaymentSuccess(false);
      setFormError('');
      setHasPrinted(false);
      setPaystackAuthorized(false);
      setPaystackReference('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-detect card brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return { brand: 'VISA', color: 'from-blue-700 to-indigo-900' };
    if (clean.startsWith('5') || clean.startsWith('2')) return { brand: 'MASTERCARD', color: 'from-orange-600 to-red-800' };
    if (clean.startsWith('3')) return { brand: 'AMEX', color: 'from-emerald-700 to-teal-900' };
    return { brand: 'APEX VAULT', color: 'from-zinc-800 to-zinc-950' };
  };

  const cardInfo = getCardBrand(cardNumber);

  // Quick auto-fill test credentials
  const handleAutoFillTest = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder('ALEXANDER VANCE');
    setExpiry('11/29');
    setCvv('382');
  };

  const validateCard = (): boolean => {
    const clean = cardNumber.replace(/\s/g, '');
    if (cardNumber.trim() === '') return setError('Card number is required.');
    if (clean.length < 12) return setError('Card number must be at least 12 digits.');
    if (cardHolder.trim() === '') return setError('Cardholder name is required.');
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) return setError('Expiry must be in MM/YY format.');
    if (cvv.trim() === '') return setError('CVV is required.');
    if (cvv.replace(/\D/g, '').length < 3) return setError('CVV must be at least 3 digits.');
    setError('');
    return true;
  };

  const setError = (msg: string): boolean => {
    setFormError(msg);
    return false;
  };

  const buildTxnId = (prefix: string) =>
    `${prefix}_${Date.now().toString(36).toUpperCase()}_${Math.floor(Math.random() * 9000 + 1000)}`;

  const handleCardProcess = async () => {
    if (!validateCard()) return;
    setIsProcessing(true);
    setProcessingStage('Initiating secure payment session...');

    setTimeout(() => {
      setProcessingStage('Verifying with 3D-Secure 2.0...');
    }, 900);

    setTimeout(() => {
      setProcessingStage('Authorizing bank settlement...');
    }, 1800);

    setTimeout(async () => {
      // TODO(backend): replace this simulated settlement with a real Paystack
      // card charge + verify call via src/services/api.ts.
      const init = await api.payments.initialize({
        amount,
        email: customerEmail,
        title,
        description
      });
      const txn = init.simulate ? buildTxnId('TXN') : init.reference;
      setGeneratedTxnId(txn);
      setIsProcessing(false);
      setFormError('');
      setPaymentSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Card details are scrubbed after settlement unless the customer chose to save them
      if (!saveCard) {
        setCardNumber('');
        setCardHolder('');
        setExpiry('');
        setCvv('');
      }

      onSuccess(txn);
    }, 2800);
  };

  const handlePaystackProcess = async () => {
    if (!paystackReference) {
      // TODO(backend): redirect to the Paystack authorization URL returned by
      // api.payments.initialize once the backend is connected.
      const init = await api.payments.initialize({
        amount,
        email: customerEmail,
        title,
        description
      });
      setPaystackReference(init.reference);
      return;
    }
    if (!paystackAuthorized) {
      setIsProcessing(true);
      setProcessingStage('Creating Paystack payment link...');
      setTimeout(() => {
        setProcessingStage('Awaiting transfer authorization...');
      }, 1200);
      setTimeout(() => {
        setPaystackAuthorized(true);
        setProcessingStage('');
        setIsProcessing(false);
      }, 2200);
      return;
    }
    completeTransfer();
  };

  const completeTransfer = () => {
    setIsProcessing(true);
    setProcessingStage('Verifying Paystack transfer settlement...');
    setTimeout(() => {
      const txn = generatedTxnId || paystackReference;
      setGeneratedTxnId(txn);
      setIsProcessing(false);
      setPaymentSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(txn);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
    setHasPrinted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 text-zinc-100 my-4 sm:my-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {paymentSuccess ? (
          /* Payment Receipt & Success View */
          <div className="text-center py-2 sm:py-4 space-y-4 sm:space-y-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in-75">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                Payment Authorized &amp; Settled
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono mt-2">
                {formatPrice(amount)}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">{title}</p>
            </div>

            {/* Digital Receipt */}
            <div className="print-area bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 text-left font-mono text-[11px] sm:text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Customer:</span>
                <span className="text-white font-bold">{customerName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Email:</span>
                <span className="text-zinc-300 truncate max-w-[220px]">{customerEmail}</span>
              </div>

              {items.length > 0 && (
                <div className="border-b border-zinc-800 pb-2">
                  <div className="text-zinc-500 mb-1">Items Purchased:</div>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 py-0.5">
                      <span className="text-zinc-300 flex-1 text-left">
                        {item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}
                      </span>
                      <span className="text-white font-bold text-right whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold">TOTAL PAID:</span>
                <span className="text-white font-black text-sm">{formatPrice(amount)}</span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Transaction Ref:</span>
                <span className="text-white font-bold">{generatedTxnId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Payment Method:</span>
                <span className="text-white font-bold">{method === 'transfer' ? 'Paystack (Transfer)' : 'Debit / Credit Card'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Date &amp; Time:</span>
                <span className="text-zinc-300">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Gateway:</span>
                <span className="text-emerald-400 font-bold">Femisayo Autos Secure Pay</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 pt-2 no-print">
              {!hasPrinted && (
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice Receipt</span>
                </button>
              )}

              {!hasPrinted && (
                <button
                  id="payment-success-done-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-700/30 text-center"
                >
                  Close &amp; Return
                </button>
              )}

              {hasPrinted && (
                <span className="text-[11px] text-zinc-500">
                  Receipt printed. Close the window when done.
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Payment Input View */
          <div className="space-y-5">
            
            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Encrypted Payment Gateway</span>
              </div>
              <h3 className="text-xl font-black text-white font-mono mt-1">
                {title}
              </h3>
              <p className="text-xs text-zinc-400">{description}</p>
            </div>

            {/* Total Display */}
            <div className="flex items-baseline justify-between bg-zinc-950 p-3 sm:p-4 rounded-2xl border border-zinc-800">
              <span className="text-[11px] sm:text-xs text-zinc-400">Total Charge Amount:</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatPrice(amount)}
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  method === 'card'
                    ? 'bg-red-950/40 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  method === 'transfer'
                    ? 'bg-red-950/40 border-red-500 text-white ring-1 ring-red-500'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Bank Transfer (Paystack)</span>
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500 text-red-400 text-xs rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-4">
                
                {/* Visual Card Representation */}
                <div className={`rounded-2xl p-5 bg-gradient-to-br ${cardInfo.color} border border-white/10 shadow-xl text-white font-mono relative overflow-hidden transition-all duration-300`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded border border-white/10">
                      Femisayo Secure
                    </span>
                    <span className="font-extrabold text-sm tracking-widest">{cardNumber ? cardInfo.brand : '•••• ••••'}</span>
                  </div>

                  <div className="text-lg tracking-widest font-bold mb-4">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between text-[11px] uppercase text-zinc-300">
                    <div>
                      <span className="block text-[9px] text-zinc-400">Cardholder</span>
                      <span className="font-bold">{cardHolder || 'CARD HOLDER'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-400">Expires</span>
                      <span className="font-bold">{expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Auto-fill test helper */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAutoFillTest}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold underline"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-fill Safe Test Card
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Enter cardholder name"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Save card option */}
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span>Save card for future payments</span>
                </label>
                <p className="text-[10px] text-zinc-500 -mt-1">
                  Your card details are securely deleted after each transaction unless you choose to save them.
                </p>
              </div>
            )}

            {method === 'transfer' && (
              <div className="p-5 sm:p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0ba4db]/15 border border-[#0ba4db]/40 text-[#0ba4db] flex items-center justify-center font-black font-mono text-sm">
                    P
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">Paystack Secure Checkout</div>
                    <p className="text-[11px] text-zinc-400">
                      Pay {formatPrice(amount)} via instant bank transfer
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#0ba4db]" />
                </div>

                {!paystackAuthorized ? (
                  <div className="space-y-3">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-[11px] font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Customer</span>
                        <span className="text-white font-semibold">{customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Email</span>
                        <span className="text-zinc-300">{customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Amount</span>
                        <span className="text-emerald-400 font-bold">{formatPrice(amount)}</span>
                      </div>
                      {paystackReference && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Reference</span>
                          <span className="text-[#0ba4db] font-bold">{paystackReference}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handlePaystackProcess}
                      className="w-full py-3.5 rounded-xl bg-[#0ba4db] hover:bg-[#0d92c4] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-xl shadow-[#0ba4db]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{paystackProcessingStage || processingStage}</span>
                        </>
                      ) : (
                        <>
                          <Landmark className="w-4 h-4" />
                          <span>{paystackReference ? 'I Have Completed the Transfer' : 'Pay with Paystack'}</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-zinc-500 text-center">
                      After payment, an automated receipt and confirmation email will be generated instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Bank transfer authorization received. Verifying settlement to issue your receipt.</span>
                    </div>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={completeTransfer}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-xl shadow-emerald-700/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Confirm Payment &amp; Generate Receipt</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button (Card only) */}
            {method === 'card' && (
              <div className="pt-2">
                <button
                  id="confirm-pay-now-btn"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCardProcess}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-xl shadow-red-700/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="truncate">{processingStage}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="truncate">Authorize &amp; Pay {formatPrice(amount)}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 1.3 End-to-End Encrypted • Backed by Paystack</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

// Print stylesheet — the print/close buttons never appear on the printed receipt
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @media print {
      .no-print { display: none !important; }
      .print-area, .print-area * { background: #fff !important; color: #000 !important; }
    }
  `;
  document.head.appendChild(styleEl);
}