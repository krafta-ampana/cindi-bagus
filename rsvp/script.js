var path = window.location.pathname;
var segments = path.split('/').filter(Boolean);
var idClient = segments.length >= 2 ? segments[segments.length - 2] : '';
var namaClient = idClient.split('-').map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); }).join(' & ');
$("#nama-client").text(namaClient);

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

// Ambil Data Ucapan 
function getDataUcapan() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }
    $.ajax({
        url: `${apiUrl}?action=readUcapan&idclient=${idClient}`,
        type: "GET",
        dataType: "json",
        success: function (data) {
            let divUcapan = $("#div-ucapan");
            divUcapan.empty();

            if (data.length === 0) {
                divUcapan.append(
                    `<p class="text-center text-muted">Belum ada ucapan untuk ditampilkan</p>`
                );
            } else {
                data.forEach(row => {
                    divUcapan.append(
                        `
                        <span class="text-muted float-end" style="font-size:8pt;">${row[4]}</span>
                        <blockquote class="blockquote mb-0 p-4 mb-3">
                            <p class="font-serif fst-italic" style="margin-bottom: 25px;">"${row[3]}"</p>
                            <footer class="blockquote-footer">
                                <cite title="Source Title" class="font-sans">${row[2]}</cite>
                            </footer>
                        </blockquote><hr>			
                        `
                    );
                });
            }
        },
        error: function (error) {
            console.error("Error fetching data", error);
        }
    });
}

// Ambil Data Ucapan
function getDataRSVP() {
    if (!apiUrl) {
        console.error("API URL belum tersedia!");
        return;
    }
    $.ajax({
        url: `${apiUrl}?action=readRSVP&idclient=${idClient}`,
        type: "GET",
        dataType: "json",
        success: function (data) {
            let divRsvp = $("#div-rsvp");
            divRsvp.empty();

            if (data.length === 0) {
                divRsvp.append(
                    `<tr>
                        <td colspan="4" class="text-center">Belum ada data untuk ditampilkan</td>
                    </tr>`
                );
            } else {
                data.forEach((row, index) => {
                    divRsvp.append(
                        `<tr>
                            <td>${index + 1}</td>
                            <td>${row[2]}</td>
                            <td>${row[3]}</td>
                            <td>${row[4]}</td>
                        </tr>`
                    );
                });
            }
        },
        error: function (error) {
            console.error("Error fetching data", error);
        }
    });
}


function copyTableToClipboard() {
    const table = document.querySelector(".table");
    if (!table) return;

    const range = document.createRange();
    range.selectNode(table);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        const successful = document.execCommand("copy");
        if (successful) {
            alert("Tabel berhasil disalin ke clipboard!");
        } else {
            alert("Gagal menyalin tabel.");
        }
    } catch (err) {
        alert("Terjadi kesalahan saat menyalin.");
        console.error(err);
    }

    selection.removeAllRanges();
}


// Jalankan Saat Dokumen Siap
$(document).ready(function () {
    loadConfigUndangan(() => {
        getDataUcapan();
        getDataRSVP();
    });
});