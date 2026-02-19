import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '../components/ui/button';

const packages = [
  {
    badge: 'Basic',
    price: '$399',
    title: 'Tent 20x20 without draping',
    includes: [
      '30 Garden Chairs',
      '3 Rectangular Table 8ft',
      '3 Table cloths',
      'Garden Light and walls',
      'Delivery and Tax included'
    ],
    featured: false
  },
  {
    badge: 'Delux',
    price: '$749',
    title: 'Tent 20x20 with draping',
    includes: [
      '30 Garden Chairs',
      '3 Rectangular Table 8ft',
      'Garden Lights - Walls',
      '1 Chandelier',
      '3 Table cloths',
      'Delivery and Tax included'
    ],
    featured: true
  },
  {
    badge: 'Basic',
    price: '$849',
    title: 'Tent 20x40 Without draping',
    includes: [
      '70 Garden Chairs',
      '7 Rectangular Table 8ft',
      '7 Table Cloths',
      'Garden lights & walls',
      'Delivery and Tax included'
    ],
    featured: false
  },
  {
    badge: 'Delux',
    price: '$1,299',
    title: 'Tent 20x40 with draping',
    includes: [
      '70 Garden Chairs',
      '7 Rectangular Table 8ft',
      'Garden Lights',
      '7 Table cloths',
      '2 Chandeliers',
      'Delivery and Tax included'
    ],
    featured: true
  }
];

const products = [
  {
    name: 'Resin Chairs',
    description: 'Elevate your event with our elegant White Resin Folding Chairs.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '8 FT Tables',
    description: 'Our 8-foot plastic folding tables are built for versatility and strength.',
    image: 'https://images.unsplash.com/photo-1519225468359-2996bc017a1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '6 FT Tables',
    description: 'Our 6-foot plastic folding tables are built for versatility and strength.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Round Tables',
    description: 'Our 60" plastic round folding tables are built for versatility and strength.',
    image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Tablecloths',
    description: 'Our white tablecloth adds a clean, sophisticated touch to any event.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Tent 20x20',
    description: 'Elegant tents with optional draping for outdoor weddings and parties.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

export default function Products() {
  return (
    <div>
      {/* Packages Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">Our Packages</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              At Star Event Rental, our packages are designed to help you plan your event stress-free and elegantly. 
              Each package includes high-quality tents, chairs, tables, and more that transform any space into a spectacular setting.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              By choosing one of our packages, you save time and money and ensure a professional and harmonious presentation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, idx) => (
              <div 
                key={idx}
                className={`bg-card p-8 rounded-2xl shadow-xl hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl ${
                  pkg.featured ? 'border-2 border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-card ring-2 ring-primary/20' : 'border border-border'
                }`}
              >
                <div className={`inline-block px-5 py-2 rounded-full text-sm font-bold mb-6 ${
                  pkg.featured ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}>
                  {pkg.badge}
                </div>
                <div className="text-5xl font-bold text-foreground mb-3">{pkg.price}</div>
                <h3 className="text-xl font-semibold text-card-foreground mb-6 min-h-[3rem]">{pkg.title}</h3>
                <ul className="mb-8 space-y-3">
                  {pkg.includes.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('Contact')}>
                  <Button className={`w-full font-semibold py-6 text-base ${
                    pkg.featured 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl' 
                      : 'bg-secondary hover:bg-secondary/80 text-foreground'
                  }`}>
                    Book Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">Products We Offer</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quality rental equipment for your special events
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <div key={idx} className="bg-card rounded-2xl overflow-hidden shadow-xl hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl group">
                <div 
                  className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">{product.name}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                  <Link to={createPageUrl('Contact')} className="text-primary font-semibold hover:text-primary/80 flex items-center gap-2 group/link">
                    Learn more 
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
