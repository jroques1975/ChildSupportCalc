import React, { useState, useEffect, useCallback } from 'react';

// Helper component for input fields
// Defined outside App to prevent re-definition on every App render, improving focus stability
const InputField = ({ label, value, onChange, type = 'text', step = '0.01' }) => (
  <div className="mb-2">
    <label className="block text-gray-700 text-sm font-bold mb-1">
      {label}:
    </label>
    <input
      type={type}
      inputMode={type === 'text' ? 'decimal' : undefined} // Use 'decimal' for numerical input with string state
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)} // Pass string directly
      className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
    />
  </div>
);

// Helper component for displaying rows with Petitioner, Respondent, and Total values
const ResultRow = ({ label, petitionerValue, respondentValue, totalValue, isCurrency = true }) => (
  <div className="grid grid-cols-4 gap-4 py-2 border-b border-gray-200 items-center">
    <div className="col-span-2 font-medium text-gray-800">{label}</div>
    <div className="text-right">
      {petitionerValue !== undefined && (isCurrency ? formatCurrency(petitionerValue) : formatPercentage(petitionerValue))}
    </div>
    <div className="text-right">
      {respondentValue !== undefined && (isCurrency ? formatCurrency(respondentValue) : formatPercentage(respondentValue))}
    </div>
    {totalValue !== undefined && (
      <div className="text-right col-span-1">
        {isCurrency ? formatCurrency(totalValue) : formatPercentage(totalValue)}
      </div>
    )}
  </div>
);

// Helper component for displaying single result values
const SingleResultRow = ({ label, value, isCurrency = true }) => (
  <div className="grid grid-cols-4 gap-4 py-2 border-b border-gray-200 items-center">
    <div className="col-span-2 font-medium text-gray-800">{label}</div>
    <div className="col-span-2 text-right">
      {isCurrency ? formatCurrency(value) : formatPercentage(value)}
    </div>
  </div>
);

// Helper function to format currency (moved outside App to be accessible by ResultRow)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format percentage (moved outside App to be accessible by ResultRow)
const formatPercentage = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};


