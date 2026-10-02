// Genera data/catalog.json + imágenes optimizadas a partir de lo extraído de Canva.
// Uso: node _build/build.mjs   (requiere sharp, instalado en _extract/node_modules)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, '_extract/package.json'));
const sharp = require('sharp');

const SRC = path.join(ROOT, '_extract/trim');
const OUT = path.join(ROOT, 'assets/img/products');
fs.mkdirSync(OUT, { recursive: true });

// ---------- Colecciones ----------
const collections = [
  { id: 'calibre-japones', name: { es: 'Calibre Japonés', pt: 'Calibre Japonês', en: 'Japanese Calibre' },
    tagline: { es: 'Automáticos Miyota & Seiko', pt: 'Automáticos Miyota & Seiko', en: 'Miyota & Seiko automatics' },
    cover: 'pd-1661' },
  { id: 'meca-cuarzo', name: { es: 'Meca-Cuarzo', pt: 'Meca-Quartzo', en: 'Meca-Quartz' },
    tagline: { es: 'Cronógrafos Seiko VK', pt: 'Cronógrafos Seiko VK', en: 'Seiko VK chronographs' },
    cover: 'pd-1644' },
  { id: 'entrada', name: { es: 'Línea Entrada', pt: 'Linha Entrada', en: 'Entry Line' },
    tagline: { es: 'Tu primer automático', pt: 'Seu primeiro automático', en: 'Your first automatic' },
    cover: 'pd-ys025' },
  { id: 'femeninos', name: { es: 'Femeninos', pt: 'Femininos', en: "Women's" },
    tagline: { es: 'Elegancia en cada detalle', pt: 'Elegância em cada detalhe', en: 'Elegance in every detail' },
    cover: 'pd-1737l' },
];

