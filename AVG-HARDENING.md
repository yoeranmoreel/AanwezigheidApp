# AVG / security hardening

Deze branch is gemaakt vanaf `main` om de bevindingen van de FG te verhelpen zonder de actieve GitHub Pages-versie te wijzigen.

## Bevestigde bevindingen

- De huidige frontend gebruikt Firestore rechtstreeks vanuit de browser.
- De medewerker-app leest volledige documenten uit `medewerkers`; daardoor komen ook e-mailadressen in de browser terecht.
- De aanwezigheid wordt per persoon/per dag opgeslagen en vormt daardoor historie.
- Het admin-dashboard gebruikt geen echte authenticatie; `setAdmin(...)` zet alleen lokale JavaScript-state.
- `verjaardagen.txt` staat publiek in de repository. De inhoud is voornaam + dag/maand, zonder geboortejaar.
- Firebase-config bevat een `measurementId`. Dat bewijst op zichzelf niet dat Analytics actief gegevens verzamelt; dit moet in Firebase/Google Analytics worden gecontroleerd.

## Doelarchitectuur

1. Firebase Authentication verplicht voor personeelsfuncties.
2. Alleen accounts op `@nissewijs.nl` krijgen toegang.
3. Adminrechten worden door Firestore Rules afgedwongen; niet door de UI.
4. Medewerkersdata wordt geminimaliseerd zodat displays geen e-mailadressen hoeven op te halen.
5. Aanwezigheid wordt omgezet van daghistorie naar alleen actuele status, tenzij Nissewijs bewust een bewaartermijn vaststelt.
6. Verjaardagen worden uit de publieke GitHub-data gehaald en intern opgeslagen.
7. Firestore gebruikt default-deny regels.
8. Database-regio, projecteigenaarschap, Analytics en verwerkersafspraken worden bestuurlijk gecontroleerd.

## Firestore Rules

`firestore.rules` bevat de voorgestelde beveiligingsbasis. **Het toevoegen van dit bestand aan GitHub activeert de regels niet automatisch.** Ze moeten pas in Firebase worden gepubliceerd nadat Authentication en de frontend op de branch zijn aangepast en getest. Publiceer ze niet op de productieomgeving zolang `main` nog zonder login draait, omdat de huidige app dan direct geen toegang meer heeft.

## Openstaande controles buiten GitHub

- Firestore database-regio.
- Eigenaar/beheerders van het Firebase-project.
- Of Google Analytics daadwerkelijk actief is.
- Huidige productie-Security Rules.
- Verwijderen van persoonsgegevens uit Git-history vereist een aparte history rewrite en force-push; dit moet bewust worden gepland.
