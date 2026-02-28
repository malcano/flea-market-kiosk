export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
    }).format(value);
};

export const clsx = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
};

export const generateId = () => crypto.randomUUID();