// ---------- Productos ----------
// v: [nombre de versión, imagen fuente, precio, precio anterior]
const SAPPHIRE = 'Zafiro AR';
const products = [
  { code: 'PD-1651', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215 (Citizen)',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero', 'caucho'], bezel: true, featured: true,
    features: { es: 'Bisel giratorio · Correa Oyster, Jubilee o caucho', pt: 'Bisel giratório · Pulseira Oyster, Jubilee ou borracha', en: 'Rotating bezel · Oyster, Jubilee or rubber strap' },
    desc: { es: 'Deportivo y versátil: bisel giratorio, cristal de zafiro y calibre automático Miyota. Del agua a la oficina sin cambiar de reloj.',
            pt: 'Esportivo e versátil: bisel giratório, cristal de safira e calibre automático Miyota. Da água ao escritório sem trocar de relógio.',
            en: 'Sporty and versatile: rotating bezel, sapphire crystal and a Miyota automatic calibre. From the water to the office without switching watches.' },
    hero: 'japones-p02-0',
    v: [['Azul degradé · Acero', 'japones-p03-0', 950000, 1050000], ['Azul · Bisel negro · Acero', 'japones-p03-1', 950000, 1050000],
        ['Negro · Acero', 'japones-p03-2', 950000, 1050000], ['Gris · Acero', 'japones-p03-3', 950000, 1050000],
        ['Negro · Oro rosa · Caucho', 'japones-p04-0', 980000], ['Gris · Caucho', 'japones-p04-1', 980000],
        ['Azul · Caucho', 'japones-p04-2', 980000], ['Negro · Caucho', 'japones-p04-3', 980000]] },

  { code: 'PD-1783', nick: 'Day-Date', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215 (Citizen)',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'], featured: true,
    features: { es: 'Fecha y día de la semana · Brazalete President', pt: 'Data e dia da semana · Pulseira President', en: 'Date and day of the week · President bracelet' },
    desc: { es: 'Un clásico de vestir con día y fecha a la vista, bisel estriado y brazalete President. Nueve combinaciones de esfera y metal.',
            pt: 'Um clássico social com dia e data à vista, bisel canelado e pulseira President. Nove combinações de mostrador e metal.',
            en: 'A dress classic with day and date on display, fluted bezel and President bracelet. Nine dial and metal combinations.' },
    hero: 'japones-p05-0',
    v: [['Celeste · Acero', 'japones-p06-0', 1100000, 1250000], ['Azul · Acero', 'japones-p06-1', 1100000, 1250000],
        ['Gris · Acero', 'japones-p06-2', 1100000, 1250000], ['Verde · Oro rosa', 'japones-p06-3', 1100000, 1250000],
        ['Bronce · Oro rosa', 'japones-p06-4', 1100000, 1250000], ['Negro · Oro rosa', 'japones-p06-5', 1100000, 1250000],
        ['Negro · Dorado', 'japones-p06-6', 1100000, 1250000], ['Blanco · Dorado', 'japones-p06-7', 1100000, 1250000],
        ['Verde · Dorado', 'japones-p06-8', 1100000, 1250000]] },

  { code: 'PD-1645', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215 (Citizen)',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Fecha · Brazalete Jubilee', pt: 'Data · Pulseira Jubilee', en: 'Date · Jubilee bracelet' },
    desc: { es: 'Bisel estriado, brazalete Jubilee y fecha con lupa. La elegancia de siempre con un automático japonés confiable.',
            pt: 'Bisel canelado, pulseira Jubilee e data com lupa. A elegância de sempre com um automático japonês confiável.',
            en: 'Fluted bezel, Jubilee bracelet and magnified date. Timeless elegance powered by a reliable Japanese automatic.' },
    hero: 'japones-p07-0',
    v: [['Champagne · Bicolor dorado', 'japones-p08-0', 960000], ['Negro · Bicolor dorado', 'japones-p08-1', 960000],
        ['Celeste · Acero', 'japones-p08-2', 960000], ['Plata · Acero', 'japones-p08-3', 960000],
        ['Verde · Acero', 'japones-p08-4', 960000], ['Gris · Acero', 'japones-p08-5', 960000], ['Azul · Acero', 'japones-p08-6', 960000]] },

  { code: 'PD-1673', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215',
    case_mm: '39', water_m: 100, crystal: SAPPHIRE, straps: ['acero', 'caucho'], featured: true,
    features: { es: 'Caja octogonal · Esfera texturizada · Acero o caucho', pt: 'Caixa octogonal · Mostrador texturizado · Aço ou borracha', en: 'Octagonal case · Textured dial · Steel or rubber' },
    desc: { es: 'Caja octogonal con brazalete integrado y esfera con textura de cuadrícula. Diseño icónico de los 70, en versión acero o caucho.',
            pt: 'Caixa octogonal com pulseira integrada e mostrador com textura quadriculada. Design icônico dos anos 70, em aço ou borracha.',
            en: 'Octagonal case with integrated bracelet and grid-textured dial. An iconic 70s design, in steel or rubber.' },
    hero: 'japones-p09-0',
    v: [['Azul · Acero', 'japones-p10-0', 1100000, 1250000], ['Plata · Acero', 'japones-p10-1', 1100000, 1250000],
        ['Negro · Acero', 'japones-p10-2', 1100000, 1250000], ['Celeste · Acero', 'japones-p10-3', 1100000, 1250000],
        ['Azul · Caucho', 'japones-p11-0', 1100000, 1250000], ['Negro · Caucho', 'japones-p11-1', 1100000, 1250000],
        ['Celeste · Caucho', 'japones-p11-2', 1100000, 1250000], ['Plata · Caucho', 'japones-p11-3', 1100000, 1250000]] },

  { code: 'PD-1661', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215 (Citizen)',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'], bezel: true,
    features: { es: 'Bisel giratorio de buceo · Brazalete de acero', pt: 'Bisel giratório de mergulho · Pulseira de aço', en: 'Rotating dive bezel · Steel bracelet' },
    desc: { es: 'El buceador por excelencia: bisel giratorio, índices luminosos y 100 m de resistencia. Seis combinaciones de esfera y bisel.',
            pt: 'O mergulhador por excelência: bisel giratório, índices luminosos e 100 m de resistência. Seis combinações de mostrador e bisel.',
            en: 'The quintessential diver: rotating bezel, luminous indices and 100 m water resistance. Six dial and bezel combinations.' },
    hero: 'japones-p12-0',
    v: [['Celeste · Acero', 'japones-p12-0', 950000, 1050000], ['Azul · Bisel negro', 'japones-p13-0', 950000, 1050000],
        ['Verde · Bisel verde', 'japones-p13-1', 950000, 1050000], ['Negro · Bisel azul y rojo', 'japones-p13-2', 950000, 1050000],
        ['Negro · Bisel negro', 'japones-p13-3', 950000, 1050000], ['Negro · Bisel verde', 'japones-p13-4', 950000, 1050000],
        ['Negro · Bisel azul', 'japones-p13-5', 950000, 1050000]] },

  { code: 'PD-1753', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215 (Citizen) / Seiko NH35',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Brazalete integrado · Elegí calibre Miyota o Seiko', pt: 'Pulseira integrada · Escolha calibre Miyota ou Seiko', en: 'Integrated bracelet · Choose Miyota or Seiko calibre' },
    desc: { es: 'Líneas limpias, brazalete integrado y esfera con acabado cepillado. Disponible con calibre Miyota 8215 o Seiko NH35.',
            pt: 'Linhas limpas, pulseira integrada e mostrador escovado. Disponível com calibre Miyota 8215 ou Seiko NH35.',
            en: 'Clean lines, integrated bracelet and brushed dial. Available with a Miyota 8215 or Seiko NH35 calibre.' },
    hero: 'japones-p14-0',
    v: [['Verde · Miyota 8215', 'japones-p15-0', 1050000, 1200000], ['Azul · Miyota 8215', 'japones-p15-1', 1050000, 1200000],
        ['Negro · Miyota 8215', 'japones-p15-2', 1050000, 1200000], ['Verde · Seiko NH35', 'japones-p16-0', 1300000],
        ['Azul · Seiko NH35', 'japones-p16-1', 1300000], ['Negro · Seiko NH35', 'japones-p16-2', 1300000]] },

  { code: 'PD-YS027', collection: 'calibre-japones', type: 'automatico', movement: 'Miyota 8215',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Esfera texturizada · Bisel estriado', pt: 'Mostrador texturizado · Bisel canelado', en: 'Textured dial · Fluted bezel' },
    desc: { es: 'Esfera con relieve ondulado, numerales aplicados y bisel estriado. Un automático con personalidad propia.',
            pt: 'Mostrador com relevo ondulado, numerais aplicados e bisel canelado. Um automático com personalidade própria.',
            en: 'Wave-textured dial, applied numerals and fluted bezel. An automatic with a personality of its own.' },
    hero: 'japones-p17-0',
    v: [['Celeste · Acero', 'japones-p17-0', 950000, 1050000], ['Negro · Bicolor oro rosa', 'japones-p18-0', 950000, 1050000]] },

  { code: 'PD-1644', nick: 'Cronógrafo', collection: 'meca-cuarzo', type: 'mecacuarzo', movement: 'Seiko VK63',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero', 'caucho'], featured: true,
    features: { es: 'Cronógrafo · Escala taquimétrica · Acero o caucho', pt: 'Cronógrafo · Escala taquimétrica · Aço ou borracha', en: 'Chronograph · Tachymeter scale · Steel or rubber' },
    desc: { es: 'Cronógrafo de inspiración racing con escala taquimétrica y calibre Seiko VK63: la precisión del cuarzo con el barrido del mecánico.',
            pt: 'Cronógrafo de inspiração racing com escala taquimétrica e calibre Seiko VK63: a precisão do quartzo com o movimento do mecânico.',
            en: 'Racing-inspired chronograph with tachymeter scale and Seiko VK63 calibre: quartz precision with a mechanical sweep.' },
    hero: 'meca-p02-0',
    v: [['Blanco · Bisel negro · Acero', 'meca-p03-0', 775000, 850000], ['Negro · Acero', 'meca-p03-1', 775000, 850000],
        ['Negro · PVD negro', 'meca-p03-2', 775000, 850000], ['Blanco · Subesferas negras · Acero', 'meca-p03-3', 775000, 850000],
        ['Negro · Oro rosa · Caucho', 'meca-p04-0', 800000, 850000], ['Salmón · Oro rosa · Caucho', 'meca-p04-1', 800000, 850000],
        ['Negro · Caucho', 'meca-p04-2', 800000, 850000], ['Blanco · Caucho', 'meca-p04-3', 800000, 850000],
        ['Blanco · Oro rosa · Caucho', 'meca-p04-4', 800000, 850000], ['Blanco · Oro rosa · Acero', 'meca-p05-0', 900000, 980000],
        ['Salmón · Bicolor', 'meca-p05-1', 900000, 980000], ['Blanco · Bicolor', 'meca-p05-2', 900000, 980000],
        ['Chocolate · Bicolor', 'meca-p05-3', 900000, 980000], ['Negro · Bicolor', 'meca-p05-4', 900000, 980000]] },

  { code: 'PD-1701', nick: 'Cronógrafo', collection: 'meca-cuarzo', type: 'mecacuarzo', movement: 'Seiko VK63',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero', 'nylon'],
    features: { es: 'Cronógrafo · Acero o nylon', pt: 'Cronógrafo · Aço ou nylon', en: 'Chronograph · Steel or nylon' },
    desc: { es: 'Cronógrafo de espíritu aeronáutico con bisel taquimétrico. En brazalete de acero o correa de nylon para un look más casual.',
            pt: 'Cronógrafo de espírito aeronáutico com bisel taquimétrico. Em pulseira de aço ou nylon para um visual mais casual.',
            en: 'Aviation-spirited chronograph with tachymeter bezel. On a steel bracelet or nylon strap for a more casual look.' },
    hero: 'meca-p06-0',
    v: [['Negro · Nylon', 'meca-p07-0', 800000, 900000], ['Negro · Acero', 'meca-p07-1', 800000, 900000],
        ['Blanco · Acero', 'meca-p07-2', 800000, 900000], ['Azul · Acero', 'meca-p08-0', 900000, 980000],
        ['Blanco y azul · Nylon', 'meca-p08-1', 900000, 980000], ['Blanco y azul · Acero', 'meca-p08-2', 900000, 980000]] },

  { code: 'PD-1707', nick: 'Cronógrafo', collection: 'meca-cuarzo', type: 'mecacuarzo', movement: 'Seiko VK63',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Cronógrafo · Caja octogonal · Brazalete integrado', pt: 'Cronógrafo · Caixa octogonal · Pulseira integrada', en: 'Chronograph · Octagonal case · Integrated bracelet' },
    desc: { es: 'La caja octogonal más deseada, ahora con cronógrafo. Esfera texturizada, brazalete integrado y calibre Seiko VK63.',
            pt: 'A caixa octogonal mais desejada, agora com cronógrafo. Mostrador texturizado, pulseira integrada e calibre Seiko VK63.',
            en: 'The most coveted octagonal case, now with a chronograph. Textured dial, integrated bracelet and Seiko VK63 calibre.' },
    hero: 'meca-p09-0',
    v: [['Azul · Acero', 'meca-p10-0', 900000, 980000], ['Celeste · Acero', 'meca-p10-1', 900000, 980000],
        ['Negro · Acero', 'meca-p10-2', 900000, 980000], ['Blanco · Acero', 'meca-p10-3', 900000, 980000]] },

  { code: 'PD-1689', collection: 'meca-cuarzo', type: 'mecacuarzo', movement: 'Seiko VH65',
    case_mm: '39', water_m: 100, crystal: SAPPHIRE, straps: ['cuero'],
    features: { es: 'Reserva de marcha · Correa de cuero', pt: 'Reserva de marcha · Pulseira de couro', en: 'Power reserve · Leather strap' },
    desc: { es: 'Reloj de vestir con indicador de reserva de marcha y correa de cuero. Discreto, fino y perfecto para el día a día.',
            pt: 'Relógio social com indicador de reserva de marcha e pulseira de couro. Discreto, fino e perfeito para o dia a dia.',
            en: 'Dress watch with power-reserve indicator and leather strap. Understated, refined and perfect for every day.' },
    hero: 'meca-p11-0',
    v: [['Blanco · Oro rosa · Cuero marrón', 'meca-p11-0', 600000, 650000], ['Azul · Cuero azul', 'meca-p12-0', 600000, 650000],
        ['Negro · Oro rosa · Cuero negro', 'meca-p12-1', 600000, 650000], ['Blanco · Cuero marrón', 'meca-p12-2', 600000, 650000],
        ['Negro · Cuero negro', 'meca-p12-3', 600000, 650000]] },

  { code: 'PD-1662', nick: 'GMT', collection: 'entrada', type: 'automatico', movement: 'Automático',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'], bezel: true, featured: true,
    features: { es: 'Doble zona horaria y fecha · Bisel giratorio 24 h', pt: 'Duplo fuso horário e data · Bisel giratório 24 h', en: 'Dual time zone and date · 24 h rotating bezel' },
    desc: { es: 'Para el que viaja: aguja GMT para un segundo huso horario, bisel bicolor de 24 horas y fecha. Seis combinaciones de bisel.',
            pt: 'Para quem viaja: ponteiro GMT para um segundo fuso horário, bisel bicolor de 24 horas e data. Seis combinações de bisel.',
            en: 'For the traveller: GMT hand for a second time zone, two-tone 24-hour bezel and date. Six bezel combinations.' },
    hero: 'entrada-p02-0',
    v: [['Bisel azul y negro · Oyster', 'entrada-p02-0', 850000, 950000], ['Bisel marrón y negro · Bicolor oro rosa', 'entrada-p03-0', 850000, 950000],
        ['Bisel azul y rojo · Jubilee', 'entrada-p03-1', 850000, 950000], ['Bisel azul y negro · Jubilee', 'entrada-p03-2', 850000, 950000],
        ['Bisel rojo y negro · Oyster', 'entrada-p03-3', 850000, 950000], ['Bisel gris y negro · Jubilee', 'entrada-p03-4', 850000, 950000],
        ['Bisel verde y negro · Oyster', 'entrada-p03-5', 850000, 950000]] },

  { code: 'PD-1752', nick: 'Day-Date', collection: 'entrada', type: 'automatico', movement: 'Automático',
    case_mm: '36', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Fecha y día de la semana · Caja 36 mm', pt: 'Data e dia da semana · Caixa 36 mm', en: 'Date and day of the week · 36 mm case' },
    desc: { es: 'El Day-Date en un tamaño más compacto de 36 mm. Ideal para muñecas finas o para quien prefiere un estilo clásico.',
            pt: 'O Day-Date em um tamanho mais compacto de 36 mm. Ideal para pulsos finos ou para quem prefere um estilo clássico.',
            en: 'The Day-Date in a more compact 36 mm size. Ideal for slimmer wrists or a more classic style.' },
    hero: 'entrada-p04-0',
    v: [['Blanco · Bicolor oro rosa', 'entrada-p04-0', 900000], ['Celeste · Acero', 'entrada-p05-0', 900000],
        ['Azul · Acero', 'entrada-p05-1', 900000], ['Bronce · Oro rosa', 'entrada-p05-2', 900000],
        ['Negro · Oro rosa', 'entrada-p05-3', 900000], ['Negro · Dorado', 'entrada-p05-4', 900000],
        ['Blanco · Dorado', 'entrada-p05-5', 900000], ['Chocolate · Bicolor oro rosa', 'entrada-p05-6', 900000],
        ['Plata · Acero', 'entrada-p05-7', 900000]] },

  { code: 'PD-1728', collection: 'entrada', type: 'automatico', movement: 'Automático',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Caja cojín · Esfera horizontal estriada', pt: 'Caixa almofada · Mostrador horizontal canelado', en: 'Cushion case · Horizontally striped dial' },
    desc: { es: 'Caja tipo cojín con brazalete integrado y esfera de líneas horizontales. Deportivo-elegante, en acero u oro rosa.',
            pt: 'Caixa tipo almofada com pulseira integrada e mostrador de linhas horizontais. Esportivo-elegante, em aço ou ouro rosé.',
            en: 'Cushion case with integrated bracelet and horizontally striped dial. Sports-elegant, in steel or rose gold.' },
    hero: 'entrada-p06-0',
    v: [['Azul · Acero', 'entrada-p07-0', 850000, 920000], ['Turquesa · Acero', 'entrada-p07-1', 850000, 920000],
        ['Verde · Acero', 'entrada-p07-2', 850000, 920000], ['Negro · Oro rosa', 'entrada-p07-3', 850000, 920000],
        ['Chocolate · Oro rosa', 'entrada-p07-4', 850000, 920000], ['Blanco · Acero', 'entrada-p07-5', 850000, 920000]] },

  { code: 'PD-YS025', nick: 'Corazón abierto', collection: 'entrada', type: 'automatico', movement: 'Automático',
    case_mm: '40', water_m: 100, crystal: SAPPHIRE, straps: ['acero'], featured: true,
    features: { es: 'Corazón abierto: el volante a la vista', pt: 'Coração aberto: o balanço à vista', en: 'Open heart: balance wheel on display' },
    desc: { es: 'Una ventana en la esfera deja ver el volante latiendo. Caja cojín, brazalete integrado y degradé de esfera.',
            pt: 'Uma janela no mostrador revela o balanço pulsando. Caixa almofada, pulseira integrada e mostrador degradê.',
            en: 'A window in the dial reveals the beating balance wheel. Cushion case, integrated bracelet and gradient dial.' },
    hero: 'entrada-p08-0',
    v: [['Chocolate · Bicolor oro rosa', 'entrada-p09-0', 1000000], ['Salmón · Bicolor oro rosa', 'entrada-p09-1', 1000000],
        ['Gris humo · Acero', 'entrada-p09-2', 1000000], ['Azul petróleo · Acero', 'entrada-p09-3', 1000000]] },

  { code: 'PD-1737L', collection: 'femeninos', type: 'cuarzo', movement: 'Ronda 762 (Suiza)',
    case_mm: '22 × 36', water_m: 100, crystal: SAPPHIRE, straps: ['acero'], featured: true,
    features: { es: 'Cuarzo suizo · Esfera de nácar · Engaste de cristales', pt: 'Quartzo suíço · Mostrador de madrepérola · Cristais cravejados', en: 'Swiss quartz · Mother-of-pearl dial · Crystal-set case' },
    desc: { es: 'Caja rectangular en tono oro rosa con engaste de cristales y esfera de nácar. Calibre suizo Ronda para una precisión impecable.',
            pt: 'Caixa retangular em tom ouro rosé com cristais cravejados e mostrador de madrepérola. Calibre suíço Ronda para precisão impecável.',
            en: 'Rose-gold-tone rectangular case set with crystals and a mother-of-pearl dial. Swiss Ronda calibre for flawless precision.' },
    hero: 'fem-pd-1737l-main-0',
    v: [['Nácar · Oro rosa', 'fem-pd-1737l-var-2', 550000, 600000], ['Gris nácar · Oro rosa', 'fem-pd-1737l-var-0', 550000, 600000],
        ['Rojo · Oro rosa', 'fem-pd-1737l-var-1', 550000, 600000], ['Turquesa · Oro rosa', 'fem-pd-1737l-var-3', 550000, 600000],
        ['Nácar · Acero', 'fem-pd-1737l-var-6', 550000, 600000], ['Gris nácar · Acero', 'fem-pd-1737l-var-4', 550000, 600000],
        ['Rojo · Acero', 'fem-pd-1737l-var-5', 550000, 600000], ['Turquesa · Acero', 'fem-pd-1737l-var-7', 550000, 600000]] },

  { code: 'PD-1776', collection: 'femeninos', type: 'cuarzo', movement: 'Seiko VH65',
    case_mm: '32', water_m: 100, crystal: SAPPHIRE, straps: ['acero'],
    features: { es: 'Bisel con cristales · Pequeño segundero · Numerales romanos', pt: 'Bisel com cristais · Pequenos segundos · Numerais romanos', en: 'Crystal-set bezel · Small seconds · Roman numerals' },
    desc: { es: 'Caja redonda de 32 mm con bisel engastado en cristales, numerales romanos y pequeño segundero. Brillo justo para todos los días.',
            pt: 'Caixa redonda de 32 mm com bisel cravejado de cristais, numerais romanos e pequenos segundos. O brilho certo para todos os dias.',
            en: 'Round 32 mm case with a crystal-set bezel, Roman numerals and small seconds. Just the right sparkle for every day.' },
    hero: 'fem-pd-1776-main-0',
    v: [['Celeste · Acero', 'fem-pd-1776-var-0', 550000, 600000], ['Verde · Acero', 'fem-pd-1776-var-1', 550000, 600000],
        ['Nácar · Acero', 'fem-pd-1776-var-2', 550000, 600000]] },

  { code: 'PD-1825', collection: 'femeninos', type: 'cuarzo', movement: 'Citizen GL22',
    case_mm: '32', water_m: 100, crystal: SAPPHIRE, straps: ['cuero'], featured: true,
    features: { es: 'Esferas de piedra y nácar · Correa de cuero', pt: 'Mostradores de pedra e madrepérola · Pulseira de couro', en: 'Stone and mother-of-pearl dials · Leather strap' },
    desc: { es: 'Caja cojín minimalista con esferas de nácar, malaquita u ojo de tigre y correa de cuero al tono. Cada pieza es única.',
            pt: 'Caixa almofada minimalista com mostradores de madrepérola, malaquita ou olho de tigre e pulseira de couro combinando. Cada peça é única.',
            en: 'Minimalist cushion case with mother-of-pearl, malachite or tiger-eye dials and a matching leather strap. Every piece is unique.' },
    hero: 'fem-pd-1825-main-0',
    v: [['Azul nácar · Cuero azul', 'fem-pd-1825-var-0', 600000, 650000], ['Malaquita · Cuero verde', 'fem-pd-1825-var-1', 600000, 650000],
        ['Nácar · Cuero blanco', 'fem-pd-1825-var-2', 600000, 650000], ['Ojo de tigre · Cuero marrón', 'fem-pd-1825-var-3', 600000, 650000]] },
];

