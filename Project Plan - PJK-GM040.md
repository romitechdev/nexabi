**Dokumen Project Plan**  
**Pijak in collaboration with IBM Skillsbuild**

**ID Tim Capstone Project	:** PJK-GM040  
**Tema Capstone		:** AI for Business Intelligence and Market Insights  
**Nama Proyek/Product	:** NexaBI: Next-Generation Business Intelligence Platform untuk Customer Analytics dan Product Recommendation pada Retail  
**List Anggota		:** 

1. APC180D6X0405 \- Irisaliya Irhabiyah Banat \- **Aktif**  
2. APC437D6Y0144 \- Ahmad Fauzul Adhim \- **Aktif**  
3. APC284D6Y0023 \- Muhromin \- **Aktif**  
4. APC103D6Y0052 \- Michael Sanjaya \- **Aktif**  
5. APC284D6Y0432 \- Muhammad Daffa Amrullah \- **Aktif**

     
1. **Ringkasan Eksekutif**

**Problem Statement**  
Pada Industri retail saat ini tenggelam dalam data namun haus akan informasi. Banyak pelaku usaha yang masih mengandalkan intuisi dalam menentukan strategi promosi dan stok, yang menyebabkan inefisiensi pada biaya pemasaran dan penumpukkan stok pada kategori yang tidak popular. Tanpa visibilitas real-time, perusahaan dapat kehilangan momentum untuk merespon perubahan perilaku pelanggan secara cepat.  
**Research Questions**

1. Bagaimana pola performa penjualan dan probabilitas dapat divisualisasikan dan dapat mendukung keputusan operasional?  
2. Bagaimana perilaku dapat dikelompokkan agar strategi pemasaran lebih personal dan tetap sasaran?  
3. Kombinasi produk apa yang memiliki korelasi pembelian tertinggi untuk mengoptimalkan strategi bundling?

**Latar Belakang & Mengapa tim memilih proyek ini**   
Proyek NexaBI dipilih karena berfungsi sebagai Painkiller bagi manajemen retail. Kani tidak hanya menyajikan data mentah, tetapi mentransformasikan menjadi solusi kritikal : (1) Visibilitas melalui Dashboard, (2) Presisi melalui Segmentasi K-Means, dan (3) Probabilitas melalui market Basket Analysis. Dengan menggunakan Global Superstore Dataset, Proyek ini mensimulasikan lingkungan bisnis nyata dengan skala data global, sehingga solusi yang dihasilkan dapat memiliki validitas tinggi untuk diterapkan pada skala perusahaan menengah hingga besar guna meningkatkan efisiensi hingga 30%.

2. **Cakupan Proyek dan Hasil Kerja**  
   **a) Garis Besar Batas Proyek**  
* **Data		:** Pemrosesan 51.000+ transaksi(2012-2015) dengan fokus pada metrix Sales, profit, dan RFM.  
* **Teknis	:** Pengembangan model Clustering (K-Means) dan Association Rules (Apriori).  
* **Output	:** Aplikasi web interaktif yang menampilkan hasil analisis data retail.

**b) Cakupan Tanggung Jawab**

* **Data Pipeline (Michael & Airish) :** Bertanggung jawab atas integrasi data, mulai dari pembersihan hingga menghasilkan model ML prediktif.  
* **Product Team (Romi & Fauzul) :** Bertanggung jawab pada ketersediaan sistem, membangun antarmuka dashboard yang mudah digunakan oleh pengguna bisnis.  
* **DevOps & Docs (Amru) :** Menjamin aplikasi dapat diakses secara stabil di cloud dan memiliki dokumentasi teknis yang komprehensif.  
    
3. **Jadwal Pengerjaan** 

| Minggu | Aktivitas | PIC | Deliverable |
| :---- | :---- | :---- | :---- |
| Minggu 1 | Finalisasi dataset, setup environment, eksplorasi awal | Michael Sanjaya \+ Semua  | EDA Report, environment siap |
| Minggu 2 | Data cleaning, preprocessing, feature engineering | Michael Sanjaya  \+ Irisaliya Irhabiyah Banat  | Dataset bersih, fitur RFM |
| Minggu 3 | Modelling clustering & market basket, backend | Irisaliya Irhabiyah Banat  \+ Muhromin  | Model ML, endpoint backend |
| Minggu 4 | Pembangunan frontend dashboard, koneksi backend | Ahmad Fauzul Adhim  \+  Murohmin  | Dashboard interaktif v1 |
| Minggu 5 | Integrasi, testing, deploy, dokumentasi | Muhammad Daffa Amrullah \+ Semua  | Aplikasi live,dokumentasi |
| Minggu 6 | Finalisasi, presentasi, demo | Semua | Presentasi \+ demo aplikasi |

