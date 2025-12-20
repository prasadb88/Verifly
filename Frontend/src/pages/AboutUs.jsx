import React from 'react';
import { Award, Users, Globe } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
                        We are rewriting the rules of <span className="text-primary">Car Buying</span>.
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Verifly was born from a simple frustration: why does buying a used car feel like a gamble? We decided to change that by using technology to eliminate the guesswork.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        Our mission is to build the world's most transparent automotive marketplace, where every scratch is documented, and every document is verified.
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
                    <img
                        src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Team meeting"
                        className="relative z-10 rounded-3xl shadow-2xl border border-border"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                <div className="bg-card p-8 rounded-2xl border border-border text-center">
                    <div className="text-4xl font-black text-primary mb-2">10k+</div>
                    <div className="text-muted-foreground font-medium">Verified Cars Sold</div>
                </div>
                <div className="bg-card p-8 rounded-2xl border border-border text-center">
                    <div className="text-4xl font-black text-primary mb-2">99%</div>
                    <div className="text-muted-foreground font-medium">Customer Satisfaction</div>
                </div>
                <div className="bg-card p-8 rounded-2xl border border-border text-center">
                    <div className="text-4xl font-black text-primary mb-2">24/7</div>
                    <div className="text-muted-foreground font-medium">Support & Assistance</div>
                </div>
            </div>

            {/* Values */}
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-12">Our Core Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 text-primary">
                            <Award className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold mb-2">Transparency</h3>
                        <p className="text-sm text-muted-foreground">No hidden fees, no hidden scratches.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold mb-2">Community</h3>
                        <p className="text-sm text-muted-foreground">Building a network trusted by thousands.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                            <Globe className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold mb-2">Sustainability</h3>
                        <p className="text-sm text-muted-foreground">Extending the life of quality vehicles.</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AboutUs;
