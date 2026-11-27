export interface Category { slug: string; title: string; description: string; imageUrl?: string; order?: number; published: boolean }
export interface Product { slug: string; name: string; category: string; description: string; imageUrl?: string; featured?: boolean; published: boolean }
export interface Project { title: string; location?: string; imageUrl?: string; published: boolean }
export interface BlogPost { slug: string; title: string; excerpt?: string; content: string; imageUrl?: string; published: boolean }
export interface Settings { phone?: string; hours?: string; email?: string; loc?: string; whatsapp?: string; facebook?: string; twitter?: string; youtube?: string; mapEmbed?: string }
export interface Inquiry { name: string; phone: string; email?: string; product?: string; message: string; kind: string; status: "new" | "contacted" | "completed" }
