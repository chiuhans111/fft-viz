/**
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
        // f * 0.29288734074253003 + (1 - f) * 0.25702716149325106,
        d3
    ]

}

function squircle_points(squircle_parameter, true_radius) {
    const sp = squircle_parameter
    //o  _ _ _ _     origin at 0,
    // /3 2  1  0    0 is end points
    // |             1 is control point for 1, 7
    // |             2 is at the corner
    // |             3 is control point for 4
    return [
        [true_radius, 0],
        [true_radius * (1 - sp[0]), 0],
        [true_radius * (sp[2] + sp[1]), true_radius * (sp[2] - sp[1])],
        [true_radius * sp[2], true_radius * sp[2]],
    ]
}


function squircle(x, y, width, height, cornerRadius) {
    cornerRadius = Math.min(width / 2, height / 2, cornerRadius)

    const x_safe_ratio = (width / 2 - cornerRadius) / (width / 2)
    const y_safe_ratio = (height / 2 - cornerRadius) / (height / 2)

    // a squircle requires safe ratio

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
        `M ${x} ${y + py[0][0]}`,
        `C ${x + py[1][1]} ${y + py[1][0]},`,
        `${x + py[2][1]} ${y + py[2][0]},`,
        `${x + py[3][1]} ${y + py[3][0]}`,

        `C ${x + px[2][0]} ${y + px[2][1]},`,
        `${x + px[1][0]} ${y + px[1][1]},`,
        `${x + px[0][0]} ${y + px[0][1]}`,

        // top right
        `L ${x + width - px[0][0]} ${y}`,
        `C ${x + width - px[1][0]} ${y + px[1][1]},`,
        `${x + width - px[2][0]} ${y + px[2][1]},`,
        `${x + width - px[3][0]} ${y + px[3][1]}`,

        `C ${x + width - py[2][1]} ${y + py[2][0]},`,
        `${x + width - py[1][1]} ${y + py[1][0]},`,
        `${x + width} ${y + py[0][0]}`,

        // bottom right
        `L ${x + width} ${y + height - py[0][0]}`,
        `C ${x + width - py[1][1]} ${y + height - py[1][0]},`,
        `${x + width - py[2][1]} ${y + height - py[2][0]},`,
        `${x + width - py[3][1]} ${y + height - py[3][0]}`,

        `C ${x + width - px[2][0]} ${y + height - px[2][1]},`,
        `${x + width - px[1][0]} ${y + height - px[1][1]},`,
        `${x + width - px[0][0]} ${y + height}`,

        // bottom left
        `L ${x + px[0][0]} ${y + height}`,
        `C ${x + px[1][0]} ${y + height - px[1][1]},`,
        `${x + px[2][0]} ${y + height - px[2][1]},`,
        `${x + px[3][0]} ${y + height - px[3][1]}`,

        `C ${x + py[2][1]} ${y + height - py[2][0]},`,
        `${x + py[1][1]} ${y + height - py[1][0]},`,
        `${x} ${y + height - py[0][0]}`,

        `Z`
    ]

    return path.join(' ');
}

export { squircle }