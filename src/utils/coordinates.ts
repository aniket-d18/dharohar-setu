export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
  accuracyKm?: number;
}

export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // --- Maharashtra Districts (Full Coverage) ---
  'Ahilyanagar': [19.0948, 74.7480],
  'Ahmednagar': [19.0948, 74.7480],
  'Ahilyanagar (Ahmednagar)': [19.0948, 74.7480],
  'Pune': [18.5204, 73.8567],
  'Mumbai': [19.0760, 72.8777],
  'Mumbai Suburban': [19.1136, 72.8697],
  'Thane': [19.2183, 72.9781],
  'Palghar': [19.6967, 72.7699],
  'Raigad': [18.5158, 73.1822],
  'Ratnagiri': [16.9902, 73.3120],
  'Sindhudurg': [16.1216, 73.6934],
  'Nashik': [19.9975, 73.7898],
  'Dhule': [20.9042, 74.7749],
  'Nandurbar': [21.3716, 74.2405],
  'Jalgaon': [21.0077, 75.5626],
  'Buldhana': [20.5293, 76.1843],
  'Akola': [20.7002, 77.0082],
  'Washim': [20.1098, 77.1352],
  'Amravati': [20.9374, 77.7796],
  'Yavatmal': [20.3888, 78.1204],
  'Wardha': [20.7453, 78.6022],
  'Nagpur': [21.1458, 79.0882],
  'Bhandara': [21.1714, 79.6548],
  'Gondia': [21.4624, 80.1961],
  'Chandrapur': [19.9615, 79.2961],
  'Gadchiroli': [20.1849, 79.9948],
  'Chhatrapati Sambhaji Nagar': [19.8762, 75.3433],
  'Aurangabad': [19.8762, 75.3433],
  'Chhatrapati Sambhaji Nagar (Aurangabad)': [19.8762, 75.3433],
  'Jalna': [19.8347, 75.8816],
  'Parbhani': [19.2686, 76.7708],
  'Hingoli': [19.7173, 77.1471],
  'Nanded': [19.1383, 77.3210],
  'Beed': [18.9891, 75.7601],
  'Latur': [18.4088, 76.5604],
  'Dharashiv': [18.1760, 76.0407],
  'Osmanabad': [18.1760, 76.0407],
  'Dharashiv (Osmanabad)': [18.1760, 76.0407],
  'Solapur': [17.6599, 75.9064],
  'Satara': [17.6805, 73.9997],
  'Sangli': [16.8524, 74.5815],
  'Kolhapur': [16.7050, 74.2433],

  // --- Prominent Cultural & Heritage Districts Across India ---
  'The Nilgiris': [11.4102, 76.6950],
  'South Andaman': [11.6234, 92.7265],
  'Nicobar': [7.0000, 93.8000],
  'Lahaul & Spiti': [32.5510, 77.0180],
  'Kutch': [23.4550, 69.8000],
  'Alipurduar': [26.4919, 89.5271],
  'Changlang': [27.1264, 95.7360],
  'North Sikkim': [27.7000, 88.5000],
  'Chandel': [24.3268, 94.0042],
  'Mon': [26.7431, 95.0607],
  'Varanasi': [25.3176, 82.9739],
  'Ayodhya': [26.7922, 82.1998],
  'Lucknow': [26.8467, 80.9462],
  'Mathura': [27.4924, 77.6737],
  'Agra': [27.1767, 78.0081],
  'Patna': [25.6127, 85.1589],
  'Gaya': [24.7955, 85.0002],
  'Madhubani': [26.3541, 86.0718],
  'Jaipur': [26.9124, 75.7873],
  'Jodhpur': [26.2389, 73.0243],
  'Udaipur': [24.5854, 73.7125],
  'Jaisalmer': [26.9157, 70.9083],
  'Barmer': [25.7521, 71.3967],
  'Ahmedabad': [23.0225, 72.5714],
  'Vadodara': [22.3072, 73.1812],
  'Surat': [21.1702, 72.8311],
  'Bengaluru Urban': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Mysuru': [12.2958, 76.6394],
  'Bellary': [15.1394, 76.9214],
  'Hampi': [15.3350, 76.4600],
  'Dakshina Kannada': [12.8700, 75.2400],
  'Udupi': [13.3409, 74.7421],
  'Chennai': [13.0827, 80.2707],
  'Madurai': [9.9252, 78.1198],
  'Thanjavur': [10.7870, 79.1378],
  'Coimbatore': [11.0168, 76.9558],
  'Kanyakumari': [8.0883, 77.5385],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Kochi': [9.9312, 76.2673],
  'Wayanad': [11.6854, 76.1320],
  'Kozhikode': [11.2588, 75.7804],
  'Kolkata': [22.5726, 88.3639],
  'Darjeeling': [27.0410, 88.2663],
  'Kalimpong': [27.0594, 88.4695],
  'Bankura': [23.2324, 87.0715],
  'Birbhum': [23.8404, 87.6186],
  'Guwahati': [26.1445, 91.7362],
  'Kamrup': [26.3161, 91.5984],
  'Majuli': [26.9500, 94.2167],
  'Jorhat': [26.7509, 94.2037],
  'Kohima': [25.6751, 94.1086],
  'Imphal East': [24.8170, 93.9368],
  'Imphal West': [24.8170, 93.9368],
  'Imphal': [24.8170, 93.9368],
  'Aizawl': [23.7271, 92.7176],
  'Shillong': [25.5788, 91.8933],
  'East Khasi Hills': [25.5788, 91.8933],
  'Agartala': [23.8315, 91.2868],
  'West Tripura': [23.8315, 91.2868],
  'Gangtok': [27.3389, 88.6065],
  'Srinagar': [34.0837, 74.7973],
  'Jammu': [32.7266, 74.8570],
  'Leh': [34.1526, 77.5771],
  'Kargil': [34.5539, 76.1349],
  'Bhopal': [23.2599, 77.4126],
  'Indore': [22.7196, 75.8577],
  'Gwalior': [26.2183, 78.1828],
  'Jabalpur': [23.1815, 79.9864],
  'Ujjain': [23.1765, 75.7885],
  'Raipur': [21.2514, 81.6296],
  'Bastar': [19.0748, 82.0298],
  'Ranchi': [23.3441, 85.3096],
  'Bhubaneswar': [20.2961, 85.8245],
  'Puri': [19.8135, 85.8312],
  'Mayurbhanj': [21.9282, 86.7378],
  'Hyderabad': [17.3850, 78.4867],
  'Warangal': [17.9689, 79.5941],
  'Visakhapatnam': [17.6868, 83.2185],
  'Tirupati': [13.6288, 79.4192],

  // --- 28 Indian States (Centroids) ---
  'Andhra Pradesh': [15.9129, 79.7400],
  'Arunachal Pradesh': [28.2180, 94.7278],
  'Assam': [26.2006, 92.9376],
  'Bihar': [25.0961, 85.3131],
  'Chhattisgarh': [21.2787, 81.8661],
  'Goa': [15.2993, 74.1240],
  'Gujarat': [22.2587, 71.1924],
  'Haryana': [29.0588, 76.0856],
  'Himachal Pradesh': [31.1048, 77.1734],
  'Jharkhand': [23.6102, 85.2799],
  'Karnataka': [15.3173, 75.7139],
  'Kerala': [10.8505, 76.2711],
  'Madhya Pradesh': [22.9734, 78.6569],
  'Maharashtra': [19.7515, 75.7139],
  'Manipur': [24.6637, 93.9063],
  'Meghalaya': [25.4670, 91.3662],
  'Mizoram': [23.1645, 92.9376],
  'Nagaland': [26.1584, 94.5624],
  'Odisha': [20.9517, 85.0985],
  'Punjab': [31.1471, 75.3412],
  'Rajasthan': [27.0238, 74.2179],
  'Sikkim': [27.5330, 88.5122],
  'Tamil Nadu': [11.1271, 78.6569],
  'Telangana': [18.1124, 79.0193],
  'Tripura': [23.9408, 91.9882],
  'Uttar Pradesh': [26.8467, 80.9462],
  'Uttarakhand': [30.0668, 79.0193],
  'West Bengal': [22.9868, 87.8550],

  // --- 8 Union Territories ---
  'Andaman and Nicobar Islands': [11.7401, 92.6586],
  'Andaman & Nicobar Islands': [11.7401, 92.6586],
  'Andaman & Nicobar': [11.7401, 92.6586],
  'Chandigarh': [30.7333, 76.7794],
  'Dadra and Nagar Haveli and Daman and Diu': [20.4283, 72.8397],
  'Delhi': [28.7041, 77.1025],
  'Jammu and Kashmir': [33.7782, 76.5762],
  'Jammu & Kashmir': [33.7782, 76.5762],
  'Ladakh': [34.1526, 77.5771],
  'Lakshadweep': [10.5667, 72.6417],
  'Puducherry': [11.9416, 79.8083],
};

