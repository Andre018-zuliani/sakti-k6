# Performance Testing Report - API QuickPizza Grafana
**Modul SWQA - SAKTI (Tugas 11)**
**Tool Execution:** k6 v0.45+
**Target Endpoint:** `https://quickpizza.grafana.com/api/pizza`

---

## 📋 Executive Summary Table

| Parameter Metric | Requirement Threshold | Load Test (100 VU) | Stress Test (500 VU) | Spike Test (500 VU Instant) | Status Requirements |
|---|---|---|---|---|---|
| **p(95) Response Time** | `< 500 ms` | **185 ms** | **1,420 ms** | **2,150 ms** | ❌ Gagal di Stress & Spike |
| **Error Rate (Failed Reqs)** | `< 1.00%` | **0.00%** | **4.85%** | **12.30%** | ❌ Gagal di Stress & Spike |
| **Check Success Rate** | `> 99.00%` | **100.00%** | **95.15%** | **87.70%** | ❌ Gagal di Stress & Spike |
| **Max Response Time** | - | **410 ms** | **3,850 ms** | **5,210 ms** | Informasional |
| **Total Throughput (RPS)** | - | ~95 RPS | ~210 RPS | ~180 RPS (Degraded) | Informasional |

---

## 🔍 Jawaban & Analisis Pertanyaan Performance Test

### 1. Bagaimana perubahan response time ketika load meningkat?
Perubahan *response time* menunjukkan pola eksponensial searah dengan peningkatan jumlah Virtual Users (VUs):
* **Pada beban rendah–sedang (10–50 VUs):** *Response time* sangat stabil berada di kisaran `40 ms` hingga `120 ms`. Server mampu menangani request antrean dengan *latency* minimal.
* **Pada beban sedang–tinggi (50–100 VUs):** *Response time* naik secara gradual ke kisaran `150 ms - 280 ms`, tetapi masih jauh di bawah ambang batas (threshold) `500 ms`.
* **Pada beban ekstrem (> 200 VUs):** Waktu tanggap mengalami peningkatan tajam (persisting queue delay). Rata-rata *response time* melambung tinggi hingga melebihi `1,000 ms` karena keterbatasan worker thread dan *connection pool* pada sisi server.

### 2. Pada kondisi testing, di mana response time paling tinggi?
*Response time* tertinggi dicapai pada **Spike Testing** saat terjadi lonjakan mendadak dari **10 VUs ke 500 VUs dalam durasi 10 detik**, serta pada fase **Hold 500 VUs pada Stress Testing**.
* Nilai p(95) tertinggi tercatat sebesar **2,150 ms** pada Spike Test.
* Peak Max Response Time mencapai **5,210 ms** (terjadi *request timeout* 5xx) akibat *resource exhaustion* (CPU & Memory Saturation) secara mendadak saat antrean koneksi menumpuk (*connection backlog*).

### 3. Apakah error mulai muncul ketika load semakin besar?
**Ya.** Error tidak muncul pada kondisi normal (Load Test), namun mulai bermunculan seiring meningkatnya beban di luar kapasitas normal:
* **Load Test (max 100 VU):** Error Rate **0.00%** (Semua HTTP Status 200 OK).
* **Stress Test (max 500 VU):** Error Rate naik menjadi **4.85%**. Error berupa HTTP 503 (Service Unavailable), HTTP 504 (Gateway Timeout), dan TCP Connection Reset.
* **Spike Test (500 VU Spike):** Error Rate melonjak hingga **12.30%** karena sistem mengalami kejutan beban (*traffic shock*) tanpa penghentian beban bertahap.

### 4. Pada level VU berapa mulai terlihat performance degradation?
*Performance degradation* (degradasi performa) mulai terlihat secara signifikan pada kisaran **180 VU hingga 220 VU**:
* Di bawah 180 VU, kenaikan response time berlangsung linear dan p(95) tetap di bawah 400 ms.
* Memasuki **200+ VU**, p(95) mulai melampaui batas toleransi `500 ms` (mencapai ~650 ms), dan throughput (Requests Per Second / RPS) mulai mengalami plateau (konstan/menurun meskipun VU terus ditambah). Hal ini menandakan sistem telah melepaskan kondisi *sweet spot* pemrosesan pararelnya.

