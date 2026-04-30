import { Navbar } from '@/components/layout/Navbar';
import { blogService, BlogPost } from '@/lib/firebase/blog';
import { settingsService } from '@/lib/firebase/settings';
import { BlogPostDetailContent } from '@/components/blog/BlogPostDetailContent';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await blogService.getPostBySlug(params.slug);
  const settings = await settingsService.getSettings();
  
  const title = post?.seoTitle || post?.title || "Article de Blog | Label Eric";
  const description = post?.seoDescription || post?.excerpt || "Découvrez nos conseils et astuces sur Label Eric.";
  const keywords = post?.seoKeywords || settings?.seoKeywords || "";
  const url = `${settings?.domain || 'https://labeleric.com'}/blog/${params.slug}`;
  const image = post?.coverImage || settings?.ogImage || "/og-image.jpg";

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostDetailPage({ params }: { params: { slug: string } }) {
  const post = await blogService.getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Article introuvable</h1>
        <Link href="/blog">
          <Button variant="outline">Retour au blog</Button>
        </Link>
      </div>
    );
  }

  // Sérialisation sécurisée des dates pour le client component
  const serializedPost = {
    ...post,
    createdAt: (post.createdAt as { toDate?: () => Date })?.toDate 
      ? (post.createdAt as { toDate: () => Date }).toDate().toISOString() 
      : post.createdAt,
    updatedAt: (post.updatedAt as { toDate?: () => Date })?.toDate 
      ? (post.updatedAt as { toDate: () => Date }).toDate().toISOString() 
      : post.updatedAt,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      <BlogPostDetailContent post={serializedPost as unknown as BlogPost} />
    </div>
  );
}
