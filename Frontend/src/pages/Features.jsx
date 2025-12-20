import React from 'react';
import { Camera, Shield, Zap, FileText, CheckCircle, Smartphone } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description }) => (
    <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const Features = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6">
                    Technology that builds <span className="text-primary">Trust</span>.
                </h1>
                <p className="text-xl text-muted-foreground">
                    Verifly combines advanced AI with secure government integrations to create the safest car marketplace in the world.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureItem
                    icon={Camera}
                    title="AI Damage Detection"
                    description="Our custom YOLOv8 model analyzes vehicle photos in milliseconds to identify scratches, dents, and repainted areas with 99% accuracy."
                />
                <FeatureItem
                    icon={FileText}
                    title="RC Verification"
                    description="Direct integration with RTO databases ensures that the ownership details, chassis number, and vehicle history are authentic."
                />
                <FeatureItem
                    icon={Shield}
                    title="Secure Transactions"
                    description="We act as the trusted middleman. Payments are held in escrow until both buyer and seller verify the handover."
                />
                <FeatureItem
                    icon={Zap}
                    title="Instant Valuations"
                    description="Get a fair market price estimate instantly based on key health parameters, mileage, and current market trends."
                />
                <FeatureItem
                    icon={CheckCircle}
                    title="Verified Dealers"
                    description="Every dealer on our platform undergoes a strict KYC process and background check before listing a single car."
                />
                <FeatureItem
                    icon={Smartphone}
                    title="Mobile First"
                    description="Manage your listings, chat with buyers, and schedule test drives on the go with our responsive mobile web app."
                />
            </div>
        </div>
    );
};

export default Features;
