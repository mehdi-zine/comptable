import React, { useState } from "react";
import { useForm } from "react-hook-form";
import app from "../../configs/config";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { toast } from "react-toastify";


export function Notifications() {

  const form = useForm();
  const { register, handleSubmit, reset, formState: { errors } } = form;

  const onSubmitHandler = async (formdata) => {

    const db = getFirestore(app);
    const clientCollectionRef = collection(db, "client");

    try {
      await addDoc(clientCollectionRef, {
        ...formdata,
        numeraire: formdata.numeraire ? Number(formdata.numeraire) : 0,
        budget: 0,
      });
      toast.success("Client Ajouté.");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'ajout du client. Veuillez réessayer.");
    }
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8 w-full">
      <Card color="transparent" shadow={false} className="mx-auto w-64">
      <Typography variant="h4" color="blue-gray" className="flex justify-center items-center mb-2">
        Ajouter un client
      </Typography>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="my-1 flex flex-col gap-6 justify-center">
          <Typography variant="h6" color="blue-gray" className="-mb-3">
            Nom <span className="text-red-500">* {errors.nom?.message}</span>
          </Typography>
          <Input
              {...register("nom", { required: "Ce champ est requis" })}
              size="lg"
              placeholder="Mytek"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          <Typography variant="h6" color="blue-gray" className="-mb-3">
            Numéraire <span className="text-red-500"> {errors.numeraire?.message}</span>
          </Typography>
          <Input
              {...register("numeraire", {
                validate: (value) =>
                  value === null ||
                  value === "" || // Allow null or empty strings
                  /^\d+(\.\d{0,3})?$/.test(value) ||
                  "Veuillez entrer un nombre avec jusqu'à 3 décimales",
              })}
              size="lg"
              placeholder="500"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onInput={(e) => {
                // Restrict input to numbers and a single decimal point with up to 3 decimal places
                e.target.value = e.target.value
                  .replace(/[^0-9.]/g, "") // Allow only numbers and a decimal point
                  .replace(/(\..*)\./g, "$1") // Prevent more than one decimal point
                  .replace(/^0+(?=\d)/, "") // Prevent leading zeros
                  .replace(/(\.\d{2}).*/g, "$1"); // Allow only up to 3 digits after the decimal
              }}
            />

            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Adresse <span className="text-red-500"> {errors.adresse?.message}</span>
            </Typography>
            <Input
              {...register("adresse", {
                maxLength: {
                  value: 100,
                  message: "L'adresse ne peut pas dépasser 100 caractères",
                },
              })}
              size="lg"
              placeholder="1234 Rue Principale, Apt 1A, Paris, 75001"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Email <span className="text-red-500"> {errors.email?.message}</span>
            </Typography>
            <Input
              {...register("email", {
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Email invalide",
                },
              })}
              size="lg"
              placeholder="name@mail.com"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Téléphone <span className="text-red-500"> {errors.telephone?.message}</span>
            </Typography>
            <Input
              {...register("telephone", {
                pattern: {
                  value: /^\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,4}$/,
                  message: "Numéro de téléphone invalide",
                },
              })}
              size="lg"
              placeholder="123-456-7890"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^\d\s-]/g, "").slice(0, 12);
              }}
            />
            
          <Button fullWidth type="submit">
            Ajouter
          </Button>
          </div>
        </form>
    </Card>
    </div>
  );
}

export default Notifications;

