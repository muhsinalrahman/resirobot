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
 * Helper
 */

Array.prototype.findData = function (data) {
  if (data instanceof RegExp) {
    return this.filter(item => data.test(item[0]));
  }

  return this.filter(item => {
    return new RegExp(data.replace(/[.*+\-?^${}()|[\]\\\/]/g, "\\$&"), "i").test(item[0]);
  });
}

/**
 * Tracking Resi API
 * 
 * scrapping dari https://trackingresi.com/
 */

class Resi {
  constructor() { }

  find(courier, receipt) {
    this.kurir = String(courier);
    this.resi = String(receipt);

    let data = this.getTables();
    if (!data) {
      return "Server sedang sibuk atau nomor resi tidak ditemukan, Silahkan coba kembali beberapa saat lagi.";
    }

    let detail = data[0];
    let trip = this.sortDataByDate(data[1]);

    let result = `<b>Data ditemukan!</b>

<b>📮 Kode Resi:</b> <code>${detail.findData("resi")[0][1]}</code>
<b>👤 Jasa Pengiriman:</b> ${detail.findData("kurir")[0][1]}

<b>📤 Pengirim:</b> ${detail.findData("nama pengirim")[0][1]}
<b>📥 Penerima:</b> ${detail.findData("nama penerima")[0][1]}

<b>📦 Status:</b> ${detail.findData("status kirim")[0][1]}`;

    let penerima = detail.findData(/penerima (barang|paket)/i);
    if (penerima.length > 0 && penerima[0][1] !== "") {
      penerima = penerima[0][1];
      result += `\n<b>📫 Yang Menerima:</b> ${penerima}`;
    } else {
      penerima = "-";
    }

    result += "\n\n<b>👣 Jejak Pengiriman:</b>\n\n";

    for (let i = 0; i < trip.length; i++) {
      result += "📆 " + this.formatDate(trip[i][0]) + "\n";
      result += " └ " + (trip[i][1] !== "" ? trip[i][1] : detail.findData("status kirim")[0][1]) + "\n";
    }

    return result;
  }

  getTables() {
    let url = `https://${this.kurir}.trackingresi.com/`
    let options = {
      "method": "POST",
      "payload": {
        "courier": this.kurir,
        "resi": this.resi
      }
    }

    let response = UrlFetchApp.fetch(url, options);
    let document = Drive.Files.insert({
      "title": "tempResiDocument",
      "mimeType": MimeType.GOOGLE_DOCS
    }, response.getBlob()).id;

    let tables = DocumentApp.openById(document).getBody().getTables();
    let result = tables.map(table => {
      let values = [];
      for (let row = 0; row < table.getNumRows(); row++) {
        let data = [];
        let columns = table.getRow(row);
        for (let column = 0; column < columns.getNumCells(); column++) {
          data.push(columns.getCell(column).getText());
        }

        values.push(data);
      }

      return values;
    });

    Drive.Files.remove(document);

    if (result.length > 0) {
      return result;
    }

    return false;
  }

  getCourier() {
    const logistic = {
      "jne": "JNE Express",
      "tiki": "TIKI",
      "pos": "POS Indonesia",
      "jnt": "J&T Express",
      "lion": "Lion Parcel",
      "ninja": "Ninja Xpress",
      "sicepat": "SiCepat Express",
      "anteraja": "AnterAja",
      "dse": "21 Express",
      "wahana": "Wahana",
      "first": "First Logistics",
      "pandu": "Pandu Logistics",
      "jet": "Jet Express",
      "pcp": "Priority Cargo & Package",
      "rex": "Royal Express",
      "rpx": "RPX Indonesia",
      "sap": "SAP Express Courier",
      "idl": "IDL Cargo",
      "idexpress": "IDexpress"
    }

    let result = "<b>🚚 Jasa Pengiriman Tersedia:</b>\n\n";

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
    let date = Utilities.formatDate(new Date(d), "Asia/Jakarta", "dd MMMM yyyy HH:mm");
    return LanguageApp.translate(date, "en", "id");
  }

  sortDataByDate(arr) {
    return arr.slice(1).sort((a, b) => {
      if (a[0] === b[0])
        return 0;
      else
        return (a[0] < b[0]) ? -1 : 1;
    });
  }
}
