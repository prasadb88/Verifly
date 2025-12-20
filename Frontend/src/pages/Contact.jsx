import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Contact Info */}
                <div>
                    <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Get in Touch</span>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">
                        Let's start a conversation.
                    </h1>
                    <p className="text-lg text-muted-foreground mb-10">
                        Have a question about listing your car or our verification process? Our team is ready to help you 24/7.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center flex-shrink-0 text-primary shadow-sm">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Email Us</h3>
                                <p className="text-muted-foreground">support@verifly.com</p>
                                <p className="text-muted-foreground">prasadbhot02@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center flex-shrink-0 text-primary shadow-sm">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Call Us</h3>
                                <p className="text-muted-foreground">+91 98765 43210</p>
                                <p className="text-sm text-muted-foreground mt-1">Mon-Fri from 9am to 6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center flex-shrink-0 text-primary shadow-sm">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Visit HQ</h3>
                                <p className="text-muted-foreground">123 Tech Park, Innovation Street</p>
                                <p className="text-muted-foreground">Mumbai, Maharashtra, India</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-card p-8 rounded-3xl border border-border shadow-lg">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">First Name</label>
                                <input type="text" className="w-full p-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Last Name</label>
                                <input type="text" className="w-full p-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <input type="email" className="w-full p-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Message</label>
                            <textarea className="w-full p-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none min-h-[150px]" placeholder="How can we help you?"></textarea>
                        </div>
                        <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            Send Message <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contact;
