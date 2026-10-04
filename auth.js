import {initializeApp,getApps,getApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {getFirestore,doc,getDoc} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {getAuth,setPersistence,browserLocalPersistence,signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
export const firebaseConfig={apiKey:"AIzaSyD9w-uzVhuvfIR5_UH-xcMKJPAlpx5fKRk",authDomain:"aanwezigheid-app.firebaseapp.com",projectId:"aanwezigheid-app",storageBucket:"aanwezigheid-app.firebasestorage.app",messagingSenderId:"188437676924",appId:"1:188437676924:web:194eb53f7c6eb40ec3daf9",measurementId:"G-V8WM335NFL"};
export const app=getApps().length?getApp():initializeApp(firebaseConfig);
export const db=getFirestore(app);
export const auth=getAuth(app);
let persistencePromise=null;
export function prepareAuth(){return persistencePromise||(persistencePromise=setPersistence(auth,browserLocalPersistence));}
export async function login(email,password){await prepareAuth();return signInWithEmailAndPassword(auth,email,password)}
export const logout=()=>signOut(auth);
export async function resolveAccount(user){
  if(!user)return{kind:"guest"};
  const snap=await getDoc(doc(db,"accounts",user.uid));
  if(!snap.exists())return{kind:"unknown",uid:user.uid};
  const profile=snap.data();
  const role=profile.role||"staff";
  if(role==="display")return{kind:"display",uid:user.uid,role,type:profile.displayType||"",profile};
  return{kind:"medewerker",uid:user.uid,role,profile};
}
export function routeForAccount(a){
  if(a.kind==="display")return a.type==="gang"?"lichtkrant.html?mode=gang":a.type==="lerarenkamer"?"lichtkrant.html?mode=lerarenkamer":"index.html";
  return"index.html";
}
