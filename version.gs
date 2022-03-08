/**
 * Pencarian Resi
 * 
 * berdasarkan https://trackingresi.com/
 * 
 * merupakan bot melacak kiriman barang dengan cepat dan mudah tanpa menu yang berbelit belit.
 * 
 * Kota Palembang, 20 Februari 2022
 */

const app = {
  "name": "Pencarian Resi",                // ganti nama bot
  "username": "resirobot",                 // ganti username bot
  "version": "2.3",                        // ganti versi bot
  "site": "https://trackingresi.com/",
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
