import {useEffect, useState} from "react";
import './App.css'
import {Table} from "./components/Table.tsx";
import {Box, Paper} from "@mui/material";

function App() {
    const [loading, setLoading] = useState<boolean>(true);
    const [filters, setFilters] = useState({
        LLM_Category: [],
        LLM_SubCategory: [],
        Version: []
    });

    useEffect(() => {
        fetch('http://localhost:3000/lists')
            .then(response => response.json())
            .then(data => {
                setFilters(data);
                setLoading(false);
            });
    }, []);


  return (
      <Box sx={{
          // width: '100vw',
          // height: '100vh',
          margin: 1}}>
          <Paper>
              {!loading && <Table filters={filters}/>}
          </Paper>
      </Box>
  )
}

export default App
