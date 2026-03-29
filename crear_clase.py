from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import copy

# ── Paleta de colores ──────────────────────────────────────────────────────────
AZUL_OSCURO  = RGBColor(0x1A, 0x2E, 0x6C)   # fondo encabezado / título
AZUL_MEDIO   = RGBColor(0x27, 0x4E, 0xA8)   # acento
CELESTE      = RGBColor(0x5B, 0x9B, 0xD5)   # subtítulo / líneas
NARANJA      = RGBColor(0xE8, 0x7D, 0x1A)   # destacados / números
GRIS_CLARO   = RGBColor(0xF2, 0xF5, 0xFA)   # fondo de cuerpo
BLANCO       = RGBColor(0xFF, 0xFF, 0xFF)
NEGRO        = RGBColor(0x1A, 0x1A, 0x1A)
VERDE        = RGBColor(0x21, 0x96, 0x53)

W = Inches(13.33)
H = Inches(7.5)

prs = Presentation()
prs.slide_width  = W
prs.slide_height = H

BLANK = prs.slide_layouts[6]   # completamente en blanco


# ── Helpers ────────────────────────────────────────────────────────────────────

def add_rect(slide, l, t, w, h, fill=None, line=None, line_w=None):
    shape = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.line.fill.background()
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    else:
        shape.fill.background()
    if line:
        shape.line.color.rgb = line
        if line_w:
            shape.line.width = Pt(line_w)
    else:
        shape.line.fill.background()
    return shape


def add_text(slide, text, l, t, w, h,
             size=18, bold=False, color=NEGRO, align=PP_ALIGN.LEFT,
             italic=False, wrap=True):
    txBox = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size  = Pt(size)
    run.font.bold  = bold
    run.font.color.rgb = color
    run.font.italic = italic
    return txBox


def title_slide(title, subtitle, badge=None):
    slide = prs.slides.add_slide(BLANK)
    # fondo total azul oscuro
    add_rect(slide, 0, 0, 13.33, 7.5, fill=AZUL_OSCURO)
    # franja decorativa celeste izquierda
    add_rect(slide, 0, 0, 0.5, 7.5, fill=CELESTE)
    # franja naranja inferior
    add_rect(slide, 0, 6.8, 13.33, 0.7, fill=NARANJA)

    add_text(slide, title,
             0.8, 1.8, 11.5, 2.2,
             size=44, bold=True, color=BLANCO, align=PP_ALIGN.LEFT)
    add_text(slide, subtitle,
             0.8, 4.0, 11.0, 1.0,
             size=24, color=CELESTE, align=PP_ALIGN.LEFT)
    if badge:
        add_text(slide, badge,
                 0.8, 5.0, 6.0, 0.7,
                 size=18, color=NARANJA, align=PP_ALIGN.LEFT)
    return slide


def section_slide(number, title, subtitle=""):
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, 13.33, 7.5, fill=AZUL_MEDIO)
    add_rect(slide, 0, 0, 13.33, 0.15, fill=NARANJA)
    add_rect(slide, 0, 7.35, 13.33, 0.15, fill=NARANJA)
    # número grande de sección
    add_text(slide, number,
             0.5, 1.5, 2.5, 4.0,
             size=100, bold=True, color=NARANJA, align=PP_ALIGN.CENTER)
    add_text(slide, title,
             3.2, 2.5, 9.0, 1.5,
             size=36, bold=True, color=BLANCO, align=PP_ALIGN.LEFT)
    if subtitle:
        add_text(slide, subtitle,
                 3.2, 4.1, 9.0, 0.9,
                 size=20, color=CELESTE, align=PP_ALIGN.LEFT)
    return slide


def content_slide(title, bullets, time_label=None, highlight=None):
    """Diapositiva de contenido con lista de bullets."""
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, 13.33, 7.5, fill=GRIS_CLARO)
    # barra superior
    add_rect(slide, 0, 0, 13.33, 1.1, fill=AZUL_OSCURO)
    # línea naranja bajo la barra
    add_rect(slide, 0, 1.1, 13.33, 0.07, fill=NARANJA)

    add_text(slide, title,
             0.4, 0.15, 11.0, 0.8,
             size=26, bold=True, color=BLANCO, align=PP_ALIGN.LEFT)

    if time_label:
        add_text(slide, time_label,
                 11.2, 0.18, 1.9, 0.65,
                 size=15, bold=True, color=NARANJA, align=PP_ALIGN.RIGHT)

    # bloque de bullets
    y = 1.4
    for item in bullets:
        icon = "▸ "
        col  = NEGRO
        sz   = 19
        bd   = False
        if isinstance(item, dict):
            icon = item.get("icon", "▸ ")
            col  = item.get("color", NEGRO)
            sz   = item.get("size", 19)
            bd   = item.get("bold", False)
            item = item["text"]
        add_text(slide, icon + item,
                 0.5, y, 12.3, 0.6,
                 size=sz, bold=bd, color=col, align=PP_ALIGN.LEFT)
        y += 0.58

    # caja de highlight al pie
    if highlight:
        add_rect(slide, 0.4, 6.45, 12.5, 0.85, fill=AZUL_OSCURO)
        add_text(slide, "💡 " + highlight,
                 0.6, 6.5, 12.1, 0.75,
                 size=16, bold=True, color=BLANCO, align=PP_ALIGN.LEFT)
    return slide


