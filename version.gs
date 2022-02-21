/**
 * Lacak/Cek Paket Pengiriman Barang
 * 
 * berdasarkan https://pluginongkoskirim.com/cek-resi/
 * 
 * merupakan bot pelacakan atau pengecekan resi paket pengiriman barang yang dikirim melalui kurir
 * JNE, J&T, SiCepat, AnterAja, POS, TIKI, Wahana & Lion parcel.
 * 
 * Kota Palembang, 20 Februari 2022
 */

const app = {
    "name": "Lacak/Cek Paket Pengiriman Barang",                // ganti nama bot
    "username": "resirobot",                                    // ganti username bot
    "version": "1.9",                                           // ganti versi bot
    "site": "https://pluginongkoskirim.com/cek-resi/",
    "author": "@kreasisaya"
}

const env = {
    "token": "BOT_API_TOKEN",                                   // bot api token dari @botfather
    "username": app.username,
    "admin": "USER_LOG_ID",                                     // user id untuk menjadi admin
    "webhook": "WEB_APP_URL"                                    // web app url dari deployment
}

function doGet(e) {
    return HtmlService.createHtmlOutput("Cari Paket Bot Aktif!");
}
