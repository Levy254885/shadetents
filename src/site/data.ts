import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { CFG } from "../firebase";
import type { Category, Product, Project, Settings } from "../types";
import { applyData, setSaver } from "./main";
if (CFG.projectId) {
  (async () => {
    try {
      const db = getFirestore(initializeApp(CFG));
      const L = async <T>(n: string) => (await getDocs(query(collection(db, n), where("published", "==", true)))).docs.map((d) => d.data() as T);
      const [c, p, j, b, s] = await Promise.all([L<Category>("categories"), L<Product>("products"), L<Project>("projects"), L<any>("blogPosts"), getDoc(doc(db, "websiteSettings", "main"))]);
      const o = (u?: string) => (u && u.includes("/upload/") ? u.replace("/upload/", "/upload/f_auto,q_auto,w_900/") : u);
      applyData({
        c: c.sort((a, b) => (a.order || 0) - (b.order || 0)).map((x) => [x.slug, x.title, x.description, o(x.imageUrl)]),
        p: p.map((x) => [x.slug, x.name, x.category, o(x.imageUrl), x.description, x.featured]),
        j: j.map((x) => [x.title, o(x.imageUrl), x.location, x.category]),
        b, s: s.exists() ? (s.data() as Settings) : {},
      });
      setSaver(async (d: any) => { await addDoc(collection(db, "inquiries"), { name: d.name, phone: d.phone, email: d.email || "", product: d.product || "", message: d.msg, kind: d.kind, status: "new", createdAt: serverTimestamp() }); });
    } catch (e) { console.warn(e); }
  })();
}