def problem_slide(title, statement, hint=None, time_label=None):
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, 13.33, 7.5, fill=GRIS_CLARO)
    add_rect(slide, 0, 0, 13.33, 1.1, fill=NARANJA)
    add_rect(slide, 0, 1.1, 13.33, 0.06, fill=AZUL_OSCURO)

    add_text(slide, title,
             0.4, 0.1, 11.0, 0.85,
             size=26, bold=True, color=BLANCO, align=PP_ALIGN.LEFT)
    if time_label:
        add_text(slide, time_label,
                 11.2, 0.15, 1.9, 0.65,
                 size=15, bold=True, color=AZUL_OSCURO, align=PP_ALIGN.RIGHT)

    # caja del enunciado
    add_rect(slide, 0.4, 1.3, 12.5, 4.3, fill=BLANCO, line=CELESTE, line_w=1.5)
    add_text(slide, statement,
             0.65, 1.45, 12.0, 4.0,
             size=18, color=NEGRO, align=PP_ALIGN.LEFT)

    if hint:
        add_rect(slide, 0.4, 5.8, 12.5, 0.95, fill=AZUL_MEDIO)
        add_text(slide, "Pista: " + hint,
                 0.6, 5.87, 12.1, 0.8,
                 size=16, italic=True, color=BLANCO, align=PP_ALIGN.LEFT)
    return slide


def two_col_slide(title, left_items, right_items, time_label=None):
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, 13.33, 7.5, fill=GRIS_CLARO)
    add_rect(slide, 0, 0, 13.33, 1.1, fill=AZUL_OSCURO)
    add_rect(slide, 0, 1.1, 13.33, 0.07, fill=NARANJA)
    add_text(slide, title,
             0.4, 0.15, 11.0, 0.8,
             size=26, bold=True, color=BLANCO, align=PP_ALIGN.LEFT)
    if time_label:
        add_text(slide, time_label,
                 11.2, 0.18, 1.9, 0.65,
                 size=15, bold=True, color=NARANJA, align=PP_ALIGN.RIGHT)

    # col izquierda
    y = 1.4
    for item in left_items:
        add_text(slide, "▸ " + item, 0.4, y, 6.1, 0.58, size=17, color=NEGRO)
        y += 0.58

    # línea divisoria vertical
    add_rect(slide, 6.75, 1.25, 0.05, 5.8, fill=CELESTE)

    # col derecha
    y = 1.4
    for item in right_items:
        add_text(slide, "▸ " + item, 6.95, y, 6.0, 0.58, size=17, color=NEGRO)
        y += 0.58
    return slide


def closing_slide(msg, sub):
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, 13.33, 7.5, fill=AZUL_OSCURO)
    add_rect(slide, 0, 0, 13.33, 0.18, fill=NARANJA)
    add_rect(slide, 0, 7.32, 13.33, 0.18, fill=NARANJA)
    add_text(slide, msg,
             1.0, 2.2, 11.0, 2.0,
             size=42, bold=True, color=BLANCO, align=PP_ALIGN.CENTER)
    add_text(slide, sub,
             1.0, 4.4, 11.0, 1.2,
             size=22, color=CELESTE, align=PP_ALIGN.CENTER)
    return slide


# ══════════════════════════════════════════════════════════════════════════════
#  DIAPOSITIVAS
# ══════════════════════════════════════════════════════════════════════════════

# 1 — Portada
title_slide(
    "Geometría OMA – Nivel 3",
    "Repaso y práctica · Intercolegial & Zonal",
    badge="⏱ 90 minutos  |  Año 2025"
)

