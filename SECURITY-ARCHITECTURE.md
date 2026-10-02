# Technische security-architectuur

> Branch: `avg-security-hardening`. Dit document beschrijft techniek; het verandert geen UI/UX.

## Authenticatie

De applicatie wordt voorbereid op Firebase Authentication zonder nu een provider vast te leggen.

- Alle interne Firestore-data vereist straks `request.auth != null`.
- Admin wordt via een expliciete `admin`-rol geautoriseerd; persoonlijke accountgegevens staan niet in de repository.
- De admincontrole staat zowel in de frontend-helper als, doorslaggevend, in Firestore Security Rules.
- De frontendcontrole is alleen UX; Firestore Rules vormen de beveiligingsgrens.
- Een loginprovider wordt later gekoppeld zonder het autorisatiemodel opnieuw te bouwen.

## Lichtkrant-modes

De URL/mode bepaalt alleen de presentatie en is **geen beveiligingsmechanisme**.

### Gang / standaard lichtkrant

`lichtkrant.html` en `?mode=gang` tonen uitsluitend de actuele aanwezigen. De bedoeling is dat deze weergave geen mededelingen of verjaardagen opvraagt.

### Lerarenkamer

`?mode=lerarenkamer` mag naast actuele aanwezigheid ook interne mededelingen en verjaardagen gebruiken. Deze gegevens worden na migratie alleen uit geauthenticeerde Firestore-bronnen gelezen.

Weer en publieke nieuwsfeeds bevatten geen personeelsgegevens. Hun externe netwerkverkeer en API-gebruik worden wel apart beoordeeld/minimaal gehouden.

## Dataminimalisatie

Doelmodel:

- `actuele_status/{medewerkerId}`: alleen `naam` en `status`; één overschrijfbaar document per medewerker.
- Geen datum/tijdstip in actuele status.
- Geen aanwezigheidshistorie.
- `medewerkers`: alleen velden die normale interne clients nodig hebben.
- `medewerkers_prive`: privé/beheervelden zoals e-mail; alleen admin.
- `verjaardagen`: voornaam + dag + maand; alleen geauthenticeerd.
- `mededelingen`: alleen geauthenticeerd; schrijven alleen admin.

## Migratievolgorde

1. Authentication-provider configureren en loginflow koppelen.
2. Clients laten werken met geauthenticeerde sessies.
3. Medewerkersdata splitsen zodat e-mail niet naar displays gaat.
4. Actuele status migreren naar `actuele_status`.
5. Verjaardagen uit publieke GitHub-data naar Firestore migreren.
6. Security Rules publiceren.
7. Oude aanwezigheidshistorie gecontroleerd verwijderen.
8. `verjaardagen.txt` uit huidige repo en, apart gepland, Git-history verwijderen.
9. Console/API-test uitvoeren: ongeauthenticeerd lezen/schrijven moet `PERMISSION_DENIED` geven.

De productie-Rules worden pas gepubliceerd nadat de nieuwe clientflow getest is; `main` blijft tot dat moment onaangeraakt.
