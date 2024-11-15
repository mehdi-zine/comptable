import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, orderBy, limit, getDocs, onSnapshot, setDoc, doc } from "firebase/firestore";
import {db} from "../../configs/config";
import { Link } from "react-router-dom";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from "@material-tailwind/react";
import {
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import placeHolderImage from "../../../public/img/company.png"


export function Home() {
  const [clientsData, setClientsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(!openDelete);

  const getLastSixTransactions = async () => {
    const transactionsQuery = query(
      collection(db, "transaction"),
      orderBy("date", "desc"),
      limit(6)
    );

    try {
      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(transactionsArray);
      setTransactionsData(transactionsArray);
    } catch (error) {
      console.error("Failed to retrieve transactions: ", error);
    }
  };

  const validate = async () => {
    try {
      const updatedCompanies = clientsData.map(async (client) => {
        const numeraireAsNumber = parseFloat(client.numeraire);
        const updatedBudget = client.budget + numeraireAsNumber;
        await setDoc(doc(db, "client", client.id), { 
          ...client, 
          budget: updatedBudget 
        });
        return { ...client, budget: updatedBudget };
      });
  
      // Wait for all updates to complete
      await Promise.all(updatedCompanies);
      setOpenDelete(!openDelete);
      //fetchData(); // Re-fetch client data after update
      console.log("Budgets updated successfully");
    } catch (error) {
      console.error("Error updating budgets:", error);
    }
  };
  
 
  useEffect(() => {
      const clientsCollectionRef = collection(db, "client");  


    const fetchData = () => {
      const unsubscribe = onSnapshot(clientsCollectionRef, (snapshot) => {
        const clientsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientsData(clientsArray);
        console.log(clientsArray);
      });

      return unsubscribe; // Return the unsubscribe function to stop listening
    };

    fetchData();
    getLastSixTransactions();
  }, []);

  const clientMap = clientsData.reduce((map, client) => {
    map[client.id] = client.nom;
    return map;
  }, {});

  return (
    <div className="mt-12">
      <div className="mb-4">
        <Button
          type="button"
          onClick = {handleOpenDelete}
          className="w-32 px-4 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
        >
          Valider
        </Button>
      </div>
      <Dialog open={openDelete} handler={handleOpenDelete} size={"sm"}>
        <DialogHeader>
          <svg class="text-green-400 dark:text-green-500 w-11 h-11 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V4a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
        </DialogHeader>
        <DialogBody className="flex justify-center items-center space-x-4 ">
          Êtes-vous sûr de vouloir valider le mois ?
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
            <Button variant="gradient" color="blue" onClick={() => validate()}>
              <span>Confirmer</span>
            </Button>
          </div>
        </DialogFooter>
      </Dialog> 
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-y-scroll overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Clients
              </Typography>
            </div>

          </CardHeader>
          <CardBody className=" max-h-[400px] px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Client", "Budget", "Numéraire", ""].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {clientsData.map(
                  ({id, nom, email, telephone, numeraire, budget, adresse}, key) => {
                    const className = `py-3 px-6 ${
                      key === clientsData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={nom}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={placeHolderImage} alt={nom} size="md" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {nom}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                        <Typography
                            variant="small"
                            className="font-bold text-blue-gray-600"
                          >
                            {budget}€
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="font-bold text-blue-gray-600"
                          >
                            {numeraire}€
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-medium"
                          >
                            <Link
                              to={"/dashboard/details"}
                              state={{id: id, nom: nom,  email: email, telephone: telephone, adresse: adresse, numeraire: numeraire, budget: budget}}>
                                <svg fill="#000000" height="26px" width="26px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 294.997 294.997" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M286.36,98.016c-13.223-37.091-40.098-66.813-75.675-83.691C175.109-2.554,135.088-4.567,97.997,8.656 C60.906,21.879,31.183,48.754,14.305,84.331C-2.572,119.908-4.585,159.928,8.637,197.02c1.113,3.122,4.547,4.748,7.667,3.637 c3.122-1.113,4.75-4.545,3.637-7.667C7.794,158.918,9.643,122.155,25.147,89.474s42.807-57.369,76.879-69.515 c34.072-12.146,70.836-10.296,103.516,5.207c32.682,15.504,57.369,42.807,69.516,76.879c12.146,34.072,10.297,70.835-5.207,103.516 s-42.807,57.369-76.879,69.515c-38.189,13.613-80.082,9.493-114.935-11.304c-2.848-1.699-6.529-0.768-8.227,2.078 c-1.698,2.846-0.768,6.529,2.078,8.227c23.207,13.848,49.276,20.903,75.541,20.902c16.674,0,33.43-2.845,49.572-8.599 c37.092-13.223,66.813-40.098,83.691-75.675C297.57,175.127,299.583,135.107,286.36,98.016z"></path> <path d="M213.499,147.518c0-3.313-2.687-6-6-6H58.069c-3.314,0-6,2.687-6,6s2.686,6,6,6h149.43 C210.812,153.518,213.499,150.831,213.499,147.518z"></path> <path d="M165.686,210.275c-2.344,2.343-2.344,6.142,0,8.485c1.171,1.171,2.707,1.757,4.242,1.757s3.071-0.586,4.242-1.757l67-67 c2.344-2.343,2.344-6.142,0-8.485l-67-67c-2.342-2.343-6.143-2.343-8.484,0c-2.344,2.343-2.344,6.142,0,8.485l62.757,62.757 L165.686,210.275z"></path> </g> </g></svg>
                            </Link>
                          </Typography>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray">
              Aperçu Des Transactions
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {transactionsData.map(
              ({ description, date, montant, type, idClient }, key) => (
                <div key={description} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      key === transactionsData.length - 1
                        ? "after:h-0"
                        : "after:h-4/6"
                    }`}
                  >
                    {React.createElement(PlusCircleIcon, {
                      className: "!w-5 !h-5 text-blue-gray-300",
                    })}
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      <div className="flex gap-3">
                        {clientMap[idClient]} <p className={type == "Vente"? 'text-base font-medium text-green-600' : 'text-base font-medium text-red-600'}>{montant}</p>
                      </div>
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {date}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