# 2 — Agenda
content_slide(
    "Agenda de la clase",
    [
        {"text": "Bloque 1 · Triángulos y puntos notables   (0–25 min)",  "bold": True, "color": AZUL_OSCURO, "size": 20},
        {"text": "Bloque 2 · Cuadriláteros y polígonos      (25–50 min)", "bold": True, "color": AZUL_OSCURO, "size": 20},
        {"text": "Bloque 3 · Circunferencia e inscripción    (50–70 min)", "bold": True, "color": AZUL_OSCURO, "size": 20},
        {"text": "Bloque 4 · Práctica tipo competencia       (70–90 min)", "bold": True, "color": AZUL_OSCURO, "size": 20},
        {"text": " "},
        {"text": "Cada bloque: teoría express → problema guiado → problema autónomo", "italic": True, "color": AZUL_MEDIO, "size": 17},
    ],
    highlight="Traé regla, compás y calculadora. ¡No se permite geometría dinámica durante los ejercicios!"
)

# ─── BLOQUE 1: TRIÁNGULOS ─────────────────────────────────────────────────────
section_slide("1", "Triángulos y puntos notables", "0 – 25 minutos")

content_slide(
    "Teoría exprés — Triángulos (I)",
    [
        "Criterios de congruencia: LLL, LAL, ALA, LA (recto)",
        "Criterios de semejanza: AA, LAL~, LLL~",
        "Teorema de la bisectriz: BD/DC = AB/AC",
        "Ceviano — Teorema de Ceva: (AF/FB)·(BD/DC)·(CE/EA) = 1",
        "Menelao: útil para colinealidad",
        "Stewart: ma² = b²·m + c²·n − a·m·n  (ceviano de longitud ma)",
    ],
    time_label="⏱ 0–8 min",
    highlight="En nivel 3, los problemas casi siempre mezclan semejanza con áreas. Identificá triángulos semejantes antes de calcular."
)

content_slide(
    "Teoría exprés — Puntos notables (II)",
    [
        "Baricentro G: intersección de medianas, G divide cada mediana 2:1 desde vértice",
        "Ortocentro H: intersección de alturas",
        "Circuncentro O: equidistante de los tres vértices",
        "Incentro I: equidistante de los tres lados (radio del incírculo = Área/s)",
        "Relación de Euler: OI² = R(R − 2r)  →  R ≥ 2r",
        "Nueve puntos: circunferencia de radio R/2 pasa por pies de alturas, puntos medios y puntos de Euler",
    ],
    time_label="⏱ 8–15 min",
    highlight="Si el enunciado menciona 'circunscripto' pensá en O; si menciona 'inscripto' pensá en I. Si menciona ambos, usá la relación de Euler."
)

problem_slide(
    "Problema guiado 1.1 — Triángulos semejantes",
    "En el triángulo ABC (rectángulo en C), la altura desde C al lado AB toca AB en H.\n"
    "Sea M el punto medio de AB.\n\n"
    "a) Demostrá que CH² = AH · HB.\n"
    "b) Si AB = 10 y CH = 4, calculá AH, HB y las longitudes AC y BC.\n"
    "c) Hallá la distancia MH.",
    hint="CH es media geométrica porque △ACH ~ △CBH ~ △ACB. Para MH usá que M es circuncentro del triángulo rectángulo.",
    time_label="⏱ 15–20 min"
)

problem_slide(
    "Problema autónomo 1.2 — Ceviano y áreas",
    "En el triángulo ABC, D es un punto en BC tal que BD = 2·DC.\n"
    "La mediana desde A toca BC en M.\n\n"
    "a) Calculá la razón entre las áreas de △ABD y △ACD.\n"
    "b) Sea G el baricentro. Demostrá que G, D y A son colineales si y solo si D = M.\n"
    "c) Con BD = 2·DC, hallá la razón AD/AG donde G es el baricentro.",
    hint="Usá que el baricentro divide la mediana en razón 2:1. Para las áreas, mismo vértice A → razón de áreas = razón de bases.",
    time_label="⏱ 20–25 min"
)

# ─── BLOQUE 2: CUADRILÁTEROS ──────────────────────────────────────────────────
section_slide("2", "Cuadriláteros y polígonos", "25 – 50 minutos")

two_col_slide(
    "Teoría exprés — Cuadriláteros",
    [
        "Paralelogramo: diagonales se bisecan",
        "Rombo: diagonales ⊥ y bisecan ángulos",
        "Rectángulo: diagonales iguales",
        "Cuadrado: todo lo anterior",
        "Trapecio: un par de lados ∥",
        "Mediatrapecio: isósceles → diag. iguales",
        "Área trapecio = (B+b)·h / 2",
    ],
    [
        "Cuadrilátero cíclico (inscripto en ⊙)",
        "  → ángulos opuestos suplementarios",
        "  → Ptolomeo: AC·BD = AB·CD + AD·BC",
        "  → Potencia de punto",
        "Cuadrilátero tangencial (exinscripto en ⊙)",
        "  → AB + CD = BC + AD",
        "Varignon: unir puntos medios → paralelo.",
    ],
    time_label="⏱ 25–32 min"
)

