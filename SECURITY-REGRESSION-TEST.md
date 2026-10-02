# Security-regressietest — directe Firestore-toegang

Doel: aantonen dat dezelfde soort directe browser/console-toegang die in de oorspronkelijke beoordeling persoonsgegevens kon uitlezen, in V2 door Firestore Security Rules wordt geweigerd.

## Verwachting vóór hardening

De huidige productie-Rules bevatten `allow read, write: if true`. Een niet-geauthenticeerde client kan daardoor collecties rechtstreeks aanspreken. De beoordeling meldde dat op deze manier 122 aanwezigheidsdocumenten met persoonsgegevens konden worden opgehaald.

## V2 acceptatiecriteria

Voer de tests uit in een browser zonder geldige Firebase Auth-sessie.

| Actie | Verwacht |
|---|---|
| Lees `medewerkers` | `PERMISSION_DENIED` |
| Lees `actuele_status` | `PERMISSION_DENIED` |
| Lees `mededelingen` | `PERMISSION_DENIED` |
| Lees `verjaardagen` | `PERMISSION_DENIED` |
| Lees `medewerkers_prive` | `PERMISSION_DENIED` |
| Maak/wijzig `actuele_status` | `PERMISSION_DENIED` |
| Maak/wijzig/verwijder medewerker | `PERMISSION_DENIED` |
| Maak/wijzig/verwijder mededeling | `PERMISSION_DENIED` |

Daarna dezelfde autorisatietests per rol:

- `display-gang`: mag alleen algemene medewerkersgegevens en actuele status lezen.
- `display-lerarenkamer`: mag daarnaast mededelingen en verjaardagen lezen.
- `staff`: mag algemene medewerkers/status/interne extra's lezen en actuele status wijzigen.
- admin `meesteryoeran@gmail.com`: mag beheerdata en beheeracties uitvoeren.

## Belangrijk

Een verborgen knop, URL-parameter of JavaScript-controle telt niet als beveiliging. De test is alleen geslaagd wanneer Firestore zelf de ongeautoriseerde aanvraag weigert.

Bewaar bij de weekendtest een screenshot van minimaal:
1. de oorspronkelijke/public read indien die vóór omschakeling nog bewust wordt getest;
2. dezelfde read ná publicatie van V2-Rules met `Missing or insufficient permissions` / `PERMISSION_DENIED`.

Deze twee screenshots zijn bruikbaar als technisch bewijs van de wijziging richting ICT/FG.
