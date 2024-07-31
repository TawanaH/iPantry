'use client';
import { Box, Stack, Typography, Button, Modal, TextField, AppBar, Toolbar, Menu, Container, MenuItem} from "@mui/material";
import { MenuIcon, RestaurantIcon} from '@mui/icons-material'
import {firestore} from '@/firebase'
import {collection, query, getDocs, setDoc, doc, deleteDoc, getDoc, } from 'firebase/firestore'
import { useEffect, useState } from "react";


export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');
  const pages = ['Pantries'];

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };


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
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add</Button>
      <Box
        border={'1px solid #333'}
      >
        <Box 
        width="800px" 
        height="100px" 
        bgcolor={'#203354'} 
        display={'flex'} 
        justifyContent={'center'} 
        alignItems={'center'}
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
                  <Button variant="contained" onClick={() => addItem(name)}>+</Button>
                  <Typography 
                  variant="h3" 
                  color={'#333'} 
                  textAlign={'center'} 
                  paddingX={2}
                  border={'1px solid #333'}
                  borderRadius={1}
                  >
                    {count}
                  </Typography>
                  <Button variant="contained" onClick={() => removeItem(name)}>-</Button>
                </Box>
              </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}





function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  

  return (
    <AppBar position="static">
      <Container 
        maxWidth="fixed" 
        sx={{ backgroundColor: '#203354'}}
        >
        <Toolbar disableGutters>
          <RestaurantIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 190,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Pantry Tracker
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <RestaurantIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Pantry Tracker
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
