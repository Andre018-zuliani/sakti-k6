# Performance Testing Report - API QuickPizza Grafana
**Modul SWQA - SAKTI (Tugas 11)**
**Tool Execution:** k6 v2.2.0
**Target Endpoint:** `https://quickpizza.grafana.com/api/pizza` (POST)

---

## 📋 Executive Summary Table

| Parameter Metric | Requirement Threshold | Load Test (100 VU) | Stress Test (500 VU) | Spike Test (500 VU Instant) | Status Requirements |
|---|---|---|---|---|---|
| **p(95) Response Time** | `< 500 ms` | **432.23 ms** | **444.80 ms** | **435.37 ms** | ✅ Lulus di semua skenario |
| **Error Rate (Failed Reqs)** | `< 1.00%` | **0.00%** | **0.00%** | **0.00%** | ✅ Lulus di semua skenario |
| **Check Success Rate** | `> 99.00%` | **100.00%** | **100.00%** | **100.00%** | ✅ Lulus di semua skenario |
| **Avg Response Time** | - | 372.47 ms | 379.34 ms | 374.81 ms | Informasional |
| **Max Response Time** | - | 2.02 s | 2.80 s | 1.68 s | Informasional |
| **p(90) Response Time** | - | 411.92 ms | 423.10 ms | 418.02 ms | Informasional |
| **Total Requests** | - | 11,514 | 147,723 | 26,240 | Informasional |
| **Throughput (RPS)** | - | ~31.94 RPS | ~204.86 RPS | ~124.70 RPS | Informasional |
| **Test Duration** | - | 6m00s | 12m01s | 3m30s | Informasional |
| **Max Virtual Users** | - | 100 | 500 | 500 | Informasional |

---

## 🔍 Jawaban & Analisis Pertanyaan Performance Test

### 1. Bagaimana perubahan response time ketika load meningkat?
Menariknya, *response time* API **sangat stabil** di seluruh rentang beban yang diuji (10 hingga 500 VUs). Rata-rata *response time* konsisten di kisaran `372 ms - 379 ms`, dan nilai p(95) juga hanya bergerak tipis antara `432 ms - 445 ms` meskipun jumlah VU melonjak 5x lipat (dari 100 ke 500 VU). Ini mengindikasikan bahwa *response time* pada API ini didominasi oleh *latency* jaringan/proses dasar (baseline ~275-290 ms untuk request tercepat) dan bukan oleh antrean akibat saturasi resource server, setidaknya dalam rentang beban yang diuji.

### 2. Pada kondisi testing, di mana response time paling tinggi?
*Response time* tertinggi (secara max) justru tercatat pada **Stress Testing** sebesar **2.80 detik**, sedikit lebih tinggi dibanding Load Test (2.02 detik) dan Spike Test (1.68 detik). Ini masuk akal karena Stress Test berjalan paling lama (12 menit) dan mempertahankan 500 VU secara terus-menerus, sehingga probabilitas munculnya outlier *response time* akibat jitter jaringan lebih tinggi dibanding Spike Test yang hanya menahan 500 VU sesaat. Namun secara p(95), ketiga skenario tetap berada dalam rentang yang berdekatan (432-445 ms), jauh di bawah threshold 500 ms.

### 3. Apakah error mulai muncul ketika load semakin besar?
**Tidak.** Error Rate tercatat **0.00%** secara konsisten di ketiga skenario — Load Test (100 VU), Stress Test (500 VU), maupun Spike Test (lonjakan instan ke 500 VU). Seluruh 185.477 total request gabungan (11.514 + 147.723 + 26.240) berhasil dengan HTTP 200 dan lolos check fungsional tanpa satupun kegagalan.

### 4. Pada level VU berapa mulai terlihat performance degradation?
Berdasarkan hasil pengujian, **tidak ditemukan titik degradasi performa yang signifikan** hingga 500 VU (batas maksimum yang diuji). p(95) response time tetap stabil di rentang 432-445 ms baik pada beban rendah (10 VU) maupun beban puncak (500 VU), dan tidak ada tren kenaikan latency yang tajam maupun error rate yang meningkat seiring naiknya VU. Ini menunjukkan API QuickPizza mampu menangani beban hingga 500 concurrent VUs tanpa menunjukkan tanda-tanda saturasi dalam kondisi pengujian ini.

