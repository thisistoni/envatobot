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



// Ersetze dies mit deinem eigenen Bot-Token
const token = process.env.BOTTOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminUsername = 'vvsclassic'; // Ersetze dies mit deinem Telegram-Benutzernamen



// Verbinde mit der MongoDB-Datenbank
async function connectToMongo() {
    await client.connect();
    db = client.db(dbName);
    console.log('Verbunden mit MongoDB');
}

connectToMongo();

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Moin! Schick mir einen Envato Link und ich gebe dir die Datei!");
});

bot.onText(/\/adduser (.+)/, async (msg, match) => {
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


bot.onText(/https:\/\/elements.envato.com\/(.+)/, async (msg, match) => {
    const envatoLink = match[0];
    if (await isUserAuthorized(msg.from.username)) {
       bot.sendMessage(msg.chat.id, "Wird heruntergeladen...");
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
    }
});


bot.onText(/\/listusers/, async (msg) => {
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

bot.onText(/\/shout (.+)/, async (msg, match) => {
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

async function getUsersWithChatId() {
    const collection = db.collection('users');
    try {
        return await collection.find({ chatId: { $exists: true } }).toArray();
    } catch (error) {
        console.error("Fehler beim Abrufen der Nutzer mit Chat-IDs: ", error);
        return [];
    }
}


process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});

