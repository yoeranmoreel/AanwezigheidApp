# Rollen voor V2

De V2 Security Rules gebruiken documenten in rollen/{firebaseAuthUid}.

Toegestane rollen:
- staff: normale medewerkerclient;
- display-gang: algemene medewerkerslijst en actuele status lezen;
- display-lerarenkamer: aanwezigheid plus mededelingen en verjaardagen lezen.

Het persoonlijke adminaccount meesteryoeran@gmail.com wordt rechtstreeks door de Rules als admin herkend.

De UID ontstaat pas nadat de identiteit in Firebase Authentication bestaat. Daarna krijgt rollen/{UID} uitsluitend een role-veld. Alleen de admin mag rol-documenten beheren.

Displayprincipe: er komt geen wachtwoord, token of andere credential in GitHub. Een display wordt tijdens installatie eenmalig geauthenticeerd en gebruikt daarna de lokale Firebase-sessie. Een kopie van de publieke websitecode levert daardoor geen displayrechten op.

De gangrol heeft geen toegang tot mededelingen, verjaardagen of medewerkers_prive.
