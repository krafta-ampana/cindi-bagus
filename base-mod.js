// ==============================
// 1. Konfigurasi & Utilities
// ==============================

// Ambil Nama Tamu Undangan dari URL
function getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    let results = regex.exec(url);
    if (!results || !results[2]) return "Tamu Undangan";
    return decodeURIComponent(results[2].replace(/\+/g, " "))
        .replace(/-/g, " ")
        .replace(/\|/g, " / ")
        .replace(/ dan /gi, " & ");
}

// Ambil URL API dari GitHub
let apiUrl = "";
function loadConfigUndangan(callback) {
    fetch("https://raw.githubusercontent.com/krafta-visio/app_assets/main/config-undangan-web.json")
        .then(response => response.json())
        .then(config => {
            apiUrl = config.apiUrl;
            console.log("API URL Loaded:", apiUrl);
            if (callback) callback();
        })
        .catch(error => console.error("Error fetching config:", error));
}

// ==============================
// 2. Fungsi Utama
// ==============================

// Ambil Data Ucapan
function getDataUcapan() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }

    const idClient = document.getElementById("ucapan-id").value;

    fetch(`${apiUrl}?action=readUcapan&idclient=${idClient}`)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            const divUcapan = document.getElementById("div-ucapan");
            divUcapan.innerHTML = "";

            data.forEach(row => {
                const div = document.createElement("div");
                div.className = "mb-2";
                div.style.borderBottom = "1px dotted #ccc";
                div.innerHTML = `
                    <div style='text-align:left; padding:20px;'>
                        <p><i>"${row[3]}"</i></p>
                        — <strong>${row[2]}<strong>&nbsp;&nbsp;&nbsp;<span class="text-muted" style="font-size:7pt;">at ${row[4]})</span>
                    </div>
                `;
                divUcapan.appendChild(div);
            });
        })
        .catch(error => console.error("Error fetching data", error));
}

// Kirim Data Ucapan
function postDataUcapan() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }

    const formattedDate = new Date().toLocaleDateString('id-ID');
    const d1 = document.getElementById("ucapan-id").value;
    const d2Input = document.getElementById("ucapan-namalengkap");
    const d3Input = document.getElementById("ucapan-isiucapan");
    const d2 = d2Input.value.trim();
    const d3 = d3Input.value.trim();

    if (!d2 || !d3) {
        alert("Nama lengkap dan isi ucapan harus diisi.");
        return;
    }

    const url = `${apiUrl}?action=createUcapan&d1=${encodeURIComponent(d1)}&d2=${encodeURIComponent(d2)}&d3=${encodeURIComponent(d3)}&d4=${encodeURIComponent(formattedDate)}`;

    fetch(url)
        .then(response => response.text())
        .then(message => {
            alert(message);
            getDataUcapan();

            d2Input.value = "";
            d3Input.value = "";

            const formContainer = document.getElementById("form-kirim-ucapan");
            const successMessage = document.getElementById("suksesKirimUcapan");
            if (formContainer) formContainer.style.display = "none";
            if (successMessage) successMessage.style.display = "block";
        })
        .catch(error => console.error("Error posting data:", error));
}

// Kirim Data RSVP
function kirimKonfirmasiKehadiran() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }

    const formattedDate = new Date().toLocaleDateString('id-ID');
    const d1 = document.getElementById("ucapan-id").value;
    const namaInput = document.getElementById("nama_konfirmasi_kehadiran");
    const jumlahInput = document.getElementById("jumlah_konfirmasi_kehadiran");
    const kehadiranChecked = document.querySelector("input[name='info_konfirmasi_kehadiran']:checked");
    const d2 = namaInput.value.trim();
    const d3 = kehadiranChecked ? kehadiranChecked.value : "";
    const d4 = jumlahInput.value.trim();

    if (!d2 || !d3 || !d4) {
        alert("Nama, konfirmasi kehadiran, dan jumlah tamu harus diisi.");
        return;
    }

    const url = `${apiUrl}?action=createRSVP&d1=${encodeURIComponent(d1)}&d2=${encodeURIComponent(d2)}&d3=${encodeURIComponent(d3)}&d4=${encodeURIComponent(d4)}&d5=${encodeURIComponent(formattedDate)}`;

    fetch(url)
        .then(response => response.text())
        .then(message => {
            alert(message);
            namaInput.value = "";
            jumlahInput.value = "";

            const formContainer = document.getElementById("form-konfirmasi-kehadiran");
            const successMessage = document.getElementById("suksesKonfirmasiKehadiran");
            if (formContainer) formContainer.style.display = "none";
            if (successMessage) successMessage.style.display = "block";
        })
        .catch(error => console.error("Error posting data:", error));
}

// ==============================
// 3. DOM Loaded Event
// ==============================

document.addEventListener("DOMContentLoaded", function () {
    // Tampilkan nama tamu dari URL
    const namaTamuEl = document.getElementById("nama_tamu_undangan");
    if (namaTamuEl) {
        namaTamuEl.append(getParameterByName('tamu'));
    }

    // Load konfigurasi & ambil data ucapan
    loadConfigUndangan(() => {
        getDataUcapan();
    });

    // Event klik tombol kirim ucapan
    const btnKirimUcapan = document.getElementById("ucapan-btnkirim");
    if (btnKirimUcapan) {
        btnKirimUcapan.addEventListener("click", postDataUcapan);
    }

    // Event klik tombol simpan RSVP
    const btnSimpanRSVP = document.getElementById("simpanKonfirmasiKehadiran");
    if (btnSimpanRSVP) {
        btnSimpanRSVP.addEventListener("click", kirimKonfirmasiKehadiran);
    }

    // Hapus elemen dengan XPath
    const xpaths = [
        "/html/body/div/div/section[2]/div/div[1]/div/section/div/div/div/div[1]",
        "/html/body/div/div/section/div/div[2]/div/section[1]/div/div/div/div[1]"
    ];
    xpaths.forEach(path => {
        const result = document.evaluate(
            path,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );
        const element = result.singleNodeValue;
        if (element) {
            setTimeout(function(){
				element.remove();
			},1000);
        }
    });
});

// ==============================
// 4. Scroll Handling
// ==============================

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.onload = function () {
    setTimeout(function () {
        const target = document.querySelector('div[data-elementor-id="183279"]');
        if (target) {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, 1600);
};
