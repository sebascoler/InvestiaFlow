import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Book, Zap, FolderOpen, LayoutDashboard, HelpCircle, Lightbulb, MessageSquare } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const HelpPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const faqs: FAQItem[] = [
    {
      question: '¿Cómo agrego un nuevo lead?',
      answer: 'Puedes agregar un lead de dos formas: 1) Haz clic en el botón "Add Lead" en la parte superior del CRM, o 2) Haz clic en el botón "+ Add Lead" en cualquier columna del Kanban. El nuevo lead se creará en el stage "Target" por defecto.',
    },
    {
      question: '¿Cómo muevo un lead entre stages?',
      answer: 'Simplemente arrastra y suelta la tarjeta del lead desde su columna actual a la columna del stage deseado. La automatización se ejecutará automáticamente si tienes reglas configuradas para ese stage.',
    },
    {
      question: '¿Cómo funcionan las automatizaciones?',
      answer: 'Las automatizaciones comparten documentos automáticamente cuando un lead alcanza un stage específico. Puedes configurar qué documentos compartir, si hay un delay, y si se envía un email de notificación. Ve a la página Automation para crear y gestionar reglas.',
    },
    {
      question: '¿Puedo configurar permisos diferentes para cada documento?',
      answer: 'Sí, cada documento puede tener permisos independientes. Haz clic en el ícono de configuración (⚙️) en cualquier documento y selecciona en qué stages debe compartirse automáticamente.',
    },
    {
      question: '¿Qué pasa si muevo un lead a un stage y no tengo reglas configuradas?',
      answer: 'El lead se moverá normalmente, pero no se compartirán documentos automáticamente. Puedes compartir documentos manualmente desde el Data Room o crear una regla de automatización para futuros leads.',
    },
    {
      question: '¿Cómo veo qué documentos se han compartido con un lead?',
      answer: 'Actualmente, los documentos compartidos se registran en la consola del navegador cuando se ejecuta una automatización. En futuras versiones, esto estará disponible en el panel de detalles del lead.',
    },
    {
      question: '¿Puedo editar un lead después de crearlo?',
      answer: 'Sí, haz clic en cualquier tarjeta de lead para abrir el panel de detalles lateral. Desde ahí puedes editar toda la información del lead, cambiar su stage, o eliminarlo.',
    },
    {
      question: '¿Qué formatos de archivo puedo subir?',
      answer: 'Puedes subir PDFs, documentos de Word, hojas de cálculo de Excel, e imágenes. El tamaño máximo recomendado es 50MB por archivo.',
    },
  ];

  const tips = [
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Organiza tus documentos por categorías para encontrarlos más fácilmente',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Usa la búsqueda y filtros en el Data Room para gestionar muchos documentos',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Crea reglas de automatización para stages comunes como "Pitch Shared" o "Due Diligence"',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Mantén actualizada la fecha de último contacto para identificar leads que necesitan seguimiento',
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      text: 'Usa las notas en cada lead para recordar detalles importantes de las conversaciones',
    },
  ];

  const sections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Comenzando con InvestiaFlow',
      icon: <Book size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">¿Qué es InvestiaFlow?</h3>
            <p className="text-gray-600">
              InvestiaFlow es una plataforma que automatiza la gestión de fundraising para startups. 
              Combina un CRM visual tipo Kanban con un Data Room inteligente que comparte documentos 
              automáticamente según el progreso de cada inversor potencial en tu pipeline.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Navegación Principal</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>CRM Pipeline:</strong> Gestiona tus leads e inversores en un tablero Kanban visual</li>
              <li><strong>Data Room:</strong> Sube y organiza documentos para compartir con inversores</li>
              <li><strong>Automation:</strong> Configura reglas para compartir documentos automáticamente</li>
              <li><strong>Settings:</strong> Configuración de tu cuenta (próximamente)</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'crm',
      title: 'Usando el CRM Pipeline',
      icon: <LayoutDashboard size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Stages del Pipeline</h3>
            <p className="text-gray-600 mb-3">
              Tu pipeline está organizado en 8 stages que representan el progreso de cada inversor:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { emoji: '🎯', name: 'Target', desc: 'Inversores identificados pero sin contacto' },
                { emoji: '📧', name: 'First Contact', desc: 'Primera comunicación establecida' },
                { emoji: '💬', name: 'In Conversation', desc: 'Conversaciones activas en curso' },
                { emoji: '📊', name: 'Pitch Shared', desc: 'Pitch deck compartido' },
                { emoji: '🔍', name: 'Due Diligence', desc: 'Proceso de due diligence iniciado' },
                { emoji: '📝', name: 'Term Sheet', desc: 'Term sheet recibido o en negociación' },
                { emoji: '✅', name: 'Committed', desc: 'Inversor comprometido' },
                { emoji: '❌', name: 'Passed', desc: 'Inversor que no avanzó' },
              ].map((stage) => (
                <div key={stage.name} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-xl">{stage.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{stage.name}</p>
                    <p className="text-xs text-gray-600">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestión de Leads</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Agregar Lead:</strong> Usa el botón "Add Lead" o el botón "+" en cualquier columna</li>
              <li><strong>Mover Lead:</strong> Arrastra y suelta la tarjeta entre columnas</li>
              <li><strong>Ver Detalles:</strong> Haz clic en cualquier tarjeta para abrir el panel lateral</li>
              <li><strong>Editar Lead:</strong> Abre el panel de detalles y haz clic en "Edit Lead"</li>
              <li><strong>Eliminar Lead:</strong> Desde el panel de detalles, haz clic en "Delete Lead"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Indicadores Visuales</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Badge "Follow up needed":</strong> Aparece cuando un lead no ha tenido contacto en más de 14 días</li>
              <li><strong>Borde naranja:</strong> Indica que el lead necesita seguimiento</li>
              <li><strong>Contador en columnas:</strong> Muestra cuántos leads hay en cada stage</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dataroom',
      title: 'Gestionando el Data Room',
      icon: <FolderOpen size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Subir Documentos</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Haz clic en "Upload Document"</li>
              <li>Arrastra y suelta un archivo o haz clic para seleccionarlo</li>
              <li>Selecciona la categoría (Pitch, Financials, Legal, Metrics, Other)</li>
              <li>Agrega una descripción opcional</li>
              <li>Haz clic en "Upload Document"</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Categorías de Documentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
              <div><strong>Pitch:</strong> Pitch decks, presentaciones</div>
              <div><strong>Financials:</strong> Modelos financieros, cap tables</div>
              <div><strong>Legal:</strong> Term sheets, contratos, políticas</div>
              <div><strong>Metrics:</strong> Dashboards, métricas de producto</div>
              <div><strong>Other:</strong> Otros documentos relevantes</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Configurar Permisos</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Haz clic en el ícono de configuración (⚙️) en cualquier documento</li>
              <li>Marca los stages en los que quieres compartir el documento automáticamente</li>
              <li>Configura un delay opcional (días después del stage)</li>
              <li>Activa el envío de email si deseas notificar al inversor</li>
              <li>Guarda los cambios</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Búsqueda y Filtros</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Usa la barra de búsqueda para encontrar documentos por nombre o descripción</li>
              <li>Filtra por categoría usando el dropdown</li>
              <li>Los resultados se actualizan en tiempo real</li>
            </ul>
          </div>
        </div>
      ),
    },
      {
        id: 'automation',
        title: 'Configurando Automatizaciones',
        icon: <Zap size={20} />,
        content: (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué son las Automatizaciones?</h3>
              <p className="text-gray-600">
                Las automatizaciones te permiten compartir documentos automáticamente cuando un lead 
                alcanza un stage específico. Esto ahorra tiempo y asegura que los inversores reciban 
                la información correcta en el momento adecuado.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Crear una Regla de Automatización</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Ve a la página "Automation"</li>
                <li>Haz clic en "Create Rule"</li>
                <li>Dale un nombre descriptivo a tu regla</li>
                <li>Selecciona el stage que activará la regla (trigger stage)</li>
                <li>Elige los documentos que quieres compartir</li>
                <li>Configura un delay opcional (0 = inmediato)</li>
                <li>Opcionalmente, configura un email de notificación con variables como {'{{name}}'}, {'{{firm}}'}</li>
                <li>Activa la regla y guárdala</li>
              </ol>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">⏱️ ¿Para qué sirve el Delay y cómo usarlo bien?</h3>
              <p className="text-gray-700 mb-3">
                El <strong>delay</strong> es el número de días que esperarás <em>después</em> de que un lead 
                alcance un stage antes de compartir los documentos automáticamente.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Delay = 0 (Inmediato):</p>
                  <p className="text-gray-700 text-sm">
                    Los documentos se comparten tan pronto como el lead entra al stage. 
                    <strong> Úsalo cuando:</strong> Quieres que el inversor tenga acceso inmediato a la información 
                    (ej: compartir pitch deck cuando llega a "Pitch Shared").
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Delay {'>'} 0 (Con espera):</p>
                  <p className="text-gray-700 text-sm">
                    Los documentos se comparten después de X días en el stage. 
                    <strong> Úsalo cuando:</strong> Quieres dar tiempo para que el inversor procese información 
                    antes de compartir más documentos, o cuando hay un proceso secuencial (ej: compartir 
                    financials 3 días después de entrar a "Due Diligence" para que primero revisen el pitch).
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-yellow-300">
                  <p className="text-sm font-medium text-gray-900 mb-1">💡 Ejemplo práctico:</p>
                  <p className="text-sm text-gray-700">
                    Lead entra a "Due Diligence" el 1 de febrero. Si configuras delay de 5 días, 
                    los documentos se compartirán automáticamente el 6 de febrero, dando tiempo 
                    para que el inversor revise primero los documentos iniciales.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🚀 ¿Cómo hacer Automatizaciones Eficientes?</h3>
              <p className="text-gray-700 mb-3">
                La clave está en entender la <strong>diferencia entre Permisos de Documentos y Reglas de Automatización</strong>, 
                y cuándo usar cada una:
              </p>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded border border-green-300">
                  <p className="font-medium text-gray-900 mb-2">📋 Permisos de Documentos (Data Room):</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-2">
                    <li>Definen <strong>cuándo</strong> un documento puede ser compartido</li>
                    <li>Se configuran por documento individual</li>
                    <li>Son más simples: solo marcas stages y delays</li>
                    <li>Útiles para documentos que siempre se comparten en los mismos stages</li>
                  </ul>
                  <p className="text-xs text-gray-600 italic">
                    Ejemplo: "El pitch deck siempre se comparte cuando un lead llega a 'Pitch Shared'"
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-green-300">
                  <p className="font-medium text-gray-900 mb-2">⚙️ Reglas de Automatización:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-2">
                    <li>Definen <strong>qué documentos</strong> compartir y <strong>cómo</strong> hacerlo</li>
                    <li>Pueden agrupar múltiples documentos en una acción</li>
                    <li>Permiten personalizar emails con templates</li>
                    <li>Útiles para flujos complejos o cuando quieres controlar el proceso</li>
                  </ul>
                  <p className="text-xs text-gray-600 italic">
                    Ejemplo: "Cuando un lead llega a 'Due Diligence', compartir financials Y cap table, 
                    con un email personalizado explicando qué incluyen"
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-300">
                  <p className="font-medium text-gray-900 mb-2">🎯 Cuándo usar cada una:</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Usa Permisos cuando:</p>
                      <ul className="list-disc list-inside text-gray-700 ml-2">
                        <li>Tienes documentos que siempre se comparten igual</li>
                        <li>Quieres configuración rápida y simple</li>
                        <li>Cada documento tiene su propio timing</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Usa Reglas cuando:</p>
                      <ul className="list-disc list-inside text-gray-700 ml-2">
                        <li>Quieres agrupar varios documentos en una acción</li>
                        <li>Necesitas emails personalizados con contexto</li>
                        <li>Tienes flujos complejos que requieren lógica específica</li>
                        <li>Quieres activar/desactivar grupos de documentos fácilmente</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-300">
                  <p className="font-medium text-gray-900 mb-2">✨ Mejores Prácticas:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li><strong>Combina ambos:</strong> Usa permisos para documentos básicos y reglas para paquetes especiales</li>
                    <li><strong>Nombra bien tus reglas:</strong> "Share Pitch Package on Pitch Shared" es mejor que "Rule 1"</li>
                    <li><strong>Revisa regularmente:</strong> Desactiva reglas que ya no uses</li>
                    <li><strong>Prueba primero:</strong> Crea un lead de prueba para verificar que las automatizaciones funcionen</li>
                    <li><strong>Documenta en notas:</strong> Cuando mueves un lead, agrega notas explicando por qué</li>
                  </ol>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Variables de Email</h3>
              <p className="text-gray-600 mb-2">Puedes usar estas variables en tus templates de email:</p>
              <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                <div><code className="bg-white px-2 py-1 rounded">{'{{name}}'}</code> - Nombre del lead</div>
                <div><code className="bg-white px-2 py-1 rounded">{'{{firm}}'}</code> - Nombre de la firma</div>
                <div><code className="bg-white px-2 py-1 rounded">{'{{email}}'}</code> - Email del lead</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestionar Reglas</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Activar/Desactivar:</strong> Usa el toggle en cada regla para activarla o desactivarla</li>
                <li><strong>Editar:</strong> Haz clic en el ícono de editar para modificar una regla existente</li>
                <li><strong>Eliminar:</strong> Haz clic en el ícono de eliminar para borrar una regla</li>
                <li><strong>Múltiples Reglas:</strong> Puedes tener varias reglas para el mismo stage</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Las automatizaciones se ejecutan automáticamente cuando mueves un lead 
                a un nuevo stage. Revisa la consola del navegador para ver los logs de ejecución.
              </p>
            </div>
          </div>
        ),
      },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
        </div>
        <p className="text-gray-600">
          Aprende a usar InvestiaFlow para gestionar tu proceso de fundraising de manera eficiente
        </p>
      </div>

      {/* Secciones principales */}
      <div className="space-y-4 mb-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary-600">{section.icon}</div>
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDown className="text-gray-400" size={20} />
              ) : (
                <ChevronRight className="text-gray-400" size={20} />
              )}
            </button>
            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4">{section.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="text-primary-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Preguntas Frecuentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(`faq-${index}`)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFAQs.has(`faq-${index}`) ? (
                  <ChevronDown className="text-gray-400" size={20} />
                ) : (
                  <ChevronRight className="text-gray-400" size={20} />
                )}
              </button>
              {expandedFAQs.has(`faq-${index}`) && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips y Mejores Prácticas */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="text-yellow-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Tips y Mejores Prácticas</h2>
        </div>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              {tip.icon}
              <p className="text-gray-700 flex-1">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contacto */}
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>
          ¿Necesitas más ayuda? Contacta a{' '}
          <a href="mailto:sebas@investia.capital" className="text-primary-600 hover:underline">
            sebas@investia.capital
          </a>
        </p>
      </div>
    </div>
  );
};

export default HelpPage;
