import Image from 'next/image';

export function BackgroundSection({ imageSrc, children, className = '', id }) {
  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          quality={75}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 to-slate-900/65" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
