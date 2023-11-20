const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { getDownloadLinkFromEnvato } = require('./vvs.js'); // Stelle sicher, dass der Pfad korrekt ist
require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI; // Deine MongoDB URI
const client = new MongoClient(mongoUri);

const dbName = 'EnvatoUserDB'; // Setze hier deinen Datenbanknamen
let db;
let isDbConnected = false;  // Neue Variable, um den DB-Verbindungsstatus zu verfolgen



// Ersetze dies mit deinem eigenen Bot-Token
const token = process.env.BOTTOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminUsername = 'vvsclassic'; // Ersetze dies mit deinem Telegram-Benutzernamen
const adminChatID = 5741007292;



// Verbinde mit der MongoDB-Datenbank
async function connectToMongo() {
    await client.connect();
    db = client.db(dbName);
    isDbConnected = true;  // Setze die Variable auf true, wenn die Verbindung erfolgreich ist

    console.log('Verbunden mit MongoDB');
}

connectToMongo();

//BASIC COMMANDS

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Moin! Schick mir einen Envato Link und ich gebe dir die Datei!");

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Zur Whitelist hinzufügen', callback_data: 'adduser ' + msg.from.username+' '+msg.from.id}]
            ]
        }
    };

    bot.sendMessage(adminChatID, "@" + msg.from.username + " hat den Bot gestartet. Zur Whitelist hinzufügen?", opts);
});

bot.onText(/\/help/, async (msg) => {

    if (!isDbConnected) {
        return;
    }
    if (await isUserAuthorized(msg.from.username)) {
        bot.sendMessage(msg.chat.id,
            "*ℹ️ HILFE*\n\n" +
            "*Wie funktioniert der Bot?*\n\n" +
            "1\\. Besuche die Envato\\-Website und wähle das Asset aus, das du herunterladen möchtest\\.\n" +
            "2\\. Kopiere den Link zum gewünschten Produkt\\.\n" +
            "_Beispiel: https://elements\\.envato\\.com/de/protesting\\-man\\-curious\\-situation\\-meme\\-expression\\-8JSMVCV\n_" +
            "3\\. Sende diesen Link an den Bot\\.\n" +
            "4\\. Du erhältst bald darauf deinen Download\\-Link\\.\n\n" +
            "*Wie viele Downloads sind möglich?*\n\n" +
            "Es gibt ein tägliches Limit von insgesamt 50 Downloads für alle Nutzer des Bots \\(nicht pro Nutzer\\)\\.\n\n" +
            "Bei Fragen oder Problemen kannst du dich an @thisistoni wenden\\.\n\n" +
            "Viel Spaß beim Nutzen des Bots\\! 🚀",
            { parse_mode: 'MarkdownV2' });

    }
    else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Service zu nutzen.");
    }
});

bot.onText(/\/donate/, async (msg) => {

    if (!isDbConnected) {
        return;
    }
    if (await isUserAuthorized(msg.from.username)) {
        bot.sendMessage(msg.chat.id,
            "*Donations für den Bot*\n\n" +
            "Der Betrieb des Bots kostet 7€ im Monat\\. Falls du ein paar Euronen übrig hast und den Bot unterstützen willst, wäre das super\\. Jeder Beitrag, auch wenn es nur 1€ ist, hilft alles am Laufen zu halten\\.\n\n" +
            "No Stress, der Bot bleibt natürlich kostenlos\\. Aber falls du was beitragen willst, hier ist der Link\\.\n\n" +
            "[Donationlink](https://revolut\\.me/antoniobeslic)",  // Korrektes Escaping des Links
            { parse_mode: 'MarkdownV2' });

    }
    else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Service zu nutzen.");
    }
});

//ADMIN COMMANDS

