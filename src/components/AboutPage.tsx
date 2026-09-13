import React from 'react';
import {
  Wrench,
  Car,
  ShoppingBag,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  ChevronRight,
  Star,
  Award,
  ArrowRight,
  MessageCircle,
  Building2,
  Sparkles,
  Users,
  Search
} from 'lucide-react';

interface AboutPageProps {
  onBookService: () => void;
  onExploreCars: () => void;
  onExploreParts: () => void;
}

const ADDRESS = 'Ilasan New Road, Behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos';
const PHONE = '+234 802 317 9860';
const PHONE_LINK = 'tel:+2348023179860';
const WHATSAPP_LINK = 'https://wa.me/2348023179860';
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=CFMP%2B4C%20Lekki';

export const AboutPage: React.FC<AboutPageProps> = ({ onBookService, onExploreCars, onExploreParts }) => {
  return (
    <div className="bg-zinc-950 text-zinc-100">

      {/* ============================================================
          1. HERO — WHO WE ARE
      ============================================================ */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/G63.jpg"
            alt="Femisayo Autos workshop"
            className="w-full h-full object-cover opacity-25 contrast-125 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/85 to-[#0a0c10]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-[#0a0c10]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-600/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
                <Users className="w-3.5 h-3.5" />
                <span>About Femisayo Autos</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] uppercase font-mono">
                More Than Repairs.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">
                  We Keep You Moving.
                </span>
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
                Femisayo Autos is an automotive service company providing professional
                vehicle diagnostics, mechanical repairs, maintenance, genuine parts,
                and automotive solutions for drivers in Lagos.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onBookService}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-700/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Book a Service</span>
                </button>
                <a
                  href={PHONE_LINK}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 font-bold text-sm tracking-wide border border-zinc-700/80 transition-all flex items-center justify-center gap-2 hover:border-red-500/40"
                >
                  <Phone className="w-4 h-4 text-red-400" />
                  <span>Contact Us</span>
                </a>
              </div>

              {/* Quick proof bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs">
                <span className="bg-zinc-900 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg text-yellow-300 font-semibold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span>4.4/5 Rating</span>
                </span>
                <span className="bg-zinc-900 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>CAC Reg: BN-2641123</span>
                </span>
                <span className="bg-zinc-900 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-400" />
                  <span>2 Lekki Locations</span>
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-700/80 bg-gradient-to-b from-zinc-800/80 via-zinc-900 to-zinc-950 p-1 shadow-2xl">
                <div className="relative h-60 sm:h-80 w-full rounded-2xl overflow-hidden group">
                  <img
                    src="/images/GLC 63 suv.jpg"
                    alt="A vehicle in our care"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                    Trusted in Lagos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. OUR STORY
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
              <img
                src="/images/air suspension.jpg"
                alt="Femisayo Autos at work"
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
              Our Story
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono leading-tight">
              Built on Experience.
              <br />
              <span className="text-zinc-400">Driven by Trust.</span>
            </h2>

            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                What started as a commitment to providing dependable automotive services has
                grown into a trusted destination for vehicle repairs, diagnostics, maintenance,
                and automotive solutions in Lagos.
              </p>
              <p>
                At Femisayo Autos, we believe that quality automotive service isn't simply about
                fixing what's broken. It's about understanding the vehicle, identifying the real
                problem, and providing a solution our customers can rely on.
              </p>
              <p>
                Registered with the CAC (BN-2641123) and operating from our Ilasan New Road
                workshop with a dedicated annex, we serve private owners, families, and businesses
                across Lekki — from everyday commuters to high-performance vehicles.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-red-400 font-mono font-black text-xl sm:text-2xl">2018</div>
                <div className="text-[11px] text-zinc-400 mt-1">Established</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-yellow-400 font-mono font-black text-xl sm:text-2xl">4.4★</div>
                <div className="text-[11px] text-zinc-400 mt-1">Google Rating</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-emerald-400 font-mono font-black text-xl sm:text-2xl">2 Bays</div>
                <div className="text-[11px] text-zinc-400 mt-1">Lekki &amp; Annex</div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-red-500/20 rounded-xl p-3.5">
              <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                Quality automotive service isn't simply about fixing what's broken — it's about
                understanding the vehicle and providing a solution our customers can rely on.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. WHAT WE DO
      ============================================================ */}
      <section className="bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
            <div>
              <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
                What We Do
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono mt-1">
                Everything Your Vehicle Needs.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">Repairs &amp; Maintenance</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Professional mechanical repairs and routine servicing that keep vehicles reliable.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">Diagnostics</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Accurate identification of mechanical and electronic vehicle faults — no guesswork.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">Vehicle Sales</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Quality vehicles for customers looking for their next car.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">Parts &amp; Accessories</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Genuine and quality automotive parts and accessories.
              </p>
            </div>
          </div>

          <button
            onClick={onBookService}
            className="mt-8 inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold underline underline-offset-4"
          >
            <span>Explore All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ============================================================
          4. WHY FEMISAYO AUTOS
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
            Why Choose Us
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono mt-1">
            Why Drivers Choose Femisayo Autos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-white font-bold text-sm mb-2">Experienced Technicians</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Skilled professionals with practical automotive knowledge across a wide range of vehicles.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
            <Search className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-white font-bold text-sm mb-2">Accurate Diagnostics</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              We focus on identifying the underlying problem rather than guessing.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
            <ShieldCheck className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-white font-bold text-sm mb-2">Quality Parts</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Quality components selected for dependable performance.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
            <Wrench className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-white font-bold text-sm mb-2">Professional Workmanship</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Attention to detail from inspection to completion.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-white font-bold text-sm mb-2">Transparent Service</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Customers understand what their vehicle needs before work begins.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 transition-colors">
            <Star className="w-6 h-6 text-yellow-400 mb-3" />
            <h3 className="text-white font-bold text-sm mb-2">Customer First</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Your vehicle and your satisfaction remain our priority.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. OUR EXPERTISE — ONE PARTNER, MULTIPLE SOLUTIONS
      ============================================================ */}
      <section className="bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
              Our Expertise
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono mt-1">
              One Automotive Partner. <span className="text-zinc-400">Multiple Solutions.</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-3 max-w-2xl mx-auto">
              Whether you need your car repaired, your next vehicle, or the right part — it all
              happens under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              onClick={onBookService}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 text-left hover:border-red-500/50 transition-colors"
            >
              <img src="/images/air sus 2.jpg" alt="Service bay" className="w-full h-56 object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-red-400">01 · Service</span>
                <h3 className="text-white font-black text-lg mt-1">Diagnostics, Repairs &amp; Maintenance</h3>
                <span className="text-xs text-zinc-300 flex items-center gap-1 mt-2 opacity-80 group-hover:opacity-100">Book a bay <ChevronRight className="w-3.5 h-3.5" /></span>
              </div>
            </button>

            <button
              onClick={onExploreCars}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 text-left hover:border-red-500/50 transition-colors"
            >
              <img src="/images/G63.jpg" alt="Car showroom" className="w-full h-56 object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-red-400">02 · Showroom</span>
                <h3 className="text-white font-black text-lg mt-1">Quality Vehicles &amp; Automotive Solutions</h3>
                <span className="text-xs text-zinc-300 flex items-center gap-1 mt-2 opacity-80 group-hover:opacity-100">Browse showroom <ChevronRight className="w-3.5 h-3.5" /></span>
              </div>
            </button>

            <button
              onClick={onExploreParts}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 text-left hover:border-red-500/50 transition-colors"
            >
              <img src="/images/air sus 3.jpg" alt="Parts & accessories" className="w-full h-56 object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-red-400">03 · Parts</span>
                <h3 className="text-white font-black text-lg mt-1">Genuine Parts &amp; Accessories</h3>
                <span className="text-xs text-zinc-300 flex items-center gap-1 mt-2 opacity-80 group-hover:opacity-100">Shop parts <ChevronRight className="w-3.5 h-3.5" /></span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. TRUST / NUMBERS
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-red-500 font-mono font-black text-3xl sm:text-4xl">2018</div>
            <div className="text-xs text-zinc-400 mt-2">Established</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-yellow-400 font-mono font-black text-3xl sm:text-4xl">4.4/5</div>
            <div className="text-xs text-zinc-400 mt-2">Google Rating</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-emerald-400 font-mono font-black text-3xl sm:text-4xl">23</div>
            <div className="text-xs text-zinc-400 mt-2">Service Packages</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-sky-400 font-mono font-black text-3xl sm:text-4xl">2</div>
            <div className="text-xs text-zinc-400 mt-2">Lekki Locations</div>
          </div>
        </div>
        <p className="text-center text-[11px] text-zinc-600 mt-4 font-mono">
          CAC Registered &middot; BN-2641123 &middot; Est. 2018 &middot; 4.4/5 from 8 Google Reviews
        </p>
      </section>

      {/* ============================================================
          7. WORKSHOP / TEAM
      ============================================================ */}
      <section className="bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-10">
            <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
              The Workshop
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono mt-1">
              The People Behind the Work
            </h2>
            <p className="text-zinc-400 text-sm mt-3 max-w-2xl mx-auto">
              Behind every successful repair is a team that takes pride in getting it right.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 aspect-[4/3]">
              <img src="/images/air suspension.jpg" alt="Diagnostics and inspection" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-800 aspect-[4/3]">
              <img src="/images/GLC 63 suv.jpg" alt="Vehicle in our care" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-800 aspect-[4/3]">
              <img src="/images/G63.jpg" alt="Femisayo Autos" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. OUR LOCATION
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-red-500 font-bold text-xs uppercase tracking-wider font-mono">
              Our Location
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">
              Visit Femisayo Autos
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300">
                  <strong className="text-white">Main Workshop:</strong> {ADDRESS}.
                  <br />
                  <span className="text-zinc-400"><strong className="text-white">Annex:</strong> FemisayoAutos Annex, Ilasan, Lekki.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300">
                  <strong className="text-white">Mon – Sat:</strong> 7:00 AM – 7:30 PM<br />
                  <span className="text-zinc-400"><strong className="text-white">Sunday:</strong> Closed (On-Call Recovery)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <Phone className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300">
                  <strong className="text-white">Call / WhatsApp:</strong>{' '}
                  <a href={PHONE_LINK} className="font-mono font-bold text-red-400 hover:text-red-300">{PHONE}</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-red-700/30"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/30"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to Us on WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-900">
              <iframe
                title="Femisayo Autos location — Ilasan New Road, Lekki"
                src="https://maps.google.com/maps?q=CFMP%2B4C%20Lekki%2C%20Eti-Osa%2C%20Lagos&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-72 sm:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          9. FINAL CTA
      ============================================================ */}
      <section className="relative overflow-hidden border-t border-zinc-800">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/G63.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <Award className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-mono leading-tight">
            Your Vehicle Deserves
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">
              the Right Care.
            </span>
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Whether you need routine maintenance, diagnostics, repairs, or expert automotive
            assistance — Femisayo Autos is ready to help.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={onBookService}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-700/40 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              Book a Service
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/40 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Talk to Us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};