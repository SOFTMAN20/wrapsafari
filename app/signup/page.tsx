'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Mail, Lock, ArrowRight, ArrowLeft, Paintbrush, Upload, Check, Sparkles, Layout, Globe, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PoweredByFooter } from '../_components/PoweredByFooter';
import { ColorPresets } from '@/lib/constants';
import { toast } from 'sonner';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
  });

  const [branding, setBranding] = useState({
    primaryColor: '#1B4D3E',
    accentColor: '#F4C542',
    logo: null as File | null,
    logoUrl: null as string | null,
  });

  const { signUp } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    // Validate Step 1 fields
    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!formData.password) {
      setError('Please enter a password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setError('');
    setStep(2);
  };
  const handleBack = () => setStep(1);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBranding({
        ...branding,
        logo: file,
        logoUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name,
        businessName: formData.businessName,
        brandColor1: branding.primaryColor,
        brandColor2: branding.accentColor,
        logoFile: branding.logo,
      });
      
      // Show success message
      toast.success('Account created successfully! Welcome to SafariWrap 🎉');
      
      // Redirect to dashboard immediately (no delay)
      router.push('/dashboard');
    } catch (err: any) {
      // Handle specific error messages
      const errorMessage = err.message || 'Failed to create account.';
      
      if (errorMessage.includes('User already registered')) {
        setError('This email is already registered. Please login instead.');
      } else if (errorMessage.includes('email')) {
        setError('Please check your email to confirm your account before logging in.');
      } else if (errorMessage.includes('Password')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-parchment relative overflow-x-hidden">
      {/* Background Decorative Element for Mobile */}
      <div className="lg:hidden absolute -top-24 -right-24 h-96 w-96 rounded-full gradient-safari opacity-20 blur-3xl pointer-events-none" />
      <div className="lg:hidden absolute -bottom-24 -left-24 h-96 w-96 rounded-full gradient-sunrise opacity-20 blur-3xl pointer-events-none" />

      {/* Desktop Hero Section */}
      <div className="hidden lg:flex lg:w-1/3 gradient-safari relative overflow-hidden flex-col justify-between p-16 text-white border-r border-white/10 shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 mb-12 group">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
              <img src="/logo.png" alt="SafariWrap" className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">SafariWrap</span>
          </Link>
          
          <h2 className="text-4xl font-black leading-tight mb-6">
            Build your <br /> 
            <span className="text-savanna">digital lodge.</span>
          </h2>
          <p className="text-lg text-white/70 font-bold leading-relaxed">
            Setup your operator identity and branding colors in seconds.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
           <StepIndicator current={step} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-6 lg:px-20 py-12 items-center lg:items-start overflow-y-auto relative z-10 min-h-screen">
        <div className="w-full max-w-2xl py-8">
           <div className="lg:hidden mb-12 text-center">
             <div className="h-16 w-16 rounded-2xl gradient-safari flex items-center justify-center mx-auto shadow-lg mb-4">
              <img src="/logo.png" alt="SafariWrap" className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-black text-forest">SafariWrap</h1>
            <p className="text-stone font-bold uppercase tracking-widest text-[10px] mt-2">Operator Portal</p>
          </div>

          {/* Header */}
          <header className="mb-8 lg:mb-12">
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-black text-forest">
              {step === 1 ? 'About your agency' : 'Design your identity'}
            </h1>
            <p className="text-sm lg:text-base text-stone font-bold mt-2">
              {step === 1 ? 'Tell us who you are and how to reach you.' : 'How should your guests see your brand?'}
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl lg:rounded-[40px] border border-dust bg-white/80 backdrop-blur-lg p-5 sm:p-6 lg:p-12 shadow-xl lg:shadow-none"
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 lg:space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm lg:text-base">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 lg:left-4 top-3 lg:top-3.5 h-4 w-4 lg:h-5 lg:w-5 text-stone/50" />
                        <Input
                          id="name"
                          placeholder="Jane Safari"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10 lg:pl-12 bg-white/50 h-11 lg:h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm lg:text-base">Agency Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 lg:left-4 top-3 lg:top-3.5 h-4 w-4 lg:h-5 lg:w-5 text-stone/50" />
                        <Input
                          id="businessName"
                          placeholder="Serengeti Soul Expeditions"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="pl-10 lg:pl-12 bg-white/50 h-11 lg:h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm lg:text-base">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 lg:left-4 top-3 lg:top-3.5 h-4 w-4 lg:h-5 lg:w-5 text-stone/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@serengetisoul.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setError(''); // Clear error on change
                        }}
                        className="pl-10 lg:pl-12 bg-white/50 h-11 lg:h-12"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm lg:text-base">Secure Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 lg:left-4 top-3 lg:top-3.5 h-4 w-4 lg:h-5 lg:w-5 text-stone/50" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 lg:pl-12 bg-white/50 h-11 lg:h-12"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    className="w-full h-12 lg:h-14 text-base lg:text-lg gap-2 mt-6 lg:mt-8"
                    onClick={handleNext}
                    disabled={!formData.email || !formData.password || !formData.name || !formData.businessName}
                    size="lg"
                  >
                    <span className="hidden sm:inline">Continue to Branding</span>
                    <span className="sm:hidden">Continue</span>
                    <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Header Section */}
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-forest/10 to-savanna/10 border border-forest/20 mb-4">
                      <Sparkles className="w-4 h-4 text-forest" />
                      <span className="text-xs font-bold text-forest uppercase tracking-wider">Customize Your Brand</span>
                    </div>
                    <p className="text-sm text-stone max-w-md mx-auto">
                      Choose colors and upload your logo to create a unique brand experience for your guests
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left Column - Controls */}
                    <div className="space-y-4 lg:space-y-6">
                       {/* Color Pickers Section */}
                       <motion.div 
                         className="bg-gradient-to-br from-white to-gray-50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-200 shadow-sm"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.1 }}
                       >
                         <div className="flex items-center gap-2 mb-4 lg:mb-5">
                           <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-forest to-forest-light flex items-center justify-center">
                             <Paintbrush className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest text-sm lg:text-base">Brand Colors</h3>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3 lg:gap-4">
                           <div className="space-y-2 lg:space-y-3">
                             <Label htmlFor="primaryColor" className="text-[10px] lg:text-xs font-bold text-stone uppercase tracking-wider">
                               Primary Color
                             </Label>
                             <div className="relative group">
                               <Input
                                 id="primaryColor"
                                 type="color"
                                 value={branding.primaryColor}
                                 onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                 className="h-16 lg:h-20 bg-white cursor-pointer border-2 border-gray-200 hover:border-forest/50 transition-all"
                               />
                               <div 
                                 className="absolute inset-2 lg:inset-3 rounded-lg lg:rounded-xl pointer-events-none border-2 lg:border-4 border-white shadow-lg transition-transform group-hover:scale-95"
                                 style={{ backgroundColor: branding.primaryColor }}
                               />
                             </div>
                             <div className="flex items-center justify-between px-2 lg:px-3 py-1.5 lg:py-2 bg-gray-100 rounded-lg">
                               <span className="text-[9px] lg:text-[10px] font-bold text-stone uppercase">Hex</span>
                               <code className="text-[10px] lg:text-xs font-mono font-bold text-forest">{branding.primaryColor}</code>
                             </div>
                           </div>
                           
                           <div className="space-y-2 lg:space-y-3">
                             <Label htmlFor="accentColor" className="text-[10px] lg:text-xs font-bold text-stone uppercase tracking-wider">
                               Accent Color
                             </Label>
                             <div className="relative group">
                               <Input
                                 id="accentColor"
                                 type="color"
                                 value={branding.accentColor}
                                 onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                                 className="h-16 lg:h-20 bg-white cursor-pointer border-2 border-gray-200 hover:border-savanna/50 transition-all"
                               />
                               <div 
                                 className="absolute inset-2 lg:inset-3 rounded-lg lg:rounded-xl pointer-events-none border-2 lg:border-4 border-white shadow-lg transition-transform group-hover:scale-95"
                                 style={{ backgroundColor: branding.accentColor }}
                               />
                             </div>
                             <div className="flex items-center justify-between px-2 lg:px-3 py-1.5 lg:py-2 bg-gray-100 rounded-lg">
                               <span className="text-[9px] lg:text-[10px] font-bold text-stone uppercase">Hex</span>
                               <code className="text-[10px] lg:text-xs font-mono font-bold text-savanna">{branding.accentColor}</code>
                             </div>
                           </div>
                         </div>
                       </motion.div>

                       {/* Color Presets Section */}
                       <motion.div 
                         className="bg-gradient-to-br from-white to-gray-50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-200 shadow-sm"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.2 }}
                       >
                         <div className="flex items-center gap-2 mb-4 lg:mb-5">
                           <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-savanna to-amber-500 flex items-center justify-center">
                             <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest text-sm lg:text-base">Quick Presets</h3>
                         </div>
                         
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 lg:gap-3">
                           {ColorPresets.map((preset, idx) => {
                             const isActive = branding.primaryColor === preset.primary && branding.accentColor === preset.accent;
                             return (
                               <motion.button
                                 key={idx}
                                 type="button"
                                 onClick={() => setBranding({ ...branding, primaryColor: preset.primary, accentColor: preset.accent })}
                                 className={`relative h-12 lg:h-14 rounded-lg lg:rounded-xl transition-all ${
                                   isActive
                                     ? 'scale-110 shadow-xl ring-4 ring-forest/30' 
                                     : 'hover:scale-105 hover:shadow-lg'
                                 }`}
                                 style={{ background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.accent} 100%)` }}
                                 whileHover={{ y: -2 }}
                                 whileTap={{ scale: 0.95 }}
                               >
                                 {isActive && (
                                   <motion.div
                                     initial={{ scale: 0 }}
                                     animate={{ scale: 1 }}
                                     className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-forest rounded-full flex items-center justify-center shadow-lg"
                                   >
                                     <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                                   </motion.div>
                                 )}
                               </motion.button>
                             );
                           })}
                         </div>
                       </motion.div>

                       {/* Logo Upload Section */}
                       <motion.div 
                         className="bg-gradient-to-br from-white to-gray-50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-200 shadow-sm"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.3 }}
                       >
                         <div className="flex items-center gap-2 mb-4 lg:mb-5">
                           <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                             <Upload className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest text-sm lg:text-base">Agency Logo</h3>
                         </div>
                         
                         <div 
                           className="relative flex flex-col sm:flex-row items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 border-dashed transition-all cursor-pointer group overflow-hidden"
                           style={{
                             borderColor: branding.logoUrl ? branding.primaryColor + '60' : '#D1D5DB',
                             backgroundColor: branding.logoUrl ? branding.primaryColor + '08' : '#F9FAFB'
                           }}
                           onClick={() => fileInputRef.current?.click()}
                         >
                           {/* Background Pattern */}
                           <div className="absolute inset-0 opacity-5" style={{
                             backgroundImage: `radial-gradient(circle, ${branding.primaryColor} 1px, transparent 1px)`,
                             backgroundSize: '20px 20px'
                           }} />
                           
                           <div 
                             className="relative z-10 h-20 w-20 lg:h-24 lg:w-24 rounded-xl lg:rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all group-hover:scale-105 shadow-md flex-shrink-0"
                             style={{
                               backgroundColor: branding.logoUrl ? 'white' : branding.primaryColor + '15',
                               borderColor: branding.logoUrl ? branding.primaryColor + '40' : '#E5E7EB'
                             }}
                           >
                             {branding.logoUrl ? (
                               <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                             ) : (
                               <div className="text-center">
                                 <Upload size={28} className="text-stone mx-auto mb-1 lg:hidden" />
                                 <Upload size={32} className="text-stone mx-auto mb-1 hidden lg:block" />
                                 <span className="text-[8px] lg:text-[9px] font-bold text-stone uppercase">Upload</span>
                               </div>
                             )}
                           </div>
                           
                           <div className="relative z-10 flex-1 text-center sm:text-left">
                             <p className="font-black text-xs lg:text-sm uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2 mb-1" style={{ color: branding.primaryColor }}>
                               {branding.logoUrl ? (
                                 <>
                                   <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                   Logo Uploaded
                                 </>
                               ) : (
                                 <>
                                   <Sparkles size={12} className="lg:hidden" />
                                   <Sparkles size={14} className="hidden lg:block" />
                                   Upload Your Logo
                                 </>
                               )}
                             </p>
                             <p className="text-[10px] lg:text-xs font-semibold text-stone">
                               {branding.logoUrl ? 'Click to change your logo' : 'PNG, JPG or SVG • Max 2MB'}
                             </p>
                             {branding.logo && (
                               <div className="mt-2 px-2 lg:px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg inline-block">
                                 <p className="text-[9px] lg:text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                   <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                   <span className="truncate max-w-[120px] lg:max-w-none">{branding.logo.name}</span>
                                 </p>
                               </div>
                             )}
                           </div>
                           
                           <ArrowRight className="relative z-10 w-5 h-5 lg:w-6 lg:h-6 text-stone group-hover:text-forest group-hover:translate-x-1 transition-all hidden sm:block" />
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                         </div>
                       </motion.div>
                    </div>

                    {/* Right Column - Live Preview */}
                    <div className="space-y-4 lg:space-y-6">
                       <motion.div
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.2 }}
                       >
                         <div className="flex items-center gap-2 mb-4 lg:mb-5">
                           <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                             <Layout className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                           </div>
                           <h3 className="font-black text-forest text-sm lg:text-base">Live Preview</h3>
                           <div className="ml-auto">
                             <div className="flex items-center gap-1">
                               <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-[9px] lg:text-[10px] font-bold text-emerald-600 uppercase">Live</span>
                             </div>
                           </div>
                         </div>
                         
                         {/* Main Preview Card */}
                         <motion.div 
                           className="rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 flex flex-col justify-center items-center text-center space-y-4 lg:space-y-6 min-h-[380px] lg:min-h-[450px] transition-all duration-500 shadow-xl"
                           style={{ 
                             background: `linear-gradient(135deg, ${branding.primaryColor}12 0%, ${branding.accentColor}12 100%)`,
                             borderColor: branding.primaryColor + '40'
                           }}
                           animate={{
                             borderColor: [branding.primaryColor + '40', branding.accentColor + '40', branding.primaryColor + '40'],
                           }}
                           transition={{ duration: 3, repeat: Infinity }}
                         >
                            {/* Logo Display */}
                            <motion.div 
                              className="relative"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div
                                className="absolute inset-0 rounded-[35px] lg:rounded-[45px] blur-2xl opacity-30"
                                style={{ backgroundColor: branding.primaryColor }}
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <motion.div 
                                className="relative h-24 w-24 lg:h-32 lg:w-32 rounded-[35px] lg:rounded-[45px] shadow-2xl flex items-center justify-center transition-all duration-500"
                                style={{ backgroundColor: branding.primaryColor }}
                                whileHover={{ rotate: 0 }}
                                animate={{ rotate: [3, -3, 3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              >
                                 {branding.logoUrl ? (
                                   <img src={branding.logoUrl} className="h-16 w-16 lg:h-20 lg:w-20 object-contain rounded-[35px] lg:rounded-[45px] p-2" alt="Logo" />
                                 ) : (
                                   <Building className="h-12 w-12 lg:h-16 lg:w-16 text-white" />
                                 )}
                              </motion.div>
                            </motion.div>
                            
                            {/* Business Name */}
                            <div>
                              <h4 className="text-2xl lg:text-3xl font-black text-ink mb-2 lg:mb-3">{formData.businessName || 'Your Agency'}</h4>
                              <motion.div 
                                className="h-1.5 lg:h-2 w-16 lg:w-20 rounded-full mx-auto transition-all duration-500 shadow-sm" 
                                style={{ backgroundColor: branding.accentColor }}
                                animate={{ width: ['50px', '70px', '50px'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                            
                            {/* Sample Buttons */}
                            <div className="flex flex-col gap-2 lg:gap-3 w-full max-w-xs">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                  variant="default" 
                                  size="lg" 
                                  className="w-full pointer-events-none transition-all duration-500 shadow-lg font-bold text-xs lg:text-sm" 
                                  style={{ 
                                    backgroundColor: branding.primaryColor,
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-2" />
                                  Create Safari Wrap
                                </Button>
                              </motion.div>
                              
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                  variant="outline" 
                                  size="lg" 
                                  className="w-full pointer-events-none border-2 transition-all duration-500 font-bold text-xs lg:text-sm" 
                                  style={{ 
                                    borderColor: branding.primaryColor, 
                                    color: branding.primaryColor 
                                  }}
                                >
                                  <Camera className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-2" />
                                  View Gallery
                                </Button>
                              </motion.div>
                            </div>
                            
                            {/* Color Swatches */}
                            <div className="flex gap-4 pt-4">
                              <motion.div 
                                className="text-center"
                                whileHover={{ y: -4 }}
                              >
                                <div 
                                  className="w-14 h-14 rounded-2xl shadow-lg border-4 border-white transition-all duration-500" 
                                  style={{ backgroundColor: branding.primaryColor }}
                                />
                                <p className="text-[9px] font-bold text-stone mt-2 uppercase tracking-wider">Primary</p>
                              </motion.div>
                              <motion.div 
                                className="text-center"
                                whileHover={{ y: -4 }}
                              >
                                <div 
                                  className="w-14 h-14 rounded-2xl shadow-lg border-4 border-white transition-all duration-500" 
                                  style={{ backgroundColor: branding.accentColor }}
                                />
                                <p className="text-[9px] font-bold text-stone mt-2 uppercase tracking-wider">Accent</p>
                              </motion.div>
                            </div>
                         </motion.div>
                         
                         {/* Mini Preview Cards */}
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3">
                           {/* QR Code Preview */}
                           <motion.div 
                             className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 border-2 border-gray-200 text-center hover:shadow-lg transition-all"
                             whileHover={{ y: -4 }}
                           >
                             <div 
                               className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl mx-auto mb-2 flex items-center justify-center shadow-md"
                               style={{ backgroundColor: branding.primaryColor }}
                             >
                               <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg grid grid-cols-3 gap-[2px] p-1">
                                 {[...Array(9)].map((_, i) => (
                                   <div key={i} className="bg-gray-800 rounded-[1px]" />
                                 ))}
                               </div>
                             </div>
                             <p className="text-[8px] lg:text-[9px] font-bold text-stone uppercase tracking-wider">QR Code</p>
                           </motion.div>
                           
                           {/* Badge Preview */}
                           <motion.div 
                             className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 border-2 border-gray-200 text-center hover:shadow-lg transition-all"
                             whileHover={{ y: -4 }}
                           >
                             <div 
                               className="px-3 py-2 rounded-full mx-auto mb-2 inline-block text-[10px] font-bold shadow-sm"
                               style={{ 
                                 backgroundColor: branding.accentColor + '25',
                                 color: branding.primaryColor
                               }}
                             >
                               Safari
                             </div>
                             <p className="text-[9px] font-bold text-stone uppercase tracking-wider">Badge</p>
                           </motion.div>
                           
                           {/* Card Preview */}
                           <motion.div 
                             className="bg-white rounded-2xl p-4 border-2 border-gray-200 text-center hover:shadow-lg transition-all"
                             whileHover={{ y: -4 }}
                           >
                             <div 
                               className="w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-md"
                               style={{ 
                                 background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%)`
                               }}
                             >
                               <Sparkles className="w-6 h-6 text-white" />
                             </div>
                             <p className="text-[9px] font-bold text-stone uppercase tracking-wider">Card</p>
                           </motion.div>
                         </div>
                       </motion.div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl lg:rounded-2xl bg-red-50 p-4 lg:p-5 border-2 border-red-200 my-6 lg:my-8"
                    >
                      <p className="text-xs lg:text-sm font-bold text-red-600 text-center flex items-center justify-center gap-2">
                        <span className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] lg:text-xs flex-shrink-0">!</span>
                        <span className="break-words">{error}</span>
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-3 lg:gap-4 mt-8 lg:mt-12 pt-6 lg:pt-8 border-t-2 border-gray-200">
                    <Button
                      variant="ghost"
                      className="px-4 lg:px-8 gap-1 lg:gap-2 hover:bg-gray-100"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm lg:text-base">Back</span>
                    </Button>
                    <Button
                      className="flex-1 h-14 lg:h-16 text-sm lg:text-lg gap-1 lg:gap-2 font-bold shadow-xl transition-all hover:scale-105"
                      disabled={isLoading}
                      onClick={handleSignup}
                      style={{
                        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%)`,
                        color: 'white'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="hidden sm:inline">Creating Your Platform...</span>
                          <span className="sm:hidden">Creating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="hidden sm:inline">Launch My Platform</span>
                          <span className="sm:hidden">Launch Platform</span>
                          <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {step === 1 && (
            <div className="mt-8 lg:mt-12 text-center lg:text-left ml-0 lg:ml-4">
              <p className="text-xs lg:text-sm font-bold text-stone">
                Already part of the safari?{' '}
                <Link href="/login" className="text-forest hover:underline decoration-2 underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-16 w-full max-w-2xl">
           <PoweredByFooter />
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, title: 'Identity', icon: <User size={18}/> },
    { n: 2, title: 'Branding', icon: <Paintbrush size={18}/> }
  ];
  
  return (
    <div className="space-y-6">
      {steps.map((s) => (
        <div key={s.n} className={`flex items-center space-x-4 transition-opacity ${current === s.n ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${current === s.n ? 'bg-savanna text-forest' : 'bg-white/10 text-white'}`}>
             {s.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Step 0{s.n}</p>
            <p className="font-extrabold text-white">{s.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
