import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./db";
import type { Category, Product, Project, Settings } from "../types";
import { applyData, setSaver } from "./main";
if (db) {
  (async () => {
    try {
      const L = async <T>(n: string) => (await getDocs(query(collection(db, n), where("published", "==", true)))).docs.map((d) => d.data() as T);
      const o = (u?: string, w = 900) => (u && u.includes("/upload/") ? u.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`) : u);
      const ord = (a: any, b: any) => (a.order || 0) - (b.order || 0);
      const [c, p, j, b, h, cl, ts, s, a] = await Promise.all([
        L<Category>("categories"), L<Product>("products"), L<Project>("projects"), L<any>("blogPosts"), L<any>("heroSlides"), L<any>("clients"), L<any>("testimonials"),
        getDoc(doc(db, "websiteSettings", "main")), getDoc(doc(db, "websiteSettings", "about")),
      ]);
      applyData({
        c: c.sort(ord).map((x) => [x.slug, x.title, x.description, o(x.imageUrl)]),
        p: p.map((x: any) => [x.slug, x.name, x.category, o(x.imageUrl), x.description, x.featured, (x.gallery || []).map((g: string) => o(g))]),
        j: j.map((x: any) => [x.title, o(x.imageUrl), x.location, x.category, x.slug, x.description, (x.gallery || []).map((g: string) => o(g))]),
        b, h: h.sort(ord).map((x: any) => [o(x.imageUrl, 1600), x.title, x.subtitle]),
        cl: cl.sort(ord).map((x: any) => ({ name: x.name, logoUrl: o(x.logoUrl, 400) })), ts,
        s: s.exists() ? (s.data() as Settings) : {}, a: a.exists() ? a.data() : {},
      });
      setSaver(async (d: any) => { await addDoc(collection(db, "inquiries"), { name: d.name, phone: d.phone, email: d.email || "", product: d.product || "", message: d.msg, kind: d.kind, status: "new", createdAt: serverTimestamp() }); });
    } catch (e) { console.warn(e); }
  })();
}