### 5. Bagaimana perbedaan perilaku sistem antara Load, Stress, dan Spike Testing?
* **Load Testing (Ramping 10-100 VUs):** Sistem menunjukkan performa **stabil dan predictable**, error rate 0%, p(95) 432.23 ms, throughput ~32 RPS.
* **Stress Testing (Gradual up to 500 VUs):** Sistem tetap **stabil meski beban 5x lebih besar**, tanpa graceful degradation yang terlihat — p(95) hanya naik tipis ke 444.8 ms, error rate tetap 0%, throughput naik signifikan ke ~205 RPS mengikuti kenaikan VU.
* **Spike Testing (Instant 10 -> 500 VUs):** Sistem **tidak menunjukkan traffic shock** meskipun lonjakan VU terjadi sangat cepat (10 detik). p(95) tetap terkendali di 435.37 ms dan error rate 0%, mengindikasikan tidak ada bottleneck resource yang terpicu oleh kenaikan beban mendadak dalam skenario ini.

### 6. Setelah load diturunkan, apakah sistem dapat kembali stabil?
Karena sistem **tidak pernah mengalami degradasi performa yang signifikan** di ketiga skenario, pertanyaan pemulihan (*recovery*) menjadi kurang relevan untuk pengujian kali ini — tidak ada kondisi "rusak" yang perlu dipulihkan. Response time dan error rate tetap stabil sepanjang siklus ramp-up maupun ramp-down VU.

### 7. Berdasarkan hasil ketiga tes, apakah API masih memenuhi performance requirement?
**Kesimpulan Akhir: API LULUS Performance Requirement di ketiga skenario pengujian.**

**Rincian Evaluasi:**
1. ✅ **LULUS pada Load Testing (100 VU):** p(95) 432.23 ms (< 500 ms), Error Rate 0.00% (< 1%), Check Success 100.00% (> 99%).
2. ✅ **LULUS pada Stress Testing (500 VU):** p(95) 444.80 ms (< 500 ms), Error Rate 0.00% (< 1%), Check Success 100.00% (> 99%).
3. ✅ **LULUS pada Spike Testing (500 VU Instant):** p(95) 435.37 ms (< 500 ms), Error Rate 0.00% (< 1%), Check Success 100.00% (> 99%).

Seluruh threshold yang dipersyaratkan terpenuhi di ketiga jenis pengujian, tanpa satupun kegagalan request selama total ±21,5 menit durasi pengujian gabungan.

---

## 💡 Catatan & Rekomendasi Lanjutan

1. **Uji beban lebih tinggi untuk menemukan breaking point:** Karena API tetap stabil hingga 500 VU, disarankan menaikkan target VU (misal 1.000-2.000) pada iterasi pengujian berikutnya untuk menemukan titik jenuh (*saturation point*) yang sesungguhnya, mengingat endpoint ini adalah demo publik milik Grafana yang kemungkinan sudah di-hosting dengan infrastruktur auto-scaling/CDN.
2. **Tambahkan skenario think-time yang lebih realistis:** `sleep(1)` statis pada tiap iterasi bisa divariasikan (misal `sleep(Math.random() * 3)`) agar pola trafik lebih menyerupai perilaku user asli dan tidak terlalu seragam antar VU.
3. **Pantau metrik sisi server (bukan hanya sisi client):** Hasil k6 hanya mencerminkan observasi dari sisi client. Jika endpoint ini adalah milik sendiri (bukan demo publik), sebaiknya dikombinasikan dengan metrik APM/observability (CPU, memory, DB connection pool) di sisi server untuk memastikan tidak ada resource yang mendekati batas meski response time terlihat stabil.
4. **Uji ulang di jam/hari berbeda:** Karena target endpoint adalah layanan publik pihak ketiga, hasil dapat bervariasi tergantung beban trafik global pada saat pengujian dilakukan. Disarankan menjalankan pengujian berulang di waktu berbeda untuk validasi konsistensi hasil.
