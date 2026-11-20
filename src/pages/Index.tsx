import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, TrendingUp, Cloud, Building2, Calendar, MessageCircle, ArrowRight, Wheat } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background leaf-pattern overflow-x-hidden">
      {/* Hero Section - Funky */}
      <header className="hero-funky hero-garden text-white relative overflow-hidden">
        {/* Floating decorative blobs */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl float-slow" />
        <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-amber-300/20 blur-3xl float-slow float-delay-1" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-emerald-300/15 blur-2xl float-slow float-delay-2" />
        <div className="absolute bottom-40 right-1/4 w-28 h-28 rounded-full bg-yellow-200/25 blur-xl float-slow float-delay-3" />
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Kisan Seva" className="h-14 w-14 object-contain drop-shadow-lg" />
              <span className="text-2xl font-brand font-bold tracking-tight text-white drop-shadow-md">Kisan Seva</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="secondary" className="gap-2 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">
                  Login / Register
                </Button>
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/25 backdrop-blur-md text-sm mb-10 border-2 border-white/40 shadow-xl bounce-subtle">
            <span className="text-2xl">🌱</span>
            <Wheat className="w-5 h-5" />
            <span className="font-bold">Grow • Plant • Harvest</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-brand font-extrabold mb-8 leading-tight text-glow">
            Where Farmers<br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-emerald-200 bg-clip-text text-transparent">
              Grow & Prosper
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Crop guides • Govt schemes • Market prices • Weather — all in one platform 🌾
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/auth">
              <Button size="lg" className="btn-hero btn-funky text-lg px-12 py-7 rounded-3xl shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-300 border-2 border-white/30">
                🌿 Start Planting Today
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features - Funky Style */}
      <section className="py-28 container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-brand font-extrabold text-center mb-4 bg-gradient-to-r from-primary via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Everything to Nurture Your Farm
        </h2>
        <p className="text-muted-foreground text-center mb-20 max-w-xl mx-auto text-lg font-medium">
          Tools & resources to help your crops flourish 🌻
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Leaf, emoji: '🌿', title: 'Crop Information', desc: 'Soil prep, fertilizers & planting techniques', color: 'from-green-400/20 to-emerald-500/20 border-green-300/50' },
            { icon: Building2, emoji: '🏛️', title: 'Govt. Schemes', desc: 'PM-KISAN, crop insurance & subsidies', color: 'from-amber-400/20 to-orange-500/20 border-amber-300/50' },
            { icon: TrendingUp, emoji: '📈', title: 'Market Prices', desc: 'Live commodity prices across India', color: 'from-blue-400/20 to-cyan-500/20 border-blue-300/50' },
            { icon: Cloud, emoji: '🌤️', title: 'Weather Forecast', desc: 'Local updates & storm alerts', color: 'from-sky-400/20 to-indigo-500/20 border-sky-300/50' },
            { icon: Calendar, emoji: '📅', title: 'Farming Calendar', desc: 'Seasonal activities & planting guide', color: 'from-violet-400/20 to-purple-500/20 border-violet-300/50' },
            { icon: MessageCircle, emoji: '💬', title: 'Expert Support', desc: 'Ask questions & get expert advice', color: 'from-teal-400/20 to-green-500/20 border-teal-300/50' },
          ].map((feature, i) => (
            <Card key={i} className={`card-garden card-funky overflow-hidden group bg-gradient-to-br ${feature.color} border-2 hover:shadow-2xl`}>
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex items-start gap-4">
                  <div className="icon-container w-16 h-16 mb-0 rounded-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">{feature.emoji}</span>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA - Funky Style */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)' }}>
        <div className="absolute inset-0 leaf-pattern opacity-30" />
        <div className="absolute top-10 left-20 text-6xl opacity-20 animate-bounce">🌾</div>
        <div className="absolute top-20 right-32 text-5xl opacity-20 float-slow">🌻</div>
        <div className="absolute bottom-16 left-1/3 text-5xl opacity-20 float-slow float-delay-1">🌿</div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-brand font-extrabold mb-4 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 bg-clip-text text-transparent">
            Ready to Grow With Us?
          </h2>
          <p className="text-foreground/80 mb-12 max-w-lg mx-auto text-lg font-semibold">
            Join thousands of farmers cultivating success 🌱<br />Free registration — start today!
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 rounded-3xl px-12 py-7 text-lg shadow-2xl hover:scale-110 transition-all bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border-2 border-emerald-400/50 text-white font-bold">
              🌱 Create Free Account
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t-2 border-primary/20 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground/80 font-medium">© 2026 Kisan Seva — Integrated Agriculture Portal</p>
          <p className="text-sm text-muted-foreground mt-1">🌾 Grow • Plant • Harvest</p>
          
          <p className="text-sm text-muted-foreground mt-1">🌾 design by : Rudra abrol and Team</p>
          <p className="text-sm text-muted-foreground mt-1">Team member: Shagun Joshi , Isha and Yashasvi Tripathi</p>
           <meta name="twitter:description" content="" />
    <meta name="twitter:description" content="" />
        </div>
      </footer>
    </div>
  );
};

export default Index;
