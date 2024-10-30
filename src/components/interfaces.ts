export interface EscalationData {
    summary: string;
    version: string;
    category: string;
    subCategory: string;
    jiraLink: string;
    caseLink: string;
    issuesCount: number;
}

export interface LinkedSFTicket {
    case_number: number;
    version: string;
}

export interface LinkedJiraItem {
    case_number: number;
}

export interface ListItem {
    LLM_Category: string;
    LLM_SubCategory: string;
    LLM_Description: string;
    Calculated: number;
    LinkedSFTickets: LinkedSFTicket[];
    LinkedJiraItems: LinkedJiraItem[];
}