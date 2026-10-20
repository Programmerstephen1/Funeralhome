import { getApiBaseUrl } from "../services/config";
import React, { useState, useEffect } from "react";
import { Flower, ArrowLeft, Plus, CreditCard, Smartphone, AlertCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom"; 
import { Button, Card, CardBody, Modal } from "../components";

export default function VisitorFlowersPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved", portrait: null, donationNumber: "" });
  
  const [flowers, setFlowers] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Flowers_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [newFlower, setNewFlower] = useState({ from: "", arrangement: "", price: 0 });
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [pendingFlower, setPendingFlower] = useState(null);

  const API_URL = getApiBaseUrl();

  useEffect(() => {
    if (!checkoutRequestId || !pendingFlower) return undefined;
    let attempts = 0;
    const interval = window.setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch(`${API_URL}/api/payments/status/${encodeURIComponent(checkoutRequestId)}`);
        const status = await response.json().catch(() => ({}));
        if (status.status === "completed") {
          window.clearInterval(interval);
          setFlowers((current) => [{ ...pendingFlower, id: Date.now(), date: new Date().toLocaleDateString() }, ...current]);
          setPendingFlower(null);
          setCheckoutRequestId(null);
          setNewFlower({ from: "", arrangement: "", price: 0 });
          setPhone("");
          setShowForm(false);
          setPaymentMessage("Payment confirmed. Your tribute has been added in this browser.");
          setIsProcessing(false);
        } else if (status.status === "failed") {
          window.clearInterval(interval);
          setPendingFlower(null);
          setCheckoutRequestId(null);
          setPaymentError("The payment was cancelled or could not be completed. You can try again.");
          setIsProcessing(false);
        } else if (attempts >= 40) {
          window.clearInterval(interval);
          setPendingFlower(null);
          setCheckoutRequestId(null);
          setPaymentError("We haven’t received payment confirmation yet. Check your M-Pesa message or call us before trying again.");
          setIsProcessing(false);
        }
      } catch {
        if (attempts >= 40) {
          window.clearInterval(interval);
          setPendingFlower(null);
          setCheckoutRequestId(null);
          setPaymentError("We couldn’t confirm the payment status. Check your M-Pesa message or call us before trying again.");
          setIsProcessing(false);
        }
      }
    }, 3000);
    return () => window.clearInterval(interval);
  }, [checkoutRequestId, pendingFlower, API_URL]);

  const arrangements = [
    { name: "White Roses & Lilies", desc: "Classic elegance", price: 1500 },
    { name: "Mixed Garden Arrangement", desc: "Colorful & vibrant", price: 2000 },
    { name: "Peach & Cream Blooms", desc: "Soft & gentle", price: 1200 },
    { name: "Lavender Dreams", desc: "Calming & peaceful", price: 1800 },
    { name: "Sunflower Tribute", desc: "Warm & radiant", price: 1000 },
    { name: "Sympathy Wreath", desc: "Traditional honor", price: 3500 },
  ];

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Flowers_${dynamicId}`, JSON.stringify(flowers));
    }
  }, [flowers, dynamicId]);

  const handleAddFlower = async () => {
    if (newFlower.from === "" || newFlower.arrangement === "" || phone === "") {
      setPaymentError("Please fill out all details and provide a phone number.");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");
    setPaymentMessage("");

    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Please sign in before paying for a floral tribute.");

      const paymentResponse = await fetch(`${API_URL}/api/payments/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: newFlower.price, phone }),
      });

      const result = await paymentResponse.json().catch(() => ({}));
      if (!paymentResponse.ok) {
        throw new Error(result.message || result.error || "M-Pesa transaction failed to initiate.");
      }
      if (!result.checkout_request_id) throw new Error("The payment provider did not return a confirmation reference. Please call us before trying again.");
      setPendingFlower({ from: newFlower.from, arrangement: newFlower.arrangement });
      setCheckoutRequestId(result.checkout_request_id);
      setPaymentMessage("Payment prompt sent. Enter your M-Pesa PIN and keep this page open while we confirm it.");
      
    } catch (error) {
      setPaymentError(error.message || "Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSelectArrangement = (arr) => {
    setNewFlower({ ...newFlower, arrangement: arr.name, price: arr.price });
    setShowForm(true);
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#805400] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-16 text-center flex flex-col items-center">
          <div className="relative mb-6">
            {memorialData.portrait !== null ? (
              <div className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundImage: `url(${memorialData.portrait})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            ) : (
              <div className="w-48 h-48 rounded-full bg-[#EFEAE0] flex items-center justify-center border-4 border-white shadow-lg">
                <Flower size={64} className="text-[#805400] opacity-50" />
              </div>
            )}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md">
              <Flower size={24} className="text-[#805400]" />
            </div>
          </div>

          <p className="text-sm tracking-[0.28em] uppercase text-[#805400] mb-3">Floral Tributes</p>
          <h1 className="text-5xl font-serif font-semibold text-[#1F2E27] mb-4">
            In loving memory of {memorialData.name}
          </h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            Send a floral tribute to honor the family. 
          </p>
          
          {memorialData.donationNumber && (
            <div className="mt-6 flex items-center gap-2 bg-[#1F2E27] text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest shadow-md">
              <ShieldCheck size={16} className="text-[#805400]"/>
              FAMILY TREASURER CONTACT (CONFIRM DETAILS BEFORE SENDING): {memorialData.donationNumber.substring(0,4)} XXX {memorialData.donationNumber.substring(7)}. Site payments are handled separately.
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {arrangements.map((arr) => (
            <Card key={arr.name} className="hover:border-[#A8895C] transition-colors hover:shadow-lg group">
              <CardBody className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <Flower size={36} className="text-[#805400] group-hover:scale-110 transition-transform" />
                  <span className="text-[#1F2E27] font-bold">KSh {arr.price.toLocaleString()}</span>
                </div>
                <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-2">{arr.name}</h2>
                <p className="text-sm text-[#3D3530] mb-6">{arr.desc}</p>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => handleSelectArrangement(arr)}>
                  Send as Donation
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <section className="mb-12 bg-white p-8 md:p-12 rounded-[2rem] border border-[#E8DFD1] shadow-sm max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8 border-b border-[#E8DFD1] pb-4">
            The Digital Garden ({flowers.length})
          </h2>
          
          {flowers.length === 0 ? (
            <p className="text-[#3D3530] italic text-center py-12">The garden is waiting for its first tribute.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flowers.map((flower) => (
                <div key={flower.id} className="p-6 bg-[#F8F6F0] rounded-2xl border border-[#E8DFD1] flex flex-col justify-between group hover:shadow-md transition-all hover:-translate-y-1">
                  <div>
                    <Flower size={24} className="text-[#805400] mb-4" />
                    <p className="font-serif text-lg font-semibold text-[#1F2E27]">{flower.arrangement}</p>
                    <p className="text-sm text-[#3D3530] mt-2 italic font-serif">From: {flower.from}</p>
                  </div>
                  <p className="text-xs text-[#805400] mt-6 font-bold tracking-widest uppercase border-t border-[#E8DFD1] pt-4">{flower.date}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Confirm Floral Donation">
          <div className="space-y-5">
            <div className="bg-[#F8F6F0] border border-[#E8DFD1] p-4 rounded text-center mb-4">
              <p className="text-xs uppercase tracking-widest text-[#716860] font-bold mb-1">{newFlower.arrangement}</p>
              <span className="text-2xl font-bold text-[#1F2E27]">KSh {newFlower.price.toLocaleString()}</span>
            </div>

            {paymentError !== "" && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded text-xs flex items-start gap-2 font-semibold">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {paymentError}
              </div>
            )}
            {paymentMessage && <p className="rounded border border-[#E8DFD1] bg-[#F8F6F0] p-3 text-sm text-[#3D3530]" role="status">{paymentMessage}</p>}
            {!localStorage.getItem("token") && <p className="text-sm text-[#3D3530]">You’ll need to <Link to="/login" className="font-semibold underline">sign in</Link> before paying.</p>}

            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name</label>
              <input type="text" value={newFlower.from} onChange={(e) => setNewFlower({ ...newFlower, from: e.target.value })} placeholder="e.g. The Smith Family" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#716860] mb-2">M-Pesa Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone size={16} className="text-[#805400]" />
                </div>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="07XX XXX XXX" 
                  className="w-full pl-10 pr-4 py-3 border border-[#E8DFD1] bg-white rounded focus:outline-none focus:border-[#A8895C] transition-colors text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddFlower} disabled={isProcessing} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white disabled:opacity-50">
                {isProcessing ? "Processing..." : "Pay & Place Flower"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
