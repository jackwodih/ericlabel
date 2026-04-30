
import { Navbar } from '@/components/layout/Navbar';
import { BlogListingContent } from '@/components/blog/BlogListingContent';

export default function BlogListingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Conseils & Expertise</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Le <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Blog</span> de Label Eric
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Découvrez nos conseils sur le marquage, le choix des matières et comment valoriser vos produits avec des étiquettes premium.
          </p>
        </div>
        <BlogListingContent />
      </main>
    </div>
  );
}
