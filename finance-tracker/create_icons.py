from PIL import Image, ImageDraw
import math

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fondo con gradiente diagonal (simulado con capas)
    for y in range(size):
        for x in range(size):
            # Gradiente de verde esmeralda a cyan
            ratio = (x + y) / (2 * size)
            r = int(16 + (6 - 16) * ratio)
            g = int(185 + (182 - 185) * ratio)
            b = int(129 + (212 - 129) * ratio)

            # Verificar si está dentro del rectángulo redondeado
            corner_radius = int(size * 0.22)
            margin = 0

            in_bounds = True
            # Esquinas
            corners = [
                (margin + corner_radius, margin + corner_radius),
                (size - margin - corner_radius - 1, margin + corner_radius),
                (margin + corner_radius, size - margin - corner_radius - 1),
                (size - margin - corner_radius - 1, size - margin - corner_radius - 1)
            ]

            if x < margin + corner_radius and y < margin + corner_radius:
                dist = math.sqrt((x - corners[0][0])**2 + (y - corners[0][1])**2)
                in_bounds = dist <= corner_radius
            elif x > size - margin - corner_radius - 1 and y < margin + corner_radius:
                dist = math.sqrt((x - corners[1][0])**2 + (y - corners[1][1])**2)
                in_bounds = dist <= corner_radius
            elif x < margin + corner_radius and y > size - margin - corner_radius - 1:
                dist = math.sqrt((x - corners[2][0])**2 + (y - corners[2][1])**2)
                in_bounds = dist <= corner_radius
            elif x > size - margin - corner_radius - 1 and y > size - margin - corner_radius - 1:
                dist = math.sqrt((x - corners[3][0])**2 + (y - corners[3][1])**2)
                in_bounds = dist <= corner_radius
            elif x < margin or x >= size - margin or y < margin or y >= size - margin:
                in_bounds = False

            if in_bounds:
                img.putpixel((x, y), (r, g, b, 255))

    # Símbolo de dinero fluido - ondas y signo $
    center_x = size // 2
    center_y = size // 2

    # Dibujar símbolo $ estilizado
    lw = max(int(size * 0.06), 3)

    # Parte superior del $
    s_height = int(size * 0.45)
    s_width = int(size * 0.28)
    s_top = center_y - s_height // 2

    # Curva superior (C invertida)
    bbox_top = [center_x - s_width//2, s_top, center_x + s_width//2, s_top + s_height//2]
    draw.arc(bbox_top, 40, 220, fill='white', width=lw)

    # Curva inferior (C)
    bbox_bottom = [center_x - s_width//2, center_y - s_height//6, center_x + s_width//2, center_y + s_height//2 + s_height//6]
    draw.arc(bbox_bottom, 220, 400, fill='white', width=lw)

    # Línea vertical del $
    line_extend = int(size * 0.06)
    draw.line([(center_x, s_top - line_extend), (center_x, s_top + s_height + line_extend)],
              fill='white', width=lw)

    # Pequeños círculos decorativos (representando flujo)
    dot_r = max(int(size * 0.025), 2)
    dot_positions = [
        (center_x + s_width//2 + int(size*0.08), center_y - int(size*0.12)),
        (center_x - s_width//2 - int(size*0.1), center_y + int(size*0.1)),
        (center_x + s_width//2 + int(size*0.12), center_y + int(size*0.08)),
    ]
    for dx, dy in dot_positions:
        draw.ellipse([dx-dot_r, dy-dot_r, dx+dot_r, dy+dot_r], fill='white')

    img.save(filename, 'PNG')
    print(f'Created {filename}')

create_icon(192, '/workspace/finance-tracker/public/icon-192.png')
create_icon(512, '/workspace/finance-tracker/public/icon-512.png')
