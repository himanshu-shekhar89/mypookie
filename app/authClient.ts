"use client";

type FirebaseUser={
  uid:string;
  email:string|null;
  displayName:string|null;
  photoURL:string|null;
  getIdToken:(forceRefresh?:boolean)=>Promise<string>;
};
type AuthResult={user:FirebaseUser};
type FirebaseAuth={
  currentUser:FirebaseUser|null;
  signInWithPopup:(provider:unknown)=>Promise<AuthResult>;
  signOut:()=>Promise<void>;
  onAuthStateChanged:(callback:(user:FirebaseUser|null)=>void)=>()=>void;
};
type FirebaseCompat={
  apps:unknown[];
  initializeApp:(config:Record<string,string>)=>unknown;
  auth:((app?:unknown)=>FirebaseAuth)&{
    GoogleAuthProvider:new()=>unknown;
    OAuthProvider:new(providerId:string)=>unknown;
  };
};

declare global { interface Window { firebase?:FirebaseCompat } }

const config={
  apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY||"AIzaSyADeQzDqdqjNCvFiSGtZLk93_XAyOQlWGA",
  authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||"mypookie-ecb4c.firebaseapp.com",
  projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||"mypookie-ecb4c",
  storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||"mypookie-ecb4c.firebasestorage.app",
  messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID||"150752558202",
  appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID||"1:150752558202:web:8785a21aff6675d61b0fc3",
};

let loading:Promise<FirebaseAuth>|null=null;
function script(src:string){
  return new Promise<void>((resolve,reject)=>{
    const existing=document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if(existing){if(existing.dataset.ready==="true")resolve();else{existing.addEventListener("load",()=>resolve(),{once:true});existing.addEventListener("error",reject,{once:true})}return}
    const element=document.createElement("script");element.src=src;element.async=true;element.onload=()=>{element.dataset.ready="true";resolve()};element.onerror=reject;document.head.appendChild(element);
  });
}

export async function firebaseAuth(){
  if(loading)return loading;
  loading=(async()=>{
    await script("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
    await script("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth-compat.js");
    if(!window.firebase)throw new Error("Firebase could not load");
    if(window.firebase.apps.length===0)window.firebase.initializeApp(config);
    const auth=window.firebase.auth();
    await new Promise<void>(resolve=>{let unsubscribe=()=>{};unsubscribe=auth.onAuthStateChanged(()=>{unsubscribe();resolve()})});
    return auth;
  })();
  return loading;
}

export async function signInWithFirebase(provider:"google"|"apple"="google"){
  const auth=await firebaseAuth();
  const selected=provider==="apple"?new window.firebase!.auth.OAuthProvider("apple.com"):new window.firebase!.auth.GoogleAuthProvider();
  return (await auth.signInWithPopup(selected)).user;
}

export async function signOutFirebase(){const auth=await firebaseAuth();await auth.signOut()}
export async function currentFirebaseUser(){return (await firebaseAuth()).currentUser}
export async function authHeaders(demoUser="local-creator"){
  const user=await currentFirebaseUser();
  const headers:Record<string,string>={"X-Demo-User":demoUser};
  if(user)headers.Authorization=`Bearer ${await user.getIdToken()}`;
  return headers;
}
export function watchFirebaseAuth(callback:(user:FirebaseUser|null)=>void){
  let unsubscribe=()=>{};
  void firebaseAuth().then(auth=>{unsubscribe=auth.onAuthStateChanged(callback)}).catch(()=>callback(null));
  return()=>unsubscribe();
}
