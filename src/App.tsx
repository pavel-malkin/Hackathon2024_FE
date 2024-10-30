import {useEffect, useState} from "react";
import {Box, Paper} from "@mui/material";
import './App.css'
import {Table} from "./components/Table.tsx";
import logo from './assets/logo.png';

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
      <>
          <div style={{margin: 20}}>
              <img src={logo} alt="Logo" style={{width: '400px', height: 'auto', marginTop: 0}}/>
          </div>
          <Box sx={{
              margin: 1
          }}>
              <Paper elevation={4} sx={{borderRadius: '12px'}}>
                  {!loading && <Table filters={filters}/>}
              </Paper>
          </Box>
      </>
  )
}

export default App
