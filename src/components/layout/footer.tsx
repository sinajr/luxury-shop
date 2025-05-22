
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ParticlesBackground } from './particles-background';
import { INTERACTIVE_BOX_PARTICLE_OPTIONS, DEFAULT_FOOTER_PARTICLE_OPTIONS } from '@/config/particles-options';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const brandLinks = [
    { name: 'Rolex', href: '/products?brand=Rolex' },
    { name: 'Gucci', href: '/products?brand=Gucci' },
    { name: 'Patek Philippe', href: '/products?brand=Patek Philippe' },
    { name: 'Nike', href: '/products?brand=Nike' },
    { name: 'Adidas', href: '/products?brand=Adidas' },
    { name: 'Hermès', href: '/products?brand=Hermès' },
  ];

  const supportLinks = [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping & Returns', href: '/shipping-returns' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  return (
    <footer className="relative text-foreground border-t border-border py-12 mt-16 overflow-hidden">
      {/* Ensure INTERACTIVE_BOX_PARTICLE_OPTIONS are being passed for testing */}
      <ParticlesBackground
        containerId="footer-particles"
        className="absolute inset-0 -z-10" // Ensure it's a background layer
        optionsOverride={INTERACTIVE_BOX_PARTICLE_OPTIONS}
      />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1 flex flex-col items-center text-center">
            <Link href="/" className="group inline-block mb-3">
              <Image
                src="/logo.png"
                alt="Elite Stuff Trade Logo"
                width={309}
                height={299}
                className="h-24 w-auto group-hover:opacity-80 transition-opacity duration-300" // Increased height from h-20 to h-24
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your premier destination for curated luxury goods, offering an exclusive selection of watches, high-end sneakers, designer apparel, and accessories from the world's most sought-after brands.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Featured Brands</h3>
            <ul className="space-y-2">
              {brandLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent hover:underline transform hover:-translate-y-px transition-all duration-200 ease-in-out inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
               <li>
                  <Link href="/products" className="text-sm text-accent font-medium hover:underline transform hover:-translate-y-px transition-all duration-200 ease-in-out inline-block">
                    View All Brands...
                  </Link>
                </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent hover:underline transform hover:-translate-y-px transition-all duration-200 ease-in-out inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="group flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-accent shrink-0 group-hover:text-primary group-hover:scale-110 transition-all duration-300 ease-in-out" />
                <a href="mailto:support@luxecollective.com" className="group-hover:text-primary group-hover:underline transform group-hover:-translate-y-px transition-all duration-300 ease-in-out inline-block">support@luxecollective.com</a>
              </li>
              <li className="group flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-accent shrink-0 group-hover:text-primary group-hover:scale-110 transition-all duration-300 ease-in-out" />
                <a href="tel:+18005555893" className="group-hover:text-primary group-hover:underline transform group-hover:-translate-y-px transition-all duration-300 ease-in-out inline-block">+1 (800) 555-LUXE</a>
              </li>
               <li className="text-sm text-muted-foreground pt-2">
                 123 Luxury Avenue, Suite 100<br />
                 Beverly Hills, CA 90210, USA
               </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="text-center text-xs text-muted-foreground">
          &copy; {currentYear} Elite Stuff Trade. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
