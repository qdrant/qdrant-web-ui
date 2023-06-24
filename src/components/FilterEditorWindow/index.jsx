import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box } from '@mui/material';
import { useParams } from "react-router-dom";
import { useClient } from "../../context/client-context";



export default function FilterEditorWindow ({setResult}) {
  const [limit, setLimit] = React.useState(2);
  const {client: qdrantClient} = useClient();
  const [vectors, setVectors] = React.useState([ "Default vector"]); // [vector1, vector2, ...
  const [vector, setVector] = React.useState(vectors[0]);

  const { collectionName } = useParams();

  React.useEffect(() => {
    const getPoints = async () => {
        try {
          let newPoints = await qdrantClient.scroll(collectionName, {
            limit: limit,
            with_vector: true,
            with_payload: true
          });
          console.log(newPoints)
          setResult({
            points: [
              ...newPoints?.points || []
            ],
          });
        } catch (error) {
          console.log(error);
          setResult({});
        }
    }
    getPoints()
  }, [collectionName,limit]);

  React.useEffect(() => {
    const getVectors = async () => {
        try {
          let collectionInfo = await qdrantClient.getCollection(collectionName)
          if(collectionInfo.config.params.vectors.size){
            setVectors(["Default vector"]);
          } 
          else{
            setVectors(Object.keys(collectionInfo.config.params.vectors));
            setVector(Object.keys(collectionInfo.config.params.vectors)[0]);
          }
        } catch (error) {
          console.log(error);
          setVectors([]);
        }
    }
    getVectors();
  }, []);


  const handleVectorChange = (event) => {
    setVector(event.target.value);
  };
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  return (
    <Box sx={{
      textAlign: "center",
    }}>
      <FormControl sx={{ m: 1, minWidth: "40%" }}>
        <InputLabel id="selectVectorLabel">Vector</InputLabel>
        <Select
          labelId="selectVectorLabel"
          id="selectVector"
          value={vector}
          label="Vector"
          onChange={handleVectorChange}
        >
        {vectors && vectors?.map((vector) => (
                  <MenuItem key={vector} value={vector}>{vector}</MenuItem>
              ))}

        </Select>
        <FormHelperText>Select Vector to Visualize</FormHelperText>
      </FormControl>
      <FormControl sx={{ m: 1, minWidth: "40%" }}>
        <InputLabel id="selectLimit">Select Limit</InputLabel>
        <Select
          labelId="selectLimit"
          id="selectLimitHelper"
          value={limit}
          label="Select Limit"
          onChange={handleLimitChange}
        >
          <MenuItem value={2}>2</MenuItem>

          <MenuItem value={500}>500</MenuItem>
          <MenuItem value={1000}>1000</MenuItem>
          <MenuItem value={2000}>2000</MenuItem>
        </Select>
        <FormHelperText>Select number of points</FormHelperText>
      </FormControl>
    </Box>
  );
}