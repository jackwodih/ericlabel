'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Sparkles, User, Box, Settings2, BookOpen } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { itemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const navLinks = [
    { name: 'Catalogue', href: '/catalogue', icon: <Box className="w-4 h-4" /> },
    { name: 'Blog', href: '/blog', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Designer', href: '/designer', icon: <Sparkles className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl' 
          : 'bg-gradient-to-b from-slate-950/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all group-hover:scale-110">
            <span className="text-white font-black text-xl">L</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight hidden lg:block">
            LABEL<span className="text-orange-500">ERIC</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-gray-300 hover:text-orange-400 flex items-center gap-2 font-bold transition-all text-xs uppercase tracking-widest"
            >
              <div className="opacity-70 group-hover:opacity-100">{link.icon}</div>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart">
            <button className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all group">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
                  {itemCount}
                </span>
              )}
            </button>
          </Link>

          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm font-medium">
            <User className="w-4 h-4" />
            Compte
          </button>

          <button 
            className="md:hidden p-2 text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="flex items-center gap-3 text-gray-300 hover:text-white text-lg font-medium p-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <Link 
                  href="/cart"
                  className="flex items-center gap-3 text-gray-300 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Panier ({itemCount})
                </Link>
                <Link 
                  href="/admin/materials"
                  className="flex items-center gap-3 text-orange-400 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings2 className="w-5 h-5" />
                  Gestion Matériaux (Admin)
                </Link>
                <div className="flex items-center gap-3 text-gray-300 px-2 cursor-pointer">
                  <User className="w-5 h-5" />
                  Mon Compte
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
