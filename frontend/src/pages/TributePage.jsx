import React, { useState } from "react";
import { Heart, Flame } from "lucide-react";
import { Button, Card, CardBody, Modal } from "../components";

export default function TributePage() {
  const [tributes, setTributes] = useState([
    {
      id: 1,
      name: "Sarah Martinez",
      message: "A wonderful soul who brought joy to everyone around them.",
      date: "June 22, 2026",
    },
    {
      id: 2,
      name: "James Wilson",
      message: "Forever grateful for the guidance and love you provided throughout the years.",
      date: "June 21, 2026",
    },
    {
      id: 3,
      name: "Emily Chen",
      message: "Thank you for the precious memories. Rest in peace, dear friend.",
      date: "June 20, 2026",
    },
  ]);

  const [candles, setCandles] = useState(new Set());
  const [showTributeForm, setShowTributeForm] = useState(false);
  const [newTribute, setNewTribute] = useState({ name: "", message: "" });

  const handleLightCandle = (id) => {
    setCandles((prev) => new Set(prev).add(id));
  };

  const handleAddTribute = () => {
    if (newTribute.name.trim() && newTribute.message.trim()) {
      setTributes((prev) => [
        {
          id: Math.max(...prev.map((t) => t.id), 0) + 1,
          name: newTribute.name,
          message: newTribute.message,
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      setNewTribute({ name: "", message: "" });
      setShowTributeForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0]">
      <div className="site-container py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <Flame size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
            A Place to Remember
          </h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            Share your memories, light a candle, and honor those we've loved and lost.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-8"
            onClick={() => setShowTributeForm(true)}
          >
            + Share a Tribute
          </Button>
        </section>

        {/* Tributes Grid */}
        <section>
          <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-8">
            Tributes ({tributes.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tributes.map((tribute) => (
              <Card key={tribute.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#1F2E27]">
                        {tribute.name}
                      </h3>
                      <p className="text-xs text-[#A8895C]">{tribute.date}</p>
                    </div>
                    <button
                      onClick={() => handleLightCandle(tribute.id)}
                      disabled={candles.has(tribute.id)}
                      className="p-2 hover:bg-[#EFEAE0] rounded transition-colors disabled:opacity-50"
                      title="Light a candle"
                    >
                      <Flame
                        size={20}
                        className={
                          candles.has(tribute.id)
                            ? "text-orange-500 fill-orange-500"
                            : "text-[#A8895C]"
                        }
                      />
                    </button>
                  </div>
                  <p className="text-[#3D3530] text-sm leading-relaxed">
                    "{tribute.message}"
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Add Tribute Form Modal */}
        <Modal
          isOpen={showTributeForm}
          onClose={() => setShowTributeForm(false)}
          title="Share Your Tribute"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={newTribute.name}
                onChange={(e) =>
                  setNewTribute({ ...newTribute, name: e.target.value })
                }
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">
                Your Tribute
              </label>
              <textarea
                value={newTribute.message}
                onChange={(e) =>
                  setNewTribute({ ...newTribute, message: e.target.value })
                }
                placeholder="Share a memory or kind words..."
                rows={4}
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleAddTribute}
                className="flex-1"
              >
                Submit Tribute
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowTributeForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Info Section */}
        <section 
          className="rounded-lg p-8 mt-16"
          style={{ backgroundColor: "#EFEAE0" }}
        >
          <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-4">
            Honoring Memory
          </h2>
          <p className="text-[#3D3530] mb-4">
            This tribute page is a sacred space to honor and remember those we love. 
            Every message, every candle lit, represents the enduring bond between 
            the living and those we've lost.
          </p>
          <p className="text-[#3D3530]">
            Share your favorite memories, kind words, or a simple acknowledgment of 
            their passing. Your tribute will help keep their spirit alive in the hearts 
            of all who knew them.
          </p>
        </section>
      </div>
    </div>
  );
}
