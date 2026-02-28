import * as XLSX from 'xlsx';
import { Product, Sale } from '../types';

export const downloadTemplate = () => {
    const template = [
        { ID: 'P001', Name: 'Sample Product 1', Category: 'Category 1', Price: 1000 },
        { ID: 'P002', Name: 'Sample Product 2', Category: 'Category 2', Price: 2000 },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'kiosk_template.xlsx');
};

export const parseProductExcel = (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet) as any[];

                const products: Product[] = json.map((row) => ({
                    id: String(row.ID || crypto.randomUUID()),
                    name: String(row.Name),
                    category: String(row.Category || 'General'),
                    price: Number(row.Price) || 0,
                }));

                resolve(products);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
};

export const exportSalesToExcel = (sales: Sale[], initialCash: number = 0) => {
    const flattenedData: any[] = [];
    const productStats: Record<string, { quantity: number, revenue: number, category: string }> = {};
    const categoryStats: Record<string, number> = {};

    sales.forEach((sale) => {
        sale.items.forEach((item, index) => {
            const isFirstItem = index === 0;
            const isLastItem = index === sale.items.length - 1;
            const itemRevenue = item.price * item.quantity;

            // Track stats for summary sheets
            if (!productStats[item.name]) {
                productStats[item.name] = { quantity: 0, revenue: 0, category: item.category };
            }
            productStats[item.name].quantity += item.quantity;
            productStats[item.name].revenue += itemRevenue;

            categoryStats[item.category] = (categoryStats[item.category] || 0) + itemRevenue;

            flattenedData.push({
                '결제 ID': sale.id.substring(0, 8), // Short ID for readability
                '항목 번호': index + 1,
                '판매 시간': new Date(sale.timestamp).toLocaleString(),
                '결제 방식': sale.paymentMethod === 'card' ? '카드' : '현금',
                '상품명': item.name,
                '카테고리': item.category,
                '단가': item.price,
                '수량': item.quantity,
                '소계': itemRevenue,
                // Only show these on the first or last row to avoid double-counting in simple Excel SUMs
                '총 결제 금액': isFirstItem ? sale.total : 0,
                '받은 금액': isFirstItem ? (sale.amountReceived || sale.total) : 0,
                '거스름돈': isLastItem ? (sale.change || 0) : 0
            });
        });
    });

    // Accounting Summary sheet
    const cashRevenue = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
    const cardRevenue = sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);

    const summaryData = [
        { '구분': '시작 현금', '금액': initialCash },
        { '구분': '현금 매출액', '금액': cashRevenue },
        { '구분': '카드 매출액', '금액': cardRevenue },
        { '구분': '총 매출액', '금액': cashRevenue + cardRevenue },
        { '구분': '최종 보유 현금 (예상)', '금액': initialCash + cashRevenue },
        { '구분': '총 판매 건수', '금액': sales.length }
    ];

    // Product Summary sheet
    const productSummaryData = Object.entries(productStats).map(([name, stats]) => ({
        '상품명': name,
        '카테고리': stats.category,
        '판매 수량': stats.quantity,
        '매출액': stats.revenue
    })).sort((a, b) => b['매출액'] - a['매출액']);

    // Category Summary sheet
    const categorySummaryData = Object.entries(categoryStats).map(([cat, rev]) => ({
        '카테고리': cat,
        '매출액': rev
    })).sort((a, b) => b['매출액'] - a['매출액']);

    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    const productWs = XLSX.utils.json_to_sheet(productSummaryData);
    const categoryWs = XLSX.utils.json_to_sheet(categorySummaryData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, '전체 요약');
    XLSX.utils.book_append_sheet(wb, ws, '상세 판매 내역');
    XLSX.utils.book_append_sheet(wb, productWs, '상품별 집계');
    XLSX.utils.book_append_sheet(wb, categoryWs, '카테고리별 집계');

    // Set column widths for better readability
    const wscols = [
        { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 },
        { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `flea_market_report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const parseSalesExcel = (file: File): Promise<Sale[]> => {
    // Simple implementation to restore sales if needed
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet) as any[];

                const sales: Sale[] = json.map((row) => ({
                    id: String(row.ID),
                    timestamp: new Date(row.Time).getTime(),
                    paymentMethod: row.Method as any,
                    total: Number(row.Total),
                    amountReceived: Number(row.Received),
                    change: Number(row.Change),
                    items: [] // Items detail is flattened in export, hard to reconstruct perfectly without complex parsing
                }));

                resolve(sales);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
};
