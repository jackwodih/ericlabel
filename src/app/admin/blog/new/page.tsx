
'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { motion } from 'framer-motion';

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Rédiger un <span className="text-orange-500">Nouvel Article</span>
            </h1>
            <p className="text-gray-400">Partagez votre expertise et améliorez votre référencement.</p>
          </div>

          <BlogEditor />
        </motion.div>
      </main>
    </div>
  );
}
