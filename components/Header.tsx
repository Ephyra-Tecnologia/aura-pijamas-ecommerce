import Image from 'next/image'

// Onde está:
<Link href="/" className="logo">
  Aura <em>Pijamas</em>
</Link>

// Troca por:
<Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
  <Image
    src="/assets/aura-header.png"
    alt="Aura Pijamas"
    height={48}
    width={160}
    style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
  />
</Link>