"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getLangFromSearchParams, type Lang } from '@/lib/copy'

const articleClass = "max-w-4xl mx-auto px-4 sm:px-6 py-16"
const sectionClass = "mb-8"
const h1Class = "text-3xl font-bold font-heading text-navy mb-2"
const h2Class = "text-xl font-semibold font-heading text-navy mb-4"
const pClass = "leading-relaxed mb-4"
const ulClass = "list-disc pl-6 space-y-2 leading-relaxed"
const dateClass = "text-gray-600 mb-8"

function TermsContentInner() {
  const searchParams = useSearchParams()
  const lang: Lang = getLangFromSearchParams({ lang: searchParams.get('lang') ?? undefined })

  if (lang === 'es') {
    return (
      <article className={articleClass}>
        <h1 className={h1Class}>Términos del Servicio de InvestiaFlow</h1>
        <p className={dateClass}>Última actualización: 13 de febrero de 2026</p>

        <p className="leading-relaxed mb-8">
          Estos Términos del Servicio (&quot;Términos&quot;) regulan el acceso y uso del servicio de CRM y Data Room de InvestiaFlow (el &quot;Servicio&quot;). Al crear una cuenta o usar el Servicio, aceptas estos Términos en tu nombre y, si corresponde, en nombre de tu empresa.
        </p>

        <section className={sectionClass}>
          <h2 className={h2Class}>1) El Servicio</h2>
          <p className={pClass}>
            InvestiaFlow es un software B2B para ayudar a founders y startups a gestionar inversores (CRM), alojar materiales (Data Room) y automatizar la compartición de documentos.
          </p>
          <p className="leading-relaxed">
            Importante: No somos banco, bróker, custodio, proveedor de pagos ni asesores financieros. No gestionamos dinero de terceros. No garantizamos resultados de fundraising.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2) Elegibilidad y cuenta</h2>
          <ul className={ulClass}>
            <li>Debes tener al menos 18 años y capacidad legal para contratar.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad en tu cuenta.</li>
            <li>Debes aportar información veraz y mantenerla actualizada.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3) Responsabilidad del usuario y uso aceptable</h2>
          <p className={pClass}>
            Te comprometes a usar el Servicio de forma legal y responsable. No debes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
            <li>Subir o compartir contenido sin derechos para ello</li>
            <li>Subir contenido ilegal, infractor, difamatorio o dañino</li>
            <li>Intentar eludir la seguridad o explotar vulnerabilidades</li>
            <li>Interferir con el Servicio (malware, automatizaciones abusivas, etc.)</li>
            <li>Usar el Servicio para spam o comunicaciones engañosas</li>
            <li>Usar el Servicio incumpliendo obligaciones de privacidad, confidencialidad o normas aplicables (incluidas las que te afecten en materia de promoción/valores)</li>
          </ul>
          <p className="leading-relaxed">
            Eres responsable de tu proceso de fundraising, tus comunicaciones y tu cumplimiento normativo.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4) Contenido del cliente (tus datos y documentos)</h2>
          <p className={pClass}>
            &quot;Contenido del Cliente&quot; incluye cualquier dato, texto, archivo o documento que subas o introduzcas (incluyendo CRM y Data Room).
          </p>
          <ul className={ulClass}>
            <li>Mantienes la propiedad del Contenido del Cliente.</li>
            <li>Concedes a InvestiaFlow un derecho limitado y no exclusivo para alojar, almacenar, procesar y mostrar dicho contenido únicamente para operar y mejorar el Servicio y prestar soporte.</li>
            <li>Declaras que tienes los derechos necesarios para subir y compartir el contenido y que no infringes leyes ni derechos de terceros.</li>
            <li>Eres responsable de configurar los permisos y decidir quién accede a tu Data Room.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5) Propiedad intelectual</h2>
          <p className={pClass}>
            El Servicio, su software, diseño y marca son propiedad de InvestiaFlow y están protegidos por leyes de propiedad intelectual. Te concedemos un derecho limitado, no exclusivo y no transferible para usar el Servicio durante tu suscripción, sujeto a estos Términos.
          </p>
          <p className="leading-relaxed">
            Si aportas feedback, nos autorizas a usarlo sin restricciones ni compensación.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6) Planes, cobro y pagos (Paddle como Merchant of Record)</h2>
          <p className={pClass}>
            Ofrecemos planes Free y Pro (mensual o anual).
          </p>
          <p className={pClass}>
            Los pagos los procesa Paddle, que actúa como Merchant of Record. Esto implica:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
            <li>Paddle gestiona el cobro, impuestos/IVA (si aplica), facturación y soporte de pago de las transacciones.</li>
            <li>Tu compra puede estar sujeta también a los términos de checkout y privacidad de Paddle.</li>
          </ul>
          <p className="leading-relaxed">
            Podemos cambiar precios y características de planes con el tiempo. Si afecta a tu plan de pago, lo aplicaremos normalmente en la renovación o según notifiquemos.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7) Renovación automática</h2>
          <p className="leading-relaxed">
            Las suscripciones de pago se renuevan automáticamente al final de cada periodo salvo que canceles antes de la fecha de renovación. Los cargos de renovación los gestiona Paddle.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8) Cancelación y reembolsos</h2>
          <p className={pClass}>
            Puedes cancelar a través del flujo de facturación de Paddle o desde el Servicio cuando esté disponible. La cancelación detiene renovaciones futuras; normalmente no reembolsa importes ya pagados del periodo en curso, salvo obligación legal o indicación expresa en el momento de compra.
          </p>
          <p className="leading-relaxed">
            Los reembolsos (si proceden) se gestionan a través de Paddle, conforme a los términos de compra y la ley aplicable.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9) Suspensión y terminación</h2>
          <p className={pClass}>
            Podemos suspender o terminar el acceso si:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
            <li>Incumples materialmente estos Términos,</li>
            <li>Tu uso supone un riesgo de seguridad,</li>
            <li>Lo exige la ley, o</li>
            <li>No pagas las tarifas aplicables (planes de pago).</li>
          </ul>
          <p className="leading-relaxed">
            Puedes dejar de usar el Servicio en cualquier momento. Tras la terminación, tu derecho de uso finaliza.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10) Exclusión de garantías</h2>
          <p className={pClass}>
            El Servicio se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;. En la medida máxima permitida por la ley:
          </p>
          <ul className={ulClass}>
            <li>No garantizamos funcionamiento ininterrumpido o libre de errores.</li>
            <li>No garantizamos que el Servicio cumpla necesidades específicas ni resultados de fundraising.</li>
            <li>No garantizamos la exactitud o integridad del Contenido del Cliente ni de información de terceros.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11) Limitación de responsabilidad</h2>
          <p className={pClass}>
            En la medida máxima permitida por la ley:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
            <li>InvestiaFlow no será responsable por daños indirectos, incidentales, especiales, consecuenciales o punitivos, ni por pérdida de beneficios, ingresos, reputación o datos, incluso si fueran previsibles.</li>
            <li>Nuestra responsabilidad total por reclamaciones relacionadas con el Servicio no excederá lo pagado por ti en los 12 meses anteriores al hecho que origine la reclamación. Si estás en el plan Free, no excederá 100 EUR.</li>
          </ul>
          <p className="leading-relaxed">
            Nada limita responsabilidades que no puedan limitarse por ley (por ejemplo, fraude).
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>12) Indemnidad (B2B)</h2>
          <p className="leading-relaxed">
            Si usas el Servicio en nombre de una empresa, aceptas indemnizar a InvestiaFlow ante reclamaciones derivadas de tu Contenido del Cliente, tu uso indebido del Servicio o tu incumplimiento de estos Términos.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>13) Cambios en el Servicio o en los Términos</h2>
          <p className="leading-relaxed">
            Podemos actualizar el Servicio y estos Términos. Si hay cambios materiales, daremos un aviso razonable publicando la versión actualizada y modificando la fecha de &quot;Última actualización&quot;. El uso continuado implica aceptación.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>14) Ley aplicable y jurisdicción</h2>
          <p className="leading-relaxed">
            Estos Términos se rigen por las leyes de Irlanda, excluyendo normas de conflicto. Los tribunales de Irlanda tendrán jurisdicción, salvo que la ley imperativa aplicable disponga otra cosa.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>15) Contacto</h2>
          <p className="leading-relaxed">Consultas sobre estos Términos: support@investiaflow.com</p>
        </section>
      </article>
    )
  }

  // English (default)
  return (
    <article className={articleClass}>
      <h1 className={h1Class}>InvestiaFlow Terms of Service</h1>
      <p className={dateClass}>Last updated: 13 February 2026</p>

      <p className="leading-relaxed mb-8">
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of InvestiaFlow&apos;s CRM and Data Room service (the &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms on behalf of yourself and, if applicable, your company.
      </p>

      <section className={sectionClass}>
        <h2 className={h2Class}>1) The Service</h2>
        <p className={pClass}>
          InvestiaFlow is a B2B software service designed to help founders and startups manage investor relationships (CRM), host fundraising materials (Data Room), and automate document sharing.
        </p>
        <p className="leading-relaxed">
          Important: We are not a bank, broker, custodian, payment provider, or financial advisor. We do not handle third-party funds. We do not guarantee fundraising outcomes.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2) Eligibility and account</h2>
        <ul className={ulClass}>
          <li>You must be at least 18 years old and able to form a contract.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity on your account.</li>
          <li>You must provide accurate account information and keep it updated.</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3) Your responsibilities and acceptable use</h2>
        <p className={pClass}>
          You agree to use the Service lawfully and responsibly. You must not:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
          <li>Upload or share content you do not have the rights to use</li>
          <li>Upload unlawful, infringing, defamatory, or harmful content</li>
          <li>Attempt to bypass security, probe, scan, or test vulnerabilities</li>
          <li>Interfere with the Service, including through malware or abusive automated requests</li>
          <li>Use the Service to send spam or deceptive communications</li>
          <li>Use the Service in violation of privacy, confidentiality, or securities/financial promotion laws applicable to you</li>
        </ul>
        <p className="leading-relaxed">
          You are responsible for your fundraising process, communications, and compliance obligations.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4) Customer content (your uploads and data)</h2>
        <p className={pClass}>
          &quot;Customer Content&quot; means any data, text, files, documents, or materials you upload or input into the Service, including CRM records and Data Room documents.
        </p>
        <ul className={ulClass}>
          <li>You retain ownership of your Customer Content.</li>
          <li>You grant InvestiaFlow a limited, non-exclusive right to host, store, process, and display Customer Content solely to operate and improve the Service and provide support.</li>
          <li>You represent that you have all rights necessary to upload and share Customer Content and that doing so does not violate any law or third-party rights.</li>
          <li>You are responsible for configuring sharing permissions and deciding who can access your Data Room.</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5) Intellectual property</h2>
        <p className={pClass}>
          The Service, including its software, design, and branding, is owned by InvestiaFlow and protected by intellectual property laws. You receive a limited, non-exclusive, non-transferable right to use the Service during your subscription term, subject to these Terms.
        </p>
        <p className="leading-relaxed">
          If you provide feedback, you grant us permission to use it without restriction or compensation.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6) Plans, billing, and payments (Paddle as Merchant of Record)</h2>
        <p className={pClass}>
          We offer Free and Pro plans (monthly or annual).
        </p>
        <p className={pClass}>
          Payments are processed by Paddle, which acts as Merchant of Record. This means:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
          <li>Paddle handles payment processing, taxes/VAT (where applicable), invoicing, and payment customer support for transactions.</li>
          <li>Your purchase may be subject to Paddle&apos;s checkout terms and privacy practices in addition to these Terms.</li>
        </ul>
        <p className="leading-relaxed">
          We may change pricing and plan features over time. If changes affect your paid plan, we will apply them at renewal or as otherwise notified.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7) Auto-renewal</h2>
        <p className="leading-relaxed">
          Paid subscriptions renew automatically at the end of each billing period unless you cancel before the renewal date. Renewal charges are handled by Paddle.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>8) Cancellation and refunds</h2>
        <p className={pClass}>
          You can cancel your subscription through the billing flow provided by Paddle or within the Service where available. Cancellation stops future renewals; it does not typically refund amounts already paid for a current billing period unless required by law or expressly stated at purchase.
        </p>
        <p className="leading-relaxed">
          Refund handling (if any) is managed through Paddle, consistent with the checkout terms and applicable law.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>9) Suspension and termination</h2>
        <p className={pClass}>
          We may suspend or terminate your access if:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
          <li>You materially breach these Terms,</li>
          <li>Your use poses a security risk to the Service or others,</li>
          <li>We are required to do so by law, or</li>
          <li>You fail to pay applicable fees (for paid plans).</li>
        </ul>
        <p className="leading-relaxed">
          You may stop using the Service at any time. Upon termination, your right to use the Service ends.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>10) Disclaimers</h2>
        <p className={pClass}>
          The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law:
        </p>
        <ul className={ulClass}>
          <li>We do not warrant uninterrupted, error-free operation.</li>
          <li>We do not warrant that the Service will meet your specific fundraising needs or produce any results.</li>
          <li>We do not warrant the accuracy or completeness of Customer Content or third-party data.</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>11) Limitation of liability</h2>
        <p className={pClass}>
          To the maximum extent permitted by law:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
          <li>InvestiaFlow will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, goodwill, or data, even if foreseeable.</li>
          <li>Our total liability for all claims relating to the Service will not exceed the amounts paid by you for the Service in the 12 months before the event giving rise to the claim. If you are on the Free plan, our total liability will not exceed EUR 100.</li>
        </ul>
        <p className="leading-relaxed">
          Nothing in these Terms limits liability that cannot be limited under applicable law (for example, liability for fraud).
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>12) Indemnity (B2B)</h2>
        <p className="leading-relaxed">
          If you use the Service on behalf of a business, you agree to indemnify and hold InvestiaFlow harmless from claims arising from your Customer Content, your misuse of the Service, or your breach of these Terms.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>13) Changes to the Service or Terms</h2>
        <p className="leading-relaxed">
          We may update the Service and these Terms from time to time. If we make material changes, we will provide reasonable notice by posting an updated version and updating the &quot;Last updated&quot; date. Continued use of the Service after changes become effective means you accept the updated Terms.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>14) Governing law and jurisdiction</h2>
        <p className="leading-relaxed">
          These Terms are governed by the laws of Ireland, excluding conflict of law rules. The courts of Ireland will have jurisdiction over disputes arising out of these Terms, except where mandatory law requires otherwise.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>15) Contact</h2>
        <p className="leading-relaxed">Questions about these Terms: support@investiaflow.com</p>
      </section>
    </article>
  )
}

export function TermsContent() {
  return (
    <Suspense fallback={<div className={articleClass}>Loading...</div>}>
      <TermsContentInner />
    </Suspense>
  )
}
