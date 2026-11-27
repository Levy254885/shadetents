import { collection, addDoc, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./db";
const esc = (s: any) => String(s ?? "").replace(/[&<>"]/g, (c) => "&#" + c.charCodeAt(0) + ";");
const K = "ste_chat";
const getId = (): string => { try { return localStorage.getItem(K) || ""; } catch { return ""; } };
const setId = (v: string) => { try { localStorage.setItem(K, v); } catch { /* ignore */ } };
export function initChat(S: () => any) {
  const root = document.createElement("div");
  root.innerHTML = `<button class="cb" aria-label="Open chat"><svg class="ic"><use href="#i-chat"/></svg></button><div class="cp" role="dialog" aria-label="Chat with us"><div class="ch"><div class="av"></div><div class="ci"><b class="cn"></b><small>Chat with our team</small></div><button class="cx" aria-label="Close chat"><svg class="ic"><use href="#i-close"/></svg></button></div><div class="cm"></div><div class="cq"></div><div class="ft2"></div></div>`;
  document.body.appendChild(root);
  const q = (s: string): any => root.querySelector(s);
  let id = getId(), unsub: any = null, opened = false;
  const bubble = (t: string, c: string, time?: string) => `<div class="mg ${c}">${esc(t)}${time ? `<small>${time}</small>` : ""}</div>`;
  const welcome = () => bubble(S().chatWelcome || "Hello! How can we help you today? Ask about tents, shade structures or a quote.", "a");
  const tm = (m: any) => (m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");
  function listen() {
    if (!db || !id || unsub) return;
    unsub = onSnapshot(query(collection(db, "chats", id, "messages"), orderBy("createdAt")), (s) => {
      const m = q(".cm");
      m.innerHTML = welcome() + s.docs.map((d) => { const x: any = d.data(); return bubble(x.text, x.from == "visitor" ? "v" : "a", tm(x)); }).join("");
      m.scrollTop = m.scrollHeight;
    });
  }
  async function send(t: string) {
    if (!db || !id) return;
    try {
      await addDoc(collection(db, "chats", id, "messages"), { from: "visitor", text: t, createdAt: serverTimestamp() });
      await updateDoc(doc(db, "chats", id), { lastMessage: t, unreadAdmin: true, updatedAt: serverTimestamp() });
    } catch { q(".cm").insertAdjacentHTML("beforeend", bubble("Message not sent. Please try again.", "a")); }
  }
  function foot() {
    const f = q(".ft2"), wa = String(S().whatsapp || "").replace(/\D/g, "");
    if (!db) { f.innerHTML = `<div class="pcf"><p>Live chat is not available right now.</p><a class="btn" href="${wa ? "https://wa.me/" + wa : "/contact"}">${wa ? "Chat on WhatsApp" : "Contact us"}</a></div>`; return; }
    if (!id) {
      f.innerHTML = `<form class="pcf"><input name="n" placeholder="Your name" required maxlength="80" autocomplete="name"><input name="p" placeholder="Phone number" required maxlength="30" type="tel" autocomplete="tel"><button class="btn">Start chat</button></form>`;
      f.querySelector("form")!.onsubmit = async (e: any) => {
        e.preventDefault();
        const n = e.target.n.value.trim(), p = e.target.p.value.trim();
        if (!n || !/^[+\d\s()-]{7,}$/.test(p)) return;
        const nid = crypto.randomUUID().replace(/-/g, "");
        try { await setDoc(doc(db, "chats", nid), { name: n, phone: p, status: "open", lastMessage: "", unreadAdmin: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); id = nid; setId(id); listen(); foot(); }
        catch { q(".cm").insertAdjacentHTML("beforeend", bubble("Could not start the chat. Please try again or use WhatsApp.", "a")); }
      };
      return;
    }
    f.innerHTML = `<form class="cf2"><input name="m" placeholder="Type your message…" maxlength="500" autocomplete="off"><button aria-label="Send"><svg class="ic"><use href="#i-send"/></svg></button></form>`;
    f.querySelector("form")!.onsubmit = (e: any) => { e.preventDefault(); const t = e.target.m.value.trim(); if (t) { e.target.m.value = ""; send(t); } };
  }
  function open() {
    const s = S();
    q(".cp").classList.add("open");
    q(".cn").textContent = s.chatName || "Shade Tents Support";
    q(".av").innerHTML = s.chatAvatar ? `<img src="${esc(s.chatAvatar)}" alt="">` : `<svg class="ic"><use href="#i-chat"/></svg>`;
    q(".cq").innerHTML = String(s.chatReplies || "Request a quote|Product prices|Installation").split("|").map((x: string) => `<button>${esc(x.trim())}</button>`).join("");
    if (!opened) { q(".cm").innerHTML = welcome(); opened = true; }
    listen(); foot();
  }
  q(".cb").onclick = () => (q(".cp").classList.contains("open") ? q(".cp").classList.remove("open") : open());
  q(".cx").onclick = () => q(".cp").classList.remove("open");
  q(".cq").onclick = (e: any) => {
    if (e.target.tagName != "BUTTON") return;
    if (id) send(e.target.textContent);
    else q(".cm").insertAdjacentHTML("beforeend", bubble("Please enter your name and phone below to start the chat.", "a"));
  };
}
