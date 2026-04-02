'use client';

import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated: April 2, 2026',
    intro: 'Welcome to Star Event Rental. By accessing our website stareventrentaltx.com or using our services, you agree to be bound by these Terms of Service. Please read them carefully before using our services.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By accessing or using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.',
      },
      {
        title: '2. Services Description',
        content: 'Star Event Rental provides event rental equipment and services in the Houston, Texas metropolitan area. Our services include, but are not limited to, the rental of tents, tables, chairs, tablecloths, linens, dance floors, and other event equipment. We also provide delivery, setup, and pickup services.',
      },
      {
        title: '3. Reservations and Payments',
        content: 'All reservations are subject to the following conditions:',
        list: [
          'A deposit is required to confirm your reservation. The deposit amount varies based on the order total.',
          'Full payment is due prior to the event date unless otherwise agreed upon in writing.',
          'Prices are subject to change without notice. However, confirmed reservations will be honored at the quoted price.',
          'Payments are processed securely through Square. We accept major credit and debit cards.',
          'All prices are in US Dollars (USD).',
        ],
      },
      {
        title: '4. Cancellation and Refund Policy',
        content: 'Our cancellation policy is as follows:',
        list: [
          'Cancellations made 7 or more days before the event date will receive a full refund of the deposit.',
          'Cancellations made less than 7 days before the event date may be subject to forfeiture of the deposit.',
          'No-shows or same-day cancellations are non-refundable.',
          'Weather-related cancellations will be handled on a case-by-case basis.',
          'To cancel a reservation, please contact us at 281-636-0615 or info@stareventrentaltx.com.',
        ],
      },
      {
        title: '5. Rental Equipment',
        content: 'By renting equipment from Star Event Rental, you agree to:',
        list: [
          'Use the equipment only for its intended purpose.',
          'Return all equipment in the same condition it was delivered.',
          'Not move, relocate, or disassemble equipment that was set up by our team without prior authorization.',
          'Be responsible for any loss, theft, or damage to rental equipment while in your possession.',
          'Allow our team access to the event location for delivery, setup, and pickup at agreed-upon times.',
        ],
      },
      {
        title: '6. Delivery and Pickup',
        content: 'Delivery and pickup times are scheduled in advance and confirmed with you. We will make every effort to arrive within the scheduled window. Star Event Rental is not responsible for delays caused by traffic, weather, or conditions beyond our control. The event location must be accessible and clear for delivery and pickup.',
      },
      {
        title: '7. SMS/Text Message Communications',
        content: 'By providing your phone number and opting in to receive text messages, you agree to the following terms:',
        list: [
          'You consent to receive text messages from Star Event Rental regarding your reservations, deliveries, payments, and promotional offers.',
          'Message frequency varies. You may receive up to 10 messages per month.',
          'Message and data rates may apply. Check with your carrier for details.',
          'You may opt out at any time by replying STOP to any text message.',
          'For assistance, reply HELP or contact us at 281-636-0615.',
          'Your consent to receive text messages is not required as a condition to purchase goods or services.',
          'We will not share your phone number with third parties for marketing purposes.',
          'Carriers are not liable for delayed or undelivered messages.',
          'You must be 18 years of age or older to subscribe to our SMS messages. By opting in, you confirm that you are at least 18 years old.',
        ],
      },
      {
        title: '8. Limitation of Liability',
        content: 'To the fullest extent permitted by law, Star Event Rental shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services or rental equipment. Our total liability for any claim shall not exceed the total amount paid by you for the specific rental at issue.',
      },
      {
        title: '9. Indemnification',
        content: 'You agree to indemnify and hold harmless Star Event Rental, its owners, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney\'s fees) arising from your use of rental equipment, violation of these Terms, or negligence.',
      },
      {
        title: '10. Force Majeure',
        content: 'Star Event Rental shall not be held liable for any failure to perform our obligations when such failure results from circumstances beyond our reasonable control, including but not limited to natural disasters, severe weather, pandemics, government actions, or other force majeure events.',
      },
      {
        title: '11. Governing Law',
        content: 'These Terms of Service shall be governed by and construed in accordance with the laws of the State of Texas. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Harris County, Texas.',
      },
      {
        title: '12. Changes to Terms',
        content: 'We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services after any changes constitutes acceptance of the new terms.',
      },
      {
        title: '13. Contact Us',
        content: 'If you have any questions about these Terms of Service, please contact us:',
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
    title: 'Términos de Servicio',
    lastUpdated: 'Última Actualización: 2 de abril de 2026',
    intro: 'Bienvenido a Star Event Rental. Al acceder a nuestro sitio web stareventrentaltx.com o utilizar nuestros servicios, usted acepta estar sujeto a estos Términos de Servicio. Por favor léalos cuidadosamente antes de usar nuestros servicios.',
    sections: [
      {
        title: '1. Aceptación de los Términos',
        content: 'Al acceder o utilizar nuestro sitio web y servicios, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos de Servicio y nuestra Política de Privacidad. Si no está de acuerdo con estos términos, por favor no utilice nuestros servicios.',
      },
      {
        title: '2. Descripción de Servicios',
        content: 'Star Event Rental proporciona equipo de alquiler para eventos y servicios en el área metropolitana de Houston, Texas. Nuestros servicios incluyen, pero no se limitan a, el alquiler de carpas, mesas, sillas, manteles, mantelería, pistas de baile y otros equipos para eventos. También proporcionamos servicios de entrega, instalación y recolección.',
      },
      {
        title: '3. Reservaciones y Pagos',
        content: 'Todas las reservaciones están sujetas a las siguientes condiciones:',
        list: [
          'Se requiere un depósito para confirmar su reservación. El monto del depósito varía según el total del pedido.',
          'El pago total debe realizarse antes de la fecha del evento, a menos que se acuerde lo contrario por escrito.',
          'Los precios están sujetos a cambios sin previo aviso. Sin embargo, las reservaciones confirmadas se respetarán al precio cotizado.',
          'Los pagos se procesan de forma segura a través de Square. Aceptamos las principales tarjetas de crédito y débito.',
          'Todos los precios están en dólares estadounidenses (USD).',
        ],
      },
      {
        title: '4. Política de Cancelación y Reembolso',
        content: 'Nuestra política de cancelación es la siguiente:',
        list: [
          'Las cancelaciones realizadas 7 o más días antes de la fecha del evento recibirán un reembolso completo del depósito.',
          'Las cancelaciones realizadas con menos de 7 días de anticipación pueden estar sujetas a la pérdida del depósito.',
          'Las ausencias o cancelaciones del mismo día no son reembolsables.',
          'Las cancelaciones relacionadas con el clima se manejarán caso por caso.',
          'Para cancelar una reservación, contáctenos al 281-636-0615 o info@stareventrentaltx.com.',
        ],
      },
      {
        title: '5. Equipo de Alquiler',
        content: 'Al alquilar equipo de Star Event Rental, usted acepta:',
        list: [
          'Usar el equipo solo para su propósito previsto.',
          'Devolver todo el equipo en las mismas condiciones en que fue entregado.',
          'No mover, reubicar ni desarmar el equipo instalado por nuestro equipo sin autorización previa.',
          'Ser responsable de cualquier pérdida, robo o daño al equipo de alquiler mientras esté en su posesión.',
          'Permitir a nuestro equipo acceso al lugar del evento para la entrega, instalación y recolección en los horarios acordados.',
        ],
      },
      {
        title: '6. Entrega y Recolección',
        content: 'Los horarios de entrega y recolección se programan con anticipación y se confirman con usted. Haremos todo lo posible por llegar dentro del horario programado. Star Event Rental no es responsable por retrasos causados por tráfico, clima o condiciones fuera de nuestro control. El lugar del evento debe estar accesible y despejado para la entrega y recolección.',
      },
      {
        title: '7. Comunicaciones por SMS/Mensaje de Texto',
        content: 'Al proporcionar su número de teléfono y optar por recibir mensajes de texto, usted acepta los siguientes términos:',
        list: [
          'Usted consiente recibir mensajes de texto de Star Event Rental sobre sus reservaciones, entregas, pagos y ofertas promocionales.',
          'La frecuencia de mensajes varía. Puede recibir hasta 10 mensajes por mes.',
          'Pueden aplicarse tarifas de mensajes y datos. Consulte con su operador para más detalles.',
          'Puede cancelar en cualquier momento respondiendo STOP a cualquier mensaje de texto.',
          'Para obtener asistencia, responda HELP o contáctenos al 281-636-0615.',
          'Su consentimiento para recibir mensajes de texto no es un requisito para comprar bienes o servicios.',
          'No compartiremos su número de teléfono con terceros con fines de marketing.',
          'Los operadores no son responsables por mensajes retrasados o no entregados.',
          'Debe tener 18 años de edad o más para suscribirse a nuestros mensajes SMS. Al optar por recibirlos, confirma que tiene al menos 18 años.',
        ],
      },
      {
        title: '8. Limitación de Responsabilidad',
        content: 'En la medida máxima permitida por la ley, Star Event Rental no será responsable por ningún daño indirecto, incidental, especial, consecuente o punitivo que surja de o esté relacionado con el uso de nuestros servicios o equipo de alquiler. Nuestra responsabilidad total por cualquier reclamación no excederá el monto total pagado por usted por el alquiler específico en cuestión.',
      },
      {
        title: '9. Indemnización',
        content: 'Usted acepta indemnizar y mantener indemne a Star Event Rental, sus propietarios, empleados y agentes de cualquier reclamación, daño, pérdida o gasto (incluidos los honorarios razonables de abogados) que surjan del uso del equipo de alquiler, la violación de estos Términos o su negligencia.',
      },
      {
        title: '10. Fuerza Mayor',
        content: 'Star Event Rental no será responsable por cualquier incumplimiento de nuestras obligaciones cuando dicho incumplimiento resulte de circunstancias fuera de nuestro control razonable, incluyendo pero sin limitarse a desastres naturales, clima severo, pandemias, acciones gubernamentales u otros eventos de fuerza mayor.',
      },
      {
        title: '11. Ley Aplicable',
        content: 'Estos Términos de Servicio se regirán e interpretarán de acuerdo con las leyes del Estado de Texas. Cualquier disputa que surja bajo estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales ubicados en el Condado de Harris, Texas.',
      },
      {
        title: '12. Cambios a los Términos',
        content: 'Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Los cambios se publicarán en esta página con una fecha de "Última Actualización" actualizada. Su uso continuado de nuestros servicios después de cualquier cambio constituye la aceptación de los nuevos términos.',
      },
      {
        title: '13. Contáctenos',
        content: 'Si tiene alguna pregunta sobre estos Términos de Servicio, contáctenos:',
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

export default function TermsOfServicePage() {
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
