/**
 * Monitor Quota - Core Script v1.0 (Production Ready for APK)
 * Deskripsi: Mengatur logika perhitungan, format data, interaksi DOM, dan persistensi data.
 * Seluruh nama variabel asli, rumus, dan ID HTML dipertahankan sepenuhnya.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Element Form
    const form = document.getElementById('quotaForm');
    const inputSisa = document.getElementById('sisaKuota');
    const inputTotal = document.getElementById('totalKuota');
    const inputDurasi = document.getElementById('durasiPaket');
    const inputHari = document.getElementById('hariPemakaian');
    
    // Inisialisasi Element Tombol Reset
    const btnReset = document.getElementById('btnReset');

    // Inisialisasi Element Dashboard / Output
    const elStatusText = document.getElementById('statusText');
    const elIndeksHemat = document.getElementById('indeksHemat');
    const elPersenIndeks = document.getElementById('persenIndeks');
    const elProgressBar = document.getElementById('progressBar');
    
    const elKuotaTotal = document.getElementById('outKuotaTotal');
    const elKuotaTerpakai = document.getElementById('outKuotaTerpakai');
    const elPersenTerpakai = document.getElementById('outPersenTerpakai');
    const elKuotaTersisa = document.getElementById('outKuotaTersisa');
    const elPersenTersisa = document.getElementById('outPersenTersisa');

    const elSisaIdeal = document.getElementById('outSisaIdeal');
    const elPersenIdeal = document.getElementById('outPersenIdeal');
    const elSelisih = document.getElementById('outSelisih');
    const elStatusSelisih = document.getElementById('outStatusSelisih');

    const elSisaHari = document.getElementById('outSisaHari');
    const elTargetHarian = document.getElementById('outTargetHarian');
    const elInsightText = document.getElementById('insightText');

    // FITUR TAMBAHAN AMAN: Muat data terakhir dari localStorage jika tersedia
    muatDataLokal();

    // Event Listener saat form disubmit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hitungDanUpdate();
    });

    // Event Listener saat tombol reset diklik
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            resetAplikasi();
        });
    }

    /**
     * Fungsi Utama Perhitungan dan Pembaruan UI
     */
    function hitungDanUpdate() {
        // Ambil data nilai input dan konversi ke tipe float/int
        const s = parseFloat(inputSisa.value);
        const T = parseFloat(inputTotal.value);
        const D = parseInt(inputDurasi.value);
        const d = parseInt(inputHari.value);

        // Validasi input dasar untuk menghindari pembagian dengan nol atau nilai minus
        if (isNaN(s) || isNaN(T) || isNaN(D) || isNaN(d) || T <= 0 || D <= 0 || d < 0) {
            alert('Mohon masukkan data yang valid dan logis.');
            return;
        }

        // VALIDASI AMAN: Proteksi logika batas pemakaian dan kuota
        if (d > D) {
            alert('Hari pemakaian tidak boleh melebihi durasi paket.');
            return;
        }
        if (s > T) {
            alert('Sisa kuota tidak boleh melebihi total kuota.');
            return;
        }

        // FITUR TAMBAHAN AMAN: Simpan input state ke localStorage agar tidak hilang saat APK ditutup
        simpanDataLokal(s, T, D, d);

        // --- 1. Sisa Kuota Ideal ---
        // Rumus asli dipertahankan: sisaIdeal = T - (T / D * d)
        let sisaIdeal = T - ((T / D) * d);
        if (sisaIdeal < 0) sisaIdeal = 0;

        // --- 2. Indeks Hemat ---
        // Rumus asli dipertahankan: indeks = s / sisaIdeal
        let indeks = 1;
        if (sisaIdeal > 0) {
            indeks = s / sisaIdeal;
        } else {
            indeks = s > 0 ? 2 : 1; 
        }

        // --- 3. Persentase Ideal ---
        // Rumus asli dipertahankan: 100 - ((100 / D) * d)
        let persenIdeal = 100 - ((100 / D) * d);
        if (persenIdeal < 0) persenIdeal = 0;

        // --- 4. Selisih ---
        // Rumus asli dipertahankan: selisih = s - sisaIdeal
        const selisih = s - sisaIdeal;

        // --- 5. Kuota Terpakai ---
        // Rumus asli dipertahankan: kuotaTerpakai = totalKuota - sisaKuota
        const kuotaTerpakai = T - s;

        // --- 6. Persentase Kuota Terpakai ---
        const persenTerpakai = (kuotaTerpakai / T) * 100;

        // --- 7. Persentase Kuota Tersisa ---
        const persenTersisa = (s / T) * 100;

        // --- 8. Sisa Hari ---
        const sisaHari = D - d;

        // --- 9. Target Pemakaian Harian ---
        // FIX BUG: Pencegahan Infinity jika sisaHari adalah 0 (Hari Terakhir)
        let targetHarian = 0;
        if (sisaHari > 0) {
            targetHarian = s / sisaHari;
        } else {
            targetHarian = s; // Alokasi kuota dihabiskan pada hari terakhir tersebut
        }

        // --- Eksekusi Update Komponen UI ---
        
        // Update Status & Kelas Gaya Visual
        const statusStr = tentukanStatus(indeks);
        const statusClass = tentukanKelas(indeks);
        
        elStatusText.textContent = statusStr;
        elStatusText.className = `status-badge ${statusClass}`;

        // Update Indeks & Progress Bar
        elIndeksHemat.textContent = indeks.toFixed(2);
        elPersenIndeks.textContent = formatPersen(indeks * 100);
        
        // Update visual progress bar (persentase sisa kuota asli)
        elProgressBar.style.width = `${Math.min(Math.max(persenTersisa, 0), 100)}%`;
        elProgressBar.className = `progress-bar ${statusClass}`;

        // Update Informasi Kuota
        elKuotaTotal.textContent = formatKuota(T);
        elKuotaTerpakai.textContent = formatKuota(kuotaTerpakai);
        elPersenTerpakai.textContent = formatPersen(persenTerpakai);
        elKuotaTersisa.textContent = formatKuota(s);
        elPersenTersisa.textContent = formatPersen(persenTersisa);

        // Update Analisis
        elSisaIdeal.textContent = formatKuota(sisaIdeal);
        elPersenIdeal.textContent = formatPersen(persenIdeal);
        elSelisih.textContent = formatKuota(Math.abs(selisih));
        
        // Perbaikan komparasi indeks berbasis presisi desimal floating-point
        if (Math.abs(indeks - 1) < 0.01) {
            elStatusSelisih.textContent = "Tepat Sesuai Target";
            elStatusSelisih.className = "text-sesuai";
        } else if (selisih > 0) {
            elStatusSelisih.textContent = "Lebih Kuota (Sisa Berlebih)";
            elStatusSelisih.className = "text-hemat";
        } else {
            elStatusSelisih.textContent = "Kurang Kuota (Defisit)";
            elStatusSelisih.className = "text-boros";
        }

        // Update Analisis Harian
        elSisaHari.textContent = `${sisaHari} Hari`;
        elTargetHarian.textContent = formatKuotaHarian(targetHarian);

        // Update Insight Otomatis
        elInsightText.textContent = buatInsight(indeks, targetHarian);
    }

    /**
     * Fungsi Format Kuota (GB / MB)
     */
    function formatKuota(nilaiGB) {
        if (nilaiGB >= 1) {
            return `${nilaiGB.toFixed(2)} GB`;
        } else {
            const nilaiMB = nilaiGB * 1024;
            return `${nilaiMB.toFixed(0)} MB`;
        }
    }

    /**
     * Fungsi Format Kuota Harian (GB/hari / MB/hari)
     */
    function formatKuotaHarian(nilaiGBHarian) {
        if (nilaiGBHarian >= 1) {
            return `${nilaiGBHarian.toFixed(2)} GB/hari`;
        } else {
            const nilaiMBHarian = nilaiGBHarian * 1024;
            return `${nilaiMBHarian.toFixed(0)} MB/hari`;
        }
    }

    /**
     * Fungsi Format Persentase
     */
    function formatPersen(nilaiPersen) {
        if (nilaiPersen < 0) nilaiPersen = 0;
        return `${nilaiPersen.toFixed(2)}%`;
    }

    /**
     * Fungsi Menentukan String Status Berdasarkan Indeks (Presisi Desimal)
     */
    function tentukanStatus(indeks) {
        if (Math.abs(indeks - 1) < 0.01) {
            return "🟡 Sesuai Target";
        } else if (indeks > 1) {
            return "🟢 Lebih Hemat";
        } else {
            return "🔴 Lebih Boros";
        }
    }

    /**
     * Fungsi Menentukan Kelas CSS Berdasarkan Indeks (Presisi Desimal)
     */
    function tentukanKelas(indeks) {
        if (Math.abs(indeks - 1) < 0.01) {
            return "sesuai";
        } else if (indeks > 1) {
            return "hemat";
        } else {
            return "boros";
        }
    }

    /**
     * Fungsi Membuat Teks Insight Otomatis (Adaptif Berbasis Indeks Skala)
     */
    function buatInsight(indeks, targetHarian) {
        let teksTarget = "";
        if (targetHarian >= 1) {
            teksTarget = `${targetHarian.toFixed(2)} GB`;
        } else {
            teksTarget = `${(targetHarian * 1024).toFixed(0)} MB`;
        }

        if (Math.abs(indeks - 1) < 0.01) {
            return `✅ Penggunaan kuota sudah sesuai target.`;
        } else if (indeks > 1.5) {
            return `👍 Penggunaan kuota masih lebih hemat dari target. Luar biasa! Anda memiliki cadangan kuota yang sangat aman. Pertahankan penggunaan sekitar ${teksTarget}/hari agar kuota tetap aman hingga akhir masa aktif.`;
        } else if (indeks > 1) {
            return `👍 Penggunaan kuota masih lebih hemat dari target. Pertahankan penggunaan sekitar ${teksTarget}/hari agar kuota tetap aman hingga akhir masa aktif.`;
        } else if (indeks < 0.5) {
            return `🚨 PENGGUNAAN KUOTA SANGAT BOROS! Sisa kuota Anda berada dalam kondisi kritis. Usahakan penggunaan harian ditekan ketat dan tidak melebihi ${teksTarget}/hari agar kuota tetap cukup hingga akhir paket.`;
        } else {
            return `⚠️ Penggunaan kuota lebih boros dari target. Usahakan penggunaan harian tidak melebihi ${teksTarget}/hari agar kuota tetap cukup hingga akhir paket.`;
        }
    }

    /**
     * Fungsi Penyimpanan Ringan (State Persistence)
     */
    function simpanDataLokal(s, T, D, d) {
        localStorage.setItem('mq_sisa', s);
        localStorage.setItem('mq_total', T);
        localStorage.setItem('mq_durasi', D);
        localStorage.setItem('mq_hari', d);
    }

    /**
     * Fungsi Pemuatan Otomatis Data Lokal
     */
    function muatDataLokal() {
        if (localStorage.getItem('mq_total')) {
            inputSisa.value = localStorage.getItem('mq_sisa');
            inputTotal.value = localStorage.getItem('mq_total');
            inputDurasi.value = localStorage.getItem('mq_durasi');
            inputHari.value = localStorage.getItem('mq_hari');
            hitungDanUpdate(); // Kalkulasi langsung secara instan saat dibuka
        }
    }

    /**
     * Fungsi Reset Aplikasi & Storage
     */
    function resetAplikasi() {
        form.reset();
        localStorage.clear(); // Bersihkan memori internal cache data

        elStatusText.textContent = "Menunggu Input...";
        elStatusText.className = "status-badge";

        elIndeksHemat.textContent = "-";
        elPersenIndeks.textContent = "-";

        elProgressBar.style.width = "0%";
        elProgressBar.className = "progress-bar";

        elKuotaTotal.textContent = "-";
        elKuotaTerpakai.textContent = "-";
        elPersenTerpakai.textContent = "-";
        elKuotaTersisa.textContent = "-";
        elPersenTersisa.textContent = "-";

        elSisaIdeal.textContent = "-";
        elPersenIdeal.textContent = "-";
        elSelisih.textContent = "-";
        elStatusSelisih.textContent = "-";
        elStatusSelisih.className = "";

        elSisaHari.textContent = "-";
        elTargetHarian.textContent = "-";

        elInsightText.textContent = "Silakan masukkan data kuota Anda pada form di atas untuk memunculkan analisis cerdas dari sistem.";
    }
});
      
