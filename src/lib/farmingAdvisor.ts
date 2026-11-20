/** Offline farming guidance used when the AI edge function is unavailable. */

type Topic = {
  match: RegExp;
  reply: string;
};

const TOPICS: Topic[] = [
  {
    match: /yellow|chlorosis|tomato|leaf/,
    reply: `**Yellow leaves (common on tomato and other vegetables)**

1. Check the pattern: older lower leaves first often means nitrogen shortage or water stress. New leaves yellow with green veins often means iron or zinc shortage.
2. Water deeply 2–3 times a week. Avoid daily light watering and waterlogging.
3. For nitrogen: apply well-rotted FYM, or urea about **20–25 kg/acre** in split doses (vegetables: a light top dress, then irrigate).
4. Spray micronutrient mix (zinc + iron) only if new leaves stay pale after watering is corrected.
5. If spots, curling, or wilting appear with yellowing, it may be a disease (early blight, wilt). Remove badly affected leaves and consult your local KVK before spraying a fungicide.

This is general guidance. Confirm with your Krishi Vigyan Kendra for your soil and crop stage.`,
  },
  {
    match: /aphid|chepa|organic pest|neem/,
    reply: `**Organic aphid control**

1. Spray a strong jet of water to knock aphids off young shoots.
2. Neem oil **5 ml per litre** of water + a few drops of liquid soap. Spray in the evening, covering the underside of leaves. Repeat after 5–7 days.
3. Release or encourage ladybird beetles. Avoid broad insecticides that kill them.
4. Remove heavily infested shoot tips.
5. If the attack is severe on wheat or mustard, a need-based spray of a recommended insecticide can be used. Wear gloves, do not spray in wind, and follow the label waiting period before harvest.`,
  },
  {
    match: /fertili[sz]er|urea|dap|wheat|npk|khad/,
    reply: `**Fertilizer guide (wheat, plains — adjust with a soil test)**

- Basal at sowing: **DAP 50 kg/acre** + **MOP 20 kg/acre** (if soil test shows potash is low).
- First nitrogen: **urea 40–45 kg/acre** with the first irrigation (about 20–25 days after sowing).
- Second nitrogen: **urea 40–45 kg/acre** at tillering / second irrigation.
- Add **zinc sulphate 10 kg/acre** once every 2–3 years if the soil is deficient.
- Organic option: 4–5 trolley FYM or compost before sowing, then reduce chemical nitrogen slightly.

Always base the final dose on your Soil Health Card. Over-use of urea increases lodging and cost.`,
  },
  {
    match: /irrigat|water|drip|drought|sinchai/,
    reply: `**Irrigation**

- Wheat: first irrigation about **21 days** after sowing, then at tillering, booting, and grain filling if rain is low.
- Rice: keep a shallow layer of water after transplanting; drain before harvest.
- Vegetables: drip or furrow irrigation in the evening. Mulch with straw to cut evaporation.
- In heat or dry spells, irrigate early morning or evening. Do not flood fields that already show yellowing from waterlogging.

If you share the crop and growth stage, a tighter schedule can be suggested.`,
  },
  {
    match: /blight|rust|wilt|disease|fungus|keet|rog/,
    reply: `**Crop disease — first steps**

1. Note the crop, which leaves (old or new), and whether you see spots, powder, wilting, or holes.
2. Remove and destroy badly infected leaves. Do not compost them.
3. Avoid overhead irrigation late in the day.
4. For leaf spots/blight, many KVKs suggest a protective fungicide such as mancozeb, used **exactly as on the label**, with gloves and a mask.
5. For wilt, fungicide sprays on leaves rarely help. Improve drainage and ask KVK about resistant varieties or soil treatment.

Send the crop name and a short description of the symptom for a closer match.`,
  },
  {
    match: /kharif|rabi|zaid|season|monsoon|sowing|buwai/,
    reply: `**Season guide (India)**

- **Kharif (Jun–Oct):** rice, maize, cotton, soybean, pigeon pea. Sow with the monsoon. Keep drainage ready.
- **Rabi (Nov–Mar):** wheat, mustard, chickpea, potato. Sow wheat in the first half of November in most plains.
- **Zaid (Mar–Jun):** short vegetables, fodder, moong where water is available. Avoid peak heat for new nurseries.

Pick the crop you plan to sow and the state, and the next field operation can be listed.`,
  },
  {
    match: /pm-?kisan|scheme|subsidy|insurance|fasal bima|kcc|loan/,
    reply: `**Schemes (short)**

- **PM-KISAN:** ₹6,000/year in three installments for eligible landholding families. Register on pmkisan.gov.in.
- **PMFBY:** crop insurance. Low farmer premium for notified crops. Apply through your bank or the PMFBY portal before the cut-off.
- **Kisan Credit Card:** short-term crop loan from your bank, often with interest subvention if repaid on time.

Open **Govt. Schemes** in this app for the details saved by your admin, and confirm eligibility at the block agriculture office.`,
  },
  {
    match: /price|mandi|bhav|market/,
    reply: `**Market prices**

Prices in this app come from the rates your admin publishes (or the starter seed data). They are per quintal.

For a sale decision, also check your nearest APMC / e-NAM mandi the same morning, because rates move daily. Open **Market Prices** and filter by your crop.`,
  },
  {
    match: /weather|rain|barish|heat/,
    reply: `**Weather and field work**

Use the **Weather** page for live temperature, humidity, and rain chance at your district.

- Rain chance above ~70%: delay pesticide and fertilizer top-dress.
- Temperature above ~40°C: irrigate in the evening and provide shade for nurseries and animals.
- Thunderstorm alert: stay out of open fields and secure equipment.`,
  },
];

const DEFAULT_REPLY = `**KrishiMitra — farming guidance**

Tell me the **crop**, **problem** (pest, yellow leaves, fertilizer, water), and **stage** (sowing, flowering, harvest).

You can also ask about:
- Yellow leaves on tomato
- Fertilizer for wheat
- Organic control of aphids
- When to irrigate
- Kharif / Rabi sowing
- PM-KISAN or crop insurance

For a serious outbreak, visit your nearest **Krishi Vigyan Kendra** or agriculture officer before using a chemical spray.`;

export function adviseFarmer(message: string): string {
  const text = message.toLowerCase();
  const hit = TOPICS.find((topic) => topic.match.test(text));
  return hit?.reply ?? DEFAULT_REPLY;
}
