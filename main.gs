const bot = new Telegram(env.token);

function setWebhook() {
    let url = env.webhook;
    bot.setWebhook(url);
}

const doPost = e => {
    try {
        let update = JSON.parse(e.postData.contents);
        if (typeof update.inline_query !== "undefined") {
            return inlineQuery(update.inline_query);
        }

        if (typeof update.message !== "undefined") {
            return message(update.message);
        }
    } catch (e) {
        bot.sendMessage(env.admin, e.message);
    }
}

const inlineQuery = update => {
    let inline_query_id = update.id;
    let text = update.query;
    if (text === "") return false;

    let data;
    if (/(.+)\#(.+)/i.test(text)) {
        data = text.split("#");
    } else {
        return false;
    }

    let courier = data[0].toLowerCase();
    let receipt = data[1];
    let content = new Resi().find(courier, receipt);
    if (!content) return false;
    let result = [{
        "type": "article",
        "id": text,
        "title": "Lacak/Cek Paket Pengiriman Barang",
        "message_text": content,
        "parse_mode": "HTML",
        "description": `cek resi ${receipt} dengan ekspedisi ${courier}`,
        "disable_web_page_preview": true
    }];

    return bot.answerInlineQuery(inline_query_id, result);
}

const message = update => {
    if (update.text) {
        let match;
        let text = update.text;
        let chat_id = update.chat.id;
        let message_id = update.message_id;

        if (new RegExp(`^\/(start|help|bantuan)(?:@${env.username})?$`, "i").exec(text)) {
            let reply = "<b>🤖" + app.name + "</b>\n";
            reply += `<code>versi ${app.version}</code>\n\n`;
            reply += "merupakan bot pelacakan atau pengecekan resi paket pengiriman barang yang dikirim melalui ";
            reply += "kurir JNE, J&T, SiCepat, AnterAja, POS, TIKI, Wahana & Lion parcel.\n\n";
            reply += "Penggunaan:\n\n";
            reply += "<code>/lacak [kode jasa pengiriman]#[kode resi]</code>\n";
            reply += "contoh: <code>/lacak pos#123456789098</code>\n\n";
            reply += "Mode <em>Inline</em> (bisa darimana saja)\n\n";
            reply += "<code>@resirobot [kode jasa pengiriman]#[kode resi]</code>\n";
            reply += "contoh: <code>@resirobot jnt#JP098765432</code>\n\n";
            reply += "👨🏻‍💻 Author: " + app.author;

            return bot.sendMessage(chat_id, reply);
        }

        if (new RegExp(`^\/ping(?:@${env.username})?$`, "i").exec(text)) {
            let start = +new Date();
            let ping = UrlFetchApp.fetch(app.site);
            let end = +new Date();
            let result = Math.abs(start - end);
            let reply = `<b>PING❗️❗️❗️</b>\n⏳ <code>${result}ms</code>`;

            return bot.sendMessage(chat_id, reply, message_id);
        }

        if (match = new RegExp(`^\/lacak(?:@${env.username})?\\s(.+)\#(.+)`, "gi").exec(text)) {
            let courier = match[1].toLowerCase();
            let receipt = match[2];
            if (typeof courier === "undefined" || typeof receipt === "undefined") return false;

            let reply = new Resi().find(courier, receipt);
            return bot.sendMessage(chat_id, reply);
        }

        if (new RegExp(`^\/(ekspedisi|jasa)(?:@${env.username})?$`, "i").exec(text)) {
            let reply = new Resi().courierList();
            return bot.sendMessage(chat_id, reply, message_id);
        }
    }

    return false;
}
