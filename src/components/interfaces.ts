export interface IOlympicData {
    athlete: string,
    age: number,
    country: string,
    year: number,
    date: string,
    sport: string,
    gold: number,
    silver: number,
    bronze: number,
    total: number
}

export interface EscalationData {
    summary: string;
    version: string;
    category: string;
    subCategory: string;
    linkedJiraItems: Array<string>;
}

export interface LinkedSFTicket {
    CaseNumber: number;
    Version: string;
}

export interface LinkedJiraItem {
    JiraItem: string;
}

export interface ListItem {
    LLM_Category: string;
    LLM_SubCategory: string;
    LLM_Description: string;
    Calculated: number;
    LinkedSFTickets: LinkedSFTicket[];
    LinkedJiraItems: LinkedJiraItem[];
}