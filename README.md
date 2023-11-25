# EnvatoBot

## Beschreibung

EnvatoBot ist ein Telegram-Bot, der es Benutzern ermöglicht, Dateien von Envato über einen bezahlten Service herunterzuladen. Der Bot fungiert als Schnittstelle zwischen dem Benutzer und dem Envato-Download-Service.

## Funktionsweise

Der Bot arbeitet in mehreren Schritten:

1. Empfangen von Envato-Links:
- Benutzer senden Envato-Links direkt an den Bot.
- Der Bot prüft, ob der Benutzer in der MongoDB-Datenbank registriert ist.
2. Weiterleitung der Anfrage:
- Bei erfolgreicher Überprüfung leitet der Bot die Anfrage an das vvs.js Skript weiter.
- vvs.js agiert als Client, der mit einem speziellen Telegram-Account verbunden ist, der Zugang zum bezahlten Envato-Service hat.
3. Kommunikation mit dem Envato-Service:
- vvs.js sendet den Envato-Link an den bezahlten Service.
- Der Service verarbeitet den Link und generiert einen Download-Link.
4. Rückgabe des Download-Links:
- Der generierte Download-Link wird von vvs.js zurück an bot.js gesendet.
- bot.js sendet diesen Link dann an den ursprünglichen Benutzer zurück.

## Installation und Setup

Um den EnvatoBot zu installieren und einzurichten, folge diesen Schritten:

1. Repository klonen:
   
`git clone https://github.com/thisistoni/envatobot.git`

`cd envatobot`

2. Abhängigkeiten installieren:
Stelle sicher, dass Node.js auf deinem System installiert ist und führe dann aus:

`npm install`

3. Konfiguration:
Erstelle eine .env-Datei im Hauptverzeichnis des Projekts.
Füge die notwendigen Umgebungsvariablen hinzu, wie z.B. TELEGRAM_BOT_TOKEN, MONGODB_URI, und andere relevante Konfigurationen.

4. Starten des Bots:

`node bot.js`

## Nutzung

So verwenden Benutzer den EnvatoBot:

1. Starten des Bots:
- Öffne Telegram und suche nach dem EnvatoBot.
- Starte eine Konversation mit dem Befehl /start.
2. Envato-Link senden:
- Sende einen gültigen Envato-Link an den Bot.
- Wenn du in der Datenbank registriert bist, wird der Bot den Link verarbeiten und einen Download-Link zurücksenden.
## Beitragen

Wenn du zum EnvatoBot-Projekt beitragen möchtest, kannst du gerne Pull-Requests stellen oder vorhandene Issues bearbeiten.

## Lizenz

Dieses Projekt ist unter der Creative Commons Attribution-NonCommercial 4.0 International Lizenz lizenziert. Diese Lizenz erlaubt anderen, das Werk zu verbreiten, zu remixen, anzupassen und darauf aufzubauen, jedoch nicht kommerziell, und zwar auch dann, wenn die neuen Werke unter der gleichen Lizenz veröffentlicht werden. Die vollständigen Lizenzbedingungen findest du hier: CC BY-NC 4.0 Lizenz.