import {useCallback, useMemo, useState} from 'react';
import {Box, Tooltip} from "@mui/material";
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {ColDef, GridReadyEvent, ModuleRegistry} from '@ag-grid-community/core';
import {AgGridReact, CustomCellRendererProps} from '@ag-grid-community/react';
import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';
import { MultiFilterModule } from "@ag-grid-enterprise/multi-filter";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-material.css';

import {EscalationData, ListItem} from "./interfaces.ts";

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, MultiFilterModule, SetFilterModule]);

interface TableProps {
    filters: {
        LLM_Category: string[];
        LLM_SubCategory: string[];
        Version: string[];
    }
}

export const Table = ({filters}: TableProps) => {
    const [gridApi, setGridApi] = useState<any>();
    const [rowData, setRowData] = useState<EscalationData[]>();
    const [columnDefs] = useState<ColDef[]>([
        {
            field: 'summary',
            headerName: 'Description',
            rowGroup: true,
            hide: true,
        },
        {
            field: 'category',
            headerName: 'Category',
            // rowGroup: true,
            filter: true,
            filterParams: {
                values: filters.LLM_Category,
                debounceMs: 1000
            }
        },
        {
            field: 'subCategory',
            headerName: 'Sub Category',
            // rowGroup: true,
            filter: true,
            filterParams: {
                values: filters.LLM_SubCategory,
                debounceMs: 1000
            }
        },
        {
            field: 'version',
            headerName: 'Version',
            cellRenderer: (params: CustomCellRendererProps) => {
                return <span style={{}}>{params.value}</span>;
            },
            filter: true,
            filterParams: {
                values: filters.Version,
                debounceMs: 1000
            },
        },
        {
            field: 'caseLink',
            headerName: 'SF Case Link',
            cellRenderer: ({value}: CustomCellRendererProps) => {
                return value? <a href={`https://zappsinternal2.zerto.local/CaseViewer/Cases/CaseView?caseNum=${value}`} target='_blank' >{value}</a> : null;
            },
        },
        {
            field: 'jiraLink',
            headerName: 'Jira Link',
            cellRenderer: ({value}: CustomCellRendererProps) => {
                return value? <a href={`https://zerto.atlassian.net/browse/${value}`} target='_blank' >{value}</a> : null;
            },
        },

    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const fetchRowData = useCallback((count?: number,  value?: string) => {
        const queryParams = new URLSearchParams({
            ...count && {count: `${count}`},
            ...value && {value}
        }).toString();

        fetch((`http://localhost:3000/filtered-list?${queryParams}`))
            .then((resp) => resp.json())
            .then((data: ListItem[]) => {
                setRowData(data.reduce<EscalationData[]>((acc, row, currentIndex) => {
                    const sfItems =  row.LinkedSFTickets.map((item, index) => ({
                        summary: `(${row.Calculated} issues) ${row.LLM_Description}`,
                        version: item.version,
                        category: index && currentIndex? data[index - 1].LLM_Category : row.LLM_Category,
                        subCategory: index && currentIndex? data[index - 1].LLM_SubCategory : row.LLM_SubCategory,
                        jiraLink: ``,
                        caseLink: `${item.case_number}`,
                        issuesCount: row.Calculated,
                    }))

                    const jiraItems =  row.LinkedJiraItems.map((item, index) => ({
                        summary: `(${row.Calculated} issues) ${row.LLM_Description}`,
                        version: "",
                        category: index && currentIndex? data[index - 1].LLM_Category : row.LLM_Category,
                        subCategory: index && currentIndex? data[index - 1].LLM_SubCategory : row.LLM_SubCategory,
                        jiraLink: `${item.case_number}`,
                        caseLink: ``,
                        issuesCount: row.Calculated,
                    }))

                    return [...acc, ...sfItems, ...jiraItems ]
                }, []));
            });
    }, [gridApi])

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetchRowData(100);
        setGridApi(params.api);
    }, []);

    const onFilterChanged = () => {
        const values = Object.values(gridApi.getFilterModel()).map((item: any) => item.values).join(',');
        fetchRowData(undefined, values);
    }

    const groupRowRendererParams = useMemo(() => {
        return {
            innerRenderer: (data: CustomCellRendererProps) => {
                return <div style={{display: 'flex', maxWidth: 500,}}>
                    <Tooltip title={data.value} placement="top-start" arrow>
                    <span style={{display: 'block', textOverflow: 'ellipsis', overflowX: 'hidden'}}>{data.value}</span>
                    </Tooltip>
                </div>
            },
            suppressCount: true,
        };
    }, []);


    return (
        <Box
            className={"ag-theme-material"}
            sx={{width: 'calc(100vw - 40px)', height: 'calc(100vh - 200px)'}}
        >
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                groupRowRendererParams={groupRowRendererParams}
                defaultColDef={defaultColDef}
                groupDisplayType={'groupRows'}
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
            />
        </Box>
    );
};