// Fotos que traen el ícono de la caja de regalo abajo a la derecha: se limpia esa esquina
const CLEAN_CORNER = new Set(['fem-pd-1737l-var-0', 'fem-pd-1737l-var-1', 'fem-pd-1737l-var-2', 'fem-pd-1737l-var-3', 'fem-pd-1737l-var-4',
  'fem-pd-1737l-var-5', 'fem-pd-1737l-var-6', 'fem-pd-1737l-var-7', 'fem-pd-1776-var-2', 'fem-pd-1825-var-0', 'fem-pd-1825-var-2']);
async function cleanCorner(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = data.slice(0, 4); // color del fondo (esquina superior izquierda)
  for (let y = Math.floor(info.height * 0.66); y < info.height; y++)
    for (let x = Math.floor(info.width * 0.68); x < info.width; x++) data.set(bg, (y * info.width + x) * 4);
  return sharp(data, { raw: info }).trim({ threshold: 10 }).png().toBuffer();
}

// ---------- Imágenes ----------
const LOWRES = 330; // por debajo de este alto, la foto viene chica desde Canva
async function encode(srcName, outName) {
  let file = path.join(SRC, srcName + '.png');
  if (CLEAN_CORNER.has(srcName)) file = await cleanCorner(file);
  const meta = await sharp(file).metadata();
  const h = Math.min(meta.height, 1000);
  await sharp(file).resize({ height: h, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 90 }).toFile(path.join(OUT, outName + '.webp'));
  const s = await sharp(path.join(OUT, outName + '.webp')).metadata();
  return { src: `assets/img/products/${outName}.webp`, w: s.width, h: s.height, ...(meta.height < LOWRES ? { lowres: true } : {}) };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const out = [];
let order = 0;
for (const p of products) {
  const id = slug(p.code);
  const hero = await encode(p.hero, `${id}`);
  const variants = [];
  for (let i = 0; i < p.v.length; i++) {
    const [name, img, price, compare] = p.v[i];
    const image = img === p.hero ? hero : await encode(img, `${id}-${i + 1}`);
    variants.push({ id: `${id}-${i + 1}`, name, image, price, compare_at: compare || null, available: true });
  }
  const prices = variants.map((v) => v.price);
  out.push({
    id, code: p.code, nick: p.nick || '', brand: 'Pagani Design', collection: p.collection,
    type: p.type, movement: p.movement, case_mm: p.case_mm, water_m: p.water_m, crystal: p.crystal,
    straps: p.straps, features: p.features, desc: p.desc, hero,
    price_from: Math.min(...prices), featured: !!p.featured, active: true, order: order++,
    variants,
  });
}

const settings = {
  brand: 'UG Collection',
  whatsapp: '595983836674',
  instagram: 'https://www.instagram.com/ug_collection27/',
  currency: 'Gs.',
  promo: { es: 'Descuento de apertura', pt: 'Desconto de inauguração', en: 'Opening discount' },
  hero: ['pd-1644', 'pd-1661', 'pd-ys025', 'pd-1673'],
};

fs.writeFileSync(path.join(ROOT, 'data/catalog.json'), JSON.stringify({ updated: new Date().toISOString(), settings, collections, products: out }, null, 1));

// ---------- Logo ----------
const IMG = path.join(ROOT, 'assets/img');
const logo = path.join(ROOT, '_brand/logo-ug-gold.png');
await sharp(logo).resize({ width: 600 }).webp({ quality: 90 }).toFile(path.join(IMG, 'logo.webp'));
await sharp(logo).resize({ width: 600 }).png().toFile(path.join(IMG, 'logo.png'));
// monograma (sólo el círculo)
await sharp(logo).extract({ left: 140, top: 0, width: 400, height: 400 }).trim({ threshold: 10 }).png().toFile(path.join(ROOT, '_build/mono-tmp.png'));
await sharp(path.join(ROOT, '_build/mono-tmp.png')).resize({ width: 256 }).png().toFile(path.join(IMG, 'monogram.png'));
await sharp(path.join(ROOT, '_build/mono-tmp.png')).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(IMG, 'favicon.png'));
await sharp(path.join(ROOT, '_build/mono-tmp.png')).resize(180, 180, { fit: 'contain', background: '#14161a' }).flatten({ background: '#14161a' }).png().toFile(path.join(IMG, 'apple-touch-icon.png'));
fs.unlinkSync(path.join(ROOT, '_build/mono-tmp.png'));

console.log(out.length, 'productos,', out.reduce((a, p) => a + p.variants.length, 0), 'versiones');
