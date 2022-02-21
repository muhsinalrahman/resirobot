/**
 * Telegram classes
 *
 * For request to telegram api client
 */

class Telegram {
    constructor(token) {
        this.token = token;
        this.apiUrl = "https://api.telegram.org"
    }

    callApi(method, data) {
        let payload = Object.entries(data)
            .filter(([_, v]) => v != null)
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

        let params = {
            "method": "POST",
            "contentType": "application/json",
            "payload": JSON.stringify({
                "method": method,
                ...payload
            })
        }

        try {
            let response = UrlFetchApp.fetch(`${this.apiUrl}/bot${this.token}/`, params);
            if (response.getResponseCode() == 200) {
                let result = response.getContentText();
                return JSON.parse(result);
            }
        } catch (e) {
            return false;
        }
    }

    setWebhook(url = "") {
        console.log(this.callApi("setWebhook", {
            url: url
        }));
    }

    sendMessage(chat_id, text, reply_to_message_id = false) {
        return this.callApi("sendMessage", {
            chat_id,
            text,
            reply_to_message_id,
            "parse_mode": "HTML",
            "disable_web_page_preview": true,
            "allow_sending_without_reply": true
        });
    }

    answerInlineQuery(inline_query_id, results) {
        return this.callApi("answerInlineQuery", {
            inline_query_id,
            results,
            "cache_time": 3600
        });
    }
}

/**
 * Ongkos Kirim API
 * 
 * main request to https://pluginongkoskirim.com/cek-resi/
 */
class Resi {
    constructor() { }

    find(courier, receipt) {
        let url = "https://pluginongkoskirim.com/cek-tarif-ongkir/front/resi-amp?__amp_source_origin=https%3A%2F%2Fpluginongkoskirim.com";
        let options = {
            "method": "POST",
            "contentType": "application/json",
            "payload": JSON.stringify({
                kurir: courier,
                resi: receipt
            })
        }

        try {
            let result = "";
            let response = UrlFetchApp.fetch(url, options);
            let content = JSON.parse(response.getContentText());

            if (content.error) {
                let error = content.message;
                if (error == "Hanya menerima input angka dan huruf" || error == "Mohon maaf kurir tidak ditemukan") {
                    result += "Mohon maaf kurir tidak ditemukan.\n";
                    result += "Gunakan perintah /ekspedisi untuk melihat jasa pengiriman tersedia.";
                    return result;
                };

                result += error.replace(courier, "<code>" + courier + "</code>");
                return result;
            }

            let data = content.data.detail;
            result += "<b>Data ditemukan!</b>\n\n";
            result += "<b>📮 Kode Resi:</b> <code>" + data.code + "</code>\n";
            result += "<b>👤 Jasa Pengiriman:</b> " + data.kurir[0] + "\n\n";

            if (data.shipper.name !== "") result += "<b>📤 Pengirim:</b> " + data.shipper.name + "\n";
            if (data.consignee.name) result += "<b>📥 Penerima:</b> " + data.consignee.name + "\n";

            result += "<b>📦 Status:</b> " + data.status;
            if (data.current_position !== "") {
                result += "\n<b>📌 Posisi:</b> " + data.current_position;
            }
            if (data.receiver !== "") {
                result += "\n<b>📫 Yang Menerima:</b> " + data.receiver;
            }

            result += "\n\n<b>👣 Jejak Pengiriman:</b>\n\n";
            for (let i = data.history.length - 1; i >= 0; i--) {
                result += "<b>📆 " + this.formatDate(data.history[i].time) + "</b>\n";
                result += " └ " + data.history[i].desc + "\n";
            }

            return result;
        } catch (e) {
            return e.message;
        }
    }

    courierList() {
        let result = "<b>🚚 Jasa Pengiriman Tersedia:</b>\n\n";
        let logistic = {
            "jne": "JNE",
            "jnt": "J&T",
            "lion": "LION Parcel",
            "ninja": "Ninja Xpress",
            "pos": "POS Indonesia",
            "sicepat": "SiCepat",
            "tiki": "Tiki",
            "anteraja": "AnterAja",
            "wahana": "Wahana",
            "trawlbens": "Trawlbens"
        }

        for (const [key, value] of Object.entries(logistic)) {
            result += "» " + value + " - " + key + "\n";
        }

        result += "\n<em>Catatan:</em>\n";
        result += "Kiri = Nama Jasa Pengiriman\n";
        result += "Kanan = Kode Jasa Pengiriman\n";
        result += "Gunakan kode jasa pengiriman ketika ingin melacak atau mengecek resi.";

        return result;
    }

    formatDate(d) {
        let date = Utilities.formatDate(new Date(d), "+0", "dd MMMM yyyy HH:mm:ss");
        return LanguageApp.translate(date, "en", "id");
    }
}
