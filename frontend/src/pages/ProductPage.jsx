import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Check, Star, ShieldCheck, Box, Route as RouteIcon, MapPin, Fuel, ShoppingCart, CheckCircle } from "lucide-react";

// --- FALLBACK DATA WITH INCLUSIONS & UPDATED HEARSE PRICING ---
const fallbackProducts = [
  // --- CASKETS ---
  { id: 101, categoryId: "casket_list", title: "Pure White Quilted Casket", desc: "Elegant white finish with premium padded interior.", price: 95000, has_sizes: true, images: ["/images/caskets/casket1().jpg", "/images/caskets/casket1(0).jpg"] },
  { id: 102, categoryId: "casket_list", title: "Standard Oak Finish Casket", desc: "Classic oak wood finish featuring a pristine white interior.", price: 92000, has_sizes: true, images: ["/images/caskets/casket2().jpeg", "/images/caskets/casket2(0).jpg"] },
  { id: 103, categoryId: "casket_list", title: "Glossy Mahogany Casket", desc: "Premium reddish-brown mahogany with a high-gloss finish.", price: 105000, has_sizes: true, images: ["/images/caskets/casket3().jpeg", "/images/caskets/casket3.jpeg"] },
  { id: 104, categoryId: "casket_list", title: "Classic Red Wood Casket", desc: "Traditional deep red wood build with sturdy handles.", price: 98000, has_sizes: true, images: ["/images/caskets/casket4.jpg"] },
  { id: 105, categoryId: "casket_list", title: "Premium Pine Casket", desc: "Smooth light wood finish for a natural, dignified rest.", price: 96000, has_sizes: true, images: ["/images/caskets/casket5().jpeg", "/images/caskets/casket5(0).jpeg", "/images/caskets/casket5(1).jpg", "/images/caskets/casket5(2).jpg"] },
  { id: 106, categoryId: "casket_list", title: "Two-Tone Executive Casket", desc: "Sophisticated two-tone metallic and wood finish.", price: 115000, has_sizes: true, images: ["/images/caskets/casket6().jpg", "/images/caskets/casket6(0).jpeg", "/images/caskets/casket6(1).jpg", "/images/caskets/casket6(2).jpg"] },
  { id: 107, categoryId: "casket_list", title: "Brown Elegant Casket", desc: "Ornate design with beautiful silver hardware accents.", price: 125000, has_sizes: true, images: ["/images/caskets/casket7(1).jpeg", "/images/caskets/casket7(2).jpeg"] },
  { id: 108, categoryId: "casket_list", title: "Classic Light Wood Casket", desc: "Traditional mid-tone solid wood construction.", price: 92000, has_sizes: true, images: ["/images/caskets/casket8.jpeg"] },
  { id: 109, categoryId: "casket_list", title: "Dark Executive Wood", desc: "Deep dark finish for a commanding presence.", price: 97000, has_sizes: true, images: ["/images/caskets/casket9.jpeg"] },
  { id: 110, categoryId: "casket_list", title: "Pearl White Casket", desc: "Glossy pure white body finished with silver handles.", price: 105000, has_sizes: true, images: ["/images/caskets/casket10(1).jpeg", "/images/caskets/casket10.jpeg"] },
  { id: 111, categoryId: "casket_list", title: "Heavy Duty Bronze Casket", desc: "Durable metal construction featuring an executive finish.", price: 145000, has_sizes: true, images: ["/images/caskets/casket11(0).jpeg", "/images/caskets/casket11.jpeg"] },
  { id: 112, categoryId: "casket_list", title: "Sleek White Wood Casket", desc: "Minimalist white casket with gold-tone hardware.", price: 94000, has_sizes: true, images: ["/images/caskets/casket12.jpeg"] },
  { id: 113, categoryId: "casket_list", title: "Standard Cedar Casket", desc: "Affordable and elegant solid cedar box.", price: 92000, has_sizes: true, images: ["/images/caskets/casket13.jpeg"] },
  { id: 114, categoryId: "casket_list", title: "Deep Mahogany Casket", desc: "Rich mahogany with soft white lining.", price: 110000, has_sizes: true, images: ["/images/caskets/casket14.jpeg"] },
  { id: 115, categoryId: "casket_list", title: "Pure White Domed Casket", desc: "Elegant domed lid pure white design.", price: 96000, has_sizes: true, images: ["/images/caskets/casket15.jpeg"] },
  { id: 116, categoryId: "casket_list", title: "Classic Light Oak Casket", desc: "Traditional light oak build with polished handles.", price: 98000, has_sizes: true, images: ["/images/caskets/casket16.jpeg"] },
  { id: 117, categoryId: "casket_list", title: "Polished Oak Casket", desc: "High gloss finished oak with sturdy grip bars.", price: 99000, has_sizes: true, images: ["/images/caskets/casket17.jpeg"] },
  { id: 118, categoryId: "casket_list", title: "Solid Oak Heritage Casket", desc: "Heavy-duty solid oak construction with a natural grain.", price: 115000, has_sizes: true, images: ["/images/caskets/casket18(0).jpg", "/images/caskets/casket18.jpg" ] },
  { id: 119, categoryId: "casket_list", title: "Serenity Blue Interior Casket", desc: "Clean white exterior revealing a peaceful blue and white padded interior.", price: 95000, has_sizes: true, images: ["/images/caskets/casket19(0).jpg", "/images/caskets/casket19(1).jpg", "/images/caskets/casket19(2).jpg", "/images/caskets/casket19(3).jpg", "/images/caskets/casket19(4).jpg"] },
  { id: 120, categoryId: "casket_list", title: "Premium Wood Glass-Top Casket", desc: "Solid wood construction featuring a full-length glass viewing panel.", price: 125000, has_sizes: true, images: ["/images/caskets/casket20().jpg", "/images/caskets/casket20(0).jpg", "/images/caskets/casket20(1).jpg", "/images/caskets/casket20(2).jpg"] },
  { id: 121, categoryId: "casket_list", title: "White & Gold Trim Casket", desc: "Pristine white finish accented with elegant gold-tone border bands.", price: 105000, has_sizes: true, images: ["/images/caskets/casket21().jpeg", "/images/caskets/casket21(0).jpeg"] },
  { id: 122, categoryId: "casket_list", title: "Classic White Domed Casket", desc: "Traditional domed lid with premium white finish.", price: 92000, has_sizes: true, images: ["/images/caskets/casket22(0).jpg", "/images/caskets/casket22(1).jpg"] },
  { id: 123, categoryId: "casket_list", title: "Pristine White Metal Casket", desc: "Durable metal construction featuring a pure white gloss.", price: 125000, has_sizes: true, images: ["/images/caskets/casket23().jpg", "/images/caskets/casket23(0).jpeg", "/images/caskets/casket23(1).jpg", "/images/caskets/casket23(2).jpg"] },
  { id: 124, categoryId: "casket_list", title: "Obsidian Black Metal Casket", desc: "Sleek, dark metallic finish for an executive, profound resting place.", price: 135000, has_sizes: true, images: ["/images/caskets/casket24().jpg", "/images/caskets/casket24(0).jpg", "/images/caskets/casket24(1).jpg", "/images/caskets/casket24(2).jpg", "/images/caskets/casket24(3).jpeg"] },
  { id: 125, categoryId: "casket_list", title: "Walnut Executive Metal Casket", desc: "Dark polished metallic design with sturdy grip handles.", price: 130000, has_sizes: true, images: ["/images/caskets/casket25().jpg", "/images/caskets/casket25(0).jpg", "/images/caskets/casket25(1).jpg"] },
  { id: 126, categoryId: "casket_list", title: "Glossy Black Casket", desc: "Highly polished black finish for a modern look.", price: 118000, has_sizes: true, images: ["/images/caskets/casket26.jpeg"] },
  { id: 127, categoryId: "casket_list", title: "Cream Velvet Interior Casket", desc: "Light exterior finish paired with a luxurious cream velvet interior.", price: 108000, has_sizes: true, images: ["/images/caskets/casket27().jpg", "/images/caskets/casket27(0).jpg", "/images/caskets/casket27(1).jpg"] },
  { id: 128, categoryId: "casket_list", title: "Premium Dark Oak Casket", desc: "High-grade oak with a deep stain and intricate handles.", price: 115000, has_sizes: true, images: ["/images/caskets/casket28().jpeg"] },
  { id: 129, categoryId: "casket_list", title: "Mahogany Elegance Casket", desc: "Beautifully carved high-gloss mahogany wood.", price: 125000, has_sizes: true, images: ["/images/caskets/casket29().jpeg", "/images/caskets/casket29(0).jpeg"] },
  { id: 130, categoryId: "casket_list", title: "Half-Glass Wooden Casket", desc: "High-end wooden design featuring a split glass viewing lid.", price: 128000, has_sizes: true, images: ["/images/caskets/casket30().jpeg", "/images/caskets/casket30(0).jpeg", "/images/caskets/casket30(1).jpeg"] },

  // --- URNS ---
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

  // --- WREATHS ---
  { id: 201, categoryId: "wreaths", title: "Dual White Hearts on Stand", desc: "Two elegant heart-shaped floral displays on a shared stand.", price: 18000, images: ["/images/wreaths/wreath1.jpeg"] },
  { id: 202, categoryId: "wreaths", title: "Classic White & Green Ring", desc: "Beautifully arranged traditional circular wreath.", price: 8000, images: ["/images/wreaths/wreath2.jpeg"] },
  { id: 203, categoryId: "wreaths", title: "Yellow & Blue Floral Dome", desc: "Vibrant yellow and blue dome floral mix.", price: 14000, images: ["/images/wreaths/wreath3.jpeg"] },
  { id: 204, categoryId: "wreaths", title: "Elevated White Floral Dome", desc: "Elegant tall white floral display.", price: 16000, images: ["/images/wreaths/wreath4.jpeg"] },
  { id: 205, categoryId: "wreaths", title: "Standing White Heart Tribute", desc: "Elevated white floral heart display on a stand.", price: 15000, images: ["/images/wreaths/wreath5.jpeg"] },
  { id: 206, categoryId: "wreaths", title: "Hanging Floral Tribute", desc: "Unique suspended floral arrangement for high-impact visual tribute.", price: 25000, images: ["/images/wreaths/wreath6.jpeg"] },
  { id: 207, categoryId: "wreaths", title: "Red & White Round Wreath", desc: "White base with striking red floral accents.", price: 8500, images: ["/images/wreaths/wreath7.jpeg"] },
  { id: 208, categoryId: "wreaths", title: "Blue & Yellow Round Wreath", desc: "Vibrant circular tribute with contrasting blue and yellow colors.", price: 8500, images: ["/images/wreaths/wreath8.jpeg"] },
  { id: 209, categoryId: "wreaths", title: "White & Green Floral Heart", desc: "Clean and pure white heart-shaped arrangement.", price: 12000, images: ["/images/wreaths/wreath9.jpeg"] },
  { id: 210, categoryId: "wreaths", title: "Family Cross & Heart Floral Set", desc: "A beautifully coordinated cross and heart set.", price: 22000, images: ["/images/wreaths/wreath10.jpeg"] },
  { id: 211, categoryId: "wreaths", title: "Pristine White Round Wreath", desc: "Classic dense arrangement in pure white blooms.", price: 8000, images: ["/images/wreaths/wreath11.jpeg"] },
  { id: 212, categoryId: "wreaths", title: "Autumn Hue Round Tribute", desc: "Warm colored circular floral arrangement.", price: 8500, images: ["/images/wreaths/wreath12.jpeg"] },
  { id: 213, categoryId: "wreaths", title: "White Cross with Red Center", desc: "Traditional cross arrangement with a vibrant center accent.", price: 14000, images: ["/images/wreaths/wreath13.jpeg"] },
  { id: 214, categoryId: "wreaths", title: "Blue & White Floral Cushion", desc: "Beautifully arranged blue and white cushion tribute.", price: 12000, images: ["/images/wreaths/wreath14.jpeg"] },
  { id: 215, categoryId: "wreaths", title: "Custom 'DAD' Floral Cushion", desc: "Circular wreath personalized with a 'DAD' centerpiece.", price: 10000, images: ["/images/wreaths/wreath15.jpeg"] },
  { id: 216, categoryId: "wreaths", title: "White & Purple Crosses", desc: "Multiple cross arrangements with elegant purple accents.", price: 22000, images: ["/images/wreaths/wreath16.jpeg"] },
  { id: 217, categoryId: "wreaths", title: "Custom 'MY LOVE' Floral Heart", desc: "Heart wreath boldly displaying 'MY LOVE'.", price: 14000, images: ["/images/wreaths/wreath17.jpeg"] },
  { id: 218, categoryId: "wreaths", title: "Full White Casket Spray", desc: "Luxurious pure white floral spray designed to rest atop the casket.", price: 25000, images: ["/images/wreaths/wreath18.jpeg"] },
  { id: 219, categoryId: "wreaths", title: "Trio of Standing Wreaths", desc: "Three coordinated standing circular wreaths.", price: 28000, images: ["/images/wreaths/wreath19.jpeg"] },
  { id: 220, categoryId: "wreaths", title: "Classic White & Green Ring", desc: "A pristine white, densely packed floral ring.", price: 8000, images: ["/images/wreaths/wreath20.jpeg"] },
  { id: 221, categoryId: "wreaths", title: "Solid Red Rose Heart", desc: "Stunning full red rose heart arrangement.", price: 15000, images: ["/images/wreaths/wreath21.jpeg"] },
  { id: 222, categoryId: "wreaths", title: "White Heart with Red Border", desc: "A beautiful mixture of red outlining white roses.", price: 14000, images: ["/images/wreaths/wreath22.jpeg"] },
  { id: 223, categoryId: "wreaths", title: "Symbolic Broken Heart Tribute", desc: "Striking broken heart floral arrangement in red and white.", price: 16000, images: ["/images/wreaths/wreath23.jpeg"] },
  { id: 224, categoryId: "wreaths", title: "White & Red Casket Spray", desc: "A long, elegant spray of mixed roses for the casket.", price: 22000, images: ["/images/wreaths/wreath24.jpeg"] },
  { id: 226, categoryId: "wreaths", title: "Large White Cross with Red Accent", desc: "An oversized standing cross with vibrant red details.", price: 15000, images: ["/images/wreaths/wreath26.jpeg"] },
  { id: 227, categoryId: "wreaths", title: "White Heart with Crimson Trim", desc: "Detailed heart shape surrounded by deep red flowers.", price: 13000, images: ["/images/wreaths/wreath27.jpeg"] },
  { id: 228, categoryId: "wreaths", title: "White & Green Heart Tribute", desc: "Pure white blooms arranged in a tight heart shape with greenery.", price: 12000, images: ["/images/wreaths/wreath28.jpg"] },
  { id: 229, categoryId: "wreaths", title: "White & Blue Sympathy Basket", desc: "Elevated floral spray featuring bold blue accents.", price: 12000, images: ["/images/wreaths/wreath29.jpg"] },
  { id: 230, categoryId: "wreaths", title: "Multi-Tribute Floral Package", desc: "A comprehensive multi-piece floral setup for the family.", price: 35000, images: ["/images/wreaths/wreath30.jpg"] },
  { id: 231, categoryId: "wreaths", title: "Standing White Sympathy Spray", desc: "Tall standing basket arrangement for the graveside or chapel.", price: 16000, images: ["/images/wreaths/wreath31.jpg"] },
  { id: 232, categoryId: "wreaths", title: "Large Red & White Casket Spray", desc: "Oversized, lush arrangement filled with fresh cut red and white flowers.", price: 26000, images: ["/images/wreaths/wreath32.jpg"] },

  // --- LOWERING GEARS & SETUP ---
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

  // --- TENTS ---
  { id: 351, categoryId: "tents", title: "Standard Pagoda Tent 1", desc: "High-peak white tent ideal for family seating.", price: 10000, images: ["/images/tents/tent1.jpeg"] },
  { id: 352, categoryId: "tents", title: "Standard Pagoda Tent 2", desc: "Medium-sized white tent for outdoor gatherings.", price: 10000, images: ["/images/tents/tent2.jpeg"] },
  { id: 353, categoryId: "tents", title: "Premium Marquee Tent", desc: "Spacious clear-span marquee tent for large gatherings and VIPs.", price: 50000, images: ["/images/tents/tent3.jpeg"] },
  { id: 354, categoryId: "tents", title: "Graveside Red Carpet Tent", desc: "Specialized tent placement featuring a dignified red carpet.", price: 15000, images: ["/images/tents/tent4.jpeg"] },
  { id: 355, categoryId: "tents", title: "Basic Gazebo Shade", desc: "Simple pop-up tent for utility, overflow, or minimal shade.", price: 5000, images: ["/images/tents/tent5.jpeg"] },
  { id: 356, categoryId: "tents", title: "Extended Gathering Tent 1", desc: "Large open-air structure for shielding large groups.", price: 25000, images: ["/images/tents/tent6.jpeg"] },
  { id: 357, categoryId: "tents", title: "Extended Gathering Tent 2", desc: "Spacious multi-pole tent setup for extended family.", price: 25000, images: ["/images/tents/tent7.jpeg"] },
  { id: 358, categoryId: "tents", title: "Extended Marquee Tent 8", desc: "Spacious multi-pole outdoor seating setup for large memorial services.", price: 30000, images: ["/images/tents/tents8.jpg"] },

  // --- HEARSES & TRANSPORT (UPDATED PRICING) ---
  { id: 401, categoryId: "hearses", title: "Mercedes Executive Hearse 1", desc: "Dignified Mercedes-Benz transport. Displays full exterior and interior suite. Base daily rate shown.", price: 100000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse1(0).jpeg", "/images/hearses/hearse1(1).jpeg", "/images/hearses/hearse1(2).jpeg", "/images/hearses/hearse1(3).jpeg", "/images/hearses/hearse1(4).jpeg", "/images/hearses/hearse1(5).jpeg"] },
  { id: 402, categoryId:"hearses", title: "Executive Mercedes Hearse 2", desc: "Durable and highly capable luxury transport.", price: 105000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse5(0).jpeg", "/images/hearses/hearse5(1).jpeg", "/images/hearses/hearse5(2).jpeg", "/images/hearses/hearse5(3).jpeg"] },
  { id: 403, categoryId:"hearses", title: "Classic Van Hearse", desc: "Spacious, reliable, and elegant van transport for the final journey. Base daily rate shown.", price: 100000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse2(0).jpeg", "/images/hearses/hearse2(1).jpeg", "/images/hearses/hearse2(3).jpeg", "/images/hearses/hearse2(4).jpeg", "/images/hearses/hearse2(5).jpg", "/images/hearses/hearse2(6).jpg", "/images/hearses/hearse2(7).jpg"] },
  { id: 404, categoryId: "hearses", title: "Executive Family Bus", desc: "Luxury bus capable of comfortably transporting the extended family. Base daily rate shown.", price: 120000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse3(0).jpeg", "/images/hearses/hearse3(1).jpeg", "/images/hearses/hearse3(2).jpeg", "/images/hearses/hearse3(3).jpg", "/images/hearses/hearse3(4).jpg"] },
  { id: 405, categoryId:"hearses", title: "Premium Black Transport", desc: "Discreet and highly professional dark vehicle option. Base daily rate shown.", price: 100000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse4(0).jpg"] },

  // --- ATTIRE ---
  { id: 601, categoryId: "attire", title: "Premium Men's Burial Suit", desc: "Complete 3-piece dark suit tailored specifically for the deceased. Includes shirt and tie.", price: 18000, images: ["/assets/mens-burial-suit.jpg"] },
  { id: 602, categoryId: "attire", title: "Men's Traditional Shroud", desc: "Dignified, high-quality fabric shroud tailored for traditional burial rites.", price: 12000, images: ["/assets/mens-shroud.jpg"] },
  { id: 603, categoryId: "attire", title: "Custom Men's Suit (Family)", desc: "Tailored 3-piece dark suit for family members. Includes measurements and fitting sessions.", price: 15000, images: ["/assets/suit-mens.jpg"] },
  { id: 604, categoryId: "attire", title: "Women's Modest Dress", desc: "Elegant, conservative dress available in black, navy, or dark grey.", price: 8500, images: ["/assets/dress-womens.jpg"] },
  { id: 605, categoryId: "attire", title: "Elegant White Lace Burial Dress", desc: "Beautifully detailed white lace modest dress for family members or burial.", price: 8500, images: ["/images/ladies attire/Lattire1().jpeg", "/images/ladies attire/Lattire1.jpeg"] },
  { id: 606, categoryId: "attire", title: "Custom Ribbon Lapels", desc: "Personalized memorial ribbons for family and guests (Pack of 50).", price: 2500, images: ["/assets/ribbons.jpg"] },

  // --- MEDIA ---
  { id: 701, categoryId: "media", title: "Standard Photo Package", desc: "One professional photographer for 6 hours. Includes digital gallery and 50 printed photos.", price: 25000, inclusions: ["Sound systems"], images: ["/images/images().jpg"] },
  { id: 702, categoryId: "media", title: "Cinematic Videography & Livestream", desc: "Two videographers, edited memorial video, and professional livestream link for diaspora relatives.", price: 55000, inclusions: ["Sound systems"], images: ["/images/images.jpg"] }
];

// --- STRICT ENTERPRISE SIZING MATH ---
const casketSizes = [
  { id: "s2", label: "Small (2 ft)", priceModifier: -30000 },
  { id: "s4", label: "Small (4 ft)", priceModifier: -26000 },
  { id: "s6", label: "Small (6 ft)", priceModifier: -22000 },
  { id: "s8", label: "Small (8 ft)", priceModifier: -18000 },
  { id: "s10", label: "Small (10 ft)", priceModifier: -14000 },
  { id: "s12", label: "Small (12 ft)", priceModifier: -10000 },
  { id: "normal", label: "Normal (Standard Adult)", priceModifier: 0 },
  { id: "large", label: "Large (Oversized)", priceModifier: 50000 },
  { id: "xl", label: "Extra Large (Custom Fit)", priceModifier: 68000 }
];

export default function ProductPage({ addToCart, bookRental }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configuration States
  const [casketSizeIndex, setCasketSizeIndex] = useState(6); // Normal Size Default (Index 6)
  const [rentalDetails, setRentalDetails] = useState({ 
    pickup: "", dropoff: "", pickupDate: "", returnDate: "", mileagePlan: "limited", estimatedDistance: "", fuelPolicy: "full_to_full" 
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        // INJECTION: Force merge the hardcoded inclusions into the live database response
        const fallbackMatch = fallbackProducts.find(fp => fp.id === parseInt(id));
        if (fallbackMatch && fallbackMatch.inclusions && (!data.inclusions || data.inclusions.length === 0)) {
          data.inclusions = fallbackMatch.inclusions;
        }
        setProduct(data);
        setMainImage(data.images && data.images.length > 0 ? data.images[0] : "");
        setLoading(false);
      })
      .catch(() => {
        let found = null;
        for (let i = 0; i < fallbackProducts.length; i++) {
          if (fallbackProducts[i].id === parseInt(id)) {
            found = fallbackProducts[i];
          }
        }
        setProduct(found);
        if (found && found.images && found.images.length > 0) {
          setMainImage(found.images[0]);
        }
        setLoading(false);
      });
  }, [id, API_URL]);

  // AUTO-SLIDE LOGIC (Rotates main image automatically every 3.5s)
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setMainImage((prevImg) => {
        const currentIndex = product.images.indexOf(prevImg);
        const nextIndex = (currentIndex + 1) % product.images.length;
        return product.images[nextIndex];
      });
    }, 3500); 
    return () => clearInterval(interval);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8895C]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center text-center p-4">
        <Box size={48} className="text-[#A8895C] mb-4" />
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-4">Item Not Found</h2>
        <Link to="/catalog" className="bg-[#1F2E27] text-white px-6 py-3 rounded text-sm uppercase tracking-widest hover:bg-[#A8895C] transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isCasket = product.has_sizes || product.categoryId === "casket_list";
  const isHearse = product.categoryId === "hearses";
  
  const discountPercent = product.discount_percent || 0;
  const originalPrice = discountPercent > 0 ? (product.price / (1 - discountPercent / 100)) : product.price;

  // DYNAMIC PRICE CALCULATION
  let finalPrice = product.price;
  
  if (isCasket) {
    finalPrice = product.price + casketSizes[casketSizeIndex].priceModifier;
  } else if (isHearse) {
    const baseDailyRate = product.price;
    let days = 1;
    if (rentalDetails.pickupDate && rentalDetails.returnDate) {
      const start = new Date(rentalDetails.pickupDate);
      const end = new Date(rentalDetails.returnDate);
      const timeDiff = end.getTime() - start.getTime();
      if (timeDiff > 0) days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    const totalBasePrice = baseDailyRate * days;

    let distanceCharge = 0;
    const distance = Number(rentalDetails.estimatedDistance) || 0;
    if (rentalDetails.mileagePlan === "limited") {
      const allowedDistance = 150 * days;
      if (distance > allowedDistance) distanceCharge = (distance - allowedDistance) * 120;
    } else if (rentalDetails.mileagePlan === "unlimited") {
      distanceCharge = 8000 * days; 
    }

    let fuelCharge = 0;
    if (rentalDetails.fuelPolicy === "pre_purchased") {
        fuelCharge = 12500;
    }
    
    finalPrice = totalBasePrice + distanceCharge + fuelCharge;
  }

  const handleAction = (isBuyNow) => {
    let itemToAdd = { ...product, price: finalPrice };

    if (isCasket) {
      const size = casketSizes[casketSizeIndex];
      itemToAdd.cartItemId = `${product.id}-${size.id}`;
      itemToAdd.title = `${product.title} (${size.label})`;
      addToCart(itemToAdd);
    } else if (isHearse) {
      itemToAdd.title = `${product.title} (Scheduled Transport)`;
      itemToAdd.rentalSchedule = rentalDetails;
      bookRental(itemToAdd);
    } else {
      itemToAdd.cartItemId = product.id;
      addToCart(itemToAdd);
    }

    setRecentlyAdded(true);
    setTimeout(() => setRecentlyAdded(false), 2000);
    
    if (isBuyNow) {
      window.location.hash = "#cart";
    }
  };

  let isFormValid = true;
  if (isHearse) {
    if (rentalDetails.pickup === "" || rentalDetails.dropoff === "" || rentalDetails.pickupDate === "" || rentalDetails.returnDate === "" || rentalDetails.estimatedDistance <= 0) {
      isFormValid = false;
    }
  }

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12">
      <div className="site-container max-w-6xl mx-auto px-4">
        
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm text-[#716860] hover:text-[#A8895C] font-bold transition-colors">
            <ChevronLeft size={16} /> Back to Results
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white border border-[#E8DFD1] rounded-xl p-4 aspect-square flex items-center justify-center overflow-hidden shadow-sm transition-opacity duration-500 ease-in-out">
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=Photo+Pending" }} />
            </div>

            {/* UPGRADED: Multi-Angle Thumbnail Boxes */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(imgUrl)}
                    className={`border-2 rounded overflow-hidden aspect-square bg-white transition-all ${
                      mainImage === imgUrl ? 'border-[#A8895C] shadow-md scale-105' : 'border-[#E8DFD1] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration & Purchase Block */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#A8895C] uppercase tracking-widest mb-2 block">
              {product.categoryId?.replace(/_/g, " ")}
            </span>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1F2E27] mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E8DFD1]">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#1F2E27]">
                  KSh {finalPrice.toLocaleString()} {isHearse && <span className="text-sm text-[#8F847C] font-normal tracking-wide">/ calculated</span>}
                </span>
                {discountPercent > 0 && (
                   <span className="text-sm text-[#8F847C] line-through mt-1">
                     Was KSh {Math.round(originalPrice).toLocaleString()}
                   </span>
                )}
              </div>
            </div>

            <p className="text-[#3D3530] leading-relaxed mb-6">{product.desc}</p>

            {/* --- INJECTIONS RENDERED HERE --- */}
            {product.inclusions && product.inclusions.length > 0 && (
              <div className="mb-8 pt-6 border-t border-[#E8DFD1]">
                <span className="text-[10px] font-bold text-[#A8895C] uppercase tracking-wider block mb-3">Package Includes:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.inclusions.map((inc, i) => (
                    <li key={i} className="text-sm text-[#716860] flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* EMBEDDED CASKET SIZING ENGINE */}
            {isCasket && (
              <div className="bg-white p-6 rounded border border-[#E8DFD1] mb-8 shadow-sm">
                <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Box size={16} className="text-[#A8895C]"/> Select Dimensions
                </h4>
                <div className="space-y-3">
                  {casketSizes.map((size, index) => {
                    const priceModifierText = size.priceModifier === 0 
                      ? "Base Price" 
                      : size.priceModifier > 0 
                        ? `+ KSh ${size.priceModifier.toLocaleString()}` 
                        : `- KSh ${Math.abs(size.priceModifier).toLocaleString()}`;
                        
                    return (
                      <label key={size.id} className={`flex items-center justify-between p-4 rounded border cursor-pointer transition-all ${casketSizeIndex === index ? "bg-[#F8F6F0] border-[#A8895C] shadow-sm" : "border-[#E8DFD1] hover:bg-[#F8F6F0]"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="casketSize" className="accent-[#A8895C] w-4 h-4" checked={casketSizeIndex === index} onChange={() => setCasketSizeIndex(index)}/>
                          <span className="text-sm font-semibold text-[#3D3530]">{size.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${casketSizeIndex === index ? "text-[#A8895C]" : "text-[#716860]"}`}>{priceModifierText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EMBEDDED RENTAL ENGINE */}
            {isHearse && (
              <div className="bg-white p-6 rounded border border-[#E8DFD1] mb-8 space-y-8 shadow-sm">
                 <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider flex items-center gap-2 border-b border-[#F8F6F0] pb-4">
                  <MapPin size={16} className="text-[#A8895C]"/> Logistics Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Pick-up Location</label>
                    <input type="text" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0]" value={rentalDetails.pickup} onChange={(e) => setRentalDetails({...rentalDetails, pickup: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Destination (Burial Site)</label>
                    <input type="text" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0]" value={rentalDetails.dropoff} onChange={(e) => setRentalDetails({...rentalDetails, dropoff: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Pick-up Date</label>
                    <input type="date" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-[#3D3530]" value={rentalDetails.pickupDate} onChange={(e) => setRentalDetails({...rentalDetails, pickupDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Return Date</label>
                    <input type="date" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-[#3D3530]" value={rentalDetails.returnDate} onChange={(e) => setRentalDetails({...rentalDetails, returnDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Mileage Structure</label>
                    <select className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-[#3D3530]" value={rentalDetails.mileagePlan} onChange={(e) => setRentalDetails({...rentalDetails, mileagePlan: e.target.value})}>
                      <option value="limited">Capped Mileage (150 km included)</option>
                      <option value="unlimited">Unlimited Mileage (Premium Flat Fee)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Estimated Distance (Kilometers)</label>
                    <input type="number" min="1" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0]" value={rentalDetails.estimatedDistance} onChange={(e) => setRentalDetails({...rentalDetails, estimatedDistance: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={() => handleAction(false)}
                disabled={!isFormValid || recentlyAdded}
                className={`flex-1 py-4 text-xs font-bold rounded uppercase tracking-widest transition-colors shadow-md ${(!isFormValid || recentlyAdded) ? "bg-[#E8DFD1] text-[#A8895C] cursor-not-allowed" : "bg-[#1F2E27] text-white hover:bg-[#3D3530]"}`}
              >
                {recentlyAdded ? (
                  <span className="flex items-center justify-center gap-2"><Check size={18}/> Added</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><ShoppingCart size={18}/> {isHearse ? "Add to Booking Requests" : "Add to Cart"}</span>
                )}
              </button>
              
              <button 
                 onClick={() => handleAction(true)}
                 disabled={!isFormValid}
                className={`flex-1 py-4 text-xs font-bold text-white rounded uppercase tracking-widest transition-colors shadow-md ${!isFormValid ? "bg-[#FF8888] cursor-not-allowed" : "bg-[#FF4747] hover:bg-[#E63939]"}`}
              >
                {isHearse ? "Book Now" : "Buy Now"}
              </button>
            </div>
            
            <div className="mt-6 flex items-center gap-3 text-sm text-[#716860] bg-white p-4 border border-[#E8DFD1] rounded shadow-sm">
               <ShieldCheck size={18} className="text-[#A8895C] shrink-0" />
               <p>Verified Last Planner Julz Inventory. Secure Checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}