
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog & Conseils | Label Eric - Expertise en Étiquetage",
  description: "Découvrez nos articles sur le marquage, le choix des matières et les tendances packaging pour valoriser vos créations.",
  keywords: "blog étiquettes, conseils marquage, tutoriels packaging, label eric afrique",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
