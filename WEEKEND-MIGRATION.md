# Weekendmigratie V2

Dit draaiboek is bedoeld voor de overgang van de huidige productieversie naar de beveiligde V2. Voer productiehandelingen pas uit wanneer de borden niet meer nodig zijn.

## Vooraf — branch gereedmaken

- [x] V2-branch los van main.
- [x] Provider-neutrale Authentication-helper.
- [x] Adminidentiteit: `meesteryoeran@gmail.com`.
- [x] Nieuw `actuele_status` model zonder datum/tijd/historie.
- [x] E-mail afgesplitst naar `medewerkers_prive`.
- [x] Mededelingen alleen opvragen in lerarenkamer-mode.
- [x] Verjaardagen in V2 uit beveiligde Firestore-collectie lezen.
- [x] Default-deny Security Rules voorbereid.
- [x] Displayrollen en autorisatiematrix technisch voorbereid.
- [ ] Definitieve display-authenticatie in Firebase configureren.
- [ ] Definitieve medewerker-loginprovider configureren.

## Vrijdagavond — gecontroleerde omschakeling

1. Noteer/exporteer voor de zekerheid de huidige Firestore-data.
2. Activeer de gekozen Firebase Authentication-provider(s).
3. Maak/test het adminaccount `meesteryoeran@gmail.com`.
4. Maak de benodigde display-identiteit(en) aan; geen wachtwoorden of tokens in GitHub opslaan.
5. Maak `verjaardagen` in Firestore en migreer alleen `naam`, `dag`, `maand`.
6. Migreer medewerkers:
   - `medewerkers`: `naam`, `zichtbaar`;
   - `medewerkers_prive`: `email` indien nog functioneel nodig.
7. Maak voor iedere medewerker maximaal één `actuele_status` document.
8. Test V2 tegen de nog open database.
9. Publiceer pas daarna de beveiligde Firestore Rules.

## Security-test na Rules-publicatie

Gebruik `SECURITY-REGRESSION-TEST.md` als vaste voor/na-test. Dit is de regressietest van de directe Firestore-toegang die bij de oorspronkelijke beoordeling gegevens opleverde.

- [ ] Uitgelogd: `medewerkers` niet rechtstreeks leesbaar.
- [ ] Uitgelogd: `actuele_status` niet rechtstreeks leesbaar.
- [ ] Uitgelogd: `mededelingen` niet leesbaar.
- [ ] Uitgelogd: `verjaardagen` niet leesbaar.
- [ ] Uitgelogd: geen writes mogelijk.
- [ ] Gewone gebruiker: geen `medewerkers_prive` toegang.
- [ ] Gewone gebruiker: geen admin-writes.
- [ ] Admin: beheerfuncties werken.
- [ ] Gangdisplay: uitsluitend benodigde actuele aanwezigheidsinformatie.
- [ ] Lerarenkamerdisplay: interne extra's alleen met juiste displaytoegang.

## Functionele regressietest

- [ ] Aan-/afmelden werkt realtime.
- [ ] Geen datum/tijdstip wordt bij status opgeslagen.
- [ ] Herhaald toggelen maakt geen extra documenten.
- [ ] Gangweergave ziet er ongewijzigd uit.
- [ ] Lerarenkamerweergave ziet er ongewijzigd uit.
- [ ] Weer werkt.
- [ ] Nieuws werkt.
- [ ] Mededelingen werken.
- [ ] Verjaardagen werken.
- [ ] Admin medewerker toevoegen/bewerken/verwijderen werkt.
- [ ] Reboot van kiosk/display behoudt de bedoelde geauthenticeerde sessie.

## Opschonen — pas na geslaagde tests

1. Oude collectie `aanwezigheid` verwijderen.
2. Oude e-mailvelden uit `medewerkers` verwijderen nadat `medewerkers_prive` is gecontroleerd.
3. `verjaardagen.txt` uit de publieke repo verwijderen.
4. Git-history opschonen in een apart, bewust uitgevoerd proces.
5. Controleren of Analytics daadwerkelijk actief is.
6. Firebase/Google-projecteigenaarschap en hersteltoegang documenteren.

## Go/no-go voor maandag

Alle security- en functionele tests hierboven moeten groen zijn. Bij een blokkerende fout blijft de oude code beschikbaar als rollback-bron, maar de database mag niet opnieuw publiek (`allow read, write: if true`) worden gezet.