// Main App component for the Florida Child Support Worksheet Calculator
function App() {
  // State variables for all input fields, initialized with example values from the document
  // Changed initial state values to strings to prevent focus loss during typing
  const [petitionerNetIncome, setPetitionerNetIncome] = useState('7740.91');
  const [respondentNetIncome, setRespondentNetIncome] = useState('5800.00');
  const [numChildren, setNumChildren] = useState('2');
  const [childcareCosts, setChildcareCosts] = useState('200.00');
  const [healthInsuranceCosts, setHealthInsuranceCosts] = useState('282.00');
  const [noncoveredMedicalCosts, setNoncoveredMedicalCosts] = useState('0.00');

  const [petitionerChildcarePaid, setPetitionerChildcarePaid] = useState('200.00');
  const [respondentChildcarePaid, setRespondentChildcarePaid] = useState('0.00');
  const [petitionerHealthInsurancePaid, setPetitionerHealthInsurancePaid] = useState('282.00');
  const [respondentHealthInsurancePaid, setRespondentHealthInsurancePaid] = useState('0.00');
  const [petitionerOtherPaid, setPetitionerOtherPaid] = useState('0.00');
  const [respondentOtherPaid, setRespondentOtherPaid] = useState('0.00');

  const [petitionerOvernights, setPetitionerOvernights] = useState('182.5');
  const [respondentOvernights, setRespondentOvernights] = useState('182.5');

  // State for calculated values
  const [calculations, setCalculations] = useState({});

  // Child Support Guidelines Chart data from Florida Statute 61.30
  // Each array corresponds to [1 Child, 2 Children, 3 Children, 4 Children, 5 Children, 6 Children]
  const guidelinesChart = {
  800:[190,211,213,216,218,220],850:[202,257,259,262,265,268],900:[213,302,305,309,312,315],950:[224,347,351,355,359,363],1000:[235,365,397,402,406,410],1050:[246,382,443,448,453,458],1100:[258,400,489,495,500,505],1150:[269,417,522,541,547,553],1200:[280,435,544,588,594,600],1250:[290,451,565,634,641,648],1300:[300,467,584,659,688,695],1350:[310,482,603,681,735,743],1400:[320,498,623,702,765,790],1450:[330,513,642,724,789,838],1500:[340,529,662,746,813,869],1550:[350,544,681,768,836,895],1600:[360,560,701,790,860,920],1650:[370,575,720,812,884,945],1700:[380,591,740,833,907,971],1750:[390,606,759,855,931,996],1800:[400,622,779,877,1022,1048],1850:[410,638,798,900,1048,1074],1900:[421,654,818,923,1074,1101],1950:[431,670,839,946,1101,1128],2000:[442,686,859,968,1128,1154],2050:[452,702,879,991,1154,1181],2100:[463,718,899,1014,1181,1207],2150:[473,734,919,1037,1207,1234],2200:[484,751,940,1060,1234,1261],2250:[494,767,960,1082,1261,1287],2300:[505,783,980,1105,1287,1314],2350:[515,799,1000,1128,1314,1340],2400:[526,815,1020,1151,1340,1367],2450:[536,831,1041,1174,1367,1394],2500:[547,847,1061,1196,1394,1420],2550:[557,864,1081,1219,1420,1447],2600:[568,880,1101,1242,1447,1473],2650:[578,896,1121,1265,1473,1500],2700:[588,912,1141,1287,1500,1524],2750:[597,927,1160,1308,1524,1549],2800:[607,941,1178,1328,1549,1573],2850:[616,956,1197,1349,1573,1598],2900:[626,971,1215,1370,1598,1622],2950:[635,986,1234,1391,1622,1647],3000:[644,1001,1252,1412,1647,1671],3050:[654,1016,1271,1433,1671,1695],3100:[663,1031,1289,1453,1695,1720],3150:[673,1045,1308,1474,1720,1744],3200:[682,1060,1327,1495,1744,1769],3250:[691,1075,1345,1516,1769,1793],3300:[701,1090,1364,1537,1793,1818],3350:[710,1105,1382,1558,1818,1842],3400:[720,1120,1401,1579,1842,1867],3450:[729,1135,1419,1599,1867,1891],3500:[738,1149,1438,1620,1891,1915],3550:[748,1164,1456,1641,1915,1940],3600:[757,1179,1475,1662,1940,1964],3650:[767,1194,1493,1683,1964,1987],3700:[776,1208,1503,1702,1987,2009],3750:[784,1221,1520,1721,2009,2031],3800:[793,1234,1536,1740,2031,2053],3850:[802,1248,1553,1759,2053,2075],3900:[811,1261,1570,1778,2075,2097],3950:[819,1275,1587,1797,2097,2119],4000:[828,1288,1603,1816,2119,2141],4050:[837,1302,1620,1835,2141,2163],4100:[846,1315,1637,1854,2163,2185],4150:[854,1329,1654,1873,2185,2207],4200:[863,1342,1670,1892,2207,2229],4250:[872,1355,1687,1911,2229,2251],4300:[881,1369,1704,1930,2251,2273],4350:[889,1382,1721,1949,2273,2295],4400:[898,1396,1737,1968,2295,2317],4450:[907,1409,1754,1987,2317,2339],4500:[916,1423,1771,2006,2339,2361],4550:[924,1436,1788,2024,2361,2384],4600:[933,1450,1804,2043,2384,2406],4650:[942,1463,1821,2062,2406,2428],4700:[951,1477,1838,2081,2428,2450],4750:[959,1490,1855,2100,2450,2472],4800:[968,1503,1871,2119,2472,2494],4850:[977,1517,1888,2138,2494,2516],4900:[986,1530,1905,2157,2516,2535],4950:[993,1542,1927,2174,2535,2551],5000:[1000,1551,1939,2188,2551,2567],5050:[1006,1561,1952,2202,2567,2583],5100:[1013,1571,1964,2215,2583,2599],5150:[1019,1580,1976,2229,2599,2615],5200:[1025,1590,1988,2243,2615,2631],5250:[1032,1599,2000,2256,2631,2647],5300:[1038,1609,2012,2270,2647,2663],5350:[1045,1619,2024,2283,2663,2679],5400:[1051,1628,2037,2297,2679,2695],5450:[1057,1638,2049,2311,2695,2711],5500:[1064,1647,2061,2324,2711,2727],5550:[1070,1657,2073,2338,2727,2743],5600:[1077,1667,2085,2352,2743,2759],5650:[1083,1676,2097,2365,2759,2775],5700:[1089,1686,2109,2379,2775,2791],5750:[1096,1695,2122,2393,2791,2807],5800:[1102,1705,2134,2406,2807,2820],5850:[1107,1713,2144,2418,2820,2833],5900:[1111,1721,2155,2429,2833,2847],5950:[1116,1729,2165,2440,2847,2860],6000:[1121,1737,2175,2451,2860,2874],6050:[1126,1746,2185,2462,2874,2887],6100:[1131,1754,2196,2473,2887,2900],6150:[1136,1762,2206,2484,2900,2914],6200:[1141,1770,2216,2495,2914,2927],6250:[1145,1778,2227,2506,2927,2941],6300:[1150,1786,2237,2517,2941,2954],6350:[1155,1795,2247,2529,2954,2967],6400:[1160,1803,2258,2540,2967,2981],6450:[1165,1811,2268,2551,2981,2994],6500:[1170,1819,2278,2562,2994,3008],6550:[1175,1827,2288,2573,3008,3021],6600:[1179,1835,2299,2584,3021,3034],6650:[1184,1843,2309,2595,3034,3045],6700:[1189,1850,2317,2604,3045,3055],6750:[1193,1856,2325,2613,3055,3064],6800:[1196,1862,2332,2621,3064,3074],6850:[1200,1868,2340,2630,3074,3084],6900:[1204,1873,2347,2639,3084,3094],6950:[1208,1879,2355,2647,3094,3103],7000:[1212,1885,2362,2656,3103,3113],7050:[1216,1891,2370,2664,3113,3123],7100:[1220,1897,2378,2673,3123,3133],7150:[1224,1903,2385,2681,3133,3142],7200:[1228,1909,2393,2690,3142,3152],7250:[1232,1915,2400,2698,3152,3162],7300:[1235,1921,2408,2707,3162,3172],7350:[1239,1927,2415,2716,3172,3181],7400:[1243,1933,2423,2724,3181,3191],7450:[1247,1939,2430,2733,3191,3201],7500:[1251,1945,2438,2741,3201,3211],7550:[1255,1951,2446,2750,3211,3220],7600:[1259,1957,2453,2758,3220,3230],7650:[1263,1963,2461,2767,3230,3240],7700:[1267,1969,2468,2775,3240,3250],7750:[1271,1975,2476,2784,3250,3259],7800:[1274,1981,2483,2792,3259,3269],7850:[1278,1987,2491,2801,3269,3279],7900:[1282,1992,2498,2810,3279,3289],7950:[1286,1998,2506,2818,3289,3298],8000:[1290,2004,2513,2827,3298,3308],8050:[1294,2010,2521,2835,3308,3318],8100:[1298,2016,2529,2844,3318,3328],8150:[1302,2022,2536,2852,3328,3337],8200:[1306,2028,2544,2861,3337,3347],8250:[1310,2034,2551,2869,3347,3357],8300:[1313,2040,2559,2878,3357,3367],8350:[1317,2046,2566,2887,3367,3376],8400:[1321,2052,2574,2895,3376,3386],8450:[1325,2058,2581,2904,3386,3396],8500:[1329,2064,2589,2912,3396,3406],8550:[1333,2070,2597,2921,3406,3415],8600:[1337,2076,2604,2929,3415,3425],8650:[1341,2082,2612,2938,3425,3435],8700:[1345,2088,2619,2946,3435,3445],8750:[1349,2094,2627,2955,3445,3454],8800:[1352,2100,2634,2963,3454,3464],8850:[1356,2106,2642,2972,3464,3474],8900:[1360,2111,2649,2981,3474,3484],8950:[1364,2117,2657,2989,3484,3493],9000:[1368,2123,2664,2998,3493,3503],9050:[1372,2129,2672,3006,3503,3513],9100:[1376,2135,2680,3015,3513,3523],9150:[1380,2141,2687,3023,3523,3532],9200:[1384,2147,2695,3032,3532,3542],9250:[1388,2153,2702,3040,3542,3552],9300:[1391,2159,2710,3049,3552,3562],9350:[1395,2165,2717,3058,3562,3571],9400:[1399,2171,2725,3066,3571,3581],9450:[1403,2177,2732,3075,3581,3591],9500:[1407,2183,2740,3083,3591,3601],9550:[1411,2189,2748,3092,3601,3610],9600:[1415,2195,2755,3100,3610,3620],9650:[1419,2201,2763,3109,3620,3628],9700:[1422,2206,2767,3115,3628,3634],9750:[1425,2210,2772,3121,3634,3641],9800:[1427,2213,2776,3126,3641,3647],9850:[1430,2217,2781,3132,3647,3653],9900:[1432,2221,2786,3137,3653,3659],9950:[1435,2225,2791,3143,3659,3666],10000:[1437,2228,2795,3148,3666,3672],};

  // Percentages for combined monthly net incomes greater than the highest amount in the schedule
  const excessPercentages = {
    1: 0.05, // 5 percent
    2: 0.075, // 7.5 percent
    3: 0.095, // 9.5 percent
    4: 0.11, // 11 percent
    5: 0.125, // 12.5 percent
    6: 0.135, // 13.5 percent
  };

  const getBasicMonthlyObligation = useCallback((combinedNetIncome, children) => {
    // Ensure children count is within supported range (1-6)
    if (children < 1 || children > 6) {
      console.warn("Number of children must be between 1 and 6 for guideline calculation.");
      return 0;
    }

    const incomeLevels = Object.keys(guidelinesChart).map(Number).sort((a, b) => a - b);
    const maxIncomeInChart = incomeLevels[incomeLevels.length - 1];
    const minIncomeInChart = incomeLevels[0];

    // Handle incomes below the minimum in the chart
    if (combinedNetIncome < minIncomeInChart) {
      // The statute does not explicitly state how to handle incomes below the lowest tier.
      // For now, we'll return the lowest value for that number of children.
      // In a real-world scenario, this might require a different approach or clarification.
      return guidelinesChart[minIncomeInChart][children - 1];
    }

    // Handle incomes within the chart
    if (combinedNetIncome <= maxIncomeInChart) {
      let lowerBoundIncome = 0;
      let upperBoundIncome = 0;

      for (let i = 0; i < incomeLevels.length; i++) {
        if (combinedNetIncome === incomeLevels[i]) {
          return guidelinesChart[incomeLevels[i]][children - 1];
        }
        if (combinedNetIncome > incomeLevels[i]) {
          lowerBoundIncome = incomeLevels[i];
        } else {
          upperBoundIncome = incomeLevels[i];
          break;
        }
      }

      // Linear interpolation for values between chart entries
      if (lowerBoundIncome && upperBoundIncome) {
        const lowerValue = guidelinesChart[lowerBoundIncome][children - 1];
        const upperValue = guidelinesChart[upperBoundIncome][children - 1];
        const interpolatedValue =
          lowerValue +
          ((combinedNetIncome - lowerBoundIncome) / (upperBoundIncome - lowerBoundIncome)) *
            (upperValue - lowerValue);
        return interpolatedValue;
      }
    }

    // Handle incomes greater than the highest amount in the schedule ($10000 in this updated chart)
    if (combinedNetIncome > maxIncomeInChart) {
      const highestChartValue = guidelinesChart[maxIncomeInChart][children - 1];
      const excessAmount = combinedNetIncome - maxIncomeInChart;
      const percentage = excessPercentages[children];
      if (percentage === undefined) {
        console.warn(`No excess percentage defined for ${children} children.`);
        return highestChartValue; // Fallback to highest chart value if percentage is missing
      }
      return highestChartValue + (excessAmount * percentage);
    }

    return 0; // Fallback
  }, []);

  // Effect hook to recalculate whenever input states change
  useEffect(() => {
    // Parse string inputs to numbers for calculations
    const parsedPetitionerNetIncome = parseFloat(petitionerNetIncome) || 0;
    const parsedRespondentNetIncome = parseFloat(respondentNetIncome) || 0;
    const parsedNumChildren = parseInt(numChildren) || 0;
    const parsedChildcareCosts = parseFloat(childcareCosts) || 0;
    const parsedHealthInsuranceCosts = parseFloat(healthInsuranceCosts) || 0;
    const parsedNoncoveredMedicalCosts = parseFloat(noncoveredMedicalCosts) || 0;
    const parsedPetitionerChildcarePaid = parseFloat(petitionerChildcarePaid) || 0;
    const parsedRespondentChildcarePaid = parseFloat(respondentChildcarePaid) || 0;
    const parsedPetitionerHealthInsurancePaid = parseFloat(petitionerHealthInsurancePaid) || 0;
    const parsedRespondentHealthInsurancePaid = parseFloat(respondentHealthInsurancePaid) || 0;
    const parsedPetitionerOtherPaid = parseFloat(petitionerOtherPaid) || 0;
    const parsedRespondentOtherPaid = parseFloat(respondentOtherPaid) || 0;
    const parsedPetitionerOvernights = parseFloat(petitionerOvernights) || 0;
    const parsedRespondentOvernights = parseFloat(respondentOvernights) || 0;


    const calculate = () => {
      // Line 1: Present Net Monthly Income (Inputs)
      const totalNetIncome = parsedPetitionerNetIncome + parsedRespondentNetIncome;

      // Line 2: Basic Monthly Obligation (from Guidelines Chart)
      const basicMonthlyObligation = getBasicMonthlyObligation(totalNetIncome, parsedNumChildren);

      // Line 3: Percent of Financial Responsibility
      const petitionerPercent = totalNetIncome > 0 ? (parsedPetitionerNetIncome / totalNetIncome) : 0;
      const respondentPercent = totalNetIncome > 0 ? (parsedRespondentNetIncome / totalNetIncome) : 0;

      // Line 4: Share of Basic Monthly Obligations
      const petitionerShareBasic = basicMonthlyObligation * petitionerPercent;
      const respondentShareBasic = basicMonthlyObligation * respondentPercent;

      // Line 5d: Total Monthly Child Care & Health Costs
      const totalAdditionalCosts = parsedChildcareCosts + parsedHealthInsuranceCosts + parsedNoncoveredMedicalCosts;

      // Line 6: Additional Support Payments
      const petitionerAdditionalSupport = totalAdditionalCosts * petitionerPercent;
      const respondentAdditionalSupport = totalAdditionalCosts * respondentPercent;

      // Line 8: Total Support Payments actually made (Non-shared parenting)
      const petitionerTotalPaid = parsedPetitionerChildcarePaid + parsedPetitionerHealthInsurancePaid + parsedPetitionerOtherPaid;
      const respondentTotalPaid = parsedRespondentChildcarePaid + parsedRespondentHealthInsurancePaid + parsedRespondentOtherPaid;

      // Line 9: MINIMUM CHILD SUPPORT OBLIGATION FOR EACH PARENT (Non-shared parenting)
      const petitionerMinObligation = petitionerShareBasic + petitionerAdditionalSupport - petitionerTotalPaid;
      const respondentMinObligation = respondentShareBasic + respondentAdditionalSupport - respondentTotalPaid;

      // Substantial Shared Parenting (GROSS UP METHOD)
      const totalOvernights = parsedPetitionerOvernights + parsedRespondentOvernights;
      // The statute defines shared parenting as exercising time-sharing at least 20 percent of the overnights in the year (73 overnights).
      const isSharedParenting = parsedPetitionerOvernights >= (365 * 0.20) || parsedRespondentOvernights >= (365 * 0.20);

      let line10 = 0;
      let line11A = 0;
      let line11B = 0;
      let line12A = 0;
      let line12B = 0;
      let line13A = 0;
      let line13B = 0;
      let line14d = 0;
      let line15A = 0;
      let line15B = 0;
      let line17A = 0;
      let line17B = 0;
      let line18A = 0;
      let line18B = 0;
      let line19 = 0;
      let line20 = 0;
      let line21 = 0;
      let line21Payer = '';

      if (isSharedParenting) {
        // Line 10: Basic Monthly Obligation x 150%
        line10 = basicMonthlyObligation * 1.5;

        // Line 11: Increased Basic Obligation for each parent
        line11A = line10 * petitionerPercent;
        line11B = line10 * respondentPercent;

        // Line 12: Percentage of overnight stays with each parent
        // Use totalOvernights for percentage calculation if both parents have overnights
        line12A = totalOvernights > 0 ? (parsedPetitionerOvernights / 365) : 0;
        line12B = totalOvernights > 0 ? (parsedRespondentOvernights / 365) : 0;

        // Line 13: Parent’s support multiplied by other Parent’s percentage of overnights
        line13A = line11A * line12B;
        line13B = line11B * line12A;

        // Line 14d: Total Monthly Child Care & Health Costs (Shared Parenting)
        line14d = parsedChildcareCosts + parsedHealthInsuranceCosts + parsedNoncoveredMedicalCosts;

        // Line 15: Additional Support Payments (Shared Parenting)
        line15A = line14d * petitionerPercent;
        line15B = line14d * respondentPercent;

        // Line 17: Total Support Payments actually made (Shared Parenting)
        line17A = parsedPetitionerChildcarePaid + parsedPetitionerHealthInsurancePaid + parsedPetitionerOtherPaid;
        line17B = parsedRespondentChildcarePaid + parsedRespondentHealthInsurancePaid + parsedRespondentOtherPaid;

        // Line 18: Total Additional Support Transfer Amount
        line18A = Math.max(0, line15A - line17A);
        line18B = Math.max(0, line15B - line17B);

        // Line 19: Total Child Support Owed from Petitioner to Respondent
        line19 = line13A + line18A;

        // Line 20: Total Child Support Owed from Respondent to Petitioner
        line20 = line13B + line18B;

        // Line 21: Actual Child Support to Be Paid
        if (line19 > line20) {
          line21 = line19 - line20;
          line21Payer = 'Petitioner to Respondent';
        } else if (line20 > line19) {
          line21 = line20 - line19;
          line21Payer = 'Respondent to Petitioner';
        } else {
          line21 = 0;
          line21Payer = 'No transfer';
        }
      }

      setCalculations({
        totalNetIncome,
        basicMonthlyObligation,
        petitionerPercent,
        respondentPercent,
        petitionerShareBasic,
        respondentShareBasic,
        totalAdditionalCosts,
        petitionerAdditionalSupport,
        respondentAdditionalSupport,
        petitionerTotalPaid,
        respondentTotalPaid,
        petitionerMinObligation,
        respondentMinObligation,
        isSharedParenting,
        line10,
        line11A,
        line11B,
        line12A,
        line12B,
        line13A,
        line13B,
        line14d,
        line15A,
        line15B,
        line17A,
        line17B,
        line18A,
        line18B,
        line19,
        line20,
        line21,
        line21Payer,
      });
    };

    calculate();
  }, [
    petitionerNetIncome,
    respondentNetIncome,
    numChildren,
    childcareCosts,
    healthInsuranceCosts,
    noncoveredMedicalCosts,
    petitionerChildcarePaid,
    respondentChildcarePaid,
    petitionerHealthInsurancePaid,
    respondentHealthInsurancePaid,
    petitionerOtherPaid,
    respondentOtherPaid,
    petitionerOvernights,
    respondentOvernights,
    getBasicMonthlyObligation, // Dependency for recalculation
  ]);


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-800 mb-6">
          Florida Child Support Guidelines Worksheet
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter the required information below to calculate child support based on Florida Statute 61.30.
        </p>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-blue-50 rounded-lg shadow-inner">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Petitioner's Information</h2>
            <InputField
              label="Present Net Monthly Income"
              value={petitionerNetIncome}
              onChange={setPetitionerNetIncome}
            />
            <InputField
              label="Monthly Childcare Payments Actually Made"
              value={petitionerChildcarePaid}
              onChange={setPetitionerChildcarePaid}
            />
            <InputField
              label="Monthly Health Insurance Payments Actually Made"
              value={petitionerHealthInsurancePaid}
              onChange={setPetitionerHealthInsurancePaid}
            />
            <InputField
              label="Other Payments/Credits Actually Made"
              value={petitionerOtherPaid}
              onChange={setPetitionerOtherPaid}
            />
            <InputField
              label="Annual Overnight Stays with Child(ren)"
              value={petitionerOvernights}
              onChange={setPetitionerOvernights}
              step="0.5"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Respondent's Information</h2>
            <InputField
              label="Present Net Monthly Income"
              value={respondentNetIncome}
              onChange={setRespondentNetIncome}
            />
            <InputField
              label="Monthly Childcare Payments Actually Made"
              value={respondentChildcarePaid}
              onChange={setRespondentChildcarePaid}
            />
            <InputField
              label="Monthly Health Insurance Payments Actually Made"
              value={respondentHealthInsurancePaid}
              onChange={setRespondentHealthInsurancePaid}
            />
            <InputField
              label="Other Payments/Credits Actually Made"
              value={respondentOtherPaid}
              onChange={setRespondentOtherPaid}
            />
            <InputField
              label="Annual Overnight Stays with Child(ren)"
              value={respondentOvernights}
              onChange={setRespondentOvernights}
              step="0.5"
            />
          </div>
        </div>

        <div className="mb-8 p-4 bg-green-50 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Child(ren) & Shared Costs</h2>
          <InputField
            label="Number of Minor Child(ren)"
            value={numChildren}
            onChange={setNumChildren}
            type="text" // Changed to text
            step="1"
          />
          <InputField
            label="100% of Monthly Child Care Costs"
            value={childcareCosts}
            onChange={setChildcareCosts}
          />
          <InputField
            label="Total Monthly Child(ren)'s Health Insurance Cost"
            value={healthInsuranceCosts}
            onChange={setHealthInsuranceCosts}
          />
          <InputField
            label="Total Monthly Child(ren)'s Noncovered Medical, Dental, and Prescription Medication Costs"
            value={noncoveredMedicalCosts}
            onChange={setNoncoveredMedicalCosts}
          />
        </div>

        {/* Calculation Results Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Calculation Results</h2>

          <div className="grid grid-cols-4 gap-4 font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-2">
            <div className="col-span-2">Description</div>
            <div className="text-right">Petitioner (A)</div>
            <div className="text-right">Respondent (B)</div>
            <div className="text-right">Total</div>
          </div>

          <ResultRow
            label="1. Present Net Monthly Income"
            petitionerValue={parseFloat(petitionerNetIncome) || 0} // Parse for display
            respondentValue={parseFloat(respondentNetIncome) || 0} // Parse for display
            totalValue={calculations.totalNetIncome}
          />
          <SingleResultRow
            label="2. Basic Monthly Obligation"
            value={calculations.basicMonthlyObligation}
          />
          <ResultRow
            label="3. Percent of Financial Responsibility"
            petitionerValue={calculations.petitionerPercent}
            respondentValue={calculations.respondentPercent}
            isCurrency={false}
          />
          <ResultRow
            label="4. Share of Basic Monthly Obligations"
            petitionerValue={calculations.petitionerShareBasic}
            respondentValue={calculations.respondentShareBasic}
          />
          <SingleResultRow
            label="5d. Total Monthly Child Care & Health Costs"
            value={calculations.totalAdditionalCosts}
          />
          <ResultRow
            label="6. Additional Support Payments"
            petitionerValue={calculations.petitionerAdditionalSupport}
            respondentValue={calculations.respondentAdditionalSupport}
          />
          <ResultRow
            label="8. Total Support Payments Actually Made"
            petitionerValue={calculations.petitionerTotalPaid}
            respondentValue={calculations.respondentTotalPaid}
          />
          <ResultRow
            label="9. MINIMUM CHILD SUPPORT OBLIGATION FOR EACH PARENT"
            petitionerValue={calculations.petitionerMinObligation}
            respondentValue={calculations.respondentMinObligation}
          />

          {calculations.isSharedParenting && (
            <>
              <h3 className="text-xl font-bold text-blue-700 mt-6 mb-4 text-center">
                Substantial Shared Parenting (GROSS UP METHOD)
              </h3>
              <SingleResultRow
                label="10. Basic Monthly Obligation x 150%"
                value={calculations.line10}
              />
              <ResultRow
                label="11. Increased Basic Obligation for each parent"
                petitionerValue={calculations.line11A}
                respondentValue={calculations.line11B}
              />
              <ResultRow
                label="12. Percentage of overnight stays with each parent (based on 365 days)"
                petitionerValue={calculations.line12A}
                respondentValue={calculations.line12B}
                isCurrency={false}
              />
              <ResultRow
                label="13. Parent’s support multiplied by other Parent’s percentage of overnights"
                petitionerValue={calculations.line13A}
                respondentValue={calculations.line13B}
              />
              <SingleResultRow
                label="14d. Total Monthly Child Care & Health Costs (Shared Parenting)"
                value={calculations.line14d}
              />
              <ResultRow
                label="15. Additional Support Payments (Shared Parenting)"
                petitionerValue={calculations.line15A}
                respondentValue={calculations.line15B}
              />
              <ResultRow
                label="17. Total Support Payments Actually Made (Shared Parenting)"
                petitionerValue={calculations.line17A}
                respondentValue={calculations.line17B}
              />
              <ResultRow
                label="18. Total Additional Support Transfer Amount [Line 15 minus line 17; Enter any negative number as zero]"
                petitionerValue={calculations.line18A}
                respondentValue={calculations.line18B}
              />
              <SingleResultRow
                label="19. Total Child Support Owed from Petitioner to Respondent [Add line 13A+18A]"
                value={calculations.line19}
              />
              <SingleResultRow
                label="20. Total Child Support Owed from Respondent to Petitioner [Add line 13B+18B]"
                value={calculations.line20}
              />
              <div className="grid grid-cols-4 gap-4 py-2 border-b-4 border-blue-500 items-center bg-blue-100 mt-4 rounded-md">
                <div className="col-span-2 font-bold text-blue-900 text-lg">
                  21. Actual Child Support to Be Paid:
                </div>
                <div className="col-span-2 text-right font-extrabold text-blue-900 text-xl">
                  {formatCurrency(calculations.line21)} ({calculations.line21Payer})
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;