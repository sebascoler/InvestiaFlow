"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getLangFromSearchParams, type Lang } from '@/lib/copy'

const articleClass = "max-w-4xl mx-auto px-4 sm:px-6 py-16"
const sectionClass = "mb-8"
const h1Class = "text-3xl font-bold font-heading text-navy mb-2"
const h2Class = "text-xl font-semibold font-heading text-navy mb-4"
const h3Class = "text-lg font-semibold text-navy mb-3"
const pClass = "leading-relaxed mb-4"
const ulClass = "list-disc pl-6 space-y-2 leading-relaxed"
const ulClassMb = "list-disc pl-6 space-y-2 mb-6 leading-relaxed"
const dateClass = "text-gray-600 mb-8"

function PrivacyContentInner() {
  const searchParams = useSearchParams()
  const lang: Lang = getLangFromSearchParams({ lang: searchParams.get('lang') ?? undefined })

  if (lang === 'es') {
    return (
      <article className={articleClass}>
        <h1 className={h1Class}>Política de Privacidad de InvestiaFlow</h1>
        <p className={dateClass}>Última actualización: 13 de febrero de 2026</p>

        <p className="leading-relaxed mb-8">
          Esta Política de Privacidad explica cómo InvestiaFlow (&quot;nosotros&quot;, &quot;nuestro/a&quot;) recopila y utiliza datos personales cuando usas nuestro servicio de CRM y Data Room para fundraising (el &quot;Servicio&quot;).
        </p>

        <section className={sectionClass}>
          <h2 className={h2Class}>1) Quiénes somos (Responsable)</h2>
          <p className={pClass}>
            InvestiaFlow es el responsable del tratamiento de los datos personales tratados en relación con el Servicio.
          </p>
          <p className="leading-relaxed">Contacto: support@investiaflow.com</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2) Qué datos recopilamos</h2>
          <p className="leading-relaxed mb-6">
            Recopilamos las siguientes categorías de datos personales:
          </p>

          <h3 className={h3Class}>A. Datos de cuenta y perfil</h3>
          <ul className={ulClassMb}>
            <li>Nombre</li>
            <li>Email</li>
            <li>Credenciales y configuración de cuenta (p. ej., preferencias del workspace)</li>
          </ul>

          <h3 className={h3Class}>B. Datos de uso y técnicos</h3>
          <ul className={ulClassMb}>
            <li>Registros y eventos de uso (p. ej., funcionalidades usadas, marcas de tiempo, acciones)</li>
            <li>Datos técnicos (p. ej., IP, navegador/dispositivo, ubicación aproximada derivada de IP)</li>
            <li>Registros de diagnóstico y seguridad</li>
          </ul>

          <h3 className={h3Class}>C. Contenido del cliente</h3>
          <ul className={ulClassMb}>
            <li>Archivos y documentos subidos (p. ej., pitch decks, financials, etc.)</li>
            <li>Datos introducidos en el CRM (p. ej., nombres/emails de inversores, notas, interacciones)</li>
            <li>Configuración de compartición y logs de acceso (p. ej., invitaciones, accesos a enlaces)</li>
          </ul>

          <h3 className={h3Class}>D. Datos de facturación</h3>
          <p className="leading-relaxed mb-3">
            No almacenamos datos completos de tarjeta. Los pagos los gestiona Paddle como Merchant of Record. Podemos recibir metadatos como:
          </p>
          <ul className={ulClass}>
            <li>Estado de suscripción, plan, fechas de renovación</li>
            <li>Identificadores de transacción, datos de factura</li>
            <li>País e información fiscal/IVA (si aplica)</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3) Para qué usamos tus datos</h2>
          <p className={pClass}>Usamos datos personales para:</p>
          <ul className={ulClass}>
            <li>Prestar, operar y mantener el Servicio (cuentas, autenticación, almacenamiento, compartición)</li>
            <li>Gestionar suscripciones y estado de facturación (vía Paddle)</li>
            <li>Mejorar el Servicio (analítica de producto, resolución de incidencias, rendimiento)</li>
            <li>Soporte y comunicaciones (mensajes operativos, respuesta a solicitudes)</li>
            <li>Proteger el Servicio (prevención de fraude/abuso, seguridad)</li>
            <li>Cumplir obligaciones legales y hacer cumplir nuestros términos</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4) Base legal (GDPR)</h2>
          <p className={pClass}>Nos basamos en:</p>
          <ul className={ulClass}>
            <li><strong>Contrato (Art. 6(1)(b))</strong>: para prestar el Servicio y gestionar tu cuenta.</li>
            <li><strong>Interés legítimo (Art. 6(1)(f))</strong>: para asegurar, mantener y mejorar el Servicio; prevenir abusos; y operar el negocio.</li>
            <li><strong>Obligación legal (Art. 6(1)(c))</strong>: para cumplir obligaciones fiscales/contables u otras exigidas por ley.</li>
            <li><strong>Consentimiento (Art. 6(1)(a))</strong>: cuando sea necesario (por ejemplo, determinadas cookies/analíticas no esenciales, si se usan). Puedes retirar el consentimiento en cualquier momento.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5) Encargados y terceros</h2>
          <p className={pClass}>
            Usamos proveedores (&quot;encargados del tratamiento&quot;) para operar el Servicio, como:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
            <li>Paddle (Merchant of Record): pagos, facturación e impuestos.</li>
            <li>Proveedores de cloud/hosting/almacenamiento: alojamiento y almacenamiento de datos/documentos.</li>
            <li>Proveedores de email: envío de correos transaccionales (invitaciones, notificaciones, etc.).</li>
            <li>Analítica y monitorización de errores (si está activada): para entender uso y corregir fallos.</li>
          </ul>
          <p className="leading-relaxed">
            Compartimos datos solo en la medida necesaria para prestar el Servicio y bajo acuerdos y salvaguardas apropiadas.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6) Transferencias internacionales</h2>
          <p className={pClass}>
            Algunos proveedores pueden tratar datos fuera del EEE, incluyendo Reino Unido u otros países. Cuando proceda, utilizamos salvaguardas adecuadas como:
          </p>
          <ul className={ulClass}>
            <li>decisiones de adecuación (cuando aplique), y/o</li>
            <li>Cláusulas Contractuales Tipo y medidas complementarias.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7) Conservación</h2>
          <p className={pClass}>Conservamos los datos solo el tiempo necesario:</p>
          <ul className={ulClass}>
            <li><strong>Datos de cuenta</strong>: mientras la cuenta esté activa.</li>
            <li><strong>Contenido del cliente</strong>: mientras lo mantengas en el Servicio y la cuenta esté activa.</li>
            <li><strong>Tras el cierre</strong>: eliminaremos o anonimizaremos en un plazo razonable, salvo que debamos conservar ciertos datos por obligaciones legales/fiscales/contables o para resolver disputas (p. ej., facturación).</li>
            <li><strong>Backups</strong>: pueden conservar datos durante un tiempo limitado hasta su sobrescritura.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8) Seguridad</h2>
          <p className="leading-relaxed">
            Aplicamos medidas razonables para proteger los datos frente a accesos no autorizados, pérdida o alteración. Ningún sistema es 100% seguro; no podemos garantizar seguridad absoluta.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9) Tus derechos</h2>
          <p className={pClass}>
            Según la ley aplicable, puedes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
            <li>Acceder a tus datos</li>
            <li>Rectificarlos</li>
            <li>Solicitar su eliminación</li>
            <li>Limitar el tratamiento</li>
            <li>Oponerte (especialmente cuando se basa en interés legítimo)</li>
            <li>Portabilidad (cuando aplique)</li>
            <li>Retirar el consentimiento (si aplica)</li>
          </ul>
          <p className={pClass}>
            Para ejercerlos, escribe a support@investiaflow.com. Podremos verificar tu identidad.
          </p>
          <p className="leading-relaxed">
            También puedes presentar una reclamación ante tu autoridad de protección de datos.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10) Cookies</h2>
          <p className="leading-relaxed">
            El Servicio puede usar cookies o tecnologías similares para autenticación, seguridad y funcionamiento. Si usamos cookies/analítica no esencial, solicitaremos consentimiento cuando sea necesario.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11) Cambios</h2>
          <p className={pClass}>
            Podemos actualizar esta Política. Publicaremos la versión actualizada y cambiaremos la fecha de &quot;Última actualización&quot;.
          </p>
          <p className="leading-relaxed">Contacto: support@investiaflow.com</p>
        </section>
      </article>
    )
  }

  // English (default)
  return (
    <article className={articleClass}>
      <h1 className={h1Class}>InvestiaFlow Privacy Policy</h1>
      <p className={dateClass}>Last updated: 13 February 2026</p>

      <p className="leading-relaxed mb-8">
        This Privacy Policy explains how InvestiaFlow (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects and uses personal data when you use our CRM and Data Room service for fundraising workflows (the &quot;Service&quot;).
      </p>

      <section className={sectionClass}>
        <h2 className={h2Class}>1) Who we are (Controller)</h2>
        <p className={pClass}>
          InvestiaFlow is the controller of personal data processed in connection with the Service.
        </p>
        <p className="leading-relaxed">Contact: support@investiaflow.com</p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2) What data we collect</h2>
        <p className="leading-relaxed mb-6">
          We collect the following categories of personal data:
        </p>

        <h3 className={h3Class}>A. Account and profile data</h3>
        <ul className={ulClassMb}>
          <li>Name</li>
          <li>Email address</li>
          <li>Account credentials and settings (e.g., workspace preferences)</li>
        </ul>

        <h3 className={h3Class}>B. Usage and device data</h3>
        <ul className={ulClassMb}>
          <li>Log data and usage events (e.g., features used, timestamps, pages/actions)</li>
          <li>Technical data (e.g., IP address, device/browser information, approximate location derived from IP)</li>
          <li>Diagnostics and security logs</li>
        </ul>

        <h3 className={h3Class}>C. Customer content</h3>
        <ul className={ulClassMb}>
          <li>Files and documents you upload (e.g., pitch decks, financials, cap tables, investor updates)</li>
          <li>CRM data you enter (e.g., investor names, emails, notes, interactions)</li>
          <li>Sharing settings and access logs (e.g., who was invited, when links were accessed)</li>
        </ul>

        <h3 className={h3Class}>D. Billing data</h3>
        <p className="leading-relaxed mb-3">
          We do not store full payment card details. Payments are handled by Paddle as Merchant of Record. We may receive billing-related metadata such as:
        </p>
        <ul className={ulClass}>
          <li>Subscription status, plan, renewal dates</li>
          <li>Transaction identifiers, invoice details</li>
          <li>Country and VAT/tax-related information (where applicable)</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3) How we use your data</h2>
        <p className={pClass}>We use personal data to:</p>
        <ul className={ulClass}>
          <li>Provide, operate, and maintain the Service (accounts, authentication, storage, document sharing)</li>
          <li>Process subscriptions and manage billing status (via Paddle)</li>
          <li>Improve the Service (product analytics, troubleshooting, performance)</li>
          <li>Provide support and communicate with you (service messages, responses to requests)</li>
          <li>Protect the Service (fraud prevention, abuse monitoring, security)</li>
          <li>Comply with legal obligations and enforce our terms</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4) Legal bases (GDPR)</h2>
        <p className={pClass}>We rely on the following legal bases under the GDPR:</p>
        <ul className={ulClass}>
          <li><strong>Contract (Art. 6(1)(b))</strong>: to provide the Service, manage accounts, and deliver features you request.</li>
          <li><strong>Legitimate interests (Art. 6(1)(f))</strong>: to secure, maintain, and improve the Service; prevent abuse; and run our business efficiently. We balance these interests against your rights.</li>
          <li><strong>Legal obligation (Art. 6(1)(c))</strong>: to meet tax, accounting, and other legal requirements (e.g., invoicing records).</li>
          <li><strong>Consent (Art. 6(1)(a))</strong>: where required (for example, certain non-essential cookies/analytics, if used). You may withdraw consent at any time.</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5) Processors and third parties</h2>
        <p className={pClass}>
          We use trusted service providers (&quot;processors&quot;) to operate the Service, such as:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
          <li>Paddle (Merchant of Record): subscription payments, invoicing, taxes, and payment support.</li>
          <li>Cloud hosting and storage providers: to host the application and store data/documents.</li>
          <li>Email delivery providers: to send transactional emails (e.g., invites, notifications, password resets).</li>
          <li>Analytics and error monitoring (if enabled): to understand usage and fix issues.</li>
        </ul>
        <p className="leading-relaxed">
          We only share personal data with processors as needed to provide the Service, under appropriate contractual safeguards.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6) International transfers</h2>
        <p className={pClass}>
          Some of our processors may process data outside the European Economic Area (&quot;EEA&quot;), including in the United Kingdom or other countries. Where required, we rely on appropriate safeguards such as:
        </p>
        <ul className={ulClass}>
          <li>adequacy decisions (where applicable), and/or</li>
          <li>Standard Contractual Clauses and supplementary measures.</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7) Data retention</h2>
        <p className={pClass}>We keep personal data only as long as necessary:</p>
        <ul className={ulClass}>
          <li><strong>Account data</strong>: for as long as your account is active.</li>
          <li><strong>Customer content</strong>: for as long as you keep it in the Service and your account remains active.</li>
          <li><strong>After account closure</strong>: we will delete or anonymize personal data within a reasonable period, unless we must retain certain data for legal, tax, accounting, or dispute-resolution purposes (e.g., invoicing records).</li>
          <li><strong>Backups</strong>: data may persist for a limited time in backups before being overwritten.</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>8) Security</h2>
        <p className="leading-relaxed">
          We use reasonable administrative, technical, and organizational measures designed to protect personal data against unauthorized access, loss, misuse, or alteration. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>9) Your rights</h2>
        <p className={pClass}>
          Subject to applicable law, you may have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed">
          <li>Access your personal data</li>
          <li>Rectify inaccurate data</li>
          <li>Request deletion</li>
          <li>Restrict processing</li>
          <li>Object to processing (especially where we rely on legitimate interests)</li>
          <li>Data portability (where applicable)</li>
          <li>Withdraw consent (where processing is based on consent)</li>
        </ul>
        <p className={pClass}>
          To exercise rights, contact support@investiaflow.com. We may need to verify your identity.
        </p>
        <p className="leading-relaxed">
          You also have the right to lodge a complaint with your local data protection authority.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>10) Cookies</h2>
        <p className="leading-relaxed">
          The Service may use cookies or similar technologies for authentication, security, and basic functionality. If we use non-essential analytics cookies, we will request consent where required.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>11) Changes to this policy</h2>
        <p className={pClass}>
          We may update this Privacy Policy from time to time. We will post the updated version in the Service and update the &quot;Last updated&quot; date.
        </p>
        <p className="leading-relaxed">Contact: support@investiaflow.com</p>
      </section>
    </article>
  )
}

export function PrivacyContent() {
  return (
    <Suspense fallback={<div className={articleClass}>Loading...</div>}>
      <PrivacyContentInner />
    </Suspense>
  )
}
