import React, { useState, useEffect } from "react";
import { ShieldCheck, ShoppingCart, Check, ChevronLeft, ChevronRight, X, Calendar, MapPin, Clock, Fuel, Route, Phone, Mail, CheckCircle, Camera, Video, PlayCircle } from "lucide-react";

// --- 1. The Categories & Sub-Categories ---
const categories = [
  { 
    id: "caskets_urns", 
    title: "Caskets & Urns", 
    desc: "A carefully curated selection of premium quality caskets and resting vessels.", 
    images: ["/images/caskets/casket3.jpeg"],
    subcategories: [
      { 
        id: "casket_list", 
        title: "Caskets", 
        desc: "Premium wood and metal caskets for dignified burials.", 
        images: ["/images/caskets/casket3.jpeg"] 
      },
      { 
        id: "urns", 
        title: "Cremation Urns", 
        desc: "Beautifully crafted vessels to preserve the ashes of your loved ones.", 
        images: ["/images/urns/images(0).jpg"] 
      }
    ]
  },
  { 
    id: "wreaths", 
    title: "Floral Wreaths", 
    desc: "Beautifully arranged fresh floral tributes to honor your loved one.", 
    images: ["/images/wreaths/wreath1.jpeg"] 
  },
  { 
    id: "setup", 
    title: "Service Setup", 
    desc: "Complete outdoor setup including premium tents, lowering gears, and decor.", 
    images: [
      "/images/tents/tent3.jpeg", 
      "/images/lowering-gears/setup10.jpeg"
    ],
    subcategories: [
      { 
        id: "lowering_gears", 
        title: "Lowering Gear", 
        desc: "Professional metal lowering gear and graveside decor.", 
        images: ["/images/lowering-gears/setup11.jpeg"] 
      },
      { 
        id: "tents", 
        title: "Tents", 
        desc: "High-quality marquees, seating, and outdoor decor.", 
        images: ["/images/tents/tent3.jpeg"] 
      }
    ]
  },
  { 
    id: "hearses", 
    title: "Hearses & Transport", 
    desc: "Dignified hearse and fleet services for a peaceful journey.", 
    images: ["/images/hearses/hearse1(0).jpeg"] 
  },
  { 
    id: "catering", 
    title: "Catering Services", 
    desc: "Premium plated and buffet services with dedicated waitstaff.", 
    images: ["/images/catering.jpg"] 
  },
  { 
    id: "attire", 
    title: "Family & Burial Attire", 
    desc: "Tailored suits, modest dresses, burial garments, and lapel ribbons.", 
    images: ["/images/ladies attire/Lattire1.jpeg"] 
  },
  { 
    id: "media", 
    title: "Photography & Media", 
    desc: "Professional photography, edited memorial videos, and live streaming.", 
    images: ["/images/images().jpg"] 
  }
];

