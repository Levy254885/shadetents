import "./admin.css";

import{initializeApp}from"firebase/app";
import{getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,sendPasswordResetEmail}from"firebase/auth";
import{getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,serverTimestamp,getCountFromServer}from"firebase/firestore";
import{CFG,API}from"../firebase";
const app=initializeApp(CFG),auth=getAuth(app),db=getFirestore(app),$=(s:string):any=>document.querySelector(s),E=s=>String(s??"").replace(/[&<>"]/g,c=>"&#"+c.charCodeAt(0)+";");
const F=(k,t,l)=>({k,t,l:l||k});
const CF={categories:[F("title","text","Title"),F("slug","text","Slug (auto if empty)"),F("description","area","Description"),F("imageUrl","img","Image"),F("order","num","Order"),F("published","chk","Published")],
products:[F("name","text","Name"),F("slug","text","Slug (auto if empty)"),F("category","cat","Category"),F("description","area","Description"),F("imageUrl","img","Main image"),F("featured","chk","Featured"),F("published","chk","Published")],
projects:[F("title","text","Title"),F("location","text","Location"),F("category","text","Category tag (e.g. Sail Shades)"),F("imageUrl","img","Image"),F("published","chk","Published")],
blogPosts:[F("title","text","Title"),F("slug","text","Slug (auto if empty)"),F("excerpt","text","Excerpt"),F("content","area","Content (blank line = new paragraph)"),F("imageUrl","img","Cover image"),F("published","chk","Published")]};
const NM={categories:"title",products:"name",projects:"title",blogPosts:"title"};
let tab="home",user=null;
const slug=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const nav=()=>`<header><b>Shade Tents Admin</b>${["home","categories","products","projects","blogPosts","inquiries","settings"].map(t=>`<button data-t="${t}" class="${t==tab?"on":""}">${t}</button>`).join("")}<button id="lo">Logout</button></header>`;
async function up(file){const t=await user.getIdToken();const s=await(await fetch(API,{method:"POST",headers:{Authorization:"Bearer "+t}})).json();const fd=new FormData();fd.append("file",file);fd.append("api_key",s.apiKey);fd.append("timestamp",s.timestamp);fd.append("signature",s.signature);fd.append("folder","shade-tents");const r=await(await fetch(`https://api.cloudinary.com/v1_1/${s.cloud}/image/upload`,{method:"POST",body:fd})).json();if(!r.secure_url)throw 0;return r.secure_url}
function login(m){$("#app").innerHTML=`<main><div class="c"><h2>Admin login</h2><input id="e" type="email" placeholder="Email"><input id="p" type="password" placeholder="Password"><p style="color:#c00">${m||""}</p><button id="li">Login</button> <button id="rs" style="background:#777">Reset password</button></div></main>`;
$("#li").onclick=()=>signInWithEmailAndPassword(auth,$("#e").value,$("#p").value).catch(()=>login("Login failed."));$("#rs").onclick=()=>sendPasswordResetEmail(auth,$("#e").value).then(()=>login("Reset email sent.")).catch(()=>login("Enter your email first."))}
onAuthStateChanged(auth,async u=>{user=u;if(!u)return login();const r=await getDoc(doc(db,"users",u.uid));if(r.data()?.role!=="admin"){$("#app").innerHTML=`<main><div class="c">Not authorized. <button id="lo">Logout</button></div></main>`;$("#lo").onclick=()=>signOut(auth);return}show()});
async function show(){let h="";
if(tab=="home"){const n=await Promise.all(["products","categories","projects","blogPosts","inquiries"].map(c=>getCountFromServer(collection(db,c))));const rec=(await getDocs(collection(db,"inquiries"))).docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5);
h=`<div class="g">${["Products","Categories","Projects","Posts","Inquiries"].map((l,i)=>`<div><b>${n[i].data().count}</b>${l}</div>`).join("")}</div><div class="c" style="margin-top:14px"><h3>Recent inquiries</h3>${rec.map(x=>`<div class="r">${E(x.name)} · ${E(x.product||x.kind)}<small>${E(x.status)}</small></div>`).join("")||"None yet."}</div>`}
else if(tab=="settings"){const s=(await getDoc(doc(db,"websiteSettings","main"))).data()||{};h=`<div class="c" id="sf"><h3>Website settings</h3>${["phone","hours","email","loc","whatsapp","facebook","twitter","youtube","mapEmbed"].map(k=>`<label>${k}</label><input name="${k}" value="${E(s[k])}">`).join("")}<button id="ss">Save</button></div>`}
else if(tab=="inquiries"){const q=(await getDocs(collection(db,"inquiries"))).docs.sort((a,b)=>(b.data().createdAt?.seconds||0)-(a.data().createdAt?.seconds||0));h=q.map(d=>{const x=d.data();return`<div class="c"><b>${E(x.name)}</b> · ${E(x.phone)} · ${E(x.email)}<br>${E(x.kind)} ${E(x.product)}<p>${E(x.message)}</p><select data-i="${d.id}">${["new","contacted","completed"].map(s=>`<option ${s==x.status?"selected":""}>${s}</option>`).join("")}</select><button class="d" data-x="inquiries/${d.id}">Delete</button></div>`}).join("")||'<div class="c">No inquiries.</div>'}
else{const cats=(await getDocs(collection(db,"categories"))).docs.map(d=>d.data());const rows=(await getDocs(collection(db,tab))).docs;h=`<div class="c"><button id="nw">+ New</button>${rows.map(d=>`<div class="r"><span>${E(d.data()[NM[tab]])} ${d.data().published?"":"(hidden)"}</span><span><button data-e="${d.id}">Edit</button> <button class="d" data-x="${tab}/${d.id}">Delete</button></span></div>`).join("")}</div><div id="fm"></div>`;
(window as any).__rows=Object.fromEntries(rows.map(d=>[d.id,d.data()] as [string,any]));(window as any).__cats=cats}
$("#app").innerHTML=nav()+"<main>"+h+"</main>"}
function edit(id?:string){const v=id?(window as any).__rows[id]:{published:true};$("#fm").innerHTML=`<div class="c"><h3>${id?"Edit":"New"}</h3>${CF[tab].map(f=>{const x=v[f.k];return`<label>${f.l}</label>`+(f.t=="area"?`<textarea name="${f.k}" rows="6">${E(x)}</textarea>`:f.t=="chk"?`<input type="checkbox" name="${f.k}" ${x?"checked":""} style="width:auto">`:f.t=="cat"?`<select name="${f.k}">${(window as any).__cats.map(c=>`<option value="${E(c.slug)}" ${c.slug==x?"selected":""}>${E(c.title)}</option>`).join("")}</select>`:f.t=="img"?`${x?`<img class="p" src="${E(x)}">`:""}<input name="${f.k}" value="${E(x)}" placeholder="Cloudinary URL"><input type="file" accept="image/*" data-up="${f.k}">`:`<input name="${f.k}" ${f.t=="num"?'type="number"':""} value="${E(x)}">`)}).join("")}<button id="sv" data-id="${id||""}">Save</button></div>`}
document.addEventListener("click",async e=>{const t=e.target as any;try{
if(t.id=="lo")return signOut(auth);if(t.dataset.t){tab=t.dataset.t;return show()}
if(t.id=="nw")return edit();if(t.dataset.e)return edit(t.dataset.e);
if(t.dataset.x&&confirm("Delete permanently?")){await deleteDoc(doc(db,t.dataset.x.split("/")[0],t.dataset.x.split("/")[1]));return show()}
if(t.id=="ss"){const d:any={};document.querySelectorAll("#sf input").forEach((i:any)=>d[i.name]=i.value);await setDoc(doc(db,"websiteSettings","main"),d);alert("Saved")}
if(t.id=="sv"){const d:any={};CF[tab].forEach(f=>{const i:any=document.querySelector(`#fm [name=${f.k}]`);d[f.k]=f.t=="chk"?i.checked:f.t=="num"?+i.value:i.value});
if("slug"in d&&!d.slug)d.slug=slug(d[NM[tab]]);d.updatedAt=serverTimestamp();const id=t.dataset.id;if(id)await updateDoc(doc(db,tab,id),d);else{d.createdAt=serverTimestamp();await addDoc(collection(db,tab),d)}show()}
}catch(x){alert("Action failed: "+(x.message||x))}});
document.addEventListener("change",async e=>{const t=e.target as any;try{if(t.dataset.up){t.previousElementSibling.value=await up(t.files[0])}
if(t.dataset.i)await updateDoc(doc(db,"inquiries",t.dataset.i),{status:t.value})}catch(x){alert("Upload/update failed: "+(x.message||x))}});