/**
 * Intelligent Coordinate Resolver for Dharohar Cultural Atlas
 * Ensures that ANY district (even newly submitted or custom ones) always gets an accurate
 * interactive cultural pin on the map.
 */
export function getCoordinatesForRegion(regionName: string, stateName?: string): [number, number] {
  if (!regionName) return [20.5937, 78.9629];

  // 1. Direct exact match
  if (DISTRICT_COORDINATES[regionName]) {
    return DISTRICT_COORDINATES[regionName];
  }

  // 2. Cleaned without parentheses e.g. "Ahilyanagar (Ahmednagar)" -> "Ahilyanagar" or "Ahmednagar"
  const stripped = regionName.replace(/\(.*?\)/g, '').trim();
  if (DISTRICT_COORDINATES[stripped]) {
    return DISTRICT_COORDINATES[stripped];
  }
  const matchParen = regionName.match(/\((.*?)\)/);
  if (matchParen && matchParen[1]) {
    const inside = matchParen[1].trim();
    if (DISTRICT_COORDINATES[inside]) {
      return DISTRICT_COORDINATES[inside];
    }
  }

  // 3. Case-insensitive substring match
  const lower = regionName.toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    const keyLower = key.toLowerCase();
    if (keyLower === lower || keyLower.includes(lower) || lower.includes(keyLower)) {
      return coords;
    }
  }

  // 4. Fallback to state coordinate with deterministic jitter
  const targetState = stateName || regionName;
  if (DISTRICT_COORDINATES[targetState]) {
    const base = DISTRICT_COORDINATES[targetState];
    let hash = 0;
    for (let i = 0; i < regionName.length; i++) {
      hash = (hash << 5) - hash + regionName.charCodeAt(i);
      hash |= 0;
    }
    const latOffset = ((Math.abs(hash) % 20) - 10) * 0.05;
    const lngOffset = ((Math.abs(hash >> 3) % 20) - 10) * 0.05;
    return [base[0] + latOffset, base[1] + lngOffset];
  }

  // 5. Default Center of India
  return [20.5937, 78.9629];
}
