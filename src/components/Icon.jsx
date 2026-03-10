/**
 * Premium Icon — ultra-thin, sharp, enterprise-grade.
 * Weight 200 gives razor-thin strokes. GRAD -25 adds crispness.
 * Usage: <Icon name="dashboard" /> or <Icon name="receipt_long" size={20} />
 */
export default function Icon({ name, size = 20, weight = 200, fill = false, grade = -25, className = '', style = {} }) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={{
                fontSize: size,
                fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' 48`,
                lineHeight: 1,
                verticalAlign: 'middle',
                ...style,
            }}
        >
            {name}
        </span>
    );
}
