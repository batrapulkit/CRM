import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle,
    Globe,
    Shield,
    Zap,
    BarChart3,
    Users,
    Plane,
    Star,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FadeIn = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

export default function Landing() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-slate-950 selection:bg-purple-500/30 selection:text-purple-200 font-sans text-slate-100 overflow-x-hidden">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] rounded-full bg-slate-900/80 blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-white">
                                Triponic
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Features
                            </a>
                            <a href="#solutions" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Solutions
                            </a>
                            <Link to="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Pricing
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" className="text-white hover:bg-white/10">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/login?mode=register">
                                <Button variant="secondary" className="font-semibold rounded-full px-6 transition-all hover:scale-105">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-8 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            The Operating System for Modern Travel Agencies
                        </div>

                        <h1 className="text-5xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                            <span className="text-white">Scale your agency with</span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                                intelligent automation
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Streamline bookings, manage clients, and unlock growth with the world's most advanced B2B travel platform.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link to="/login?mode=register">
                                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-lg shadow-purple-500/25 transition-all hover:scale-105">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm">
                                Book Demo
                            </Button>
                        </div>
                    </motion.div>

                    {/* 3D Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 100 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, type: "spring" }}
                        className="relative mx-auto max-w-6xl"
                        style={{ perspective: "1000px" }}
                    >
                        <motion.div
                            animate={{ y: [0, -20, 0], rotateX: [0, 2, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-purple-500/10 p-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl" />
                            <div className="absolute inset-0 bg-slate-950 flex flex-col">
                                {/* Mock Header */}
                                <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-2 bg-white/10 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5" />
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20" />
                                    </div>
                                </div>
                                <div className="flex-1 flex overflow-hidden">
                                    {/* Mock Sidebar */}
                                    <div className="w-48 border-r border-white/5 p-4 space-y-3 hidden md:block">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex items-center gap-3 opacity-50">
                                                <div className="w-4 h-4 rounded bg-white/20" />
                                                <div className="w-20 h-2 bg-white/10 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Mock Content */}
                                    <div className="flex-1 p-6 space-y-6">
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: "Total Revenue", val: "$124,500", color: "text-green-400" },
                                                { label: "Active Bookings", val: "42", color: "text-blue-400" },
                                                { label: "Pending Leads", val: "18", color: "text-purple-400" }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="w-20 h-2 bg-white/10 rounded-full mb-3" />
                                                    <div className={`text-xl font-bold ${stat.color}`}>{stat.val}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Chart Area */}
                                        <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 relative overflow-hidden">
                                            <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
                                                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        transition={{ duration: 1, delay: i * 0.05 }}
                                                        className="w-full bg-gradient-to-t from-purple-500/50 to-blue-500/50 rounded-t-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By */}
            <section className="py-12 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Trusted by 500+ Agencies Worldwide</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Expedia', 'Booking.com', 'Amadeus', 'Sabre', 'Travelport'].map((brand) => (
                            <span key={brand} className="text-xl font-bold text-slate-300">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid (Bento Style) */}
            <section id="features" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to run your agency</h2>
                            <p className="text-xl text-slate-400">Replace your fragmented toolset with one unified operating system.</p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large Card */}
                        <FadeIn delay={0.1}>
                            <div className="md:col-span-2 bg-gradient-to-br from-purple-900/20 to-slate-900/50 border border-white/10 rounded-3xl p-8 h-full hover:border-purple-500/30 transition-colors group">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Itineraries</h3>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Generate stunning, personalized day-by-day itineraries in seconds. Our AI analyzes thousands of data points to create the perfect trip for your clients.
                                </p>
                                <div className="h-48 bg-slate-950/50 rounded-xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                                    {/* Abstract UI elements */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                                            <div className="h-2 w-24 bg-white/20 rounded-full" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                                            <div className="h-2 w-32 bg-white/20 rounded-full" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-pink-400" />
                                            <div className="h-2 w-20 bg-white/20 rounded-full" />
                                        </div>
                                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                                                <Plane className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="h-2 w-16 bg-white/20 rounded-full mb-1" />
                                                <div className="h-1.5 w-10 bg-white/10 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Tall Card */}
                        <FadeIn delay={0.2}>
                            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 h-full hover:border-blue-500/30 transition-colors group">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                    <Globe className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Global Network</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Direct access to 50,000+ vetted hotels, DMCs, and activity providers worldwide.
                                </p>
                            </div>
                        </FadeIn>

                        {/* Standard Cards */}
                        {[
                            { icon: Users, title: "CRM", desc: "Track every lead and interaction.", color: "text-pink-400", bg: "bg-pink-500/20" },
                            { icon: Shield, title: "Secure Payments", desc: "Enterprise-grade security.", color: "text-emerald-400", bg: "bg-emerald-500/20" },
                            { icon: BarChart3, title: "Analytics", desc: "Real-time performance insights.", color: "text-cyan-400", bg: "bg-cyan-500/20" }
                        ].map((feature, i) => (
                            <FadeIn key={i} delay={0.3 + (i * 0.1)}>
                                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 h-full hover:border-white/20 transition-colors group">
                                    <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-slate-400">{feature.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 border-t border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">Loved by Agencies</h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { text: "Triponic has completely transformed how we operate. We've doubled our bookings in 3 months.", author: "Sarah J.", role: "CEO, LuxTravel" },
                            { text: "The AI itinerary builder is a game changer. What used to take hours now takes minutes.", author: "Mike T.", role: "Founder, TravelCo" },
                            { text: "Finally, a modern platform that actually understands what travel agents need.", author: "Elena R.", role: "Director, GlobalWays" }
                        ].map((t, i) => (
                            <FadeIn key={i} delay={i * 0.2}>
                                <div className="bg-slate-900/50 border border-white/10 p-8 rounded-2xl relative">
                                    <div className="flex gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                                    </div>
                                    <p className="text-lg text-slate-300 mb-6">"{t.text}"</p>
                                    <div>
                                        <p className="font-bold text-white">{t.author}</p>
                                        <p className="text-sm text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-slate-950" />

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <FadeIn>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to transform your agency?</h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join thousands of travel professionals who are scaling their business with Triponic.</p>
                        <Link to="/login?mode=register">
                            <Button size="lg" variant="secondary" className="h-16 px-12 text-xl rounded-full font-bold transition-transform hover:scale-105">
                                Get Started for Free
                                <ArrowRight className="ml-2 w-6 h-6" />
                            </Button>
                        </Link>
                    </FadeIn>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <span className="font-bold text-white text-lg">Triponic</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2024 Triponic Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        {['Terms', 'Privacy', 'Contact'].map(item => (
                            <a key={item} href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
