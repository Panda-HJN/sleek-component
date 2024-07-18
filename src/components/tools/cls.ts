// 连接类名，用空格分隔
function joinClasses(...names: Array<string | undefined>): string {
    return names.filter(Boolean).join(' ');
}

// 创建一个函数，该函数为给定的类名添加前缀
// const modalC = createPrefixedClassName('und-modal');
// <footer className={modalC('footer')}/>
function createPrefixedClassName(prefix: string): (name: string | string[]) => string {
    return function(name: string | string[]): string {
        if (Array.isArray(name)) {
            return name.map(item => [prefix, item].filter(Boolean).join('-')).join(' ');
        }
        return [prefix, name].filter(Boolean).join('-');
    };
}

export { createPrefixedClassName, joinClasses };
