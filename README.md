# PalmBook

## firestore.rules

**Development**
Change allow read, write: if false; to true;

**Production**
If authenticated from firebase: Change allow read, write: if false; to request.auth != null;

## Install dependencies
```bash
npm install
```

## run the server
```bash
npm start
```