problem_slide(
    "Problema guiado 2.1 — Trapecio y semejanza",
    "ABCD es un trapecio con AB ∥ CD. Las diagonales AC y BD se cortan en P.\n"
    "AB = 6, CD = 4.\n\n"
    "a) Demostrá que △APB ~ △CPD y hallá la razón de semejanza.\n"
    "b) Si el área de △CPD es 8, calculá el área de △APB y del trapecio completo.\n"
    "c) ¿Cuánto miden BP y PD si BD = 10?",
    hint="Los triángulos △APB y △CPD son semejantes (AA). La razón de áreas es el cuadrado de la razón lineal. Para las partes de BD usá la razón 3:2.",
    time_label="⏱ 32–40 min"
)

problem_slide(
    "Problema autónomo 2.2 — Cuadrilátero cíclico (tipo Zonal)",
    "ABCD es un cuadrilátero inscripto en una circunferencia.\n"
    "AB = 3, BC = 5, CD = 6, DA = 4.\n\n"
    "a) Calculá AC usando el Teorema de Ptolomeo y la Ley del Coseno (hint: usá el ángulo ∠ABC + ∠ADC = 180°).\n"
    "b) Hallá el área del cuadrilátero mediante la fórmula de Brahmagupta:\n"
    "    K = √((s−a)(s−b)(s−c)(s−d))  con s = semiperímetro.\n"
    "c) Calculá el radio de la circunferencia circunscripta.",
    hint="Brahmagupta es el análogo de Herón para cuadriláteros cíclicos. El radio se obtiene dividiendo el producto de las diagonales por 4K.",
    time_label="⏱ 40–50 min"
)

# ─── BLOQUE 3: CIRCUNFERENCIA ─────────────────────────────────────────────────
section_slide("3", "Circunferencia e inscripción", "50 – 70 minutos")

content_slide(
    "Teoría exprés — Circunferencia (I)",
    [
        "Ángulo central = arco. Ángulo inscripto = arco/2.",
        "Ángulo inscripto en semicírculo = 90°.",
        "Ángulos inscriptos que subtienden el mismo arco son iguales.",
        "Ángulo entre cuerda y tangente = arco interceptado / 2.",
        "Dos cuerdas que se cruzan: PA·PB = PC·PD (potencia).",
        "Dos secantes desde punto exterior: PA·PB = PC·PD.",
        "Tangente-secante: t² = PA·PB.",
    ],
    time_label="⏱ 50–58 min",
    highlight="La potencia de un punto es la clave para resolver la mayoría de problemas con dos circunferencias o cuerda+secante."
)

content_slide(
    "Teoría exprés — Circunferencia (II)",
    [
        "Longitud de arco = r·θ (θ en radianes) = 2πr·α/360°.",
        "Área de sector = r²·θ/2 = πr²·α/360°.",
        "Área de segmento = sector − triángulo.",
        "Línea de los centros ⊥ cuerda común a dos ⊙.",
        "Distancia entre centros vs. radios: externa, interna, tangentes ext./int.",
        "Eje radical: lugar geométrico de puntos con igual potencia respecto de dos ⊙.",
    ],
    time_label="⏱ 58–63 min",
    highlight="Cuando hay dos circunferencias, trazá el eje radical. Si hay tres, los tres ejes radicales se cortan en el centro radical."
)

problem_slide(
    "Problema guiado 3.1 — Potencia de punto",
    "Sea P un punto exterior a una circunferencia de radio 5 y centro O.\n"
    "Desde P se trazan dos secantes: una toca la circunferencia en A y B (con A entre P y B),\n"
    "la otra en C y D (con C entre P y D).\n\n"
    "Datos: PA = 3, PB = 12, PC = 4.\n\n"
    "a) Calculá PD.\n"
    "b) Hallá la longitud de la tangente desde P.\n"
    "c) Si la cuerda AB tiene como punto medio a M, hallá OM.",
    hint="Potencia de punto: PA·PB = PC·PD = t². Para OM usá que OM ⊥ AB y el Teorema de Pitágoras.",
    time_label="⏱ 63–70 min"
)

# ─── BLOQUE 4: PRÁCTICA TIPO COMPETENCIA ──────────────────────────────────────
section_slide("4", "Práctica tipo competencia", "70 – 90 minutos")

