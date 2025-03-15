/**
 * This calculates the SVG path for drawing a squircle.
 * 
 * Author: Hans Chiu
 * This js code provide basic support for drawing squircle
 */


const sr = 1 - 0.7952295855142201



function get_squircle_parameter(squircle_ness) {
    const r = 1 - squircle_ness * sr
    const d3 = r - r / Math.sqrt(2)
    let f = squircle_ness
    return [
        f * 0.24537586511865822 + (1 - f) * 0.26512268687055385,
        f * 0.23315123245977887 + (1 - f) * 0.18747047774458375,
        d3
    ]

}

const precision = 100

function squircle_points(squircle_parameter, true_radius) {
    const sp = squircle_parameter
    //o  _ _ _ _     origin at 0,
    // /3 2  1  0    0 is end points
    // |             1 is control point for 1, 7
    // |             2 is at the corner
    // |             3 is control point for 4
    const points =  [
        [true_radius, 0],
        [true_radius * (1 - sp[0]), 0],
        [true_radius * (sp[2] + sp[1]), true_radius * (sp[2] - sp[1])],
        [true_radius * sp[2], true_radius * sp[2]],
    ]

    // for(let point of points){
    //     point[0] = Math.round(point[0] * precision) / precision
    //     point[1] = Math.round(point[1] * precision) / precision
    // }
    return points
}

function ps(x, y){
    return `${x.toFixed(2)} ${y.toFixed(2)}`
}


function squircle(x, y, width, height, cornerRadius) {
    if (width < 1e-3) width = 1e-3
    if (height < 1e-3) height = 1e-3
    cornerRadius = Math.min(width / 2, height / 2, cornerRadius)


    // x = Math.round(x * precision) / precision
    // y = Math.round(y * precision) / precision
    // width = Math.round(width * precision) / precision
    // height = Math.round(height * precision) / precision

    const x_safe_ratio = (width / 2 - cornerRadius) / (width / 2)
    const y_safe_ratio = (height / 2 - cornerRadius) / (height / 2)

    // a squircle requires a safe ratio, which determines the squircleness..
    const x_squircle_ness = Math.min(1, x_safe_ratio / sr)
    const y_squircle_ness = Math.min(1, y_safe_ratio / sr)

    const parameter_x = get_squircle_parameter(x_squircle_ness)
    const parameter_y = get_squircle_parameter(y_squircle_ness)

    const x_radius = cornerRadius / (1 - x_squircle_ness * sr)
    const y_radius = cornerRadius / (1 - y_squircle_ness * sr)


    const px = squircle_points(parameter_x, x_radius)
    const py = squircle_points(parameter_y, y_radius)

    const path = [
        // top left
        'M ' + ps(x, y + py[0][0]),
        'C ' + ps(x + py[1][1], y + py[1][0]) + ',' + 
              ps(x + py[2][1], y + py[2][0]) + ',' + 
              ps(x + py[3][1], y + py[3][0]),

        'C ' + ps(x + px[2][0], y + px[2][1]) + ',' + 
              ps(x + px[1][0], y + px[1][1]) + ',' + 
              ps(x + px[0][0], y + px[0][1]),

        'L ' + ps(x + width / 2, y),

        // top right
        'L ' + ps(x + width - px[0][0], y),
        'C ' + ps(x + width - px[1][0], y + px[1][1]) + ',' + 
              ps(x + width - px[2][0], y + px[2][1]) + ',' + 
              ps(x + width - px[3][0], y + px[3][1]),

        'C ' + ps(x + width - py[2][1], y + py[2][0]) + ',' + 
              ps(x + width - py[1][1], y + py[1][0]) + ',' + 
              ps(x + width, y + py[0][0]),

        'L ' + ps(x + width, y + height / 2),

        // bottom right
        'L ' + ps(x + width, y + height - py[0][0]),
        'C ' + ps(x + width - py[1][1], y + height - py[1][0]) + ',' + 
              ps(x + width - py[2][1], y + height - py[2][0]) + ',' + 
              ps(x + width - py[3][1], y + height - py[3][0]),

        'C ' + ps(x + width - px[2][0], y + height - px[2][1]) + ',' + 
              ps(x + width - px[1][0], y + height - px[1][1]) + ',' + 
              ps(x + width - px[0][0], y + height),

        'L ' + ps(x + width / 2, y + height),

        // bottom left
        'L ' + ps(x + px[0][0], y + height),
        'C ' + ps(x + px[1][0], y + height - px[1][1]) + ',' + 
              ps(x + px[2][0], y + height - px[2][1]) + ',' + 
              ps(x + px[3][0], y + height - px[3][1]),

        'C ' + ps(x + py[2][1], y + height - py[2][0]) + ',' + 
              ps(x + py[1][1], y + height - py[1][0]) + ',' + 
              ps(x, y + height - py[0][0]),

        'L ' + ps(x, y + height / 2),

        'Z'
    ]

    return path.join(' ');
}

function squircleRevolve(x, y, width, height, cornerRadius, f){
    // Revolve around the squircle by giving f = 0~1, 0 = on the middle right.
    if (width < 1e-3) width = 1e-3
    if (height < 1e-3) height = 1e-3
    cornerRadius = Math.min(width / 2, height / 2, cornerRadius)

    const x_len = width - cornerRadius*2
    const y_len = height - cornerRadius*2
    const corner_len = cornerRadius*2*Math.PI/4

    const total_len = x_len*2+y_len*2 + corner_len*4

    f = (f+1)%1

    let d = f * total_len

    const candidate = [
        [y_len / 2, 'y', x + width, y + height / 2, 0, -1],
        [corner_len, 'c', x + width - cornerRadius, y + cornerRadius, 0, 0],
        [x_len, 'x', x + width - cornerRadius, y, -1, 0],
        [corner_len, 'c', x + cornerRadius, y + cornerRadius, Math.PI / 2, 0],
        [y_len, 'y', x, y + cornerRadius, 0, 1],
        [corner_len, 'c', x + cornerRadius, y + height - cornerRadius, Math.PI, 0],
        [x_len, 'x', x+cornerRadius, y + height, 1, 0],
        [corner_len, 'c', x + width - cornerRadius, y + height - cornerRadius, 3 * Math.PI / 2, 0],
        [y_len / 2, 'y', x + width, y + height - cornerRadius, 0, -1]
    ]

    for (let i = 0; i < candidate.length; i++) {
        const [len, type, cx, cy, dx, dy] = candidate[i];
        if (d <= len) {
            if (type === 'x' || type === 'y') {
                return {x: cx + d * dx, y: cy + d * dy};
            } else if (type === 'c') {
                const angle = dx + (d / len) * (Math.PI / 2);
                return {
                    x: cx + cornerRadius * Math.cos(angle),
                    y: cy - cornerRadius * Math.sin(angle)
                };
            }
        }
        d -= len;
    }
    return {x, y}; // fallback in case something goes wrong
}

export { squircle, squircleRevolve }