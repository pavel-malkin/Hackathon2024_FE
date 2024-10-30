import {useCallback, useMemo, useState} from 'react';
import {Box} from "@mui/material";
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
            headerName: 'Summary',
            rowGroup: true,
            hide: true
        },
        {
            field: 'version',
            headerName: 'Version',
            cellRenderer: (params: CustomCellRendererProps) => {
                return <span style={{marginLeft: 60}}>{params.value}</span>;
            },
            filter: true,
            filterParams: {
                values: filters.Version,
                debounceMs: 1000
            },
        },
        {
            field: 'category',
            headerName: 'Category',
            filter: true,
            filterParams: {
                values: filters.LLM_Category,
                debounceMs: 1000
            }
        },
        {
            field: 'subCategory',
            headerName: 'Sub Category',
            filter: true,
            filterParams: {
                values: filters.LLM_SubCategory,
                debounceMs: 1000
            }
        },

    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const fetchRowData = useCallback((count?: number,  values?: string) => {
        const queryParams = new URLSearchParams({
            ...count && {count: `${count}`},
            ...values && {values}
        }).toString();

        fetch((`http://localhost:3000/filtered-list?${queryParams}`))
            .then((resp) => resp.json())
            .then((data: ListItem[]) => {
                setRowData(data.reduce<EscalationData[]>((acc, row) => {
                    const items =  row.LinkedSFTickets.map((item) => ({
                        summary: row.LLM_Description,
                        version: item.version,
                        category: row.LLM_Category,
                        subCategory: row.LLM_SubCategory,
                        linkedJiraItems: row.LinkedJiraItems.map((item) => item.JiraItem)
                    }))
                    return [...acc, ...items ]
                }, []));
            });
    }, [gridApi])

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetchRowData(10);
        setGridApi(params.api);
    }, []);

    const onFilterChanged = () => {
        const values = Object.values(gridApi.getFilterModel()).map((item: any) => item.values).join(',');
        fetchRowData(undefined, values);
    }


    return (
        <Box
            className={"ag-theme-material"}
            sx={{width: 'calc(100vw - 40px)', height: 'calc(100vh - 200px)'}}
        >
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                groupDisplayType={'groupRows'}
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
            />
        </Box>
    );
};