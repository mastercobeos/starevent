'use client';

import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: April 2, 2026',
    intro: 'Star Event Rental ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website stareventrentaltx.com, use our services, or communicate with us via phone, email, or text message.',
    sections: [
      {
        title: '1. Information We Collect',
        content: 'We may collect the following types of information:',
        list: [
          'Personal Information: Name, email address, phone number, mailing address.',
          'Event Details: Event date, location, type of event, rental equipment preferences.',
          'Payment Information: Credit/debit card details processed securely through our payment processor (Square). We do not store your full card information on our servers.',
          'Communications: Records of your interactions with us, including phone calls, emails, and text messages.',
          'Website Usage Data: IP address, browser type, pages visited, and other analytics data collected through cookies and similar technologies.',
        ],
      },
      {
        title: '2. How We Use Your Information',
        content: 'We use the information we collect to:',
        list: [
          'Process and fulfill your rental reservations and orders.',
          'Send booking confirmations, delivery reminders, and payment receipts.',
          'Communicate with you about your account, orders, and customer service inquiries.',
          'Send promotional offers, discounts, and marketing messages (with your consent).',
          'Improve our website, products, and services.',
          'Comply with legal obligations.',
        ],
      },
      {
        title: '3. SMS/Text Messaging',
        content: 'When you provide your phone number and consent to receive text messages from Star Event Rental, you agree to the following:',
        list: [
          'Message Types: We may send transactional messages (booking confirmations, delivery updates, payment reminders) and promotional messages (special offers, discounts, event tips).',
          'Message Frequency: Message frequency varies. You may receive up to 10 messages per month.',
          'Opt-Out: You can opt out of receiving text messages at any time by replying STOP to any message. After opting out, you will receive a confirmation message and will no longer receive text messages from us.',
          'Help: For help, reply HELP to any message or contact us at 281-636-0615 or info@stareventrentaltx.com.',
          'Costs: Message and data rates may apply. Check with your mobile carrier for details.',
          'Carriers Supported: Compatible with all major US carriers including AT&T, Verizon, T-Mobile, Sprint, and others.',
          'Consent Not Required: Your consent to receive SMS messages is not a condition of purchasing any goods or services from us.',
          'Privacy: We will not share your phone number or SMS opt-in data with third parties or affiliates for marketing purposes.',
        ],
      },
      {
        title: '4. Information Sharing',
        content: 'We do not sell your personal information. We may share your information with:',
        list: [
          'Service Providers: Third-party vendors who help us operate our business (payment processing, delivery, website hosting, SMS messaging services).',
          'Legal Requirements: When required by law, subpoena, or legal process.',
          'Business Transfers: In connection with any merger, sale of company assets, or acquisition.',
        ],
      },
      {
        title: '5. Data Security',
        content: 'We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
      },
      {
        title: '6. Cookies and Tracking Technologies',
        content: 'Our website uses cookies and similar tracking technologies to enhance your browsing experience and collect usage data. You can control cookies through your browser settings. We use Google Analytics to understand how visitors use our site.',
      },
      {
        title: '7. Third-Party Links',
        content: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to read the privacy policies of any third-party site you visit.',
      },
      {
        title: '8. Children\'s Privacy',
        content: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.',
      },
      {
        title: '9. Your Rights',
        content: 'Depending on your location, you may have the right to:',
        list: [
          'Access the personal information we hold about you.',
          'Request correction of inaccurate information.',
          'Request deletion of your personal information.',
          'Opt out of marketing communications.',
        ],
      },
      {
        title: '10. Changes to This Policy',
        content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.',
      },
      {
        title: '11. Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us:',
        list: [
          'Star Event Rental',
          'Address: 3730 Redwood Falls Dr, Houston, TX 77082',
          'Phone: 281-636-0615',
          'Email: info@stareventrentaltx.com',
          'Website: stareventrentaltx.com',
        ],
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última Actualización: 2 de abril de 2026',
    intro: 'Star Event Rental ("nosotros" o "nuestro") se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web stareventrentaltx.com, utiliza nuestros servicios o se comunica con nosotros por teléfono, correo electrónico o mensaje de texto.',
    sections: [
      {
        title: '1. Información que Recopilamos',
        content: 'Podemos recopilar los siguientes tipos de información:',
        list: [
          'Información Personal: Nombre, dirección de correo electrónico, número de teléfono, dirección postal.',
          'Detalles del Evento: Fecha del evento, ubicación, tipo de evento, preferencias de equipo de alquiler.',
          'Información de Pago: Datos de tarjeta de crédito/débito procesados de forma segura a través de nuestro procesador de pagos (Square). No almacenamos la información completa de su tarjeta en nuestros servidores.',
          'Comunicaciones: Registros de sus interacciones con nosotros, incluyendo llamadas telefónicas, correos electrónicos y mensajes de texto.',
          'Datos de Uso del Sitio Web: Dirección IP, tipo de navegador, páginas visitadas y otros datos analíticos recopilados a través de cookies y tecnologías similares.',
        ],
      },
      {
        title: '2. Cómo Usamos su Información',
        content: 'Usamos la información que recopilamos para:',
        list: [
          'Procesar y cumplir con sus reservaciones y pedidos de alquiler.',
          'Enviar confirmaciones de reserva, recordatorios de entrega y recibos de pago.',
          'Comunicarnos con usted sobre su cuenta, pedidos y consultas de servicio al cliente.',
          'Enviar ofertas promocionales, descuentos y mensajes de marketing (con su consentimiento).',
          'Mejorar nuestro sitio web, productos y servicios.',
          'Cumplir con obligaciones legales.',
        ],
      },
      {
        title: '3. Mensajes SMS/Texto',
        content: 'Cuando proporciona su número de teléfono y da su consentimiento para recibir mensajes de texto de Star Event Rental, acepta lo siguiente:',
        list: [
          'Tipos de Mensajes: Podemos enviar mensajes transaccionales (confirmaciones de reserva, actualizaciones de entrega, recordatorios de pago) y mensajes promocionales (ofertas especiales, descuentos, consejos para eventos).',
          'Frecuencia de Mensajes: La frecuencia de mensajes varía. Puede recibir hasta 10 mensajes por mes.',
          'Cancelación: Puede cancelar la recepción de mensajes de texto en cualquier momento respondiendo STOP a cualquier mensaje. Después de cancelar, recibirá un mensaje de confirmación y dejará de recibir mensajes de texto de nuestra parte.',
          'Ayuda: Para obtener ayuda, responda HELP a cualquier mensaje o contáctenos al 281-636-0615 o info@stareventrentaltx.com.',
          'Costos: Pueden aplicarse tarifas de mensajes y datos. Consulte con su operador móvil para más detalles.',
          'Operadores Compatibles: Compatible con todos los principales operadores de EE.UU. incluyendo AT&T, Verizon, T-Mobile, Sprint y otros.',
          'Consentimiento No Requerido: Su consentimiento para recibir mensajes SMS no es una condición para comprar productos o servicios de nuestra parte.',
          'Privacidad: No compartiremos su número de teléfono ni sus datos de suscripción a SMS con terceros o afiliados con fines de marketing.',
        ],
      },
      {
        title: '4. Compartir Información',
        content: 'No vendemos su información personal. Podemos compartir su información con:',
        list: [
          'Proveedores de Servicios: Proveedores externos que nos ayudan a operar nuestro negocio (procesamiento de pagos, entregas, alojamiento web, servicios de mensajería SMS).',
          'Requisitos Legales: Cuando lo requiera la ley, citación u otro proceso legal.',
          'Transferencias Comerciales: En relación con cualquier fusión, venta de activos de la empresa o adquisición.',
        ],
      },
      {
        title: '5. Seguridad de Datos',
        content: 'Implementamos medidas de seguridad razonables para proteger su información personal del acceso, uso o divulgación no autorizados. Sin embargo, ningún método de transmisión por internet o almacenamiento electrónico es 100% seguro, y no podemos garantizar una seguridad absoluta.',
      },
      {
        title: '6. Cookies y Tecnologías de Seguimiento',
        content: 'Nuestro sitio web utiliza cookies y tecnologías de seguimiento similares para mejorar su experiencia de navegación y recopilar datos de uso. Puede controlar las cookies a través de la configuración de su navegador. Utilizamos Google Analytics para comprender cómo los visitantes usan nuestro sitio.',
      },
      {
        title: '7. Enlaces a Terceros',
        content: 'Nuestro sitio web puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad ni del contenido de esos sitios. Le recomendamos leer las políticas de privacidad de cualquier sitio de terceros que visite.',
      },
      {
        title: '8. Privacidad de Menores',
        content: 'Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos intencionalmente información personal de menores. Si cree que hemos recopilado información de un menor, contáctenos de inmediato.',
      },
      {
        title: '9. Sus Derechos',
        content: 'Dependiendo de su ubicación, puede tener derecho a:',
        list: [
          'Acceder a la información personal que tenemos sobre usted.',
          'Solicitar la corrección de información inexacta.',
          'Solicitar la eliminación de su información personal.',
          'Cancelar la recepción de comunicaciones de marketing.',
        ],
      },
      {
        title: '10. Cambios a Esta Política',
        content: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Cualquier cambio será publicado en esta página con una fecha de "Última Actualización" actualizada. Le recomendamos revisar esta política periódicamente.',
      },
      {
        title: '11. Contáctenos',
        content: 'Si tiene alguna pregunta sobre esta Política de Privacidad, contáctenos:',
        list: [
          'Star Event Rental',
          'Dirección: 3730 Redwood Falls Dr, Houston, TX 77082',
          'Teléfono: 281-636-0615',
          'Correo: info@stareventrentaltx.com',
          'Sitio web: stareventrentaltx.com',
        ],
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t.title}</h1>
        <p className="text-muted-foreground text-sm mb-8">{t.lastUpdated}</p>
        <p className="text-muted-foreground mb-10 leading-relaxed">{t.intro}</p>

        <div className="space-y-8">
          {t.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              {section.list && (
                <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
                  {section.list.map((item, j) => (
                    <li key={j} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
