from app import create_app, db
from app.models import Product, ProductImage, ProductSpecification

# The Complete 108-Item Last Planner Julz Inventory (Syntax Corrected)
catalog_data = [
    # --- CASKETS ---
    { "id": 101, "category_id": "casket_list", "title": "Pure White Quilted Casket", "desc": "Elegant white finish with premium padded interior.", "price": 65000, "images": ["/images/caskets/casket1().jpg", "/images/caskets/casket1(0).jpg"] },
    { "id": 102, "category_id": "casket_list", "title": "Standard Oak Finish Casket", "desc": "Classic oak wood finish featuring a pristine white interior.", "price": 45000, "images": ["/images/caskets/casket2().jpeg", "/images/caskets/casket2(0).jpg"] },
    { "id": 103, "category_id": "casket_list", "title": "Glossy Mahogany Casket", "desc": "Premium reddish-brown mahogany with a high-gloss finish.", "price": 85000, "images": ["/images/caskets/casket3().jpeg", "/images/caskets/casket3.jpeg"] },
    { "id": 104, "category_id": "casket_list", "title": "Classic Red Wood Casket", "desc": "Traditional deep red wood build with sturdy handles.", "price": 70000, "images": ["/images/caskets/casket4.jpg"] },
    { "id": 105, "category_id": "casket_list", "title": "Premium Pine Casket", "desc": "Smooth light wood finish for a natural, dignified rest.", "price": 60000, "images": ["/images/caskets/casket5().jpeg", "/images/caskets/casket5(0).jpeg", "/images/caskets/casket5(1).jpg", "/images/caskets/casket5(2).jpg"] },
    { "id": 106, "category_id": "casket_list", "title": "Two-Tone Executive Casket", "desc": "Sophisticated two-tone metallic and wood finish.", "price": 95000, "images": ["/images/caskets/casket6().jpg", "/images/caskets/casket6(0).jpeg", "/images/caskets/casket6(1).jpg", "/images/caskets/casket6(2).jpg"] },
    { "id": 107, "category_id": "casket_list", "title": "Brown Elegant Casket", "desc": "Ornate design with beautiful silver hardware accents.", "price": 110000, "images": ["/images/caskets/casket7(1).jpeg", "/images/caskets/casket7(2).jpeg"] },
    { "id": 108, "category_id": "casket_list", "title": "Classic Light Wood Casket", "desc": "Traditional mid-tone solid wood construction.", "price": 45000, "images": ["/images/caskets/casket8.jpeg"] },
    { "id": 109, "category_id": "casket_list", "title": "Dark Executive Wood", "desc": "Deep dark finish for a commanding presence.", "price": 68000, "images": ["/images/caskets/casket9.jpeg"] },
    { "id": 110, "category_id": "casket_list", "title": "Pearl White Casket", "desc": "Glossy pure white body finished with silver handles.", "price": 75000, "images": ["/images/caskets/casket10(1).jpeg", "/images/caskets/casket10.jpeg"] },
    { "id": 111, "category_id": "casket_list", "title": "Heavy Duty Bronze Casket", "desc": "Durable metal construction featuring an executive finish.", "price": 120000, "images": ["/images/caskets/casket11(0).jpeg", "/images/caskets/casket11.jpeg"] },
    { "id": 112, "category_id": "casket_list", "title": "Sleek White Wood Casket", "desc": "Minimalist white casket with gold-tone hardware.", "price": 55000, "images": ["/images/caskets/casket12.jpeg"] },
    { "id": 113, "category_id": "casket_list", "title": "Standard Cedar Casket", "desc": "Affordable and elegant solid cedar box.", "price": 42000, "images": ["/images/caskets/casket13.jpeg"] },
    { "id": 114, "category_id": "casket_list", "title": "Deep Mahogany Casket", "desc": "Rich mahogany with soft white lining.", "price": 80000, "images": ["/images/caskets/casket14.jpeg"] },
    { "id": 115, "category_id": "casket_list", "title": "Pure White Domed Casket", "desc": "Elegant domed lid pure white design.", "price": 62000, "images": ["/images/caskets/casket15.jpeg"] },
    { "id": 116, "category_id": "casket_list", "title": "Classic Light Oak Casket", "desc": "Traditional light oak build with polished handles.", "price": 65000, "images": ["/images/caskets/casket16.jpeg"] },
    { "id": 117, "category_id": "casket_list", "title": "Polished Oak Casket", "desc": "High gloss finished oak with sturdy grip bars.", "price": 66000, "images": ["/images/caskets/casket17.jpeg"] },
    { "id": 118, "category_id": "casket_list", "title": "Solid Oak Heritage Casket", "desc": "Heavy-duty solid oak construction with a natural grain.", "price": 80000, "images": ["/images/caskets/casket18(0).jpg", "/images/caskets/casket18.jpg"] },
    { "id": 119, "category_id": "casket_list", "title": "Serenity Blue Interior Casket", "desc": "Clean white exterior revealing a peaceful blue and white padded interior.", "price": 55000, "images": ["/images/caskets/casket19(0).jpg", "/images/caskets/casket19(1).jpg", "/images/caskets/casket19(2).jpg", "/images/caskets/casket19(3).jpg", "/images/caskets/casket19(4).jpg"] },
    { "id": 120, "category_id": "casket_list", "title": "Premium Wood Glass-Top Casket", "desc": "Solid wood construction featuring a full-length glass viewing panel.", "price": 95000, "images": ["/images/caskets/casket20().jpg", "/images/caskets/casket20(0).jpg", "/images/caskets/casket20(1).jpg", "/images/caskets/casket20(2).jpg"] },
    { "id": 121, "category_id": "casket_list", "title": "White & Gold Trim Casket", "desc": "Pristine white finish accented with elegant gold-tone border bands.", "price": 70000, "images": ["/images/caskets/casket21().jpeg", "/images/caskets/casket21(0).jpeg"] },
    { "id": 122, "category_id": "casket_list", "title": "Classic White Domed Casket", "desc": "Traditional domed lid with premium white finish.", "price": 50000, "images": ["/images/caskets/casket22(0).jpg", "/images/caskets/casket22(1).jpg"] },
    { "id": 123, "category_id": "casket_list", "title": "Pristine White Metal Casket", "desc": "Durable metal construction featuring a pure white gloss.", "price": 95000, "images": ["/images/caskets/casket23().jpg", "/images/caskets/casket23(0).jpeg", "/images/caskets/casket23(1).jpg", "/images/caskets/casket23(2).jpg"] },
    { "id": 124, "category_id": "casket_list", "title": "Obsidian Black Metal Casket", "desc": "Sleek, dark metallic finish for an executive, profound resting place.", "price": 105000, "images": ["/images/caskets/casket24().jpg", "/images/caskets/casket24(0).jpg", "/images/caskets/casket24(1).jpg", "/images/caskets/casket24(2).jpg", "/images/caskets/casket24(3).jpeg"] },
    { "id": 125, "category_id": "casket_list", "title": "Walnut Executive Metal Casket", "desc": "Dark polished metallic design with sturdy grip handles.", "price": 100000, "images": ["/images/caskets/casket25().jpg", "/images/caskets/casket25(0).jpg", "/images/caskets/casket25(1).jpg"] },
    { "id": 126, "category_id": "casket_list", "title": "Glossy Black Casket", "desc": "Highly polished black finish for a modern look.", "price": 98000, "images": ["/images/caskets/casket26.jpeg"] },
    { "id": 127, "category_id": "casket_list", "title": "Cream Velvet Interior Casket", "desc": "Light exterior finish paired with a luxurious cream velvet interior.", "price": 72000, "images": ["/images/caskets/casket27().jpg", "/images/caskets/casket27(0).jpg", "/images/caskets/casket27(1).jpg"] },
    { "id": 128, "category_id": "casket_list", "title": "Premium Dark Oak Casket", "desc": "High-grade oak with a deep stain and intricate handles.", "price": 82000, "images": ["/images/caskets/casket28().jpeg"] },
    { "id": 129, "category_id": "casket_list", "title": "Mahogany Elegance Casket", "desc": "Beautifully carved high-gloss mahogany wood.", "price": 92000, "images": ["/images/caskets/casket29().jpeg", "/images/caskets/casket29(0).jpeg"] },
    { "id": 130, "category_id": "casket_list", "title": "Half-Glass Wooden Casket", "desc": "High-end wooden design featuring a split glass viewing lid.", "price": 98000, "images": ["/images/caskets/casket30().jpeg", "/images/caskets/casket30(0).jpeg", "/images/caskets/casket30(1).jpeg"] },

    # --- URNS ---
    { "id": 151, "category_id": "urns", "title": "Classic Marble Box Urn", "desc": "Solid cultured marble in a deep burgundy finish.", "price": 18000, "images": ["/images/urns/images(0).jpg"] },
    { "id": 152, "category_id": "urns", "title": "Rustic Clay Urn", "desc": "Hand-crafted rustic earth-tone vessel.", "price": 12000, "images": ["/images/urns/images(1).jpg"] },
    { "id": 153, "category_id": "urns", "title": "Bronze Flying Birds Urn", "desc": "Elegant brass urn with engraved flying doves.", "price": 22000, "images": ["/images/urns/images(2).jpg"] },
    { "id": 154, "category_id": "urns", "title": "Purple Floral Keepsake", "desc": "Delicate purple and silver finish with floral motif.", "price": 15000, "images": ["/images/urns/images(3).jpg"] },
    { "id": 155, "category_id": "urns", "title": "Natural Stone Urn", "desc": "Textured natural stone finish.", "price": 20000, "images": ["/images/urns/images(4).jpg"] },
    { "id": 156, "category_id": "urns", "title": "Sleek Silver Urn", "desc": "Minimalist brushed silver metal design.", "price": 14000, "images": ["/images/urns/images(5).jpg"] },
    { "id": 157, "category_id": "urns", "title": "Grey Granite Urn", "desc": "Heavy-duty polished grey granite.", "price": 25000, "images": ["/images/urns/images(6).jpg"] },
    { "id": 158, "category_id": "urns", "title": "Engraved Wooden Box", "desc": "Premium dark wood with intricate front engraving.", "price": 16000, "images": ["/images/urns/images(7).jpg"] },
    { "id": 159, "category_id": "urns", "title": "Silver Display Urn", "desc": "Classic metallic urn perfect for mantle display.", "price": 13500, "images": ["/images/urns/images(8).jpg"] },
    { "id": 160, "category_id": "urns", "title": "Minimalist Sandstone Urn", "desc": "Light, textured sandstone finish.", "price": 17000, "images": ["/images/urns/images(9).jpg"] },
    { "id": 161, "category_id": "urns", "title": "Green and Gold Brass Urn", "desc": "Deep green body with dual gold bands.", "price": 19000, "images": ["/images/urns/images(10).jpg"] },
    { "id": 162, "category_id": "urns", "title": "Carved Tree Wooden Urn", "desc": "Warm wood finish featuring a 'Tree of Life' engraving.", "price": 15500, "images": ["/images/urns/images(11).jpg"] },
    { "id": 163, "category_id": "urns", "title": "Blue Swirl Glass Urn", "desc": "Artistic blue swirl pattern, includes protective bag.", "price": 21000, "images": ["/images/urns/images(12).jpg"] },
    { "id": 164, "category_id": "urns", "title": "White Rose Brass Urn", "desc": "Pristine white finish with a gold engraved rose.", "price": 18500, "images": ["/images/urns/images(13).jpg"] },
    { "id": 165, "category_id": "urns", "title": "Midnight Blue Keepsake", "desc": "Deep blue speckled finish with a velvet bag.", "price": 16500, "images": ["/images/urns/images(14).jpg"] },
    { "id": 166, "category_id": "urns", "title": "Silver Teardrop Urn", "desc": "Unique teardrop shape with intricate silver engraving.", "price": 24000, "images": ["/images/urns/images(15).jpg"] },

    # --- WREATHS ---
    { "id": 201, "category_id": "wreaths", "title": "Dual White Hearts on Stand", "desc": "Two elegant heart-shaped floral displays on a shared stand.", "price": 18000, "images": ["/images/wreaths/wreath1.jpeg"] },
    { "id": 202, "category_id": "wreaths", "title": "Classic White & Green Ring", "desc": "Beautifully arranged traditional circular wreath.", "price": 8000, "images": ["/images/wreaths/wreath2.jpeg"] },
    { "id": 203, "category_id": "wreaths", "title": "Yellow & Blue Floral Dome", "desc": "Vibrant yellow and blue dome floral mix.", "price": 14000, "images": ["/images/wreaths/wreath3.jpeg"] },
    { "id": 204, "category_id": "wreaths", "title": "Elevated White Floral Dome", "desc": "Elegant tall white floral display.", "price": 16000, "images": ["/images/wreaths/wreath4.jpeg"] },
    { "id": 205, "category_id": "wreaths", "title": "Standing White Heart Tribute", "desc": "Elevated white floral heart display on a stand.", "price": 15000, "images": ["/images/wreaths/wreath5.jpeg"] },
    { "id": 206, "category_id": "wreaths", "title": "Hanging Floral Tribute", "desc": "Unique suspended floral arrangement for high-impact visual tribute.", "price": 25000, "images": ["/images/wreaths/wreath6.jpeg"] },
    { "id": 207, "category_id": "wreaths", "title": "Red & White Round Wreath", "desc": "White base with striking red floral accents.", "price": 8500, "images": ["/images/wreaths/wreath7.jpeg"] },
    { "id": 208, "category_id": "wreaths", "title": "Blue & Yellow Round Wreath", "desc": "Vibrant circular tribute with contrasting blue and yellow colors.", "price": 8500, "images": ["/images/wreaths/wreath8.jpeg"] },
    { "id": 209, "category_id": "wreaths", "title": "White & Green Floral Heart", "desc": "Clean and pure white heart-shaped arrangement.", "price": 12000, "images": ["/images/wreaths/wreath9.jpeg"] },
    { "id": 210, "category_id": "wreaths", "title": "Family Cross & Heart Floral Set", "desc": "A beautifully coordinated cross and heart set.", "price": 22000, "images": ["/images/wreaths/wreath10.jpeg"] },
    { "id": 211, "category_id": "wreaths", "title": "Pristine White Round Wreath", "desc": "Classic dense arrangement in pure white blooms.", "price": 8000, "images": ["/images/wreaths/wreath11.jpeg"] },
    { "id": 212, "category_id": "wreaths", "title": "Autumn Hue Round Tribute", "desc": "Warm colored circular floral arrangement.", "price": 8500, "images": ["/images/wreaths/wreath12.jpeg"] },
    { "id": 213, "category_id": "wreaths", "title": "White Cross with Red Center", "desc": "Traditional cross arrangement with a vibrant center accent.", "price": 14000, "images": ["/images/wreaths/wreath13.jpeg"] },
    { "id": 214, "category_id": "wreaths", "title": "Blue & White Floral Cushion", "desc": "Beautifully arranged blue and white cushion tribute.", "price": 12000, "images": ["/images/wreaths/wreath14.jpeg"] },
    { "id": 215, "category_id": "wreaths", "title": "Custom 'DAD' Floral Cushion", "desc": "Circular wreath personalized with a 'DAD' centerpiece.", "price": 10000, "images": ["/images/wreaths/wreath15.jpeg"] },
    { "id": 216, "category_id": "wreaths", "title": "White & Purple Crosses", "desc": "Multiple cross arrangements with elegant purple accents.", "price": 22000, "images": ["/images/wreaths/wreath16.jpeg"] },
    { "id": 217, "category_id": "wreaths", "title": "Custom 'MY LOVE' Floral Heart", "desc": "Heart wreath boldly displaying 'MY LOVE'.", "price": 14000, "images": ["/images/wreaths/wreath17.jpeg"] },
    { "id": 218, "category_id": "wreaths", "title": "Full White Casket Spray", "desc": "Luxurious pure white floral spray designed to rest atop the casket.", "price": 25000, "images": ["/images/wreaths/wreath18.jpeg"] },
    { "id": 219, "category_id": "wreaths", "title": "Trio of Standing Wreaths", "desc": "Three coordinated standing circular wreaths.", "price": 28000, "images": ["/images/wreaths/wreath19.jpeg"] },
    { "id": 220, "category_id": "wreaths", "title": "Classic White & Green Ring", "desc": "A pristine white, densely packed floral ring.", "price": 8000, "images": ["/images/wreaths/wreath20.jpeg"] },
    { "id": 221, "category_id": "wreaths", "title": "Solid Red Rose Heart", "desc": "Stunning full red rose heart arrangement.", "price": 15000, "images": ["/images/wreaths/wreath21.jpeg"] },
    { "id": 222, "category_id": "wreaths", "title": "White Heart with Red Border", "desc": "A beautiful mixture of red outlining white roses.", "price": 14000, "images": ["/images/wreaths/wreath22.jpeg"] },
    { "id": 223, "category_id": "wreaths", "title": "Symbolic Broken Heart Tribute", "desc": "Striking broken heart floral arrangement in red and white.", "price": 16000, "images": ["/images/wreaths/wreath23.jpeg"] },
    { "id": 224, "category_id": "wreaths", "title": "White & Red Casket Spray", "desc": "A long, elegant spray of mixed roses for the casket.", "price": 22000, "images": ["/images/wreaths/wreath24.jpeg"] },
    { "id": 226, "category_id": "wreaths", "title": "Large White Cross with Red Accent", "desc": "An oversized standing cross with vibrant red details.", "price": 15000, "images": ["/images/wreaths/wreath26.jpeg"] },
    { "id": 227, "category_id": "wreaths", "title": "White Heart with Crimson Trim", "desc": "Detailed heart shape surrounded by deep red flowers.", "price": 13000, "images": ["/images/wreaths/wreath27.jpeg"] },
    { "id": 228, "category_id": "wreaths", "title": "White & Green Heart Tribute", "desc": "Pure white blooms arranged in a tight heart shape with greenery.", "price": 12000, "images": ["/images/wreaths/wreath28.jpg"] },
    { "id": 229, "category_id": "wreaths", "title": "White & Blue Sympathy Basket", "desc": "Elevated floral spray featuring bold blue accents.", "price": 12000, "images": ["/images/wreaths/wreath29.jpg"] },
    { "id": 230, "category_id": "wreaths", "title": "Multi-Tribute Floral Package", "desc": "A comprehensive multi-piece floral setup for the family.", "price": 35000, "images": ["/images/wreaths/wreath30.jpg"] },
    { "id": 231, "category_id": "wreaths", "title": "Standing White Sympathy Spray", "desc": "Tall standing basket arrangement for the graveside or chapel.", "price": 16000, "images": ["/images/wreaths/wreath31.jpg"] },
    { "id": 232, "category_id": "wreaths", "title": "Large Red & White Casket Spray", "desc": "Oversized, lush arrangement filled with fresh cut red and white flowers.", "price": 26000, "images": ["/images/wreaths/wreath32.jpg"] },

    # --- LOWERING GEARS ---
    { "id": 300, "category_id": "lowering_gears", "title": "Executive Placement Setup ", "desc": "Complete elegant lowering service setup.", "price": 25000, "images": ["/images/lowering-gears/setup10(0).jpeg", "/images/lowering-gears/setup10(1).jpeg"] },
    { "id": 301, "category_id": "lowering_gears", "title": "Graveside AstroTurf Setup", "desc": "Lowering gear accompanied by premium artificial grass.", "price": 20000, "images": ["/images/lowering-gears/setup.jpeg"] },
    { "id": 302, "category_id": "lowering_gears", "title": "Standard Lowering Device 1", "desc": "Heavy-duty metal lowering gear mechanism.", "price": 15000, "images": ["/images/lowering-gears/setup1.jpeg"] },
    { "id": 303, "category_id": "lowering_gears", "title": "Standard Lowering Device 2", "desc": "Durable gear with sturdy green straps.", "price": 15000, "images": ["/images/lowering-gears/setup2.jpeg"] },
    { "id": 304, "category_id": "lowering_gears", "title": "Standard Lowering Device 3", "desc": "Metal framework gear for stable descents.", "price": 15000, "images": ["/images/lowering-gears/setup3.jpeg","/images/lowering-gears/setup5.jpeg"] }, 
    { "id": 305, "category_id": "lowering_gears", "title": "Executive Placement Setup 4", "desc": "Elegant lowering gear wrapped in green.", "price": 25000, "images": ["/images/lowering-gears/setup11.jpeg"] }, 
    { "id": 306, "category_id": "lowering_gears", "title": "VIP Red Carpet Setup 5", "desc": "Service setup featuring a red carpet walkway.", "price": 35000, "images": ["/images/lowering-gears/setup12.jpeg"] }, 
    { "id": 307, "category_id": "lowering_gears", "title": "Executive Walkway", "desc": "Premium graveside runner placement.", "price": 18000, "images": ["/images/lowering-gears/setup18.jpeg", "/images/lowering-gears/setup19.jpeg", "/images/lowering-gears/setup20.jpeg", "/images/lowering-gears/setup18.jpeg"] }, 
    { "id": 308, "category_id": "lowering_gears", "title": "VIP Red Carpet Setup", "desc": "Complete outdoor red carpet experience.", "price": 35000, "images": ["/images/lowering-gears/setup14.jpeg"] },
    { "id": 309, "category_id": "lowering_gears", "title": "VIP Red Carpet Setup 2", "desc": "Red carpet setup leading to the tent.", "price": 35000, "images": ["/images/lowering-gears/setup16.jpeg"] }, 
    { "id": 310, "category_id": "lowering_gears", "title": "Executive Walkway 2", "desc": "Long red carpet runner for family access.", "price": 18000, "images": ["/images/lowering-gears/setup17.jpeg"] },

    # --- TENTS ---
    { "id": 351, "category_id": "tents", "title": "Standard Pagoda Tent 1", "desc": "High-peak white tent ideal for family seating.", "price": 10000, "images": ["/images/tents/tent1.jpeg"] },
    { "id": 352, "category_id": "tents", "title": "Standard Pagoda Tent 2", "desc": "Medium-sized white tent for outdoor gatherings.", "price": 10000, "images": ["/images/tents/tent2.jpeg"] },
    { "id": 353, "category_id": "tents", "title": "Premium Marquee Tent", "desc": "Spacious clear-span marquee tent for large gatherings and VIPs.", "price": 50000, "images": ["/images/tents/tent3.jpeg"] },
    { "id": 354, "category_id": "tents", "title": "Graveside Red Carpet Tent", "desc": "Specialized tent placement featuring a dignified red carpet.", "price": 15000, "images": ["/images/tents/tent4.jpeg"] },
    { "id": 355, "category_id": "tents", "title": "Basic Gazebo Shade", "desc": "Simple pop-up tent for utility, overflow, or minimal shade.", "price": 5000, "images": ["/images/tents/tent5.jpeg"] },
    { "id": 356, "category_id": "tents", "title": "Extended Gathering Tent 1", "desc": "Large open-air structure for shielding large groups.", "price": 25000, "images": ["/images/tents/tent6.jpeg"] },
    { "id": 357, "category_id": "tents", "title": "Extended Gathering Tent 2", "desc": "Spacious multi-pole tent setup for extended family.", "price": 25000, "images": ["/images/tents/tent7.jpeg"] },

    # --- HEARSES ---
    { "id": 401, "category_id": "hearses", "title": "Mercedes Executive Hearse 1", "desc": "Dignified Mercedes-Benz transport. Displays full exterior and interior suite. Base daily rate shown.", "price": 25000, "images": ["/images/hearses/hearse1(0).jpeg", "/images/hearses/hearse1(1).jpeg", "/images/hearses/hearse1(2).jpeg", "/images/hearses/hearse1(3).jpeg", "/images/hearses/hearse1(4).jpeg", "/images/hearses/hearse1(5).jpeg"] },
    { "id": 402, "category_id": "hearses", "title": "Executive Mercedes Hearse 2", "desc": "Durable and highly capable luxury transport.", "price": 28000, "images": ["/images/hearses/hearse5(0).jpeg", "/images/hearses/hearse5(1).jpeg", "/images/hearses/hearse5(2).jpeg", "/images/hearses/hearse5(3).jpeg"] },
    { "id": 403, "category_id": "hearses", "title": "Classic Van Hearse", "desc": "Spacious, reliable, and elegant van transport for the final journey. Base daily rate shown.", "price": 15000, "images": ["/images/hearses/hearse2(0).jpeg", "/images/hearses/hearse2(1).jpeg", "/images/hearses/hearse2(3).jpeg", "/images/hearses/hearse2(4).jpeg", "/images/hearses/hearse2(5).jpg", "/images/hearses/hearse2(6).jpg", "/images/hearses/hearse2(7).jpg"] },
    { "id": 404, "category_id": "hearses", "title": "Executive Family Bus", "desc": "Luxury bus capable of comfortably transporting the extended family. Base daily rate shown.", "price": 35000, "images": ["/images/hearses/hearse3(0).jpeg", "/images/hearses/hearse3(1).jpeg", "/images/hearses/hearse3(2).jpeg", "/images/hearses/hearse3(3).jpg", "/images/hearses/hearse3(4).jpg"] },
    { "id": 405, "category_id": "hearses", "title": "Premium Black Transport", "desc": "Discreet and highly professional dark vehicle option. Base daily rate shown.", "price": 20000, "images": ["/images/hearses/hearse4(0).jpg"] },

    # --- ATTIRE ---
    { "id": 601, "category_id": "attire", "title": "Premium Men's Burial Suit", "desc": "Complete 3-piece dark suit tailored specifically for the deceased. Includes shirt and tie.", "price": 18000, "images": ["/assets/mens-burial-suit.jpg"] },
    { "id": 602, "category_id": "attire", "title": "Men's Traditional Shroud", "desc": "Dignified, high-quality fabric shroud tailored for traditional burial rites.", "price": 12000, "images": ["/assets/mens-shroud.jpg"] },
    { "id": 603, "category_id": "attire", "title": "Custom Men's Suit (Family)", "desc": "Tailored 3-piece dark suit for family members. Includes measurements and fitting sessions.", "price": 15000, "images": ["/assets/suit-mens.jpg"] },
    { "id": 604, "category_id": "attire", "title": "Women's Modest Dress", "desc": "Elegant, conservative dress available in black, navy, or dark grey.", "price": 8500, "images": ["/assets/dress-womens.jpg"] },
    { "id": 605, "category_id": "attire", "title": "Elegant White Lace Burial Dress", "desc": "Beautifully detailed white lace modest dress for family members or burial.", "price": 8500, "images": ["/images/ladies attire/Lattire1().jpeg", "/images/ladies attire/Lattire1.jpeg"] },
    { "id": 606, "category_id": "attire", "title": "Custom Ribbon Lapels", "desc": "Personalized memorial ribbons for family and guests (Pack of 50).", "price": 2500, "images": ["/assets/ribbons.jpg"] },

    # --- MEDIA ---
    { "id": 701, "category_id": "media", "title": "Standard Photo Package", "desc": "One professional photographer for 6 hours. Includes digital gallery and 50 printed photos.", "price": 25000, "images": ["/images/images().jpg"] },
    { "id": 702, "category_id": "media", "title": "Cinematic Videography & Livestream", "desc": "Two videographers, edited memorial video, and professional livestream link for diaspora relatives.", "price": 55000, "images": ["/images/images.jpg"] }
]

