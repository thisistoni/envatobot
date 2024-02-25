const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions/index.js");
require('dotenv').config();


const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION); // fill this later with the value from session.save()

async function getDownloadLinkFromEnvato(envatoLink) {
    try {
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.start({
            phoneNumber: async () => await input.text("Bitte gib deine Telefonnummer ein: "),
            password: async () => await input.text("Bitte gib dein Passwort ein: "),
            phoneCode: async () => await input.text("Bitte gib den Code ein, den du erhalten hast: "),
            onError: (err) => console.log(err),
        });

        await client.sendMessage('@AwesomeDownloaderBot', { message: envatoLink });

        
        // Warte auf die Antwort vom AwesomeDownloaderBot
        const startTime = Date.now();   
        
        let downloadLinkMessage = null;
        let downloadCountMessage = null;
        while (!downloadLinkMessage || !downloadCountMessage) {
            if (Date.now() - startTime > 30000) {
                console.log('Zeitlimit erreicht, Abbruch der Schleife');
                return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];

            }
            let messages = await client.getMessages('@AwesomeDownloaderBot', { limit: 2 });
            let message = messages[0].message;
            console.log('Current message: '+message);
            if (message.startsWith('https://yourl.cc/')) {
                downloadLinkMessage = message;
                if (downloadCountMessage == null && messages[1].message.includes('Your download link is')) {
                    downloadCountMessage = messages[1].message;
                    console.log('downloadCountMessage: ', downloadCountMessage);

                }
            } 

            // Kurze Pause, um das Polling-Intervall einzustellen
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        client.disconnect();

        // Nach dem Aufrufen von client.disconnect()
        client._destroyed = true;


        let answers = [downloadLinkMessage];
        // Extrahiere die Anzahl der Downloads aus der Nachricht
        const downloadCount = downloadCountMessage.match(/plan has (\d+)/)[1];
        answers.push(downloadCount + " von 50 Dateien wurden heute heruntergeladen. 📂");


        return answers;
    }
    catch (error) {
        console.error("Fehler beim Abrufen des Download-Links: ", error);
        return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];
    }

}

async function getDownloadLinkFromFreepik(freepikLink) {
    try {
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.start({
            phoneNumber: async () => await input.text("Bitte gib deine Telefonnummer ein: "),
            password: async () => await input.text("Bitte gib dein Passwort ein: "),
            phoneCode: async () => await input.text("Bitte gib den Code ein, den du erhalten hast: "),
            onError: (err) => console.log(err),
        });

        await client.sendMessage('@AwesomeDownloaderBot', { message: freepikLink });

        
        // Warte auf die Antwort vom AwesomeDownlaoderBot
        const startTime = Date.now();   
        
        let downloadLinkMessage = null;
        while (!downloadLinkMessage) {
            if (Date.now() - startTime > 30000) {
                console.log('Zeitlimit erreicht, Abbruch der Schleife');
                return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];

            }
            let messages = await client.getMessages('@AwesomeDownloaderBot', { limit: 1 });
            let message = messages[0].message;
            console.log('Current message: '+message);
            if (message.includes('https://yourl.cc/')) {
                downloadLinkMessage = message;
            } 

            // Kurze Pause, um das Polling-Intervall einzustellen
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        client.disconnect();

        // Nach dem Aufrufen von client.disconnect()
        client._destroyed = true;


        let answers = [downloadLinkMessage];
        // Extrahiere die Anzahl der Downloads aus der Nachricht
        
        return answers;
    }
    catch (error) {
        console.error("Fehler beim Abrufen des Download-Links: ", error);
        return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];
    }

}

async function getDownloadLinkFromFlaticon(flaticonLink) {
    try {
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.start({
            phoneNumber: async () => await input.text("Bitte gib deine Telefonnummer ein: "),
            password: async () => await input.text("Bitte gib dein Passwort ein: "),
            phoneCode: async () => await input.text("Bitte gib den Code ein, den du erhalten hast: "),
            onError: (err) => console.log(err),
        });

        await client.sendMessage('@AwesomeDownloaderBot', { message: flaticonLink });

        
        // Warte auf die Antwort vom AwesomeDownloaderBot
        const startTime = Date.now();   
        
        let downloadLinkMessage = null;
        while (!downloadLinkMessage) {
            if (Date.now() - startTime > 30000) {
                console.log('Zeitlimit erreicht, Abbruch der Schleife');
                return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];

            }
            let messages = await client.getMessages('@AwesomeDownloaderBot', { limit: 2 });
            let message = messages[0].message;
            console.log('Current message: '+message);
            if (message.includes('https://awesome-dl.com')&& messages[1].message.includes('https://cdn-icons-png')) {
                downloadLinkMessage = messages[1].message;
                
            } 

            // Kurze Pause, um das Polling-Intervall einzustellen
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        client.disconnect();

        // Nach dem Aufrufen von client.disconnect()
        client._destroyed = true;


        let answers = [downloadLinkMessage];
      


        return answers;
    }
    catch (error) {
        console.error("Fehler beim Abrufen des Download-Links: ", error);
        return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];
    }

}

module.exports = { getDownloadLinkFromEnvato, getDownloadLinkFromFreepik, getDownloadLinkFromFlaticon };
