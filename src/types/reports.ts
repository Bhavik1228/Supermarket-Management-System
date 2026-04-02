export type ReportType = 'SALES' | 'INVENTORY' | 'TAX' | 'AUDIT' | 'PROFIT_LOSS' | 'LOYALTY' | 'VELOCITY' | 'ACCOUNT_STATEMENT';

export interface ReportFilter {
    dateRange?: { from: Date; to: Date };
    staffId?: string;
    categoryId?: string;
}

export interface ReportData {
    success: boolean;
    error?: string;
    data?: any;
}
