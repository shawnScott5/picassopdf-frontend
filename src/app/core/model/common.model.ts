export interface User {
    _id: string
    email: string,
    password: string,
    name?: string,
    organizationId?: string,
    accountType?: string,
    role?: string,
    companyName?: string,
    companyId?: string,
    subscription: any,
    subscriptionStartDate: any,
    nextPaymentDate: string,
    recentSearches: Array<any>,
    thisMonthRecurringRevenue: number,
    thisMonthTotalRevenue: number,
    influencersEmailViewed: Array<string>,
    influencersEmailViewedCount: number,
    thisMonthTotalClients: number, 
    thisMonthNewClients: number,
    admin: boolean,
    avatar: string,
    stripeSessionId: string;
    stripeSubscriptionId: string;
    tempViewLimit: number;
    lastMonthRecurringRevenue: number;
    lastMonthTotalRevenue: number;
    lastMonthNewClients: number;
    lastMonthTotalClients: number;
}
export interface LoginPayLoad {
    email: string,
    password: string
}

export interface RegisterPayLoad {
    name: string,
    email: string,
    password: string
}

export interface ApiResponse<T> {
    status?: boolean,
    message?: string,
    error?: string,
    data: T
}