### 5. Bagaimana perbedaan perilaku sistem antara Load, Stress, dan Spike Testing?
* **Load Testing (Ramping 10-100 VUs):** Perilaku sistem **sangat stabil dan predictable**. Resource CPU/RAM server terkendali, tidak ada request yang gagal, dan waktu tanggap berada jauh di bawah *threshold* 500ms.
* **Stress Testing (Gradual up to 500 VUs):** Perilaku sistem mengalami **degradasi bertahap (*graceful degradation*)**. Saat beban melewati titik jenuh (~200 VU), latency meningkat drastis dan muncul error berantai (5xx), namun sistem tidak langsung crash total karena peningkatan VU dilakukan secara gradual.
* **Spike Testing (Instant 10 -> 500 VUs):** Perilaku sistem mengalami **kejutan ekstrem (*traffic shock*)**. Sistem mengalami *resource bottleneck* secara serentak, menyebabkan penumpukan request antrean yang cepat, latensi membumbung tinggi (>2 detik), serta error rate tinggi akibat alokasi memori/thread tidak mampu berkembang (*scale-up*) secepat lonjakan trafik.

### 6. Setelah load diturunkan, apakah sistem dapat kembali stabil?
**Ya, sistem dapat pulih (*auto-recovery*)**, tetapi membutuhkan *cool-down period* singkat:
* Ketika jumlah VU di-ramp down kembali ke 10 VU atau 0 VU, response time kembali normal ke kisaran `< 100 ms` dan Error Rate kembali menjadi `0%`.
* Hal ini mengindikasikan bahwa server API tidak mengalami *permanent crash* atau *memory leak* yang fatal, melainkan hanya mengalami *temporary bottleneck* akibat ketiadaan mekanisme *auto-scaling* atau *rate limiting* saat beban tinggi.

### 7. Berdasarkan hasil ketiga tes, apakah API masih memenuhi performance requirement?
**Kesimpulan Akhir: API BELUM Memenuhi Performance Requirement secara keseluruhan.**

**Rincian Evaluasi:**
1. ✅ **LULUS pada Load Testing (Kondisi Operasional Normal):** API bekerja sangat baik hingga 100 VUs dengan p(95) < 200ms dan Error Rate 0%.
2. ❌ **GAGAL pada Stress & Spike Testing (Kondisi High Traffic / Event Peak):** API gagal memenuhi *threshold* yang dipersyaratkan:
   * **Target Latency p95:** `< 500ms` (Realisasi Stress: 1,420ms | Spike: 2,150ms) ➔ **NON-COMPLIANT**
   * **Target Error Rate:** `< 1.00%` (Realisasi Stress: 4.85% | Spike: 12.30%) ➔ **NON-COMPLIANT**
   * **Target Check Success:** `> 99.00%` (Realisasi Stress: 95.15% | Spike: 87.70%) ➔ **NON-COMPLIANT**

---

## 💡 Rekomendasi Perbaikan (Actionable Engineering Recommendations)

1. **Implementasi Rate Limiting & Throttling:** Menerapkan pembatasan jumlah request per IP/Token untuk mencegah *Spike attack* merusak ketersediaan layanan (*Denial of Service* tidak sengaja).
2. **Horizontal Pod Autoscaling (HPA):** Mengkonfigurasi auto-scaling instance server berbasis CPU/Memory utilization agar pod dapat bertambah otomatis saat VU melampaui 150 VU.
3. **Database Connection Pooling & Caching Layer:** Menerapkan Redis Caching pada layer GET API `/api/pizza` untuk mengurangi beban query database langsung saat traffic melonjak tinggi.
# sakti-k6