content_slide(
    "Estrategia para resolver en olimpiada",
    [
        "1. Leer el enunciado completo y dibujar una figura GRANDE y prolija.",
        "2. Marcar todo lo dado: medidas, paralelas, ángulos iguales.",
        "3. Identificar qué tipo de configuración es (triángulo, cíclico, potencia…).",
        "4. Conjeturar el resultado antes de calcular.",
        "5. Escribir cada paso con justificación explícita.",
        "6. Verificar con casos particulares (triángulo equilátero, rectángulo…).",
    ],
    time_label="⏱ 70–73 min",
    highlight="¡La figura es tu mejor aliada! Un diagrama incorrecto puede arruinar 20 minutos de trabajo."
)

problem_slide(
    "Problema de competencia A — Nivel Intercolegial",
    "En el triángulo ABC, el punto D es el pie de la altura desde A.\n"
    "La bisectriz del ángulo A corta a BC en E.\n"
    "Sea M el punto medio de BC.\n\n"
    "Sabiendo que BD = 4, DC = 9 y BC = 13:\n\n"
    "a) Calculá AD (altura).\n"
    "b) Hallá AB y AC usando el resultado de (a).\n"
    "c) Determiná BE usando la propiedad de la bisectriz.\n"
    "d) ¿Son colineales D, E, M? Justificá.",
    hint="AD² = BD·DC (media geométrica). La bisectriz: BE/EC = AB/AC.",
    time_label="⏱ 73–82 min"
)

problem_slide(
    "Problema de competencia B — Nivel Zonal",
    "ABCD es un rectángulo con AB = 3 y BC = 4.\n"
    "P es un punto en CD tal que DP = 1 (y PC = 3).\n"
    "La recta AP corta a BC (prolongada si es necesario) en Q.\n\n"
    "a) Calculá BQ.\n"
    "b) Hallá el área del triángulo APB.\n"
    "c) Una circunferencia pasa por A, P y B. Calculá su radio.\n"
    "d) ¿El punto C es interior o exterior a esa circunferencia? Justificá.",
    hint="Para (a) usá semejanza de triángulos o coordenadas. Para (c) usá la ley de senos: 2R = AP/sin(∠ABP).",
    time_label="⏱ 82–90 min"
)

# ─── Cierre ───────────────────────────────────────────────────────────────────
content_slide(
    "Soluciones clave — para repasar en casa",
    [
        {"text": "1.1b) AH = 1.6, HB = 8.4, AC = 4, BC ≈ 9.17, MH = 3.4", "color": VERDE, "bold": True, "size": 17},
        {"text": "1.2a) Área(ABD)/Área(ACD) = 2 (razón BD/DC = 2)", "color": VERDE, "bold": True, "size": 17},
        {"text": "2.1b) Área(APB) = 18, Área trapecio = 50", "color": VERDE, "bold": True, "size": 17},
        {"text": "2.2b) s = 9, K = √(6·4·3·5) = 6√10 ≈ 18.97", "color": VERDE, "bold": True, "size": 17},
        {"text": "3.1a) PD = 9  b) t = 6  c) OM = 4", "color": VERDE, "bold": True, "size": 17},
        {"text": "4A-a) AD = 6  b) AB = √52 ≈ 7.21, AC = √117 ≈ 10.82", "color": VERDE, "bold": True, "size": 17},
        {"text": "4B-a) BQ = 4  b) Área = 6  c) R = 2.5  d) C exterior", "color": VERDE, "bold": True, "size": 17},
    ],
    highlight="Corregí cada problema revisando el razonamiento, no solo el número final."
)

content_slide(
    "Recursos para seguir practicando",
    [
        "oma.org.ar  →  Archivo de enunciados intercolegiales y zonales (todos los años)",
        "Geometría para Olimpiadas — Grupo Mate (libro nivel 3, incluye teoría + 150 ej.)",
        "Art of Problem Solving — Geometry section (problemas internacionales con soluciones)",
        "GeoGebra  →  Construir cada figura del enunciado para verificar soluciones",
        "Recomendación: resolver al menos 3 problemas de años anteriores por semana",
        "Simulacros cronometrados: 90 min, 3 problemas, sin ayuda externa",
    ],
    highlight="El salto intercolegial → zonal se logra con velocidad + justificación rigurosa. Practicá escribir cada paso."
)

closing_slide(
    "¡Buena suerte en la competencia!",
    "Geometría OMA Nivel 3  ·  Intercolegial & Zonal  ·  2025"
)


# ── Guardar ────────────────────────────────────────────────────────────────────
output = "/home/user/prueba/Geometria_OMA_Nivel3.pptx"
prs.save(output)
print(f"Guardado: {output}")
print(f"Diapositivas: {len(prs.slides)}")