// --- 2. The Products ---
const products = [
  // ==========================================
  // --- CASKETS ---
  // ==========================================
  { id: 101, categoryId: "casket_list", title: "Pure White Quilted Casket", desc: "Elegant white finish with premium padded interior.", price: 65000, images: ["/images/caskets/casket1().jpg", "/images/caskets/casket1(0).jpg"] },
  { id: 102, categoryId: "casket_list", title: "Standard Oak Finish Casket", desc: "Classic oak wood finish featuring a pristine white interior.", price: 45000, images: ["/images/caskets/casket2().jpeg", "/images/caskets/casket2(0).jpg"] },
  { id: 103, categoryId: "casket_list", title: "Glossy Mahogany Casket", desc: "Premium reddish-brown mahogany with a high-gloss finish.", price: 85000, images: ["/images/caskets/casket3().jpeg", "/images/caskets/casket3.jpeg"] },
  { id: 104, categoryId: "casket_list", title: "Classic Red Wood Casket", desc: "Traditional deep red wood build with sturdy handles.", price: 70000, images: ["/images/caskets/casket4.jpg"] },
  { id: 105, categoryId: "casket_list", title: "Premium Pine Casket", desc: "Smooth light wood finish for a natural, dignified rest.", price: 60000, images: ["/images/caskets/casket5().jpeg", "/images/caskets/casket5(0).jpeg", "/images/caskets/casket5(1).jpg", "/images/caskets/casket5(2).jpg"] },
  { id: 106, categoryId: "casket_list", title: "Two-Tone Executive Casket", desc: "Sophisticated two-tone metallic and wood finish.", price: 95000, images: ["/images/caskets/casket6().jpg", "/images/caskets/casket6(0).jpeg", "/images/caskets/casket6(1).jpg", "/images/caskets/casket6(2).jpg"] },
  { id: 107, categoryId: "casket_list", title: "Brown Elegant Casket", desc: "Ornate design with beautiful silver hardware accents.", price: 110000, images: ["/images/caskets/casket7(1).jpeg", "/images/caskets/casket7(2).jpeg"] },
  { id: 108, categoryId: "casket_list", title: "Classic Light Wood Casket", desc: "Traditional mid-tone solid wood construction.", price: 45000, images: ["/images/caskets/casket8.jpeg"] },
  { id: 109, categoryId: "casket_list", title: "Dark Executive Wood", desc: "Deep dark finish for a commanding presence.", price: 68000, images: ["/images/caskets/casket9.jpeg"] },
  { id: 110, categoryId: "casket_list", title: "Pearl White Casket", desc: "Glossy pure white body finished with silver handles.", price: 75000, images: ["/images/caskets/casket10(1).jpeg", "/images/caskets/casket10.jpeg"] },
  { id: 111, categoryId: "casket_list", title: "Heavy Duty Bronze Casket", desc: "Durable metal construction featuring an executive finish.", price: 120000, images: ["/images/caskets/casket11(0).jpeg", "/images/caskets/casket11.jpeg"] },
  { id: 112, categoryId: "casket_list", title: "Sleek White Wood Casket", desc: "Minimalist white casket with gold-tone hardware.", price: 55000, images: ["/images/caskets/casket12.jpeg"] },
  { id: 113, categoryId: "casket_list", title: "Standard Cedar Casket", desc: "Affordable and elegant solid cedar box.", price: 42000, images: ["/images/caskets/casket13.jpeg"] },
  { id: 114, categoryId: "casket_list", title: "Deep Mahogany Casket", desc: "Rich mahogany with soft white lining.", price: 80000, images: ["/images/caskets/casket14.jpeg"] },
  { id: 115, categoryId: "casket_list", title: "Pure White Domed Casket", desc: "Elegant domed lid pure white design.", price: 62000, images: ["/images/caskets/casket15.jpeg"] },
  { id: 116, categoryId: "casket_list", title: "Classic Light Oak Casket", desc: "Traditional light oak build with polished handles.", price: 65000, images: ["/images/caskets/casket16.jpeg"] },
  { id: 117, categoryId: "casket_list", title: "Polished Oak Casket", desc: "High gloss finished oak with sturdy grip bars.", price: 66000, images: ["/images/caskets/casket17.jpeg"] },
  { id: 118, categoryId: "casket_list", title: "Solid Oak Heritage Casket", desc: "Heavy-duty solid oak construction with a natural grain.", price: 80000, images: ["/images/caskets/casket18(0).jpg", "/images/caskets/casket18.jpg" ] },
  { id: 119, categoryId: "casket_list", title: "Serenity Blue Interior Casket", desc: "Clean white exterior revealing a peaceful blue and white padded interior.", price: 55000, images: ["/images/caskets/casket19(0).jpg", "/images/caskets/casket19(1).jpg", "/images/caskets/casket19(2).jpg", "/images/caskets/casket19(3).jpg", "/images/caskets/casket19(4).jpg"] },
  { id: 120, categoryId: "casket_list", title: "Gold Accent White Casket", desc: "Luxurious white finish bordered with subtle gold detailing.", price: 88000, images: ["/images/caskets/casket20().jpg", "/images/caskets/casket20(0).jpg", "/images/caskets/casket20(1).jpg", "/images/caskets/casket20(2).jpg"] },
  { id: 121, categoryId: "casket_list", title: "Classic Domed White Casket", desc: "Traditional domed lid with premium white padding.", price: 70000, images: ["/images/caskets/casket21().jpeg", "/images/caskets/casket21(0).jpeg"] },
  { id: 122, categoryId: "casket_list", title: "Standard White Wood Casket", desc: "Affordable and dignified pure white wood finish.", price: 40000, images: ["/images/caskets/casket22(0).jpg", "/images/caskets/casket22(1).jpg"] },
  { id: 123, categoryId: "casket_list", title: "Pristine White Metal Casket", desc: "Durable metal construction featuring a pure white gloss.", price: 95000, images: ["/images/caskets/casket23().jpg", "/images/caskets/casket23(0).jpeg", "/images/caskets/casket23(1).jpg", "/images/caskets/casket23(2).jpg"] },
  { id: 124, categoryId: "casket_list", title: "Obsidian Black Metal Casket", desc: "Sleek, dark metallic finish for an executive, profound resting place.", price: 105000, images: ["/images/caskets/casket24().jpg", "/images/caskets/casket24(0).jpg", "/images/caskets/casket24(1).jpg", "/images/caskets/casket24(2).jpg", "/images/caskets/casket24(3).jpeg"] },
  { id: 125, categoryId: "casket_list", title: "Walnut Executive Metal Casket", desc: "Dark polished metallic design with sturdy grip handles.", price: 100000, images: ["/images/caskets/casket25().jpg", "/images/caskets/casket25(0).jpg", "/images/caskets/casket25(1).jpg"] },
  { id: 126, categoryId: "casket_list", title: "Glossy Black Casket", desc: "Highly polished black finish for a modern look.", price: 98000, images: ["/images/caskets/casket26.jpeg"] },
  { id: 127, categoryId: "casket_list", title: "Cream Velvet Interior Casket", desc: "Light exterior finish paired with a luxurious cream velvet interior.", price: 72000, images: ["/images/caskets/casket27().jpg", "/images/caskets/casket27(0).jpg", "/images/caskets/casket27(1).jpg"] },
  { id: 128, categoryId: "casket_list", title: "Premium Dark Oak Casket", desc: "High-grade oak with a deep stain and intricate handles.", price: 82000, images: ["/images/caskets/casket28().jpeg"] },
  { id: 129, categoryId: "casket_list", title: "Mahogany Elegance Casket", desc: "Beautifully carved high-gloss mahogany wood.", price: 92000, images: ["/images/caskets/casket29().jpeg", "/images/caskets/casket29(0).jpeg"] },
  { id: 130, categoryId: "casket_list", title: "Premium Walnut Finish Casket", desc: "High-end wooden box design showcasing expert craftsmanship.", price: 98000, images: ["/images/caskets/casket30().jpeg", "/images/caskets/casket30(0).jpeg", "/images/caskets/casket30(1).jpeg"] },

  // ==========================================
  // --- URNS ---
  // ==========================================
  { id: 151, categoryId: "urns", title: "Classic Marble Box Urn", desc: "Solid cultured marble in a deep burgundy finish.", price: 18000, images: ["/images/urns/images(0).jpg"] },
  { id: 152, categoryId: "urns", title: "Rustic Clay Urn", desc: "Hand-crafted rustic earth-tone vessel.", price: 12000, images: ["/images/urns/images(1).jpg"] },
  { id: 153, categoryId: "urns", title: "Bronze Flying Birds Urn", desc: "Elegant brass urn with engraved flying doves.", price: 22000, images: ["/images/urns/images(2).jpg"] },
  { id: 154, categoryId: "urns", title: "Purple Floral Keepsake", desc: "Delicate purple and silver finish with floral motif.", price: 15000, images: ["/images/urns/images(3).jpg"] },
  { id: 155, categoryId: "urns", title: "Natural Stone Urn", desc: "Textured natural stone finish.", price: 20000, images: ["/images/urns/images(4).jpg"] },
  { id: 156, categoryId: "urns", title: "Sleek Silver Urn", desc: "Minimalist brushed silver metal design.", price: 14000, images: ["/images/urns/images(5).jpg"] },
  { id: 157, categoryId: "urns", title: "Grey Granite Urn", desc: "Heavy-duty polished grey granite.", price: 25000, images: ["/images/urns/images(6).jpg"] },
  { id: 158, categoryId: "urns", title: "Engraved Wooden Box", desc: "Premium dark wood with intricate front engraving.", price: 16000, images: ["/images/urns/images(7).jpg"] },
  { id: 159, categoryId: "urns", title: "Silver Display Urn", desc: "Classic metallic urn perfect for mantle display.", price: 13500, images: ["/images/urns/images(8).jpg"] },
  { id: 160, categoryId: "urns", title: "Minimalist Sandstone Urn", desc: "Light, textured sandstone finish.", price: 17000, images: ["/images/urns/images(9).jpg"] },
  { id: 161, categoryId: "urns", title: "Green and Gold Brass Urn", desc: "Deep green body with dual gold bands.", price: 19000, images: ["/images/urns/images(10).jpg"] },
  { id: 162, categoryId: "urns", title: "Carved Tree Wooden Urn", desc: "Warm wood finish featuring a 'Tree of Life' engraving.", price: 15500, images: ["/images/urns/images(11).jpg"] },
  { id: 163, categoryId: "urns", title: "Blue Swirl Glass Urn", desc: "Artistic blue swirl pattern, includes protective bag.", price: 21000, images: ["/images/urns/images(12).jpg"] },
  { id: 164, categoryId: "urns", title: "White Rose Brass Urn", desc: "Pristine white finish with a gold engraved rose.", price: 18500, images: ["/images/urns/images(13).jpg"] },
  { id: 165, categoryId: "urns", title: "Midnight Blue Keepsake", desc: "Deep blue speckled finish with a velvet bag.", price: 16500, images: ["/images/urns/images(14).jpg"] },
  { id: 166, categoryId: "urns", title: "Silver Teardrop Urn", desc: "Unique teardrop shape with intricate silver engraving.", price: 24000, images: ["/images/urns/images(15).jpg"] },

  // ==========================================
  // --- WREATHS ---
  // ==========================================
  { id: 201, categoryId: "wreaths", title: "Classic Heart Wreath", desc: "Elegant heart-shaped floral display.", price: 8500, images: ["/images/wreaths/wreath1.jpeg"] },
  { id: 202, categoryId: "wreaths", title: "White Round Tribute", desc: "Beautifully arranged white circular wreath.", price: 7500, images: ["/images/wreaths/wreath2.jpeg"] },
  { id: 203, categoryId: "wreaths", title: "Yellow Accent Wreath", desc: "Vibrant yellow and green floral mix.", price: 8000, images: ["/images/wreaths/wreath3.jpeg"] },
  { id: 204, categoryId: "wreaths", title: "Dome Pedestal Wreath", desc: "Elegant dome-shaped floral display.", price: 14000, images: ["/images/wreaths/wreath4.jpeg"] },
  { id: 205, categoryId: "wreaths", title: "Standing Heart Tribute", desc: "Elevated heart-shaped display on a stand.", price: 15000, images: ["/images/wreaths/wreath5.jpeg"] },
  { id: 206, categoryId: "wreaths", title: "Hanging Floral Chandelier", desc: "Unique suspended floral arrangement.", price: 25000, images: ["/images/wreaths/wreath6.jpeg"] },
  { id: 207, categoryId: "wreaths", title: "Red & White Accent Wreath", desc: "White base with striking red floral accents.", price: 8000, images: ["/images/wreaths/wreath7.jpeg"] },
  { id: 208, categoryId: "wreaths", title: "Sunshine Mix Round Wreath", desc: "Vibrant yellow and white circular tribute.", price: 7500, images: ["/images/wreaths/wreath8.jpeg"] },
  { id: 209, categoryId: "wreaths", title: "Classic Round Display", desc: "Traditional round floral ring.", price: 7000, images: ["/images/wreaths/wreath9.jpeg"] },
  { id: 210, categoryId: "wreaths", title: "Cross & Heart Combo Set", desc: "A beautifully matched set featuring a cross and hearts.", price: 22000, images: ["/images/wreaths/wreath10.jpeg"] },
  { id: 211, categoryId: "wreaths", title: "Pristine White Round Wreath", desc: "Classic circular arrangement in pure white.", price: 7000, images: ["/images/wreaths/wreath11.jpeg"] },
  { id: 212, categoryId: "wreaths", title: "Autumn Hue Wreath", desc: "Warm colored floral arrangement.", price: 8000, images: ["/images/wreaths/wreath12.jpeg"] },
  { id: 213, categoryId: "wreaths", title: "Pure White Cross Wreath", desc: "Traditional cross arrangement with white blooms.", price: 9500, images: ["/images/wreaths/wreath13.jpeg"] },
  { id: 214, categoryId: "wreaths", title: "Dual Heart Setup", desc: "Two corresponding heart arrangements.", price: 16000, images: ["/images/wreaths/wreath14.jpeg"] },
  { id: 215, categoryId: "wreaths", title: "Custom Text Round Wreath", desc: "Round wreath tailored with a name or title.", price: 9000, images: ["/images/wreaths/wreath15.jpeg"] },
  { id: 216, categoryId: "wreaths", title: "Sympathy Standing Cross", desc: "A large cross mounted on a stand.", price: 12000, images: ["/images/wreaths/wreath16.jpeg"] },
  { id: 217, categoryId: "wreaths", title: "Custom Lettering Heart", desc: "Heart wreath with custom ribbon.", price: 11500, images: ["/images/wreaths/wreath17.jpeg"] },
  { id: 218, categoryId: "wreaths", title: "Casket Floral Spray", desc: "Luxurious floral blanket designed to rest atop the casket.", price: 18000, images: ["/images/wreaths/wreath18.jpeg"] },
  { id: 219, categoryId: "wreaths", title: "Premium Casket Spray", desc: "Thick, full coverage floral display for the casket.", price: 20000, images: ["/images/wreaths/wreath19.jpeg"] },
  { id: 220, categoryId: "wreaths", title: "Elegant White Ring", desc: "A pristine white floral ring.", price: 7500, images: ["/images/wreaths/wreath20.jpeg"] },
  { id: 221, categoryId: "wreaths", title: "Deep Red Heart Wreath", desc: "Stunning full red rose heart arrangement.", price: 10000, images: ["/images/wreaths/wreath21.jpeg"] },
  { id: 222, categoryId: "wreaths", title: "Red and White Ring", desc: "A beautiful mixture of red and white roses.", price: 8500, images: ["/images/wreaths/wreath22.jpeg"] },
  { id: 223, categoryId: "wreaths", title: "Broken Heart Tribute", desc: "Symbolic broken heart floral arrangement in red and white.", price: 12000, images: ["/images/wreaths/wreath23.jpeg"] },
  { id: 224, categoryId: "wreaths", title: "Classic Red Casket Spray", desc: "A long spray of red roses for the casket.", price: 17000, images: ["/images/wreaths/wreath24.jpeg"] },
  { id: 226, categoryId: "wreaths", title: "Large White Cross", desc: "An oversized white cross with red accents.", price: 14000, images: ["/images/wreaths/wreath26.jpeg"] },
  { id: 227, categoryId: "wreaths", title: "White & Red Heart Display", desc: "Detailed heart shape combining fresh white and deep red flowers.", price: 10500, images: ["/images/wreaths/wreath27.jpeg"] },
  { id: 228, categoryId: "wreaths", title: "Green and White Accent", desc: "Fresh greenery mixed with white floral blooms.", price: 8000, images: ["/images/wreaths/wreath28.jpg"] },
  { id: 229, categoryId: "wreaths", title: "Standing Sympathy Spray", desc: "Elevated floral spray designed to stand tall at the service.", price: 16000, images: ["/images/wreaths/wreath29.jpg"] },
  { id: 230, categoryId: "wreaths", title: "Premium Floral Basket", desc: "A rich, low-profile basket arrangement of vibrant fresh blooms.", price: 13000, images: ["/images/wreaths/wreath30.jpg"] },
  { id: 231, categoryId: "wreaths", title: "Standing Floral Display", desc: "Tall standing arrangement for the graveside or chapel.", price: 15500, images: ["/images/wreaths/wreath31.jpg"] },
  { id: 232, categoryId: "wreaths", title: "Large Basket Spray", desc: "Oversized basket filled with fresh cut flowers.", price: 14500, images: ["/images/wreaths/wreath32.jpg"] },

  // ==========================================
  // --- LOWERING GEARS & SETUP ---
  // ==========================================
  { id: 300, categoryId: "lowering_gears", title: "Executive Placement Setup ", desc: "Complete elegant lowering service setup.", price: 25000, images: ["/images/lowering-gears/setup10(0).jpeg", "/images/lowering-gears/setup10(1).jpeg"] },
  { id: 301, categoryId: "lowering_gears", title: "Graveside AstroTurf Setup", desc: "Lowering gear accompanied by premium artificial grass.", price: 20000, images: ["/images/lowering-gears/setup.jpeg"] },
  { id: 302, categoryId: "lowering_gears", title: "Standard Lowering Device 1", desc: "Heavy-duty metal lowering gear mechanism.", price: 15000, images: ["/images/lowering-gears/setup1.jpeg"] },
  { id: 303, categoryId: "lowering_gears", title: "Standard Lowering Device 2", desc: "Durable gear with sturdy green straps.", price: 15000, images: ["/images/lowering-gears/setup2.jpeg"] },
  { id: 304, categoryId: "lowering_gears", title: "Standard Lowering Device 3", desc: "Metal framework gear for stable descents.", price: 15000, images: ["/images/lowering-gears/setup3.jpeg","/images/lowering-gears/setup5.jpeg"] }, 
  { id: 305, categoryId: "lowering_gears", title: "Executive Placement Setup 4", desc: "Elegant lowering gear wrapped in green.", price: 25000, images: ["/images/lowering-gears/setup11.jpeg"] }, 
  { id: 306, categoryId: "lowering_gears", title: "VIP Red Carpet Setup 5", desc: "Service setup featuring a red carpet walkway.", price: 35000, images: ["/images/lowering-gears/setup12.jpeg"] }, 
  { id: 307, categoryId: "lowering_gears", title: "Executive Walkway", desc: "Premium graveside runner placement.", price: 18000, images: ["/images/lowering-gears/setup18.jpeg", "/images/lowering-gears/setup19.jpeg", "/images/lowering-gears/setup20.jpeg", "/images/lowering-gears/setup18.jpeg"] }, 
  { id: 308, categoryId: "lowering_gears", title: "VIP Red Carpet Setup", desc: "Complete outdoor red carpet experience.", price: 35000, images: ["/images/lowering-gears/setup14.jpeg"] },
  { id: 309, categoryId: "lowering_gears", title: "VIP Red Carpet Setup 2", desc: "Red carpet setup leading to the tent.", price: 35000, images: ["/images/lowering-gears/setup16.jpeg"] }, 
  { id: 310, categoryId: "lowering_gears", title: "Executive Walkway 2", desc: "Long red carpet runner for family access.", price: 18000, images: ["/images/lowering-gears/setup17.jpeg"] },

  // ==========================================
  // --- TENTS ---
  // ==========================================
  { id: 351, categoryId: "tents", title: "Standard Pagoda Tent 1", desc: "High-peak white tent ideal for family seating.", price: 10000, images: ["/images/tents/tent1.jpeg"] },
  { id: 352, categoryId: "tents", title: "Standard Pagoda Tent 2", desc: "Medium-sized white tent for outdoor gatherings.", price: 10000, images: ["/images/tents/tent2.jpeg"] },
  { id: 353, categoryId: "tents", title: "Premium Marquee Tent", desc: "Spacious clear-span marquee tent for large gatherings and VIPs.", price: 50000, images: ["/images/tents/tent3.jpeg"] },
  { id: 354, categoryId: "tents", title: "Graveside Red Carpet Tent", desc: "Specialized tent placement featuring a dignified red carpet.", price: 15000, images: ["/images/tents/tent4.jpeg"] },
  { id: 355, categoryId: "tents", title: "Basic Gazebo Shade", desc: "Simple pop-up tent for utility, overflow, or minimal shade.", price: 5000, images: ["/images/tents/tent5.jpeg"] },
  { id: 356, categoryId: "tents", title: "Extended Gathering Tent 1", desc: "Large open-air structure for shielding large groups.", price: 25000, images: ["/images/tents/tent6.jpeg"] },
  { id: 357, categoryId: "tents", title: "Extended Gathering Tent 2", desc: "Spacious multi-pole tent setup for extended family.", price: 25000, images: ["/images/tents/tent7.jpeg"] },

  // ==========================================
  // --- HEARSES ---
  // ==========================================
  { id: 401, categoryId: "hearses", title: "Mercedes Executive Hearse 1", desc: "Dignified Mercedes-Benz transport. Displays full exterior and interior suite. Base daily rate shown.", price: 25000, images: ["/images/hearses/hearse1(0).jpeg", "/images/hearses/hearse1(1).jpeg", "/images/hearses/hearse1(2).jpeg", "/images/hearses/hearse1(3).jpeg", "/images/hearses/hearse1(4).jpeg", "/images/hearses/hearse1(5).jpeg"] },
  { id: 402, categoryId:"hearses", title: "Executive Mercedes Hearse 2", desc: "Durable and highly capable luxury transport.", price: 28000, images: ["/images/hearses/hearse5(0).jpeg", "/images/hearses/hearse5(1).jpeg", "/images/hearses/hearse5(2).jpeg", "/images/hearses/hearse5(3).jpeg"] },
  { id: 403, categoryId:"hearses", title: "Classic Van Hearse", desc: "Spacious, reliable, and elegant van transport for the final journey. Base daily rate shown.", price: 15000, images: ["/images/hearses/hearse2(0).jpeg", "/images/hearses/hearse2(1).jpeg", "/images/hearses/hearse2(3).jpeg", "/images/hearses/hearse2(4).jpeg", "/images/hearses/hearse2(5).jpg", "/images/hearses/hearse2(6).jpg", "/images/hearses/hearse2(7).jpg"] },
  { id: 404, categoryId: "hearses", title: "Executive Family Bus", desc: "Luxury bus capable of comfortably transporting the extended family. Base daily rate shown.", price: 35000, images: ["/images/hearses/hearse3(0).jpeg", "/images/hearses/hearse3(1).jpeg", "/images/hearses/hearse3(2).jpeg", "/images/hearses/hearse3(3).jpg", "/images/hearses/hearse3(4).jpg"] },
  { id: 405, categoryId:"hearses", title: "Premium Black Transport", desc: "Discreet and highly professional dark vehicle option. Base daily rate shown.", price: 20000, images: ["/images/hearses/hearse4(0).jpg"] },

  // ==========================================
  // --- ATTIRE (MEN'S & WOMEN'S) ---
  // ==========================================
  { id: 601, categoryId: "attire", title: "Premium Men's Burial Suit", desc: "Complete 3-piece dark suit tailored specifically for the deceased. Includes shirt and tie.", price: 18000, images: ["/assets/mens-burial-suit.jpg"] },
  { id: 602, categoryId: "attire", title: "Men's Traditional Shroud", desc: "Dignified, high-quality fabric shroud tailored for traditional burial rites.", price: 12000, images: ["/assets/mens-shroud.jpg"] },
  { id: 603, categoryId: "attire", title: "Custom Men's Suit (Family)", desc: "Tailored 3-piece dark suit for family members. Includes measurements and fitting sessions.", price: 15000, images: ["/assets/suit-mens.jpg"] },
  { id: 604, categoryId: "attire", title: "Women's Modest Dress", desc: "Elegant, conservative dress available in black, navy, or dark grey.", price: 8500, images: ["/assets/dress-womens.jpg"] },
  { id: 605, categoryId: "attire", title: "Elegant White Lace Dress", desc: "Beautiful white lace modest dress for family members or burial.", price: 7500, images: ["/images/ladies attire/Lattire1().jpeg", "/images/ladies attire/Lattire1.jpeg"] },
  { id: 606, categoryId: "attire", title: "Custom Ribbon Lapels", desc: "Personalized memorial ribbons for family and guests (Pack of 50).", price: 2500, images: ["/assets/ribbons.jpg"] },

  // ==========================================
  // --- MEDIA ---
  // ==========================================
  { id: 701, categoryId: "media", title: "Standard Photo Package", desc: "One professional photographer for 6 hours. Includes digital gallery and 50 printed photos.", price: 25000, images: ["/images/images().jpg"] },
  { id: 702, categoryId: "media", title: "Cinematic Videography & Livestream", desc: "Two videographers, edited memorial video, and professional livestream link for diaspora relatives.", price: 55000, images: ["/images/images.jpg"] }
];

