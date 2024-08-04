"use client";
require("dotenv").config();
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  query,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState("");
  const [recipeList, setRecipeList] = useState("");

  const GOOGLE_API_KEY = "AIzaSyAxzgLGxcmC6Qih3x7ZCeYY5Ih--Q61FVM";

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setSearchVal(searchTerm);

    if (searchVal === "") {
      updatePantry();
      return;
    }
    console.log("THE PANTRY CONTAINS", pantry);
    const filterBySearch = pantry.filter((item) => {
      if (item.name.toLowerCase().includes(searchVal.toLowerCase())) {
        return item;
      }
    });
    setPantry(filterBySearch);
  };

  function handleSearchClick() {
    if (searchVal === "") {
      updatePantry();
      return;
    }
    console.log("THE PANTRY CONTAINS", pantry);
    const filterBySearch = pantry.filter((item) => {
      if (item.name.toLowerCase().includes(searchVal.toLowerCase())) {
        return item;
      }
    });
    setPantry(filterBySearch);
  }

  function handleClear() {
    setSearchVal("");
    updatePantry();
  }

  const updateRecipeList = async (pantryList) => {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    const itemString = pantryList
      .map((item) => `${item.name}: ${item.count}`)
      .join(", ");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Give me 3 recipes I can make with ${itemString}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    setRecipeList(text);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  };

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantrylist = [];
    docs.forEach((doc) => {
      pantrylist.push({ name: doc.id, ...doc.data() });
    });
    updateRecipeList(pantrylist);
    setPantry(pantrylist);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }
    await updatePantry();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={2}
    >
      <Box
        width="100vw"
        height="10vw"
        display={"flex"}
        alignItems={"center"}
        flexDirection={"column"}
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
          <Stack widthd="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
              sx={{ backgroundColor: "#203354", color: "#FFFFFF" }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box display={"flex"} gap={2}>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ backgroundColor: "#203354" }}
        >
          Add
        </Button>
        <TextField
          id="outlined-basic"
          label="Search"
          variant="outlined"
          value={searchVal}
          onChange={handleInputChange}
        />
        <Button
          variant="contained"
          onClick={handleSearchClick}
          sx={{ backgroundColor: "#203354" }}
        >
          Search
        </Button>
        <Button
          variant="contained"
          onClick={handleClear}
          sx={{ backgroundColor: "#203354" }}
        >
          Clear
        </Button>
      </Box>

      <Box display={"flex"} gap={2}>
        <Box
          border={"1px solid #343c4a"}
          padding="10px"
          borderRadius="20px" //Radius of tabs
        >
          <Box
            width="800px"
            height="100px"
            bgcolor={"#203354"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            marginBottom="10px"
            borderRadius="20px" //Radius of tabs
          >
            <Typography variant="h2" color={"#FFFFFF"} textAlign={"center"}>
              Pantry Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
            {pantry.map(({ name, count }) => (
              <Box
                key={name}
                width="100%"
                minHeight="100px"
                display={"flex"}
                justifyContent={"space-between"}
                paddingX={5}
                alignItems={"center"}
                bgcolor={"#f0f0f0"}
                borderRadius="20px" //Radius of tabs
              >
                <Typography variant="h3" color={"#333"} textAlign={"center"}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Box display={"flex"}>
                  <Button
                    variant="contained"
                    onClick={() => addItem(name)}
                    sx={{ backgroundColor: "#203354" }}
                  >
                    +
                  </Button>
                  <Typography
                    variant="h3"
                    color={"#333"}
                    textAlign={"center"}
                    paddingX="5px"
                    marginX="5px"
                    border={"1px solid #333"}
                    borderRadius={1}
                  >
                    {count}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => removeItem(name)}
                    sx={{ backgroundColor: "#203354" }}
                  >
                    -
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box
          border={"1px solid #343c4a"}
          padding="10px"
          borderRadius="20px" //Radius of tabs
        >
          <Box
            width="800px"
            height="100px"
            bgcolor={"#203354"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            marginBottom="10px"
            borderRadius="20px" //Radius of tabs
          >
            <Typography
              variant="h2"
              color={"#FFFFFF"}
              textAlign={"center"}
              align="left"
            >
              Suggested Recipes
            </Typography>
          </Box>

          <Typography
            variant="h6"
            color={"#333"}
            textAlign={"center"}
            width="800px"
            height="300px"
            overflow={"auto"}
            sx={{ whiteSpace: "pre-line" }}
          >
            {recipeList}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