bot.onText(/\/adduser (.+)/, async (msg, match) => {
    if (!isDbConnected) {
        return;
    }
    if (msg.from.username === adminUsername) {
        const username = match[1];
        try {
            await addUser(username);
            bot.sendMessage(msg.chat.id, `${username} wurde hinzugefügt.`);
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Benutzers: ", error);
            bot.sendMessage(msg.chat.id, "Es gab einen Fehler beim Hinzufügen des Benutzers.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});


bot.onText(/\/removeuser (.+)/, async (msg, match) => {
    if (!isDbConnected) {
        return;
    }
    if (msg.from.username === adminUsername) {
        const username = match[1];
        try {
            await removeUser(username);
            bot.sendMessage(msg.chat.id, `${username} wurde entfernt.`);
        } catch (error) {
            console.error("Fehler beim Entfernen des Benutzers: ", error);
            bot.sendMessage(msg.chat.id, "Es gab einen Fehler beim Entfernen des Benutzers.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});

bot.onText(/\/listusers/, async (msg) => {
    if (!isDbConnected) {
        return;
    }
    if (msg.from.username === adminUsername) {
        try {
            let users = await getUsers();
            let response = "";
            if (users.length > 0) {
                response = "Gespeicherte Nutzer:\n";
                users.forEach((user, index) => {
                    response += `${index + 1}. @${user}\n`;
                });
            } else {
                response = "Keine Nutzer gespeichert.";
            }
            bot.sendMessage(msg.chat.id, response);
        } catch (error) {
            console.error("Fehler beim Abrufen der Benutzerliste: ", error);
            bot.sendMessage(msg.chat.id, "Es gab einen Fehler beim Abrufen der Benutzerliste.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});

bot.onText(/\/shout (.+)/, async (msg, match) => {
    if (!isDbConnected) {
        return;
    }
    if (msg.from.username === adminUsername) {
        const message = match[1];
        try {
            let users = await getUsersWithChatId();
            let count = 0;

            users.forEach(async user => {
                if (user.chatId) {
                    bot.sendMessage(user.chatId, message);
                    count++;

                }
            });

            bot.sendMessage(msg.chat.id, `Nachricht wurde an ${count} Nutzer gesendet.`);
        } catch (error) {
            console.error("Fehler beim Senden der Nachricht an alle Benutzer: ", error);
            bot.sendMessage(msg.chat.id, "Es gab einen Fehler beim Senden der Nachricht.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "Du hast keine Berechtigung, diesen Befehl zu nutzen.");
    }
});

//MAIN-FUNKTION

bot.onText(/https:\/\/elements.envato.com\/(.+)/, async (msg, match) => {
    if (!isDbConnected) {
        return;
    }
    const envatoLink = match[0];
    if (await isUserAuthorized(msg.from.username)) {
        bot.sendMessage(msg.chat.id, "Download läuft...⏳");
        await updateChatIdForAuthorizedUser(msg.from.username, msg.chat.id);

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

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Zur Whitelist hinzufügen', callback_data: 'adduser ' + msg.from.username+' '+msg.from.id}]
                ]
            }
        };

        bot.sendMessage(adminChatID, "@" + msg.from.username + " hat versucht, etwas herunterzuladen. Zur Whitelist hinzufügen?", opts);
    }
});




//METHODEN, ABFRAGEN ETC.


// Hinzufügen eines Benutzers zur Datenbank
async function addUser(username) {
    const collection = db.collection('users');
    const userExists = await collection.findOne({ username });
    if (!userExists) {
        await collection.insertOne({ username });
    }
}

// Entfernen eines Benutzers aus der Datenbank
async function removeUser(username) {
    const collection = db.collection('users');
    await collection.deleteOne({ username });
}

// Überprüfen, ob ein Benutzer in der Datenbank vorhanden ist
async function isUserAuthorized(username) {


    const collection = db.collection('users');
    const user = await collection.findOne({ username });
    return user != null;
}



async function getUsers() {
    const collection = db.collection('users');
    try {
        const users = await collection.find({}).toArray();
        return users.map(user => user.username);
    } catch (error) {
        console.error("Fehler beim Abrufen der Benutzer: ", error);
        return [];
    }
}

// Allgemeine Methode zum Speichern der Chat-ID eines autorisierten Nutzers
async function updateChatIdForAuthorizedUser(username, chatId) {
    const collection = db.collection('users');
    const user = await collection.findOne({ username });

    if (user) {
        await collection.updateOne({ username }, { $set: { chatId } });
    }
}



async function getUsersWithChatId() {
    const collection = db.collection('users');
    try {
        return await collection.find({ chatId: { $exists: true } }).toArray();
    } catch (error) {
        console.error("Fehler beim Abrufen der Nutzer mit Chat-IDs: ", error);
        return [];
    }
}



//CALL BACK QUERY
bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;

    if (!isDbConnected) {
        bot.sendMessage(adminChatID, "Datenbank ist derzeit nicht verbunden.");
        return;
    }

    if (action.startsWith('adduser ')) {
        const username = action.split(' ')[1];
        const chatid= action.split(' ')[2];

        if (callbackQuery.from.username === adminUsername) {
            try {
                await addUser(username);
                bot.sendMessage(adminChatID, `${username} wurde hinzugefügt.`);
                bot.sendMessage(chatid, `Du hast Zugang zum Bot erhalten!`);

            } catch (error) {
                console.error("Fehler beim Hinzufügen des Benutzers: ", error);
                bot.sendMessage(adminChatID, `Es gab einen Fehler beim Hinzufügen des Benutzers ${username}.`);
            }
        } else {
            bot.sendMessage(adminChatID, `Du hast keine Berechtigung, diesen Befehl zu nutzen.`);
        }
    }
});

process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});

