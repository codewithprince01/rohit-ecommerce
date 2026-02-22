import { Store, User, Shield, Info } from 'lucide-react';
import Head from '../../components/common/Head';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            <Head title="About Us" description="Learn more about Agrawal General Store, our mission, and our values." />
            
            {/* Hero Banner */}
            <div className="relative bg-gray-900 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1604719312566-b7cbfa776c16?auto=format&fit=crop&q=80&w=2574" 
                        alt="Grocery Store Interior" 
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-6">
                        About Agrawal General Store
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Serving the community of Sabalgarh with quality products, trust, and dedication since 2010.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Our Story</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                                Bringing Quality Groceries to Your Doorstep
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                                Agrawal General And Professional Store was established with a simple vision: to provide the families of Sabalgarh with fresh, high-quality groceries at honest prices. 
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Over the years, we have grown from a small neighborhood shop to a comprehensive general store that caters to all your daily needs. From fresh snacks and beverages to cleaning supplies and personal care items, we stock it all.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-2xl text-primary-600 mb-1">10+</h4>
                                    <p className="text-gray-600 text-sm">Years of Service</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-2xl text-primary-600 mb-1">5000+</h4>
                                    <p className="text-gray-600 text-sm">Happy Customers</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-2xl relative z-10">
                                <img 
                                    src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=2574" 
                                    alt="Store Owner" 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <p className="font-bold text-lg">Ankush Bansal</p>
                                        <p className="text-sm opacity-90">Store Owner & Founder</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Frame */}
                            <div className="absolute top-8 left-8 w-full h-full border-2 border-primary-200 rounded-2xl -z-0"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
                        <h2 className="section-heading mt-2">Our Core Values</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Store,
                                title: "Wide Variety",
                                desc: "We stock everything from daily essentials to exclusive festive specials."
                            },
                            {
                                icon: Shield,
                                title: "Quality Assurance",
                                desc: "Every product on our shelves is quality checked to ensure you get the best."
                            },
                            {
                                icon: User,
                                title: "Customer First",
                                desc: "Your satisfaction is our priority. We go the extra mile to serve you better."
                            }
                        ].map((value, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-soft hover:shadow-xl transition-all duration-300 group text-center">
                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <value.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info Strip */}
            <div className="bg-primary-600 text-white py-12">
                <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <Info size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Visiting Sabalgarh?</h3>
                            <p className="text-primary-100">Stop by our store and say hello!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