// --- REUSABLE COMPONENT: Automatic Image Slider ---
const ImageSlider = ({ images, altText, aspectClass }) => {
  const [imgIndex, setImgIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={`w-full ${aspectClass} bg-[#F4F1EA] border-b border-[#E8DFD1] overflow-hidden relative group/slider`}>
      <img 
        src={images[imgIndex]} 
        alt={altText}
        onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=Photo+Pending" }} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImg}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-[#1F2E27] hover:bg-[#A8895C] hover:text-white opacity-0 group-hover/slider:opacity-100 transition-all z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextImg}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-[#1F2E27] hover:bg-[#A8895C] hover:text-white opacity-0 group-hover/slider:opacity-100 transition-all z-10"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${idx === imgIndex ? "bg-[#A8895C] w-4" : "bg-white/60 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- COMPONENT: Category / Sub-Category Card (No Prices) ---
const CategoryCard = ({ item, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-xl transition-all duration-300 flex flex-col text-left group overflow-hidden w-full"
  >
    <ImageSlider images={item.images} altText={item.title} aspectClass="aspect-[4/3]" />
    <div className="p-6 flex-grow flex flex-col w-full">
      <h3 className="text-xl font-serif text-[#1F2E27] mb-3 group-hover:text-[#A8895C] transition-colors">
        {item.title}
      </h3>
      <p className="text-sm text-[#3D3530] leading-relaxed mb-6">
        {item.desc}
      </p>
      <span className="mt-auto text-xs uppercase tracking-widest text-[#1F2E27] font-semibold border-b border-[#1F2E27] pb-1 w-fit group-hover:border-[#A8895C] group-hover:text-[#A8895C] transition-colors">
        View Collection
      </span>
    </div>
  </button>
);

// --- COMPONENT: Product Card (Shows Prices and Add to Cart) ---
const ProductCard = ({ item, recentlyAdded, onAddToCart, onOpenRentalModal }) => (
  <div className="bg-white border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
    <ImageSlider images={item.images} altText={item.title} aspectClass="aspect-square" />
    <div className="p-6 flex-grow flex flex-col text-center">
      <h3 className="text-xl font-serif text-[#1F2E27] mb-3 border-b border-[#E8DFD1] pb-3 mx-4">
        {item.title}
      </h3>
      <p className="text-sm text-[#3D3530] leading-relaxed mb-6 px-2">
        {item.desc}
      </p>
      <div className="mt-auto flex flex-col items-center gap-4">
        <span className="text-lg font-semibold text-[#1F2E27]">
          KSh {item.price.toLocaleString()}
          {item.categoryId === "hearses" && <span className="text-xs text-[#8F847C] block mt-1 font-normal">+ Dynamic Mileage</span>}
        </span>
        <button 
          onClick={() => {
            if (item.categoryId === "hearses") {
              onOpenRentalModal(item);
            } else {
              onAddToCart(item);
            }
          }}
          disabled={recentlyAdded === item.id}
          className={`w-full py-3 text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
            recentlyAdded === item.id 
              ? "bg-emerald-700 text-white" 
              : "bg-[#1F2E27] text-white hover:bg-[#A8895C]"
          }`}
        >
          {recentlyAdded === item.id ? (
            <><Check size={16} /> Added</>
          ) : (
            item.categoryId === "hearses" ? (
              "Schedule Hearse"
            ) : (
              <><ShoppingCart size={16} /> Add to Booking</>
            )
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---
export default function CatalogPage({ dynamicId, cart, addToCart, bookRental }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(null);

  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedHearse, setSelectedHearse] = useState(null);
  
  // Advanced State for Enterprise Pricing
  const [rentalDetails, setRentalDetails] = useState({ 
    pickup: "", 
    dropoff: "", 
    pickupDate: "", 
    returnDate: "",
    mileagePlan: "limited", 
    estimatedDistance: "",
    fuelPolicy: "full_to_full" 
  });

  // State for the custom Forms
  const [cateringForm, setCateringForm] = useState({ name: "", phone: "", requirements: "" });

  // Check if we are in one of the new full-window immersive modes
  const isImmersiveMode = activeCategory && (activeCategory.id === "catering" || activeCategory.id === "media");

  // Robust Deep-Link Listener
  useEffect(() => {
    if (dynamicId) {
      const mainCat = categories.find(c => c.id === dynamicId);
      if (mainCat) {
        setActiveCategory(mainCat);
        setActiveSubCategory(null);
        return;
      }
      
      for (const cat of categories) {
        if (cat.subcategories) {
          const sub = cat.subcategories.find(s => s.id === dynamicId);
          if (sub) {
            setActiveCategory(cat);
            setActiveSubCategory(sub);
            return;
          }
        }
      }
    } else {
      setActiveCategory(null);
      setActiveSubCategory(null);
    }
  }, [dynamicId]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setRecentlyAdded(product.id);
    setTimeout(() => setRecentlyAdded(null), 2000);
  };

  const handleOpenRentalModal = (hearse) => {
    setSelectedHearse(hearse);
    setShowRentalModal(true);
  };

  // --- DYNAMIC PRICING ENGINE ---
  const calculateTotal = () => {
    if (!selectedHearse) return 0;
    
    const baseDailyRate = selectedHearse.price;
    let days = 1;
    if (rentalDetails.pickupDate && rentalDetails.returnDate) {
      const start = new Date(rentalDetails.pickupDate);
      const end = new Date(rentalDetails.returnDate);
      const timeDiff = end.getTime() - start.getTime();
      if (timeDiff > 0) {
        days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }
    }
    const totalBasePrice = baseDailyRate * days;

    let distanceCharge = 0;
    const distance = Number(rentalDetails.estimatedDistance) || 0;
    
    if (rentalDetails.mileagePlan === "limited") {
      const allowedDistance = 150 * days;
      if (distance > allowedDistance) {
        distanceCharge = (distance - allowedDistance) * 120;
      }
    } else if (rentalDetails.mileagePlan === "unlimited") {
      distanceCharge = 8000 * days; 
    }

    let fuelCharge = 0;
    if (rentalDetails.fuelPolicy === "pre_purchased") {
      fuelCharge = 12500; 
    }

    return totalBasePrice + distanceCharge + fuelCharge;
  };

  const handleConfirmRental = () => {
    const finalCalculatedPrice = calculateTotal();
    
    const customizedHearse = {
      ...selectedHearse,
      title: `${selectedHearse.title} (Scheduled Transport)`,
      price: finalCalculatedPrice,
      rentalSchedule: rentalDetails
    };
    
    if (bookRental) {
      bookRental(customizedHearse);
    } else {
      addToCart(customizedHearse);
    }
    
    setRecentlyAdded(selectedHearse.id);
    setTimeout(() => setRecentlyAdded(null), 2000);
    
    setShowRentalModal(false);
    setRentalDetails({ pickup: "", dropoff: "", pickupDate: "", returnDate: "", mileagePlan: "limited", estimatedDistance: "", fuelPolicy: "full_to_full" });
  };

  const handleBackClick = () => {
    if (activeCategory?.subcategories && activeSubCategory) {
      window.location.hash = `#catalog/${activeCategory.id}`;
    } else {
      window.location.hash = "#catalog";
    }
  };

  const isFormValid = rentalDetails.pickup.trim() && rentalDetails.dropoff.trim() && rentalDetails.pickupDate && rentalDetails.returnDate && rentalDetails.estimatedDistance > 0;

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col relative">
      <div className="pt-12 pb-24 flex-grow">
        
        {/* ========================================================================= */}
        {/* STANDARD DIRECTORY LAYOUT (Hidden if in full-screen immersive mode) */}
        {/* ========================================================================= */}
        {!isImmersiveMode && (
          <section className="site-container px-4 mx-auto max-w-6xl animate-fadeIn">
            
            {/* Page Header */}
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">
                Classic Provisions
              </p>
              <h2 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
                Curated Memorial Catalog
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 w-fit mx-auto px-4 py-2 rounded-full border border-emerald-100 mb-8">
                <ShieldCheck size={16} />
                <span>100% Secure Checkout via M-Pesa API</span>
              </div>
            </div>

            {/* VIEW 1: Main Directory Cards */}
            {!activeCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <CategoryCard 
                    key={cat.id} 
                    item={cat} 
                    onClick={() => window.location.hash = `#catalog/${cat.id}`} 
                  />
                ))}
              </div>
            )}

            {/* VIEW 2: Sub-Category Cards */}
            {activeCategory && activeCategory.subcategories && !activeSubCategory && (
              <div>
                <button 
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
                >
                  <ChevronLeft size={16} /> Back to Directory
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8">
                  {activeCategory.subcategories.map((sub) => (
                    <CategoryCard 
                      key={sub.id} 
                      item={sub} 
                      onClick={() => window.location.hash = `#catalog/${sub.id}`} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 3: Final Products Grid (For Standard Categories) */}
            {activeCategory && (!activeCategory.subcategories || activeSubCategory) && (
              <div>
                <button 
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
                >
                  <ChevronLeft size={16} /> 
                  {activeCategory.subcategories ? `Back to ${activeCategory.title}` : "Back to Directory"}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {products
                    .filter((p) => p.categoryId === (activeSubCategory ? activeSubCategory.id : activeCategory.id))
                    .map((item) => (
                      <ProductCard 
                        key={item.id} 
                        item={item} 
                        recentlyAdded={recentlyAdded} 
                        onAddToCart={handleAddToCart} 
                        onOpenRentalModal={handleOpenRentalModal} 
                      />
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* IMMERSIVE FULL-WINDOW LAYOUTS (CATERING & MEDIA) */}
        {/* ========================================================================= */}
        {isImmersiveMode && (
          <div className="w-full animate-fadeIn">
            
            {/* Full Bleed Back Button */}
            <div className="w-full px-4 lg:px-8 py-4 mx-auto max-w-7xl">
               <button 
                 onClick={handleBackClick}
                 className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold transition-colors"
               >
                 <ChevronLeft size={16} /> Return to Main Catalog
               </button>
            </div>

            {/* --- LAST PLANNER JULZ CATERING ENGINE (FULL BLEED) --- */}
            {activeCategory.id === "catering" && (
              <div className="w-full bg-[#1A1A18] font-sans border-y border-[#2A2A2A] shadow-2xl">
                
                {/* Top Notification Bar */}
                <div className="bg-[#0B0B0A] text-[#A8895C] text-[10px] sm:text-xs tracking-[0.15em] uppercase py-3 px-6 flex flex-wrap justify-center sm:justify-between items-center gap-4 border-b border-[#2A2A2A]">
                  <span className="hidden md:flex items-center gap-2"><CheckCircle size={14}/> Food Safety Compliant</span>
                  <span className="hidden md:flex items-center gap-2"><CheckCircle size={14}/> Registered & VAT Invoicing</span>
                  <span className="flex items-center gap-2"><CheckCircle size={14}/> Serving 50 - 1000+ Guests</span>
                </div>

                {/* Main Hero & PRO-GRADE HTML FORM */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left: Typography & Copy */}
                    <div className="lg:col-span-7">
                      <span className="inline-block px-4 py-1.5 rounded-full border border-[#A8895C] text-[#A8895C] text-xs font-bold tracking-[0.2em] mb-8 bg-[#A8895C]/10">
                        MEMORIAL SERVICES
                      </span>
                      <h2 className="text-4xl lg:text-6xl xl:text-7xl font-serif text-white mb-6 leading-[1.1]">
                        Last Planner Julz <br/>
                        <span className="text-[#A8895C] italic text-3xl lg:text-5xl xl:text-6xl">Dignified Memorial Catering</span>
                      </h2>
                      <p className="text-[#D8CFBC] text-sm lg:text-base leading-relaxed mb-8 opacity-90 max-w-lg">
                        To support our families with absolute devotion, we provide deeply respectful and highly professional funeral catering services. We craft custom packages and traditional tribute menus to handle all catering details during these difficult moments with the utmost dignity.
                      </p>
                      
                      {/* Trust Indicators */}
                      <div className="flex gap-8 border-t border-[#2A2A2A] pt-8 mt-8">
                        <div>
                          <p className="text-white font-serif text-2xl mb-1">500+</p>
                          <p className="text-[#A8895C] text-xs uppercase tracking-widest">Events Catered</p>
                        </div>
                        <div>
                          <p className="text-white font-serif text-2xl mb-1">98%</p>
                          <p className="text-[#A8895C] text-xs uppercase tracking-widest">Client Satisfaction</p>
                        </div>
                        <div>
                          <p className="text-white font-serif text-2xl mb-1">10+</p>
                          <p className="text-[#A8895C] text-xs uppercase tracking-widest">Years Experience</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Lead Capture Form Box (WIRED UP TO FORMSUBMIT) */}
                    <div className="lg:col-span-5 bg-[#0B0B0A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl">
                      <h3 className="text-2xl font-serif text-white mb-3">Request a Catering Quote</h3>
                      <p className="text-sm text-[#D8CFBC] mb-8 opacity-80 leading-relaxed">
                        Our culinary coordinators are ready to assist with custom arrangements. Send your details for an immediate response.
                      </p>
                      
                      <form action="https://formsubmit.co/stephenitwika178@gmail.com" method="POST" className="space-y-6">
                        {/* Hidden Inputs for Form Routing */}
                        <input type="hidden" name="_subject" value="New Catering Quote Request - Last Planner Julz" />
                        <input type="hidden" name="_captcha" value="false" />
                        
                        <div>
                          <label className="block text-[11px] font-bold text-[#A8895C] tracking-[0.15em] mb-2 uppercase">Your Name</label>
                          <input 
                            type="text" 
                            name="Client_Name"
                            placeholder="Contact Person" 
                            required
                            className="w-full bg-[#1A1A18] border border-[#2A2A2A] rounded-lg p-4 text-white focus:border-[#A8895C] outline-none transition-colors placeholder:text-[#4A4A4A]" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#A8895C] tracking-[0.15em] mb-2 uppercase">Phone Number</label>
                          <input 
                            type="tel" 
                            name="Phone_Number"
                            placeholder="07XX XXX XXX" 
                            required
                            className="w-full bg-[#1A1A18] border border-[#2A2A2A] rounded-lg p-4 text-white focus:border-[#A8895C] outline-none transition-colors placeholder:text-[#4A4A4A]" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#A8895C] tracking-[0.15em] mb-2 uppercase">Requirement Details</label>
                          <textarea 
                            name="Requirements"
                            placeholder="Estimated guest count, location, date..." 
                            rows="3" 
                            required
                            className="w-full bg-[#1A1A18] border border-[#2A2A2A] rounded-lg p-4 text-white focus:border-[#A8895C] outline-none transition-colors resize-none placeholder:text-[#4A4A4A]"
                          ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-[#A8895C] text-white font-bold tracking-widest uppercase py-4 rounded-lg hover:bg-[#8F744D] transition-colors mt-4 shadow-lg">
                          Get a Quote
                        </button>
                      </form>
                    </div>

                  </div>
                </div>

                {/* Footer Style Directory (Inside Catering Page) */}
                <div className="bg-[#0B0B0A] border-t border-[#2A2A2A]">
                  <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-1">
                      <h4 className="text-xl font-serif text-white mb-4">Last Planner <span className="text-[#A8895C] italic">Julz</span></h4>
                      <p className="text-sm text-[#D8CFBC] opacity-80 leading-relaxed mb-6">
                        Kenya's most reliable catering partner for memorial events. Fresh food, strict hygiene, and on-time delivery — always.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[#A8895C] text-xs font-bold tracking-[0.2em] uppercase mb-6">Our Services</h4>
                      <ul className="space-y-3 text-sm text-[#D8CFBC] opacity-90">
                        <li className="hover:text-white cursor-pointer transition-colors">Funeral Catering Services</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Memorial Receptions</li>
                        <li className="hover:text-white cursor-pointer transition-colors">VIP Tent Plated Service</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Standard Buffet Packages</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Custom Tribute Menus</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[#A8895C] text-xs font-bold tracking-[0.2em] uppercase mb-6">Contact Us</h4>
                      <ul className="space-y-4 text-sm text-[#D8CFBC] opacity-90">
                        <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><Phone size={16} className="text-[#A8895C]"/> +254 7XX XXX XXX</li>
                        <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><Mail size={16} className="text-[#A8895C]"/> catering@lastplannerjulz.co.ke</li>
                        <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><MapPin size={16} className="text-[#A8895C]"/> Ruiru, Kiambu County, Kenya</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[#A8895C] text-xs font-bold tracking-[0.2em] uppercase mb-6">Serving Regions</h4>
                      <ul className="space-y-3 text-sm text-[#D8CFBC] opacity-90">
                        <li>Ruiru & Environs</li>
                        <li>Kiambu County</li>
                        <li>Nairobi CBD</li>
                        <li>Westlands & Lavington</li>
                        <li>Thika Road Corridor</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- PHOTOGRAPHY & MEDIA EXCELLENCE ENGINE (FULL BLEED) --- */}
            {activeCategory.id === "media" && (
              <div className="w-full bg-white border-y border-[#E8DFD1] shadow-xl">
                
                {/* Media Hero Banner */}
                <div 
                  className="w-full py-20 lg:py-32 px-4 text-center border-b border-[#E8DFD1] bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: "url('/images/mediabackground.png')" }}
                >
                  <div className="relative z-10 max-w-4xl mx-auto">
                    <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-4 font-extrabold drop-shadow-md">
                      Timeless Tribute Media
                    </p>
                    <h2 className="text-5xl lg:text-6xl font-serif font-bold text-[#1F2E27] mb-8 leading-tight drop-shadow-xl">
                      Preserving Legacies <br/> <span className="italic text-[#A8895C]">Through the Lens</span>
                    </h2>
                    <p className="text-xl text-[#1F2E27] font-semibold leading-relaxed mb-8 max-w-2xl mx-auto drop-shadow-xl">
                      Our media team captures the profound dignity of your loved one's final journey. From high-resolution photography to multi-camera global live streaming, we ensure every memory is handled with the utmost excellence.
                    </p>
                  </div>
                </div>

                {/* Cinematic Showcase Grid */}
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    
                    {/* Photo Package Card */}
                    <div className="group rounded-xl overflow-hidden border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-2xl transition-all bg-[#F8F6F0] flex flex-col">
                      <div className="h-80 bg-[#1F2E27] overflow-hidden relative">
                        {/* Perfect Image Mapping: images().jpg */}
                        <img src="/images/images().jpg" alt="Photography" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Photography+Showcase" }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2E27] to-transparent opacity-80"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                          <Camera size={36} className="mb-3 text-[#A8895C]" />
                          <h3 className="text-3xl font-serif">Standard Photography</h3>
                        </div>
                      </div>
                      <div className="p-8 lg:p-10 flex-grow flex flex-col">
                        <p className="text-lg text-[#3D3530] mb-8 leading-relaxed flex-grow">
                          A dedicated professional photographer to discreetly capture the entire service. Includes a digital online gallery, a custom photo book, and 50 high-quality prints.
                        </p>
                        <div className="border-t border-[#E8DFD1] pt-8 flex justify-between items-center">
                          <span className="text-3xl font-bold text-[#1F2E27]">KSh 25,000</span>
                          <button onClick={() => handleAddToCart({ id: 701, title: "Standard Photo Package", price: 25000 })} className="bg-[#1F2E27] text-white px-8 py-3 rounded text-sm uppercase tracking-widest hover:bg-[#A8895C] transition-colors shadow-md">Add to Booking</button>
                        </div>
                      </div>
                    </div>

                    {/* Video/Stream Package Card */}
                    <div className="group rounded-xl overflow-hidden border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-2xl transition-all bg-[#F8F6F0] flex flex-col">
                      <div className="h-80 bg-[#1F2E27] overflow-hidden relative">
                        {/* Perfect Image Mapping: images.jpg */}
                        <img src="/images/images.jpg" alt="Videography" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Cinematic+Videography" }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2E27] to-transparent opacity-80"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                          <Video size={36} className="mb-3 text-[#A8895C]" />
                          <h3 className="text-3xl font-serif">Cinematic Video & Stream</h3>
                        </div>
                      </div>
                      <div className="p-8 lg:p-10 flex-grow flex flex-col">
                        <p className="text-lg text-[#3D3530] mb-8 leading-relaxed flex-grow">
                          Two expert videographers providing full multi-angle coverage. Includes a beautifully edited memorial documentary and a secure HD Livestream link for diaspora relatives.
                        </p>
                        <div className="border-t border-[#E8DFD1] pt-8 flex justify-between items-center">
                          <span className="text-3xl font-bold text-[#1F2E27]">KSh 55,000</span>
                          <button onClick={() => handleAddToCart({ id: 702, title: "Cinematic Videography & Livestream", price: 55000 })} className="bg-[#1F2E27] text-white px-8 py-3 rounded text-sm uppercase tracking-widest hover:bg-[#A8895C] transition-colors shadow-md">Add to Booking</button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Media Inquiry Box (WIRED UP TO FORMSUBMIT) */}
                  <div className="bg-[#1F2E27] rounded-xl p-10 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-3xl mx-auto">
                      <h3 className="text-3xl lg:text-4xl font-serif mb-6 text-[#A8895C]">Require Custom Media Coverage?</h3>
                      <p className="text-lg text-[#E8DFD1] opacity-90 mb-10 leading-relaxed">
                        We can arrange drone coverage, multi-location streaming, and extended editorial photography. Speak with our media director today to craft your perfect tribute.
                      </p>
                      
                      {/* FormSubmit HTML Form */}
                      <form action="https://formsubmit.co/stephenitwika178@gmail.com" method="POST" className="flex flex-col sm:flex-row gap-4 justify-center">
                        <input type="hidden" name="_subject" value="New Media Callback Request" />
                        <input type="hidden" name="_captcha" value="false" />
                        
                        <input 
                          type="tel" 
                          name="Phone_Number"
                          placeholder="Your Phone Number" 
                          required
                          className="px-6 py-4 rounded text-[#1F2E27] focus:outline-none w-full sm:w-80 text-lg" 
                        />
                        <button type="submit" className="bg-[#A8895C] text-white px-8 py-4 rounded font-bold uppercase tracking-widest hover:bg-[#8F744D] transition-colors whitespace-nowrap shadow-lg">
                          Request Callback
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- ENTERPRISE RENTAL MODAL --- */}
      {showRentalModal && selectedHearse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[#E8DFD1]">
            
            {/* Modal Header */}
            <div className="bg-[#1F2E27] p-5 flex justify-between items-center text-white border-b-4 border-[#A8895C] shrink-0">
              <div>
                <h3 className="font-serif text-xl tracking-wide">Configure Transport Logistics</h3>
                <p className="text-xs text-[#E8DFD1] opacity-80 mt-1 uppercase tracking-widest">{selectedHearse.title}</p>
              </div>
              <button onClick={() => setShowRentalModal(false)} className="hover:text-[#A8895C] transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Form Area */}
            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar flex-grow">
              
              {/* SECTION 1: Rental Parameters */}
              <section className="bg-[#F8F6F0] p-5 rounded border border-[#E8DFD1]">
                <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider mb-4 flex items-center gap-2"><MapPin size={16} className="text-[#A8895C]"/> 1. Rental Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Pick-up Location</label>
                    <input type="text" placeholder="e.g. Montezuma Funeral Home" className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors" value={rentalDetails.pickup} onChange={(e) => setRentalDetails({...rentalDetails, pickup: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Destination (Burial Site)</label>
                    <input type="text" placeholder="e.g. Langata Cemetery" className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors" value={rentalDetails.dropoff} onChange={(e) => setRentalDetails({...rentalDetails, dropoff: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Pick-up Date</label>
                    <input type="date" className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" value={rentalDetails.pickupDate} onChange={(e) => setRentalDetails({...rentalDetails, pickupDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Return Date</label>
                    <input type="date" className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" value={rentalDetails.returnDate} onChange={(e) => setRentalDetails({...rentalDetails, returnDate: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* SECTION 2: Mileage Plan */}
              <section className="bg-[#F8F6F0] p-5 rounded border border-[#E8DFD1]">
                <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider mb-4 flex items-center gap-2"><Route size={16} className="text-[#A8895C]"/> 2. Mileage Plan</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Select Mileage Structure</label>
                    <select className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" value={rentalDetails.mileagePlan} onChange={(e) => setRentalDetails({...rentalDetails, mileagePlan: e.target.value})}>
                      <option value="limited">Capped Mileage (150 km/day included)</option>
                      <option value="unlimited">Unlimited Mileage (Premium Flat Fee)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Estimated Total Journey (Kilometers)</label>
                    <input type="number" min="1" placeholder="e.g. 200" className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors" value={rentalDetails.estimatedDistance} onChange={(e) => setRentalDetails({...rentalDetails, estimatedDistance: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* SECTION 3: Fuel Policy */}
              <section className="bg-[#F8F6F0] p-5 rounded border border-[#E8DFD1]">
                <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider mb-4 flex items-center gap-2"><Fuel size={16} className="text-[#A8895C]"/> 3. Fuel Policy</h4>
                <div>
                  <label className="block text-xs font-semibold text-[#716860] mb-1">Select Fuel Handling</label>
                  <select className="w-full p-2.5 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" value={rentalDetails.fuelPolicy} onChange={(e) => setRentalDetails({...rentalDetails, fuelPolicy: e.target.value})}>
                    <option value="full_to_full">Full-to-Full (Return with full tank - No upfront fee)</option>
                    <option value="same_to_same">Same-to-Same (Fair Fuel Match)</option>
                    <option value="pre_purchased">Pre-purchased (Pay upfront, return empty)</option>
                  </select>
                </div>
              </section>

            </div>

            {/* Sticky Footer: Dynamic Total & Actions */}
            <div className="p-6 bg-white border-t border-[#E8DFD1] shrink-0">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-xs font-semibold text-[#716860] uppercase tracking-wider block mb-1">Estimated Total:</span>
                  <span className="text-3xl font-bold text-[#1F2E27]">KSh {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8F847C] block">Base Rate: KSh {selectedHearse.price.toLocaleString()} / day</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowRentalModal(false)} className="flex-1 py-3.5 text-sm font-semibold tracking-wider uppercase bg-transparent text-[#3D3530] border-2 border-[#E8DFD1] hover:bg-[#F8F6F0] transition-all rounded">
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRental} 
                  disabled={!isFormValid}
                  className={`flex-1 py-3.5 text-sm font-semibold tracking-wider uppercase transition-all rounded ${
                    isFormValid 
                    ? "bg-[#1F2E27] text-white hover:bg-[#A8895C] shadow-lg" 
                    : "bg-[#E8DFD1] text-[#A8895C] cursor-not-allowed"
                  }`}
                >
                  Generate Quote
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}