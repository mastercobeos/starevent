import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '../components/ui/button';

const benefits = [
  {
    icon: '💎',
    title: 'Personalized Service',
    description: 'Every event is unique. We help you choose the ideal furniture based on the type of celebration, space, and style you want to achieve.'
  },
  {
    icon: '⏰',
    title: 'Punctuality and Reliability',
    description: 'We know that time is key. We deliver, set up, and pick up on time, with total commitment and professionalism.'
  },
  {
    icon: '🪑',
    title: 'Quality and Presentation',
    description: 'Our products are in excellent condition: clean, durable, and ready to impress on any occasion.'
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Business, Close Relationship',
    description: 'We are passionate about what we do, and we do it as a family. We provide friendly service, responsibility, and attention to detail.'
  }
];

const stats = [
  { number: '0 K+', label: 'Happy Customers' },
  { number: '0 K+', label: 'Company Rating' },
  { number: '0+', label: 'Years Experience' }
];

export default function About() {
  return (
    <div>
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Successful Event Setup"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h4 className="text-primary uppercase text-sm font-bold tracking-wider mb-2">
                Why Choose Star Event Rental in KATY TX
              </h4>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Inspire your space through art and design
              </h2>
              <div className="space-y-6 mb-8">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="text-4xl flex-shrink-0">{benefit.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t-2 border-border">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden text-center text-foreground">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Star Event Rental Services in Houston</h2>
          <Link to={createPageUrl('Contact')}>
            <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