app = create_app()

def determine_specs(category_id):
    if category_id == "casket_list": return {"Material": "Premium Solid Construction", "Interior": "Luxury Velvet Lining", "Features": "Sturdy Grip Handles"}
    if category_id == "urns": return {"Material": "Durable Core", "Design": "Elegant Memorial Finish"}
    if category_id == "wreaths": return {"Flowers": "Fresh Cut Assortment", "Arrangement": "Professional Floral Design"}
    if category_id == "lowering_gears": return {"Service": "Graveside Delivery & Setup", "Operators": "Professional Crew"}
    if category_id == "tents": return {"Setup": "Full Assembly & Takedown", "Quality": "Weather-Resistant Canopy"}
    if category_id == "hearses": return {"Type": "Executive Transport", "Driver": "Uniformed Chauffeur Included"}
    if category_id == "attire": return {"Tailoring": "Custom Fit Availability", "Material": "High-Quality Fabric"}
    if category_id == "media": return {"Delivery": "Digital & Physical Artifacts", "Operators": "Professional Equipment"}
    return {}

with app.app_context():
    print("Clearing old catalog data...")
    ProductSpecification.query.delete()
    ProductImage.query.delete()
    Product.query.delete()
    
    print("Seeding ALL 108 Items into Enterprise Catalog...")
    for item in catalog_data:
        # 1. Create Product
        product = Product(
            id=item["id"],
            category_id=item["category_id"],
            title=item["title"],
            description=item["desc"],
            price=item["price"],
            dispatch_location="Nairobi Central"
        )
        db.session.add(product)
        db.session.flush()
        
        # 2. Add All Images
        for img_url in item["images"]:
            img = ProductImage(product_id=product.id, image_url=img_url)
            db.session.add(img)
            
        # 3. Add Dynamic Specs Based on Category
        specs = determine_specs(item["category_id"])
        for key, value in specs.items():
            spec = ProductSpecification(product_id=product.id, key_name=key, value=value)
            db.session.add(spec)
                
        # Universal Delivery Estimate
        logistics_spec = ProductSpecification(product_id=product.id, key_name="Delivery Estimate", value="Ruiru & Nairobi (1-2 Days), Other Counties (3-8 Days)")
        db.session.add(logistics_spec)

    db.session.commit()
    print("✅ All items successfully seeded! Your catalog is now fully populated.")