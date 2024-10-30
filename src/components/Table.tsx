import {useCallback, useMemo, useState} from 'react';
import {Box} from "@mui/material";
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {ColDef, GridReadyEvent, ModuleRegistry} from '@ag-grid-community/core';
import {AgGridReact, CustomCellRendererProps} from '@ag-grid-community/react';
import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';
import { MultiFilterModule } from "@ag-grid-enterprise/multi-filter";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import {EscalationData} from "./interfaces.ts";
import rows from '../mock/rows.json'
import {filters} from "../mock/lists.ts";

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, MultiFilterModule, SetFilterModule]);

export const Table = () => {
    const [gridApi, setGridApi] = useState<any>();
    const [rowData, setRowData] = useState<EscalationData[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'summary',
            headerName: 'Summary',
            rowGroup: true,
            hide: true
        },
        // {field: 'year', rowGroup: true, hide: true},
        {
            field: 'version',
            headerName: 'Version',
            cellRenderer: (params: CustomCellRendererProps) => {
                return <span style={{marginLeft: 60}}>{params.value}</span>;
            },
            filter: true,
            filterParams: {
                values: (params: { success: (arg0: string[]) => void; }) => {
                    // simulating async delay
                    setTimeout(() => params.success(filters.Version), 500);
                }
            }
        },
        {
            field: 'category',
            headerName: 'Category',
            filter: true,
            filterParams: {
                values: (params: { success: (arg0: string[]) => void; }) => {
                    // simulating async delay
                    setTimeout(() => params.success(filters.LLM_Category), 500);
                }
            }
        },
        {
            field: 'subCategory',
            headerName: 'Sub Category',
            filter: true
        },

    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const fetchRowData = useCallback(() => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
    }, [])

    const onGridReady = useCallback((params: GridReadyEvent) => {


        setRowData(rows.reduce<EscalationData[]>((acc, row) => {
            const items =  row.LinkedSFTickets.map((item) => ({
                summary: row.LLM_Description,
                version: item.Version,
                category: row.LLM_Category,
                subCategory: row.LLM_SubCategory,
                linkedJiraItems: row.LinkedJiraItems.map((item) => item.JiraItem)
            }))
            return [...acc, ...items ]
        }, []))
        setGridApi(params.api);
    }, []);

    const onFilterChanged = () => {
        gridApi.getFilterModel();
    }


    return (
        <Box
            className={"ag-theme-quartz"}
            sx={{width: 'calc(100vw - 40px)', height: 'calc(100vh - 20px)'}}
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