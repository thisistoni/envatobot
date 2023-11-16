const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { getDownloadLinkFromEnvato } = require('./vvs.js'); // Stelle sicher, dass der Pfad korrekt ist
require('dotenv').config();



// Ersetze dies mit deinem eigenen Bot-Token
const token = process.env.BOTTOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminUsername = 'vvsclassic'; // Ersetze dies mit deinem Telegram-Benutzernamen

const userFilePath = path.join(__dirname, 'users.txt');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Moin! Schick mir einen Envato Link und ich gebe dir die Datei!");
});

bot.onText(/\/adduser (.+)/, (msg, match) => {
    if (msg.from.username === adminUsername) {
        const username = match[1];
        addUser(username);
        bot.sendMessage(msg.chat.id, `${username} wurde hinzugefügt.`);
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});

bot.onText(/\/removeuser (.+)/, (msg, match) => {
    if (msg.from.username === adminUsername) {
        const username = match[1];
        removeUser(username);
        bot.sendMessage(msg.chat.id, `${username} wurde entfernt.`);
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});

bot.onText(/https:\/\/elements.envato.com\/(.+)/, async (msg, match) => {
    const envatoLink = match[0];
    if (isUserAuthorized(msg.from.username)) {
       bot.sendMessage(msg.chat.id, "Wird heruntergeladen...");

        const answers = await getDownloadLinkFromEnvato(envatoLink);
        if (answers.length === 1 && answers[0].startsWith("Es gab einen Fehler")) {
            bot.sendMessage(msg.chat.id, answers[0]);
        } else {
            bot.sendMessage(msg.chat.id, answers[0]);
            bot.sendMessage(msg.chat.id, answers[1]);
            bot.sendMessage(msg.chat.id, "Der Download-Link ist 30 Sekunden gültig.")
        }   
    
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Service zu nutzen.");
    }
});


bot.onText(/\/listusers/, (msg) => {
    if (msg.from.username === adminUsername) {
        let users = getUsers();
        let response = users.length > 0 ? "Gespeicherte Nutzer: " + users.join(', ') : "Keine Nutzer gespeichert.";
        bot.sendMessage(msg.chat.id, response);
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});


function addUser(username) {
    let users = getUsers();
    if (!users.includes(username)) {
        users.push(username);
        fs.writeFileSync(userFilePath, users.join('\n'), 'utf8');
    }
}

function removeUser(username) {
    let users = getUsers();
    users = users.filter(user => user !== username);
    fs.writeFileSync(userFilePath, users.join('\n'), 'utf8');
}

function getUsers() {
    if (!fs.existsSync(userFilePath)) {
        return [];
    }
    return fs.readFileSync(userFilePath, 'utf8').split('\n');
}

function isUserAuthorized(username) {
    let users = getUsers();
    return users.includes(username);
}



