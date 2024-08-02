'use client';
import { Box, Stack, Typography, Button, Modal, TextField} from "@mui/material";
import {firestore} from '@/firebase'
import {collection, query, getDocs, setDoc, doc, deleteDoc, getDoc, } from 'firebase/firestore'
import { useEffect, useState } from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";


//When update pantry is called, send the list of all pantry items to api then load results



export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');
  const [recipeList, setRecipeList] = useState('');
  const OPENROUTER_API_KEY = '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'

  const updateRecipeList = async (pantryList) => {
    const itemString = pantryList.map(item => `${item.name}: ${item.count}`).join(', ');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-3.5-turbo",
        "messages": [
          {"role": "user", "content": `Give me 3 recipes I can make with ${itemString}`},
        ],
      })
    });

    const JSONresponse = await response.json()
    const Answer = JSONresponse.choices[0].message.content
    
    setRecipeList(Answer);
    console.log(Answer)
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  };


  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantrylist = []
    docs.forEach(doc => {
      pantrylist.push({"name": doc.id, ...doc.data()})
    })
    console.log(pantrylist)
    updateRecipeList(pantrylist)
    setPantry(pantrylist)
  }


  useEffect(() => {
    updatePantry()
  }, [])


  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + 1})
    }
    else{
      await setDoc(docRef, {count: 1})
    }
    await updatePantry()
  }


  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if(count === 1) {
        await deleteDoc(docRef)
      }
      else {
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  }


  return (
    <Box 
    width="100vw"
    height="100vh"
    display={"flex"}
    alignItems={"center"}
    flexDirection={'column'}
    gap={2}
    > 
      <Box
        width="100vw"
        height="10vw"
        display={"flex"}
        alignItems={"center"}
        flexDirection={'column'}
      >
      <ResponsiveAppBar></ResponsiveAppBar>
      </Box>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack widthd="100%" direction={'row'} spacing={2}>
            <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            />
            <Button 
            variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            sx={{ backgroundColor: '#203354', color: '#FFFFFF'}}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen} sx={{ backgroundColor: '#203354'}}>Add</Button>
      <Box
        border={'1px solid #343c4a'}
        padding='10px'
        borderRadius='20px' //Radius of tabs
      >
        <Box 
        width="800px" 
        height="100px" 
        bgcolor={'#203354'} 
        display={'flex'} 
        justifyContent={'center'} 
        alignItems={'center'}
        marginBottom='10px'
        borderRadius='20px' //Radius of tabs
        > 
          <Typography
            variant="h2"
            color={'#FFFFFF'}
            textAlign={'center'}
          >
            Pantry Items
          </Typography>
        </Box>
        <Stack 
        width="800px" 
        height="300px" 
        spacing={2} 
        overflow={'auto'} 
        >
          {pantry.map(({name, count}) => (
              <Box
                key={name}
                width="100%"
                minHeight="100px"
                display={'flex'}
                justifyContent={'space-between'}
                paddingX={5}
                alignItems={'center'}
                bgcolor={'#f0f0f0'}
                borderRadius='20px' //Radius of tabs
              >
                <Typography
                  variant="h3"
                  color={'#333'}
                  textAlign={'center'}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Box
                display={'flex'}
                >
                  <Button variant="contained" onClick={() => addItem(name)} sx={{ backgroundColor: '#203354'}}>+</Button>
                  <Typography 
                  variant="h3" 
                  color={'#333'} 
                  textAlign={'center'} 
                  paddingX='5px'
                  marginX='5px'
                  border={'1px solid #333'}
                  borderRadius={1}
                  >
                    {count}
                  </Typography>
                  <Button variant="contained" onClick={() => removeItem(name)} sx={{ backgroundColor: '#203354'}}>-</Button>
                </Box>
              </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}


