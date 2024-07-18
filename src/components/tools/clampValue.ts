// 为这个函数编写使用中文说明
/**
 *
 * @param value 要被限制的值
 * @param range 限制范围，可以是一个数字，也可以是一个数组，数组的第一个元素是最小值，第二个元素是最大值
 * @returns 限制后的值
 */

function clampValue(value: number, range: number | [number, number]): number {
    if (Array.isArray(range)) {
        // 确保数组长度为2
        if (range.length !== 2) {
            throw new Error('范围数组只能有两个元素');
        }
        const [minimum, maximum] = range; // 将数组元素转换为数字
        if (value < minimum) return minimum;
        if (value > maximum) return maximum;
    } else {
        return range // 将range转换为数字
    }
    return value;
}
export { clampValue}
