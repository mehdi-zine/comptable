import React, { useState, useEffect, useRef } from "react";
import app from "../../configs/config";
import { format } from 'date-fns';
import { getFirestore, doc, setDoc, addDoc, collection, query, where, getDocs, deleteDoc, onSnapshot } from "firebase/firestore"; 
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from "@material-tailwind/react";
import placeHolderImage from "../../../public/img/company.png"
import { projectsTableData } from "@/data";
import { toast } from "react-toastify";



export function Tables() {

  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [state, setState] = useState({ image: "", nom: "", adresse: "", id: "", telephone: "", email: "" });
  const [transactionsData, setTransactionsData] = useState([]);
  const [montant, setMontant] = useState(0);
  const [type, setType] = useState("Vente");
  const [description, setDescription] = useState("");
  const [editedMontant, setEditedMontant] = useState(0);
  const [editedType, setEditedType] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedId, setEditedId] = useState("");

  const [budget, setBudget] = useState(0);
  const [editedState, setEditedState] = useState(state);

  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(!openDelete);
  const handleOpen = () => setOpen(!open);
  const [isEditing, setIsEditing] = useState(false);

  const db = getFirestore(app);

  const handleOptionChange = (e) => setType(e.target.value);
  const handleOptionChangeEdit = (e) => setEditedType(e.target.value);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setEditedState(state);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setState(editedState);
      setIsEditing(false);
      await setDoc(doc(db, "client", location.state.id), editedState);
    } catch (error) {
      console.error("Error updating client:", error);
      setEditedState(state);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedState({ ...editedState, [name]: value });
  };

  const saveData = async () => {
    setOpen(!open);
    const now = new Date();
    const formattedDate = format(now, 'dd MMM h:mm a').toUpperCase();

    try {
      await addDoc(collection(db, "transaction"), {
        idClient: location.state.id,
        montant,
        description,
        type,
        date: formattedDate
      });
      toast.success("transaction ajoutée avec succées");
    } catch (error) {
      toast.error("Veuillez réessayer plus tard");
    }
  };

  const editData = async () => {
    try {
      await setDoc(doc(db, "transaction", editedId), {
        description: editedDescription,
        montant: editedMontant,
        type: editedType,
        date: editedDate,
        idClient: location.state.id
      });
      console.log("Transaction edited.");
      setOpenEdit(!openEdit);
    } catch (error) {
      console.error("Error editing transaction:", error);
      setEditedState(state);
    }
  };

  const handleOpenEdit = (id, description, montant, type, date) => {
    setOpenEdit(!openEdit);
    setEditedMontant(montant);
    setEditedDescription(description);
    setEditedType(type);
    setEditedDate(date);
    setEditedId(id);
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, "transaction", id));
      console.log(`Transaction with id ${id} has been removed`);
    } catch (error) {
      console.error(`Failed to remove transaction with id ${id}: `, error);
    }
  };

  const deleteClient = async () => {
    try {
      await deleteTransactionsByClient(location.state.id);
      await deleteDoc(doc(db, "client", location.state.id));
      navigate("/dashboard/home");
      setOpenDelete(!openDelete);
      console.log(`Client with id ${location.state.id} has been removed`);
    } catch (error) {
      console.error(`Failed to remove client with id ${location.state.id}: `, error);
    }
  };

  const deleteTransactionsByClient = async (idClient) => {
    try {
      const transactionsQuery = query(collection(db, "transaction"), where("idClient", "==", idClient));
      const snapshot = await getDocs(transactionsQuery);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`All transactions with idClient ${idClient} have been removed`);
    } catch (error) {
      console.error(`Failed to remove transactions with idClient ${idClient}: `, error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedState({ ...editedState, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = () => {
    const transactionsQuery = query(collection(db, "transaction"), where("idClient", "==", location.state.id));
    onSnapshot(transactionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const transactionsArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactionsData(transactionsArray);
        
        let sum = 0;
        transactionsArray.forEach(val => {
          if (val.type === "Vente") sum += parseFloat(val.montant);
          else sum -= parseFloat(val.montant);
        });
        setBudget(sum);
      } else {
        setTransactionsData([]);
        setBudget(0);
      }
    });
  };

  useEffect(() => {
    const clientDoc = doc(db, "client", location.state.id);
    const fetchClient = () => {
      onSnapshot(clientDoc, (snapshot) => {
        if (snapshot.exists()) {
          const dataItem = snapshot.data();
          setState(dataItem);
          setEditedState(dataItem);
        }
      });
    };

    fetchClient();
    fetchData();
  }, [location.state.id, db]);




  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="mx-[300px] min-h-[300px]">
        <CardBody>
          <div className="flex items-center justify-between pb-3 border-b-2 mb-3">
            <div className="flex items-center gap-4">
                <Avatar src={editedState.image || placeHolderImage}
                alt="img" size="xl" onClick={() => isEditing && fileInputRef.current && fileInputRef.current.click()}/>
                {isEditing && (
                  <input
                    type="file"
                    name="image"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                )}
                <div className="text-3xl font-semibold text-black">
                  {isEditing ? (
                  <input
                    type="text"
                    name="nom"
                    onChange={handleChange}
                    value={editedState.nom}
                    className="w-2/3 border border-gray-300 rounded-lg px-2 py-1"
                  />
                  ) : (
                    editedState.nom
                  )}
                </div>
            </div>
            <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="text-white bg-green-400 border-gray-300 hover:bg-green-500 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                  Confirmer
                </button>
                <button onClick={handleCancel} className="text-green-500 bg-white border border-green-500 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={handleEdit} className="text-gray-900 bg-gray-100 border border-gray-300 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                  Modifier
                </button>
                <button  onClick = {handleOpenDelete} type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
                  Supprimer
                </button>          
              </>
            )}
            </div>
            
          </div>
          <div className="h-full flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="text-base text-gray-500 w-1/6"> Adresse </div>
              <div className="w-5/6">
                {isEditing ? (
                <input
                  type="text"
                  name="adresse"
                  onChange={handleChange}
                  value={editedState.adresse}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
                ) : (
                  editedState.adresse
                )}
               </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-base text-gray-500 w-1/6"> Telephone </div>
              <div className="w-5/6">
              {isEditing ? (
                <input
                  type="text"
                  name="telephone"
                  onChange={handleChange}
                  value={editedState.telephone}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
                ) : (
                  editedState.telephone
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-base text-gray-500 w-1/6"> E-mail </div>
              <div className="w-5/6">
              {isEditing ? (
                <input
                  type="text"
                  name="email"
                  onChange={handleChange}
                  value={editedState.email}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
                ) : (
                  editedState.email
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-base text-gray-500 w-1/6"> Budget </div>
              <div className="w-5/6"> {budget}€</div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={openDelete} handler={handleOpenDelete} size={"sm"}>
        <DialogHeader>
          <svg class="text-gray-400 dark:text-gray-500 w-11 h-11 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        </DialogHeader>
        <DialogBody className="flex justify-center items-center space-x-4 ">
          Êtes-vous sûr de vouloir supprimer ce client ?
        </DialogBody>
        <DialogFooter className="flex justify-center items-center space-x-4">
          <div >
            <Button
              variant="text"
              color="black"
              onClick={handleOpenDelete}
              className="mr-1"
            >
              <span>Annuler</span>
            </Button>
            <Button variant="gradient" color="red" onClick={() => deleteClient()}>
              <span>Confirmer</span>
            </Button>
          </div>
        </DialogFooter>
      </Dialog> 
      
        <button onClick={handleOpen} type="button" className="self-end text-white bg-blue-800 hover:bg-blue-900 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
          Ajouter Une Transaction
        </button>
        <Dialog open={open} handler={handleOpen}>
          <DialogHeader>Ajouter une transaction</DialogHeader>
          <DialogBody>
            <form class="max-w-md mx-auto">
              <div class="relative z-0 w-full mb-5 group">
                  <input type="number" name="floating_email" id="floating_email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required 
                    onChange={(e) => setMontant(e.target.value)}/>
                  <label for="floating_email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Montant</label>
              </div>
              <div class="relative z-0 w-full mb-8 group">
                  <input type="text" name="floating_password" id="floating_password" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required
                    onChange={(e) => setDescription(e.target.value)} />
                  <label for="floating_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Description</label>
              </div>

              <div class="flex items-center mb-4 gap-5 ">
                <div className="flex items-center">
                  <input id="country-option-2" type="radio" name="countries" value="Vente" class="w-4 h-4 border-gray-300" 
                    checked={type === 'Vente'}
                    onChange={handleOptionChange}/>
                  <label for="country-option-2" class="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Vente
                  </label>
                </div>
                <div className="flex items-center">
                  <input id="country-option-3" type="radio" name="countries" value="Achat" class="w-4 h-4 border-gray-300" 
                  checked={type === 'Achat'}
                  onChange={handleOptionChange}/>
                  <label for="country-option-3" class="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Achat
                  </label>
                </div>
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleOpen}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button variant="gradient" color="green" onClick={saveData}>
              <span>Confirm</span>
            </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openEdit} handler={handleOpenEdit}>
          <DialogHeader>Modifier une transaction</DialogHeader>
          <DialogBody>
            <form class="max-w-md mx-auto">
              <div class="relative z-0 w-full mb-5 group">
                  <input type="number" name="floating_email" id="floating_email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required 
                    onChange={(e) => setEditedMontant(e.target.value)} value={editedMontant}                                   
                    />
                  <label for="floating_email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Montant</label>
              </div>
              <div class="relative z-0 w-full mb-8 group">
                  <input type="text" name="floating_password" id="floating_password" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required
                    onChange={(e) => setEditedDescription(e.target.value)} value={editedDescription} />
                  <label for="floating_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Description</label>
              </div>

              <div class="flex items-center mb-4 gap-5 ">
                <div className="flex items-center">
                  <input id="country-option-2" type="radio" name="countries" value="Vente" class="w-4 h-4 border-gray-300" 
                    checked={editedType === 'Vente'}
                    onChange={handleOptionChangeEdit}/>
                  <label for="country-option-2" class="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Vente
                  </label>
                </div>
                <div className="flex items-center">
                  <input id="country-option-3" type="radio" name="countries" value="Achat" class="w-4 h-4 border-gray-300" 
                  checked={editedType === 'Achat'}
                  onChange={handleOptionChangeEdit}/>
                  <label for="country-option-3" class="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Achat
                  </label>
                </div>
              </div>
            </form>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleOpenEdit}
              className="mr-1"
            >
              <span>Annuler</span>
            </Button>
            <Button variant="gradient" color="green" onClick={editData}>
              <span>Confirmer</span>
            </Button>
        </DialogFooter>
          </DialogBody>
      </Dialog>

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Historique des transactions
          </Typography>
        </CardHeader>
        <CardBody className="overflow-y-scroll max-h-[500px] px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Description", "Montant", "Type", "Date", ""].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {transactionsData.map(
                ({id, description, montant, type, date }, key) => {
                  const className = `py-3 px-5 ${
                    key === transactionsData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={description}>
                      <td className={className}>
                        <div className="text-base flex items-center gap-5 w-48">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {description}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className={type == "Vente"? 'text-base font-medium text-green-600' : 'text-base font-medium text-red-600'}
                        >
                          {montant}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="w-10/12">
                          <Typography
                            variant="small"
                            className="mb-1 block text-base font-bold text-blue-gray-600"
                          >
                            {type}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="w-10/12">
                          <Typography
                            variant="small"
                            className="mb-1 block text-base font-bold text-blue-gray-600"
                          >
                            {date}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex gap-4">
                          <button onClick={() => handleOpenEdit(id,description,montant,type,date)}
                              className="text-xs font-semibold text-blue-gray-600">
                              <svg fill="#000000" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 348.882 348.882" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M333.988,11.758l-0.42-0.383C325.538,4.04,315.129,0,304.258,0c-12.187,0-23.888,5.159-32.104,14.153L116.803,184.231 c-1.416,1.55-2.49,3.379-3.154,5.37l-18.267,54.762c-2.112,6.331-1.052,13.333,2.835,18.729c3.918,5.438,10.23,8.685,16.886,8.685 c0,0,0.001,0,0.001,0c2.879,0,5.693-0.592,8.362-1.76l52.89-23.138c1.923-0.841,3.648-2.076,5.063-3.626L336.771,73.176 C352.937,55.479,351.69,27.929,333.988,11.758z M130.381,234.247l10.719-32.134l0.904-0.99l20.316,18.556l-0.904,0.99 L130.381,234.247z M314.621,52.943L182.553,197.53l-20.316-18.556L294.305,34.386c2.583-2.828,6.118-4.386,9.954-4.386 c3.365,0,6.588,1.252,9.082,3.53l0.419,0.383C319.244,38.922,319.63,47.459,314.621,52.943z"></path> <path d="M303.85,138.388c-8.284,0-15,6.716-15,15v127.347c0,21.034-17.113,38.147-38.147,38.147H68.904 c-21.035,0-38.147-17.113-38.147-38.147V100.413c0-21.034,17.113-38.147,38.147-38.147h131.587c8.284,0,15-6.716,15-15 s-6.716-15-15-15H68.904c-37.577,0-68.147,30.571-68.147,68.147v180.321c0,37.576,30.571,68.147,68.147,68.147h181.798 c37.576,0,68.147-30.571,68.147-68.147V153.388C318.85,145.104,312.134,138.388,303.85,138.388z"></path> </g> </g></svg>
                          </button>
                          <button onClick={() => deleteTransaction(id)}
                            className="text-xs font-semibold text-blue-gray-600">
                              <svg fill="#000000" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 482.428 482.429" xml:space="preserve" stroke="#000000" stroke-width="6.271564"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098 c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117 h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828 C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879 C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096 c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266 c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979 V115.744z"></path> <path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07 c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"></path> <path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07 c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"></path> <path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07 c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"></path> </g> </g> </g></svg>                        
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Tables;
