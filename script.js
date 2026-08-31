import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// ---------------------------------------------------------------------------
// 1. SKENARIO WORKLOAD
// ---------------------------------------------------------------------------
const scenarios = {
  // a. Ramping-VUs Load Testing (10 -> 50 -> 100 -> 0 VUs)
  load: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  // b. Stress Testing (hingga 500 VUs)
  stress: [
    { duration: '2m', target: 100 },
    { duration: '3m', target: 300 },
    { duration: '3m', target: 500 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 0 },
  ],
  // c. Spike Testing (Lonjakan mendadak hingga 500 VUs)
  spike: [
    { duration: '1m', target: 10 },   // Baseline
    { duration: '10s', target: 500 }, // Spike mendadak
    { duration: '1m', target: 500 },  // Hold saat spike
    { duration: '10s', target: 10 },  // Drop kembali
    { duration: '1m', target: 10 },   // Recovery observation
    { duration: '10s', target: 0 },
  ]
};

// Pilih skenario berdasarkan env TEST_TYPE, default: 'load'
const selectedTestType = __ENV.TEST_TYPE || 'load';
const selectedStages = scenarios[selectedTestType] || scenarios.load;

// ---------------------------------------------------------------------------
// 2. K6 OPTIONS & THRESHOLDS
// ---------------------------------------------------------------------------
export const options = {
  stages: selectedStages,
  thresholds: {
    // p95 response time < 500ms
    'http_req_duration': ['p(95)<500'],
    // Error rate < 1%
    'http_req_failed': ['rate<0.01'],
    // Check success rate > 99%
    'checks': ['rate>0.99'],
  },
};

// Target Endpoint API
const BASE_URL = 'https://quickpizza.grafana.com/api/pizza';

// ---------------------------------------------------------------------------
// 3. MAIN TEST FUNCTION
// ---------------------------------------------------------------------------
export default function () {
  // Endpoint /api/pizza is a POST that returns a pizza recommendation
  // based on the restrictions sent in the request body. It also requires
  // an Authorization header (any non-empty token value works for this
  // public demo instance).
  const payload = JSON.stringify({
    maxCaloriesPerSlice: 1000,
    mustBeVegetarian: false,
    excludedIngredients: [],
    excludedTools: [],
    maxNumberOfToppings: 6,
    minNumberOfToppings: 2,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Token abcdef0123456789',
      'User-Agent': 'k6-performance-test',
    },
    tags: { name: 'GetPizzaAPI' },
  };

  const res = http.post(BASE_URL, payload, params);

  // Functional Validation: Check HTTP Status 200
  const checkRes = check(res, {
    'HTTP status is 200': (r) => r.status === 200,
  });

  // Pause singkat antar request untuk menyerupai real-user behavior
  sleep(1);
}

// ---------------------------------------------------------------------------
// 4. REPORTING (handleSummary)
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  const reportFileName = __ENV.REPORT_FILE || 'result.html';

  return {
    [reportFileName]: htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}