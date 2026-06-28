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
    const inputTanggal = document.getElementById('tanggalMulai'); 
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

    const elTglPrediksi = document.getElementById('outTglPrediksi');
    const elSisaHariKuota = document.getElementById('outSisaHariKuota');
    const elStatusPrediksi = document.getElementById('outStatusPrediksi');

    const elHistoryList = document.getElementById('historyList');
    const btnHapusHistory = document.getElementById('btnHapusHistory');

    const elStatTotalHitung = document.getElementById('statTotalHitung');
    const elStatAvgPakaiHarian = document.getElementById('statAvgPakaiHarian');
    const elStatAvgIndeksHemat = document.getElementById('statAvgIndeksHemat');
    const elStatHariHemat = document.getElementById('statHariHemat');
    const elStatHariSesuai = document.getElementById('statHariSesuai');
    const elStatHariBoros = document.getElementById('statHariBoros');
    const elStatPersenHariHemat = document.getElementById('statPersenHariHemat');
    const elStatIndeksMax = document.getElementById('statIndeksMax');
    const elStatIndeksMin = document.getElementById('statIndeksMin');
    const elStatSisaMax = document.getElementById('statSisaMax');
    const elStatSisaMin = document.getElementById('statSisaMin');
    const elStatistikContent = document.getElementById('statistikContent');

    // ===== EXPORT PDF START =====
    const btnExportPDF = document.getElementById('btnExportPDF');
    // ===== EXPORT PDF END =====

    // ===== BACKUP & RESTORE START =====
    const btnBackupData = document.getElementById('btnBackupData');
    const btnRestoreData = document.getElementById('btnRestoreData');
    const inputRestoreFile = document.getElementById('inputRestoreFile');
    // ===== BACKUP & RESTORE END =====

    // ===== FITUR BARU : Grafik Penggunaan =====
    let myQuotaChart = null;
    const elQuotaChart = document.getElementById('quotaChart');
    const elGrafikKosongText = document.getElementById('grafikKosongText');
    // ==========================================

    // ===== FITUR BARU : Smart Analytics Container =====
    const elSmartAnalyticsContent = document.getElementById('smartAnalyticsContent');
    // ==========================================

    // ===== FITUR BARU : Heatmap Calendar Elements =====
    let currentCalDate = new Date();
    const elHeatmapMonthTitle = document.getElementById('heatmapMonthTitle');
    const elHeatmapGrid = document.getElementById('heatmapGrid');
    const btnPrevMonth = document.getElementById('btnPrevMonth');
    const btnNextMonth = document.getElementById('btnNextMonth');
    const elHeatmapModal = document.getElementById('heatmapModal');
    const elCloseHeatmapModal = document.getElementById('closeHeatmapModal');

    const elCalSumHemat = document.getElementById('calSumHemat');
    const elCalSumSesuai = document.getElementById('calSumSesuai');
    const elCalSumBoros = document.getElementById('calSumBoros');
    const elCalSumNoData = document.getElementById('calSumNoData');
    const elCalStreakHemat = document.getElementById('calStreakHemat');

    const popCalTanggal = document.getElementById('popCalTanggal');
    const popCalStatus = document.getElementById('popCalStatus');
    const popCalIndeks = document.getElementById('popCalIndeks');
    const popCalSisa = document.getElementById('popCalSisa');
    const popCalTerpakai = document.getElementById('popCalTerpakai');
    const popCalHariKe = document.getElementById('popCalHariKe');
    // ==========================================

    function hitungOtomatisHariPemakaian() {
        if (!inputTanggal.value) return false;

        const tglMulai = new Date(inputTanggal.value);
        tglMulai.setHours(0, 0, 0, 0);

        const tglSekarang = new Date();
        tglSekarang.setHours(0, 0, 0, 0);

        const selisihWaktu = tglSekarang.getTime() - tglMulai.getTime();
        let selisihHari = Math.floor(selisihWaktu / (1000 * 60 * 60 * 24));

        if (selisihHari < 0) selisihHari = 0; 
        inputHari.value = selisihHari;
        return true;
    }

    inputTanggal.addEventListener('change', () => {
        hitungOtomatisHariPemakaian();
        if (inputSisa.value && inputTotal.value && inputDurasi.value) {
            hitungDanUpdate(false);
        }
    });

    muatDataLokal();
    
    tampilkanHistory();
    hitungDanTampilkanStatistik();
    
    updateGrafikPenggunaan();
    updateSmartAnalytics();
    
    // ===== FITUR BARU : Inisialisasi Heatmap =====
    updateHeatmapCalendar();
    // ==============================================

    if (btnHapusHistory) {
        btnHapusHistory.addEventListener('click', () => {
            localStorage.removeItem('mq_history');
            tampilkanHistory();
            hitungDanTampilkanStatistik();
            updateGrafikPenggunaan();
            updateSmartAnalytics();
            // ===== FITUR BARU : Update Heatmap =====
            updateHeatmapCalendar();
            // ==============================================
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hitungDanUpdate(false);
    });

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            resetAplikasi();
        });
    }

    /**
     * Fungsi Utama Perhitungan dan Pembaruan UI
     */
    function hitungDanUpdate(isInitialLoad = false) {
        const s = parseFloat(inputSisa.value);
        const T = parseFloat(inputTotal.value);
        const D = parseInt(inputDurasi.value);
        const d = parseInt(inputHari.value);

        if (isNaN(s) || isNaN(T) || isNaN(D) || isNaN(d) || T <= 0 || D <= 0 || d < 0) {
            return;
        }

        if (d > D) {
            alert('Hari pemakaian tidak boleh melebihi durasi paket.');
            return;
        }
        if (s > T) {
            alert('Sisa kuota tidak boleh melebihi total kuota.');
            return;
        }

        simpanDataLokal(s, T, D, d);

        let sisaIdeal = T - ((T / D) * d);
        if (sisaIdeal < 0) sisaIdeal = 0;

        let indeks = 1;
        if (sisaIdeal > 0) {
            indeks = s / sisaIdeal;
        } else {
            indeks = s > 0 ? 2 : 1; 
        }

        let persenIdeal = 100 - ((100 / D) * d);
        if (persenIdeal < 0) persenIdeal = 0; 

        const selisih = s - sisaIdeal;
        const kuotaTerpakai = T - s;
        const persenTerpakai = (kuotaTerpakai / T) * 100;
        const persenTersisa = (s / T) * 100;
        const sisaHari = D - d;

        let targetHarian = 0;
        if (sisaHari > 0) {
            targetHarian = s / sisaHari;
        } else {
            targetHarian = s; 
        }

        const statusStr = tentukanStatus(indeks);
        const statusClass = tentukanKelas(indeks);
        
        elStatusText.textContent = statusStr;
        elStatusText.className = `status-badge ${statusClass}`;

        elIndeksHemat.textContent = indeks.toFixed(2);
        elPersenIndeks.textContent = formatPersen(indeks * 100);
        
        elProgressBar.style.width = `${Math.min(Math.max(persenTersisa, 0), 100)}%`;
        elProgressBar.className = `progress-bar bg-${statusClass}`;

        elKuotaTotal.textContent = formatKuota(T);
        elKuotaTerpakai.textContent = formatKuota(kuotaTerpakai);
        elPersenTerpakai.textContent = formatPersen(persenTerpakai);
        elKuotaTersisa.textContent = formatKuota(s);
        elPersenTersisa.textContent = formatPersen(persenTersisa);

        elSisaIdeal.textContent = formatKuota(sisaIdeal);
        elPersenIdeal.textContent = formatPersen(persenIdeal);
        elSelisih.textContent = formatKuota(Math.abs(selisih));
        
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

        elSisaHari.textContent = `${sisaHari} Hari`;
        elTargetHarian.textContent = formatKuotaHarian(targetHarian);

        if (d === 0) {
            elTglPrediksi.textContent = "Belum cukup data.";
            elSisaHariKuota.textContent = "Belum cukup data.";
            elStatusPrediksi.textContent = "Belum cukup data.";
            elStatusPrediksi.className = "";
        } else {
            const pemakaianHarian = kuotaTerpakai / d;
            
            if (pemakaianHarian > 0) {
                const sisaHariKuota = s / pemakaianHarian;
                
                const tanggalHariIni = new Date();
                tanggalHariIni.setDate(tanggalHariIni.getDate() + sisaHariKuota);
                
                const opsiFormat = { day: 'numeric', month: 'long', year: 'numeric' };
                const tglFormatIndo = tanggalHariIni.toLocaleDateString('id-ID', opsiFormat);
                
                elTglPrediksi.textContent = tglFormatIndo;
                elSisaHariKuota.textContent = `${Math.ceil(sisaHariKuota)} Hari`;
                
                if (sisaHariKuota > 14) {
                    elStatusPrediksi.textContent = "🟢 Aman";
                    elStatusPrediksi.className = "text-hemat"; 
                } else if (sisaHariKuota >= 7 && sisaHariKuota <= 14) {
                    elStatusPrediksi.textContent = "🟡 Waspada";
                    elStatusPrediksi.className = "text-sesuai"; 
                } else {
                    elStatusPrediksi.textContent = "🔴 Kritis";
                    elStatusPrediksi.className = "text-boros"; 
                }
            } else {
                elTglPrediksi.textContent = "Tidak terdeteksi pemakaian";
                elSisaHariKuota.textContent = "Tak terhingga";
                elStatusPrediksi.textContent = "🟢 Aman";
                elStatusPrediksi.className = "text-hemat";
            }
        }

        elInsightText.textContent = buatInsight(indeks, targetHarian);

        if (!isInitialLoad) {
            tambahKeHistory(T, s, kuotaTerpakai, d, indeks, statusStr);
        }
    }

    function tambahKeHistory(total, sisa, terpakai, hari, indeks, status) {
        const agora = new Date();
        const opsiWaktu = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const waktuString = carriageReturnFix(agora.toLocaleDateString('id-ID', opsiWaktu).replace('.', ':'));

        const itemBaru = {
            waktu: waktuString,
            totalKuota: formatKuota(total),
            sisaKuota: formatKuota(sisa),
            kuotaTerpakai: formatKuota(terpakai),
            hariPemakaian: hari,
            indeksHemat: indeks.toFixed(2),
            statusText: status,
            _rawSisa: sisa,       
            _rawTerpakai: terpakai 
        };

        let listHistory = JSON.parse(localStorage.getItem('mq_history')) || [];
        listHistory.unshift(itemBaru); 

        if (listHistory.length > 30) {
            listHistory.pop(); 
        }

        localStorage.setItem('mq_history', JSON.stringify(listHistory));
        tampilkanHistory();
        hitungDanTampilkanStatistik();
        updateGrafikPenggunaan();
        updateSmartAnalytics();
        // ===== FITUR BARU : Live Update Heatmap =====
        updateHeatmapCalendar();
        // ============================================
    }

    function carriageReturnFix(str) {
        return str.replace(/\u200E/g, '');
    }

    function tampilkanHistory() {
        if (!elHistoryList) return;
        
        const listHistory = JSON.parse(localStorage.getItem('mq_history')) || [];
        
        if (listHistory.length === 0) {
            elHistoryList.innerHTML = `<p style="text-align: center; color: #6b7280; font-style: italic; margin: 15px 0;">Belum ada riwayat perhitungan.</p>`;
            return;
        }

        let htmlString = "";
        listHistory.forEach(item => {
            let warnaStatus = "";
            const isDarkModeActive = document.body.classList.contains('dark-mode');

            if (item.statusText.includes("Hemat")) {
                warnaStatus = isDarkModeActive ? "color: #4ade80; font-weight: bold;" : "color: #10b981; font-weight: bold;";
            } else if (item.statusText.includes("Target")) {
                warnaStatus = isDarkModeActive ? "color: #facc15; font-weight: bold;" : "color: #eab308; font-weight: bold;";
            } else {
                warnaStatus = isDarkModeActive ? "color: #f87171; font-weight: bold;" : "color: #ef4444; font-weight: bold;";
            }

            htmlString += `
                <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #6b7280; font-size: 11px;">
                        <span>📅 ${item.waktu}</span>
                        <span style="${warnaStatus}">${item.statusText}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; color: #374151;">
                        <div>Total/Sisa: <b>${item.totalKuota} / ${item.sisaKuota}</b></div>
                        <div>Terpakai: <b>${item.kuotaTerpakai}</b></div>
                        <div>Hari ke-: <b>${item.hariPemakaian}</b></div>
                        <div>Indeks: <b>${item.indeksHemat}</b></div>
                    </div>
                </div>
            `;
        });

        elHistoryList.innerHTML = htmlString;
    }

    function hitungDanTampilkanStatistik() {
        if (!elStatistikContent) return;
        
        const listHistory = JSON.parse(localStorage.getItem('mq_history')) || [];
        
        if (listHistory.length === 0) {
            elStatistikContent.innerHTML = `
                <table class="table-data">
                    <tr><td>Total Perhitungan</td><td class="text-right bold">-</td></tr>
                    <tr><td>Rata-rata Pemakaian Harian</td><td class="text-right bold">-</td></tr>
                    <tr><td>Rata-rata Indeks Hemat</td><td class="text-right bold">-</td></tr>
                    <tr><td>Jumlah Hari Hemat (Hijau)</td><td class="text-right bold text-highlight">-</td></tr>
                    <tr><td>Jumlah Hari Sesuai Target (Kuning)</td><td class="text-right bold">-</td></tr>
                    <tr><td>Jumlah Hari Boros (Merah)</td><td class="text-right bold">-</td></tr>
                    <tr><td>Persentase Hari Hemat</td><td class="text-right bold italic">-</td></tr>
                    <tr><td>Indeks Hemat Tertinggi</td><td class="text-right bold">-</td></tr>
                    <tr><td>Indeks Hemat Terendah</td><td class="text-right bold">-</td></tr>
                    <tr><td>Kuota Tersisa Tertinggi</td><td class="text-right bold">-</td></tr>
                    <tr><td>Kuota Tersisa Terendah</td><td class="text-right bold">-</td></tr>
                </table>
                <p style="text-align: center; color: #6b7280; font-style: italic; margin-top: 10px;">Belum ada data statistik.</p>
            `;
            return;
        }

        let totalPerhitungan = listHistory.length;
        let sumPemakaianHarian = 0;
        let countPemakaianHarianValid = 0;
        let sumIndeksHemat = 0;
        
        let hariHemat = 0;
        let hariSesuai = 0;
        let hariBoros = 0;

        let maxIndeks = -Infinity;
        let minIndeks = Infinity;
        let maxSisa = -Infinity;
        let minSisa = Infinity;

        listHistory.forEach(item => {
            let idx = parseFloat(item.indeksHemat);
            let hariVal = parseInt(item.hariPemakaian);

            let sisaVal = item._rawSisa !== undefined ? item._rawSisa : parseFloat(item.sisaKuota.replace(/[^\d.]/g, ''));
            let terpakaiVal = item._rawTerpakai !== undefined ? item._rawTerpakai : parseFloat(item.kuotaTerpakai.replace(/[^\d.]/g, ''));

            if (item._rawSisa === undefined && item.sisaKuota.includes("MB")) sisaVal = sisaVal / 1024;
            if (item._rawTerpakai === undefined && item.kuotaTerpakai.includes("MB")) terpakaiVal = terpakaiVal / 1024;

            if (!isNaN(hariVal) && hariVal > 0 && !isNaN(terpakaiVal)) {
                sumPemakaianHarian += (terpakaiVal / hariVal);
                countPemakaianHarianValid++;
            }

            if (!isNaN(idx)) {
                sumIndeksHemat += idx;
                if (idx > maxIndeks) maxIndeks = idx;
                if (idx < minIndeks) minIndeks = idx;
            }

            if (!isNaN(sisaVal)) {
                if (sisaVal > maxSisa) maxSisa = sisaVal;
                if (sisaVal < minSisa) minSisa = sisaVal;
            }

            if (item.statusText.includes("Hemat")) {
                hariHemat++;
            } else if (item.statusText.includes("Target")) {
                hariSesuai++;
            } else if (item.statusText.includes("Boros")) {
                hariBoros++;
            }
        });

        let avgPemakaianHarian = countPemakaianHarianValid > 0 ? (sumPemakaianHarian / countPemakaianHarianValid) : 0;
        let avgIndeksHemat = totalPerhitungan > 0 ? (sumIndeksHemat / totalPerhitungan) : 1;
        let persenHariHemat = totalPerhitungan > 0 ? (hariHemat / totalPerhitungan) * 100 : 0;

        elStatistikContent.innerHTML = `
            <table class="table-data">
                <tr><td>Total Perhitungan</td><td id="statTotalHitung" class="text-right bold"></td></tr>
                <tr><td>Rata-rata Pemakaian Harian</td><td id="statAvgPakaiHarian" class="text-right bold"></td></tr>
                <tr><td>Rata-rata Indeks Hemat</td><td id="statAvgIndeksHemat" class="text-right bold"></td></tr>
                <tr><td>Jumlah Hari Hemat (Hijau)</td><td id="statHariHemat" class="text-right bold text-highlight"></td></tr>
                <tr><td>Jumlah Hari Sesuai Target (Kuning)</td><td id="statHariSesuai" class="text-right bold"></td></tr>
                <tr><td>Jumlah Hari Boros (Merah)</td><td id="statHariBoros" class="text-right bold"></td></tr>
                <tr><td>Persentase Hari Hemat</td><td id="statPersenHariHemat" class="text-right bold italic"></td></tr>
                <tr><td>Indeks Hemat Tertinggi</td><td id="statIndeksMax" class="text-right bold"></td></tr>
                <tr><td>Indeks Hemat Terendah</td><td id="statIndeksMin" class="text-right bold"></td></tr>
                <tr><td>Kuota Tersisa Tertinggi</td><td id="statSisaMax" class="text-right bold"></td></tr>
                <tr><td>Kuota Tersisa Terendah</td><td id="statSisaMin" class="text-right bold"></td></tr>
            </table>
        `;

        document.getElementById('statTotalHitung').textContent = `${totalPerhitungan} kali`;
        document.getElementById('statAvgPakaiHarian').textContent = formatKuotaHarian(avgPemakaianHarian);
        document.getElementById('statAvgIndeksHemat').textContent = avgIndeksHemat.toFixed(2);
        document.getElementById('statHariHemat').textContent = `${hariHemat} hari`;
        document.getElementById('statHariSesuai').textContent = `${hariSesuai} hari`;
        document.getElementById('statHariBoros').textContent = `${hariBoros} hari`;
        document.getElementById('statPersenHariHemat').textContent = `${persenHariHemat.toFixed(0)}%`;
        document.getElementById('statIndeksMax').textContent = maxIndeks === -Infinity ? "-" : maxIndeks.toFixed(2);
        document.getElementById('statIndeksMin').textContent = minIndeks === Infinity ? "-" : minIndeks.toFixed(2);
        document.getElementById('statSisaMax').textContent = maxSisa === -Infinity ? "-" : formatKuota(maxSisa);
        document.getElementById('statSisaMin').textContent = minSisa === Infinity ? "-" : formatKuota(minSisa);
    }

    function updateGrafikPenggunaan() {
        try {
            if (!elQuotaChart) return;

            const listHistory = JSON.parse(localStorage.getItem('mq_history')) || [];

            if (listHistory.length === 0) {
                elQuotaChart.style.display = 'none';
                elGrafikKosongText.style.display = 'block';
                if (myQuotaChart) {
                    myQuotaChart.destroy();
                    myQuotaChart = null;
                }
                return;
            }

            elQuotaChart.style.display = 'block';
            elGrafikKosongText.style.display = 'none';

            const dataSetTerbatas = listHistory.slice(0, 30).reverse();
            const labelWaktu = dataSetTerbatas.map(item => item.waktu.split(',')[0]); 
            const dataSisaKuota = dataSetTerbatas.map(item => {
                if (item._rawSisa !== undefined) return item._rawSisa;
                let val = parseFloat(item.sisaKuota.replace(/[^\d.]/g, ''));
                return item.sisaKuota.includes("MB") ? val / 1024 : val;
            });

            if (myQuotaChart) {
                myQuotaChart.destroy();
            }

            if (typeof Chart === 'undefined') {
                elQuotaChart.style.display = 'none';
                elGrafikKosongText.style.display = 'block';
                elGrafikKosongText.textContent = "Gagal memuat sistem grafik harian.";
                return;
            }

            const isDark = document.body.classList.contains('dark-mode');

            myQuotaChart = new Chart(elQuotaChart, {
                type: 'line',
                data: {
                    labels: labelWaktu,
                    datasets: [{
                        label: 'Sisa Kuota (GB)',
                        data: dataSisaKuota,
                        borderColor: isDark ? '#60a5fa' : '#2563eb', 
                        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        tension: 0.2, 
                        pointBackgroundColor: isDark ? '#60a5fa' : '#2563eb',
                        pointRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 10 }, color: isDark ? '#94a3b8' : '#6b7280' }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: isDark ? '#334155' : '#e5e7eb' },
                            ticks: {
                                font: { size: 11 },
                                color: isDark ? '#94a3b8' : '#6b7280',
                                callback: function(value) { return value + ' GB'; }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            if (elQuotaChart) elQuotaChart.style.display = 'none';
            if (elGrafikKosongText) elGrafikKosongText.style.display = 'block';
        }
    }

    function updateSmartAnalytics() {
        if (!elSmartAnalyticsContent) return;

        const listHistory = JSON.parse(localStorage.getItem('mq_history')) || [];

        if (listHistory.length < 5) {
            elSmartAnalyticsContent.innerHTML = `
                <p style="text-align: center; color: #6b7280; font-style: italic; margin: 15px 0;">Data histori belum cukup untuk menghasilkan analisis.</p>
            `;
            return;
        }

        let sumPemakaianHarian = 0;
        let validDaysCount = 0;
        let countHemat = 0;

        let maxTerpakai = -Infinity;
        let minTerpakai = Infinity;
        let tglPalingBoros = "-";
        let tglPalingHemat = "-";

        listHistory.forEach(item => {
            let hariVal = parseInt(item.hariPemakaian);
            let terpakaiVal = item._rawTerpakai !== undefined ? item._rawTerpakai : parseFloat(item.kuotaTerpakai.replace(/[^\d.]/g, ''));

            if (item._rawTerpakai === undefined && item.kuotaTerpakai.includes("MB")) terpakaiVal = terpakaiVal / 1024;

            if (!isNaN(hariVal) && hariVal > 0 && !isNaN(terpakaiVal)) {
                let rasiopakai = terpakaiVal / hariVal;
                sumPemakaianHarian += rasiopakai;
                validDaysCount++;

                if (rasiopakai > maxTerpakai) {
                    maxTerpakai = rasiopakai;
                    tglPalingBoros = item.waktu.split(',')[0];
                }
                if (rasiopakai < minTerpakai) {
                    minTerpakai = rasiopakai;
                    tglPalingHemat = item.waktu.split(',')[0];
                }
            }

            if (item.statusText.includes("Hemat") || item.statusText.includes("Target")) {
                countHemat++;
            }
        });

        let avgPakai = validDaysCount > 0 ? (sumPemakaianHarian / validDaysCount) : 0;
        let trenStatus = "Stabil";
        let teksInsightTren = "Selama beberapa hari terakhir penggunaan Anda cenderung stabil.";
        
        if (listHistory.length >= 2) {
            let limit = Math.min(7, Math.floor(listHistory.length / 2));
            if (limit > 0) {
                let sumTerakhir = 0;
                let sumSebelumnya = 0;
                
                for (let i = 0; i < limit; i++) {
                    let h1 = parseInt(listHistory[i].hariPemakaian);
                    let t1 = listHistory[i]._rawTerpakai !== undefined ? listHistory[i]._rawTerpakai : parseFloat(listHistory[i].kuotaTerpakai.replace(/[^\d.]/g, ''));
                    sumTerakhir += (h1 > 0 ? t1 / h1 : 0);

                    let h2 = parseInt(listHistory[i + limit].hariPemakaian);
                    let t2 = listHistory[i + limit]._rawTerpakai !== undefined ? listHistory[i + limit]._rawTerpakai : parseFloat(listHistory[i + limit].kuotaTerpakai.replace(/[^\d.]/g, ''));
                    sumSebelumnya += (h2 > 0 ? t2 / h2 : 0);
                }

                let avgTerakhir = sumTerakhir / limit;
                let avgSebelumnya = sumSebelumnya / limit;

                if (avgSebelumnya > 0) {
                    let diffPercent = ((avgTerakhir - avgSebelumnya) / avgSebelumnya) * 100;
                    if (diffPercent > 5) {
                        trenStatus = "📈 Naik";
                        teksInsightTren = `Pemakaian meningkat sekitar ${Math.abs(diffPercent).toFixed(0)}% dibanding periode sebelumnya.`;
                    } else if (diffPercent < -5) {
                        trenStatus = "📉 Turun";
                        teksInsightTren = `Pemakaian menurun sekitar ${Math.abs(diffPercent).toFixed(0)}% dibanding periode sebelumnya.`;
                    }
                }
            }
        }

        let currentSisa = parseFloat(localStorage.getItem('mq_sisa')) || 0;
        let currentDurasi = parseInt(localStorage.getItem('mq_durasi')) || 0;
        let currentHari = parseInt(localStorage.getItem('mq_hari')) || 0;

        let sisaHariPaket = currentDurasi - currentHari;
        if (sisaHariPaket < 0) sisaHariPaket = 0;

        let prediksiSisaKuotaMasaAktif = currentSisa - (avgPakai * sisaHariPaket);
        if (prediksiSisaKuotaMasaAktif < 0) prediksiSisaKuotaMasaAktif = 0;

        let teksPrediksiSisa = formatKuota(prediksiSisaKuotaMasaAktif);
        let teksTglHabis = "-";

        if (avgPakai > 0) {
            let sisaHariKuota = currentSisa / avgPakai;
            let targetTanggal = new Date();
            targetTanggal.setDate(targetTanggal.getDate() + sisaHariKuota);
            teksTglHabis = targetTanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            teksTglHabis = "Tak terhingga";
        }

        let teksInsightSistem = "Jika pola saat ini dipertahankan, kuota diperkirakan masih aman hingga akhir masa aktif.";
        if (prediksiSisaKuotaMasaAktif === 0) {
            teksInsightSistem = "Peringatan! Jika tren ini berlanjut, paket data Anda akan habis sebelum masa aktif berakhir.";
        }

        let persenKeberhasilan = (countHemat / listHistory.length) * 100;

        elSmartAnalyticsContent.innerHTML = `
            <table class="table-data">
                <tr><td>📊 Rata-rata Pemakaian Harian</td><td class="text-right bold">${formatKuotaHarian(avgPakai)}</td></tr>
                <tr><td>🔄 Tren Penggunaan</td><td class="text-right bold">${trenStatus}</td></tr>
                <tr><td>🟢 Hari Paling Hemat</td><td class="text-right text-hemat">${tglPalingHemat} (${formatKuotaHarian(minTerpakai === Infinity ? 0 : minTerpakai)})</td></tr>
                <tr><td>🔴 Hari Paling Boros</td><td class="text-right text-boros">${tglPalingBoros} (${formatKuotaHarian(maxTerpakai === -Infinity ? 0 : maxTerpakai)})</td></tr>
                <tr><td>📦 Prediksi Sisa Kuota Akhir Paket</td><td class="text-right bold">${teksPrediksiSisa}</td></tr>
                <tr><td>📅 Prediksi Tanggal Kuota Habis</td><td class="text-right text-highlight">${teksTglHabis}</td></tr>
                <tr><td>🎯 Keberhasilan Target Hemat</td><td class="text-right bold italic">${persenKeberhasilan.toFixed(0)}%</td></tr>
            </table>
            <div class="smart-insight-box">
                💡 <b>Smart Insight:</b> ${teksInsightTren} ${teksInsightSistem}
            </div>
        `;
    }

    // ===== FITUR BARU : Heatmap Calendar Engine =====
    /**
     * Memetakan warna status kalender berdasarkan nilai indeks hemat
     */
    function dapatkanKelasWarnaHeatmap(indeks) {
        if (isNaN(indeks)) return "bg-no-data";
        if (indeks > 1.5) return "bg-sangat-hemat";
        if (indeks > 1.0) return "bg-hemat-cal";
        if (Math.abs(indeks - 1.0) < 0.01) return "bg-sesuai-cal";
        if (indeks >= 0.5) return "bg-agak-boros";
        return "bg-boros-cal";
    }

    /**
     * Memperbarui UI komponen kalender heatmap
     */
    function updateHeatmapCalendar() {
        if (!elHeatmapGrid || !elHeatmapMonthTitle) return;

        const listHistory = JSON.parse(localStorage.getItem('mq_history')) || [];
        
        const tahun = currentCalDate.getFullYear();
        const bulan = currentCalDate.getMonth();

        const namaBulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        elHeatmapMonthTitle.textContent = `${namaBulanIndo[bulan]} ${tahun}`;

        // Cari total hari dalam bulan & hari awal dimulainya bulan
        const totalHari = new Date(tahun, bulan + 1, 0).getDate();
        const hariPertama = new Date(tahun, bulan, 1).getDay();

        elHeatmapGrid.innerHTML = "";

        // Buat slot kosong untuk hari sebelum tanggal 1
        for (let i = 0; i < hariPertama; i++) {
            const divKosong = document.createElement('div');
            divKosong.className = "cal-day-empty";
            elHeatmapGrid.appendChild(divKosong);
        }

        // Variabel penghitung ringkasan khusus bulan yang aktif di-render
        let sumHemat = 0, sumSesuai = 0, sumBoros = 0, sumNoData = 0;

        // Loop rendering kotak tanggal harian
        for (let tgl = 1; tgl <= totalHari; tgl++) {
            const divHari = document.createElement('div');
            divHari.className = "cal-day-box";
            divHari.textContent = tgl;

            // Cari data history yang paling cocok/sesuai dengan tanggal iterasi saat ini
            let dataMatch = null;
            for (let item of listHistory) {
                // Parsing format string waktu history (Contoh: "29 Jun 2026 14:20")
                const parts = item.waktu.split(' ');
                if (parts.length >= 3) {
                    const hD = parseInt(parts[0]);
                    const hMStr = parts[1].toLowerCase();
                    const hY = parseInt(parts[2]);

                    const petaBulanSingkat = {
                        jan:0, feb:1, mar:2, apr:3, mei:4, jun:5, jul:6, ags:7, sep:8, okt:9, nov:10, des:11,
                        janf:0, febf:1, marf:2, aprf:3, meif:4, junf:5, julf:6, agsf:7, sepf:8, oktf:9, novf:10, desf:11
                    };
                    const hM = petaBulanSingkat[hMStr.substring(0,3)];

                    if (hD === tgl && hM === bulan && hY === tahun) {
                        dataMatch = item;
                        break; // Ambil entri terbaru yang pas
                    }
                }
            }

            if (dataMatch) {
                const idx = parseFloat(dataMatch.indeksHemat);
                divHari.classList.add(dapatkanKelasWarnaHeatmap(idx));

                // Klasifikasi untuk ringkasan bulanan
                if (idx > 1.0) sumHemat++;
                else if (Math.abs(idx - 1.0) < 0.01) sumSesuai++;
                else sumBoros++;

                // Berikan event listener untuk memunculkan detail modal
                divHari.addEventListener('click', () => {
                    popCalTanggal.textContent = `📅 Detail Tanggal: ${tgl} ${namaBulanIndo[bulan]} ${tahun}`;
                    popCalStatus.textContent = dataMatch.statusText;
                    
                    // Pewarnaan teks status popup dinamis mengikuti style MonQuota
                    if (dataMatch.statusText.includes("Hemat")) popCalStatus.className = "text-right text-hemat";
                    else if (dataMatch.statusText.includes("Target")) popCalStatus.className = "text-right text-sesuai";
                    else popCalStatus.className = "text-right text-boros";

                    popCalIndeks.textContent = dataMatch.indeksHemat;
                    popCalSisa.textContent = dataMatch.sisaKuota;
                    popCalTerpakai.textContent = dataMatch.kuotaTerpakai;
                    popCalHariKe.textContent = `Hari Ke- ${dataMatch.hariPemakaian}`;
                    elHeatmapModal.style.display = "flex";
                });
            } else {
                divHari.classList.add("bg-no-data");
                sumNoData++;
                divHari.addEventListener('click', () => {
                    popCalTanggal.textContent = `📅 Tanggal: ${tgl} ${namaBulanIndo[bulan]} ${tahun}`;
                    popCalStatus.textContent = "Tidak Ada Data";
                    popCalStatus.className = "text-right italic";
                    popCalIndeks.textContent = "-";
                    popCalSisa.textContent = "-";
                    popCalTerpakai.textContent = "-";
                    popCalHariKe.textContent = "-";
                    elHeatmapModal.style.display = "flex";
                });
            }

            elHeatmapGrid.appendChild(divHari);
        }

        // Tampilkan hasil akumulasi ke panel ringkasan bulanan
        elCalSumHemat.textContent = sumHemat;
        elCalSumSesuai.textContent = sumSesuai;
        elCalSumBoros.textContent = sumBoros;
        elCalSumNoData.textContent = sumNoData;

        // Hitung Streak Hemat Terpanjang Global (Seluruh Data History Secara Kronologis)
        let streakMaks = 0;
        let streakSkarang = 0;
        
        // Urutkan history dari data terlama ke data terbaru untuk memproses runtutan hari
        const listHistoryKronologis = [...listHistory].reverse();
        
        listHistoryKronologis.forEach(item => {
            const idx = parseFloat(item.indeksHemat);
            if (!isNaN(idx) && idx >= 1.0) { // Masuk kategori Hemat atau Sesuai Target
                streakSkarang++;
                if (streakSkarang > streakMaks) {
                    streakMaks = streakSkarang;
                }
            } else {
                streakSkarang = 0; // Patah streak jika boros
            }
        });

        elCalStreakHemat.textContent = `${streakMaks} Hari`;
    }

    // Navigasi Tombol Kalender
    if (btnPrevMonth) {
        btnPrevMonth.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            updateHeatmapCalendar();
        });
    }

    if (btnNextMonth) {
        btnNextMonth.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            updateHeatmapCalendar();
        });
    }

    // Modal Close Action
    if (elCloseHeatmapModal) {
        elCloseHeatmapModal.addEventListener('click', () => {
            elHeatmapModal.style.display = "none";
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === elHeatmapModal) {
            elHeatmapModal.style.display = "none";
        }
    });
    // ==============================================

    /**
     * Fungsi Utilitas Tambahan
     */
    function formatKuota(nilaiGB) {
        if (nilaiGB >= 1) {
            return `${nilaiGB.toFixed(2)} GB`;
        } else {
            const nilaiMB = nilaiGB * 1024;
            return `${nilaiMB.toFixed(0)} MB`;
        }
    }

    function formatKuotaHarian(nilaiGBHarian) {
        if (nilaiGBHarian >= 1) {
            return `${nilaiGBHarian.toFixed(2)} GB/hari`;
        } else {
            const nilaiMBHarian = nilaiGBHarian * 1024;
            return `${nilaiMBHarian.toFixed(0)} MB/hari`;
        }
    }

    function formatPersen(nilaiPersen) {
        if (nilaiPersen < 0) nilaiPersen = 0;
        return `${nilaiPersen.toFixed(2)}%`;
    }

    function tentukanStatus(indeks) {
        if (Math.abs(indeks - 1) < 0.01) {
            return "🟡 Sesuai Target";
        } else if (indeks > 1) {
            return "🟢 Lebih Hemat";
        } else {
            return "🔴 Lebih Boros";
        }
    }

    function tentukanKelas(indeks) {
        if (Math.abs(indeks - 1) < 0.01) {
            return "sesuai";
        } else if (indeks > 1) {
            return "hemat";
        } else {
            return "boros";
        }
    }

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
            return `🚨 PENGGUNAAN... SANGAT BOROS! Sisa kuota Anda berada dalam kondisi kritis. Usahakan penggunaan harian ditekan ketat dan tidak melebihi ${teksTarget}/hari agar kuota tetap cukup hingga akhir paket.`;
        } else {
            return `⚠️ Penggunaan kuota lebih boros dari target. Usahakan penggunaan harian tidak melebihi ${teksTarget}/hari agar kuota tetap cukup hingga akhir paket.`;
        }
    }

    function simpanDataLokal(s, T, D, d) {
        localStorage.setItem('mq_sisa', s);
        localStorage.setItem('mq_total', T);
        localStorage.setItem('mq_durasi', D);
        localStorage.setItem('mq_hari', d);
        localStorage.setItem('mq_tanggal', inputTanggal.value); 
    }

    function muatDataLokal() {
        if (localStorage.getItem('mq_total')) {
            inputSisa.value = localStorage.getItem('mq_sisa');
            inputTotal.value = localStorage.getItem('mq_total');
            inputDurasi.value = localStorage.getItem('mq_durasi');
            inputTanggal.value = localStorage.getItem('mq_tanggal') || ''; 
            
            if (inputTanggal.value) {
                hitungOtomatisHariPemakaian(); 
            } else {
                inputHari.value = localStorage.getItem('mq_hari');
            }
            
            hitungDanUpdate(true);
        }
    }

    function resetAplikasi() {
        form.reset();
        
        localStorage.removeItem('mq_sisa');
        localStorage.removeItem('mq_total');
        localStorage.removeItem('mq_durasi');
        localStorage.removeItem('mq_hari');
        localStorage.removeItem('mq_tanggal');

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

        elTglPrediksi.textContent = "-";
        elSisaHariKuota.textContent = "-";
        elStatusPrediksi.textContent = "-";
        elStatusPrediksi.className = "";

        elInsightText.textContent = "Silakan masukkan data kuota Anda pada form di atas untuk memunculkan analisis cerdas dari sistem.";

        hitungDanTampilkanStatistik();
        updateGrafikPenggunaan();
        updateSmartAnalytics();
        // ===== FITUR BARU : Reset Heatmap =====
        updateHeatmapCalendar();
        // ==============================================
    }

    // ===== DARK MODE START =====
    const btnDarkMode = document.getElementById('btnDarkMode');
    
    function terapkanTemaSesuaiStorage() {
        if (localStorage.getItem('mq_theme') === 'dark') {
            document.body.classList.add('dark-mode');
            if (btnDarkMode) btnDarkMode.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            if (btnDarkMode) btnDarkMode.textContent = '🌙';
        }
    }

    terapkanTemaSesuaiStorage();

    if (btnDarkMode) {
        btnDarkMode.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('mq_theme', 'dark');
                btnDarkMode.textContent = '☀️';
            } else {
                localStorage.setItem('mq_theme', 'light');
                btnDarkMode.textContent = '🌙';
            }

            tampilkanHistory(); 
            updateGrafikPenggunaan(); 
            // ===== FITUR BARU : Theme Sync Kalender =====
            updateHeatmapCalendar();
            // ============================================
        });
    }
    // ===== DARK MODE END =====

    // ===== EXPORT PDF START =====
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            if (!elKuotaTotal.textContent || elKuotaTotal.textContent === '-' || !inputTotal.value) {
                alert("Belum ada data untuk diekspor.");
                return;
            }

            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

                const marginX = 20;
                let currentY = 20;
                const lineSpacing = 8;
                const pageWidth = 170; 

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(22);
                pdf.setTextColor(37, 99, 235); 
                pdf.text("MONQUOTA", marginX, currentY);
                
                currentY += 8;
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(107, 114, 128); 
                pdf.text("Laporan Penggunaan Kuota", marginX, currentY);

                currentY += 5;
                pdf.setDrawColor(229, 231, 235);
                pdf.setLineWidth(0.5);
                pdf.line(marginX, currentY, marginX + pageWidth, currentY);

                currentY += 10;
                pdf.setFontSize(10);
                pdf.setTextColor(31, 41, 55);

                const opsiWaktu = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                const tglCetak = new Date().toLocaleDateString('id-ID', opsiWaktu);

                const barisData = [
                    ["Tanggal Cetak", tglCetak],
                    ["Total Kuota", elKuotaTotal.textContent],
                    ["Kuota Terpakai", elKuotaTerpakai.textContent],
                    ["Kuota Tersisa", elKuotaTersisa.textContent],
                    ["Persentase Terpakai", elPersenTerpakai.textContent],
                    ["Persentase Tersisa", elPersenTersisa.textContent],
                    ["Hari Pemakaian", `Hari Ke- ${inputHari.value}`],
                    ["Sisa Hari", elSisaHari.textContent],
                    ["Indeks Hemat", elIndeksHemat.textContent],
                    ["Status", elStatusText.textContent],
                    ["Target Harian", elTargetHarian.textContent],
                    ["Sisa Ideal", elSisaIdeal.textContent],
                    ["Prediksi Kuota Habis", `${elTglPrediksi.textContent} (${elSisaHariKuota.textContent})`]
                ];

                barisData.forEach((item) => {
                    pdf.setFont("helvetica", "bold");
                    pdf.text(item[0], marginX, currentY);
                    pdf.setFont("helvetica", "normal");
                    pdf.text(`: ${item[1]}`, marginX + 50, currentY);
                    currentY += lineSpacing;
                });

                currentY += 2;
                pdf.setFont("helvetica", "bold");
                pdf.text("Insight", marginX, currentY);
                
                pdf.setFont("helvetica", "normal");
                const teksInsight = elInsightText.textContent || "-";
                const barisInsightTerpotong = pdf.splitTextToSize(teksInsight, pageWidth - 10);
                
                currentY += 5;
                barisInsightTerpotong.forEach((baris) => {
                    if (currentY > 270) { pdf.addPage(); currentY = 20; }
                    pdf.text(baris, marginX + 4, currentY);
                    currentY += 5;
                });

                if (elQuotaChart && elQuotaChart.style.display !== 'none' && myQuotaChart) {
                    currentY += 10;
                    if (currentY > 210) { pdf.addPage(); currentY = 20; }
                    pdf.setFont("helvetica", "bold");
                    pdf.text("Grafik Penggunaan Kuota", marginX, currentY);
                    
                    const imageChartBase64 = elQuotaChart.toDataURL("image/png", 1.0);
                    currentY += 5;
                    pdf.addImage(imageChartBase64, "PNG", marginX, currentY, pageWidth, 50);
                    currentY += 55;
                }

                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(9);
                pdf.setTextColor(156, 163, 175);
                pdf.text("Dibuat oleh MonQuota", marginX, 285);

                pdf.save(`Laporan_MonQuota_${Date.now()}.pdf`);
            } catch (error) {
                alert("Terjadi kesalahan sistem saat mengekspor laporan PDF.");
            }
        });
    }
    // ===== EXPORT PDF END =====

    // ===== BACKUP & RESTORE START =====
    if (btnBackupData) {
        btnBackupData.addEventListener('click', () => {
            try {
                const sekarang = new Date();
                const formatDuaDigit = (num) => String(num).padStart(2, '0');
                
                const yyyy = sekarang.getFullYear();
                const mm = formatDuaDigit(sekarang.getMonth() + 1);
                const dd = formatDuaDigit(sekarang.getDate());
                const hh = formatDuaDigit(sekarang.getHours());
                const min = formatDuaDigit(sekarang.getMinutes());
                const ss = formatDuaDigit(sekarang.getSeconds());

                const namaFileBackup = `MonQuota_Backup_${yyyy}-${mm}-${dd}.json`;
                const payloadStorage = {};
                const keysMonQuota = ['mq_sisa', 'mq_total', 'mq_durasi', 'mq_hari', 'mq_tanggal', 'mq_history', 'mq_theme'];
                
                keysMonQuota.forEach(k => {
                    const v = localStorage.getItem(k);
                    if (v !== null) payloadStorage[k] = v;
                });

                const strukturBackup = {
                    metadata: { app: "MonQuota", version: "1.1.0", backup_date: `${yyyy}-${mm}-${dd}`, backup_time: `${hh}:${min}:${ss}` },
                    data: payloadStorage
                };

                const dataBlob = new Blob([JSON.stringify(strukturBackup, null, 2)], { type: 'application/json' });
                const urlObjek = URL.createObjectURL(dataBlob);
                const linkUnduh = document.createElement('a');
                linkUnduh.href = urlObjek;
                linkUnduh.download = namaFileBackup;
                document.body.appendChild(linkUnduh);
                linkUnduh.click();
                document.body.removeChild(linkUnduh);
                URL.revokeObjectURL(urlObjek);
            } catch (err) {
                console.error(err);
            }
        });
    }

    if (btnRestoreData && inputRestoreFile) {
        btnRestoreData.addEventListener('click', () => { inputRestoreFile.click(); });

        inputRestoreFile.addEventListener('change', (event) => {
            const fileTerpilih = event.target.files[0];
            if (!fileTerpilih) return;

            const pembacaFile = new FileReader();
            pembacaFile.onload = (e) => {
                try {
                    const jsonParsed = JSON.parse(e.target.result);
                    if (!jsonParsed || !jsonParsed.metadata || jsonParsed.metadata.app !== "MonQuota" || !jsonParsed.data) {
                        alert("File backup tidak valid.");
                        inputRestoreFile.value = "";
                        return;
                    }

                    const dataset = jsonParsed.data;
                    Object.keys(dataset).forEach(key => { localStorage.setItem(key, dataset[key]); });

                    muatDataLokal();
                    tampilkanHistory();
                    hitungDanTampilkanStatistik();
                    terapkanTemaSesuaiStorage();
                    updateGrafikPenggunaan();
                    updateSmartAnalytics();
                    // ===== FITUR BARU : Live Restore Sync Kalender =====
                    updateHeatmapCalendar();
                    // ===================================================

                    alert("Backup berhasil dipulihkan.");
                } catch (error) {
                    alert("File backup tidak valid.");
                }
                inputRestoreFile.value = "";
            };
            pembacaFile.readAsText(fileTerpilih);
        });
    }
    // ===== BACKUP & RESTORE END =====
});