4. **Uraian Rencana Penugasan/*Job Desk* Setiap Learning Path**

| Anggota | Learning Path | Tanggung Jawab Detail |
| ----- | ----- | ----- |
| Michael Sanjaya | Machine Learning | Pengumpulan & validasi dataset; data cleaning (missing values, outlier, duplikat); EDA & visualisasi insight awal; dokumentasi preprocessing pipeline |
| Irisaliya Irhabiyah Banat | Machine Learning | Feature engineering (RFM extraction, encoding); membangun model K-Means Clustering; market basket analysis dengan Apriori/FP-Growth; evaluasi & interpretasi model |
| Muhromin | Backend | Setup REST backend; manajemen database (PostgreSQL/SQLite); autentikasi & validasi input |
| Ahmad Fauzul Adhim | Frontend | Desain UI/UX dashboard; implementasi chart interaktif (Plotly/ECharts); koneksi frontend ke backend; responsivitas dan user experience |
| Muhammad Daffa Amrullah | DevOps | Setup CI/CD pipeline; containerisation (Docker); deploy ke cloud (Heroku/Railway/VPS); testing end-to-end; penulisan dokumentasi teknis |

5. **Sumber Daya Proyek**  
   Bahasa Pemrograman & Framework

| Tools / Resource | Kategori | Fungsi |
| ----- | ----- | ----- |
| Python 3.10+ | Bahasa Pemrograman | Bahasa utama untuk data processing, ML, dan backend |
| Pandas, NumPy | Library Data | Manipulasi data, EDA, dan feature engineering |
| Scikit-learn | Library ML | Implementasi K-Means Clustering, preprocessing, evaluasi model |
| MLxtend | Library ML | Implementasi Apriori algorithm untuk Market Basket Analysis |
| Matplotlib, Seaborn, Plotly | Visualisasi | Visualisasi EDA, model output, dan dashboard interaktif |
| React.js | Frontend Framework | Membangun antarmuka dashboard yang interaktif dan responsif |
| PostgreSQL  | Database | Penyimpanan data hasil preprocessing dan model output |
| Docker | DevOps | Kontainerisasi aplikasi agar konsisten di berbagai environment |
| Git & GitHub | Version Control | Kolaborasi kode, branching, dan code review antar anggota tim |
| Google Colab  | Development | Lingkungan pengembangan untuk eksplorasi data dan modelling |

**Dataset**

* Global Superstore Sales Dataset — Kaggle (CC0: Public Domain)  
* URL: [kaggle.com/datasets/apoorvaappz/global-super-store-dataset](http://kaggle.com/datasets/apoorvaappz/global-super-store-dataset)   
* Ukuran: 51.290 baris, 24 kolom, periode 2012–2015  
* Kolom kunci: Order ID, Customer ID, Order Date, Product Name, Category, Sales, Profit, Region

**Refrensi & Jurnal**

* Han, J., Pei, J., & Kamber, M. (2012). Data Mining: Concepts and Techniques. Elsevier.  
* Chen, D., Sain, S.L., & Guo, K. (2012). Data mining for the online retail industry: RFM model-based customer segmentation. Journal of Database Marketing.  
* Agrawal, R., & Srikant, R. (1994). Fast algorithms for mining association rules. VLDB Conference.  
* Tableau BI Best Practices Documentation — tableau.com

6. **Rencana Manajemen Risiko dan Isu**  
   	Dalam mengerjakan proyek NexaBI, terdapat beberapa risiko yang bisa mengacaukan jalannya proyek, baik dari sisi teknis, data, maupun kerja sama antar tim. Oleh karena itu, dari awal proyek harus dilakukan identifikasi masalah agar setiap hambatan bisa diperkirakan lebih dini dan tidak sampai menyebabkan keterlambatan atau kegagalan dalam pelaksanaan proyek.

Pendekatan yang digunakan adalah analisis SWOT untuk melihat faktor-faktor internal dan eksternal yang bisa mempengaruhi keberhasilan proyek, serta menentukan tindakan mitigasi yang tepat.

1. Strengths (Kekuatan)  
   Proyek ini didukung oleh penggunaan dataset yang cukup representatif, yaitu Global Superstore, yang mencerminkan situasi bisnis nyata. Selain itu, metode seperti dashboard interaktif, segmentasi K-Means, dan analisis keranjang belanja sudah terbukti memberikan informasi yang bermanfaat.  
   **Strategi:** Menggunakan alat dan metode yang sudah teruji sehingga hasilnya lebih akurat dan bisa langsung digunakan sebagai dasar dalam mengambil keputusan.  
2. Weaknesses (Kelemahan)  
   Keterbatasan dalam pemahaman awal terhadap data serta kemungkinan adanya ketidaksesuaian dalam data bisa menjadi penghalang. Selain itu, proses pemrosesan data dan pembuatan model bisa memakan waktu yang cukup lama jika tidak dikelola dengan tepat.  
   **Strategi:** Melakukan pengecekan terhadap data secara rinci di awal dan merencanakan jadwal kerja yang sesuai dengan kemampuan agar setiap tahapan bisa berjalan dengan lebih teratur dan terorganisir.  
3. Opportunities (Peluang)  
   Kebutuhan industri akan keputusan yang didasarkan pada data memberikan kesempatan besar bagi proyek ini untuk menciptakan dampak yang nyata. Hasil dari analisis tersebut bisa digunakan untuk meningkatkan efisiensi operasi dan memperbaiki metode pemasaran.  
   **Strategi:** Membuat hasil proyek tidak hanya berupa gambar atau tampilan, tetapi juga memberikan saran yang bisa dipakai dan mudah dipahami oleh para pemilik bisnis.  
4. Threats (Ancaman)  
   Perubahan kebutuhan atau batasan proyek selama pengerjaan, serta waktu dan sumber daya yang terbatas, bisa menjadi hambatan. Selain itu, kesalahan dalam memahami data bisa menyebabkan pengambilan keputusan yang kurang tepat.  
   **Strategi:** Mempertahankan komunikasi yang baik di dalam tim, memeriksa hasil analisis secara berkala, dan mengelola dokumen pada setiap tahap agar evaluasi dapat dilakukan dengan lebih mudah.  
   

