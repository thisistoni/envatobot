const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions/index.js");
require('dotenv').config();


const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION); // fill this later with the value from session.save()

async function getDownloadLinkFromEnvato(envatoLink) {
    try{
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });
    
        await client.start({
            phoneNumber: async () => await input.text("Bitte gib deine Telefonnummer ein: "),
            password: async () => await input.text("Bitte gib dein Passwort ein: "),
            phoneCode: async () => await input.text("Bitte gib den Code ein, den du erhalten hast: "),
            onError: (err) => console.log(err),
        });
    
        await client.sendMessage('@eedownloader_bot', { message: envatoLink });
    
        // Warte auf die Antwort vom Envato Bot
        let downloadLinkMessage = null;
        let downloadCountMessage = null;
        while (!downloadLinkMessage || !downloadCountMessage) {
            let messages = await client.getMessages('@eedownloader_bot', { limit: 2 });
            let message = messages[0].message;
            console.log(message);
            if (message.startsWith('https://l.envato-download.com/')) {
                downloadLinkMessage = message;
                if(downloadCountMessage==null && messages[1].message.includes('You’ve downloaded'))
                {
                    downloadCountMessage = messages[1].message;

                }
            } else if (message.includes('You’ve downloaded')) {
                downloadCountMessage = message;
            }
    
            // Kurze Pause, um das Polling-Intervall einzustellen
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        client.disconnect();
        console.log("Client disconnected:"+client.disconnected);
    
    // Nach dem Aufrufen von client.disconnect()
    client._destroyed = true;
        await new Promise(resolve => setTimeout(resolve, 9000));
    
        let answers= [downloadLinkMessage];
        // Extrahiere die Anzahl der Downloads aus der Nachricht
        const downloadCount = downloadCountMessage.match(/downloaded (\d+)/)[1];
        answers.push(downloadCount+" von 50 Dateien heute heruntergeladen");
        console.log(answers[0]);
        console.log(answers[1]);
    
        return answers;
    }
 catch (error) {
    console.error("Fehler beim Abrufen des Download-Links: ", error);
    return ["Es gab einen Fehler beim Abrufen des Download-Links. Bitte versuche es später noch einmal."];
}
   
}

module.exports = { getDownloadLinkFromEnvato };
