import './App.css'
import {Table} from "./components/Table.tsx";
import {Box, Paper} from "@mui/material";

function App() {

  return (
      <Box sx={{
          // width: '100vw',
          // height: '100vh',
          margin: 1}}>
          <Paper>
              <Table/>
          </Paper>
      </Box>
  )
}

export default App
