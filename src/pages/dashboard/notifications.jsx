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
import { DropzoneArea } from "material-ui-dropzone";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";


export function Notifications() {

  const form = useForm();
  const { register, handleSubmit, reset, formState: { errors } } = form;
  const [image, setImage] = useState(null);

  const handleRemoveImage = () => {
    setImage(null);
  };
  

  const handleFileChange = (files) => {
    if (files.length > 0) {
      const file = files[0];
      console.log('File:', file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  const onSubmitHandler = async (formdata) => {
    console.log("Form data:", { ...formdata, image: image == null ? "" : image });

    const db = getFirestore(app);
    const clientCollectionRef = collection(db, "client");

    try {
      await addDoc(clientCollectionRef, {
        ...formdata,
        image: image == null ? "" : image,
      });
      toast.success("Client Ajouté.");
      reset();
      setImage(null);
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'ajout du client. Veuillez réessayer.");
    }
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card color="transparent" shadow={false} className="mx-auto">
      <Typography variant="h4" color="blue-gray" className="flex justify-center items-center mb-2">
        Ajouter un client
      </Typography>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="my-1 flex flex-col gap-6">
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
              Adresse <span className="text-red-500">* {errors.adresse?.message}</span>
            </Typography>
            <Input
              {...register("adresse", {
                required: "L'adresse est requise",
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
              Email <span className="text-red-500">* {errors.email?.message}</span>
            </Typography>
            <Input
              {...register("email", {
                required: "L'email est requis",
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
              Téléphone <span className="text-red-500">* {errors.telephone?.message}</span>
            </Typography>
            <Input
              {...register("telephone", {
                required: "Le téléphone est requis",
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
            <DropzoneArea
              dropzoneClass="!min-h-[100px]"
              showPreviewsInDropzone={false}
              acceptedFiles={['image/*']}
              dropzoneText={"Drag and drop an image or click"}
              onChange={handleFileChange}
              filesLimit={1}
            />
            <div className="flex justify-center">
              {image ? (
                <div className="relative"><img src={image} alt="Preview" className="w-24 h-24 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700" /><button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-3 -right-3 bg-white p-1 rounded-full shadow-md"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button></div>

              ) : (
                <Typography variant="body2" color="gray-500" className="text-center">
                  No image uploaded
                </Typography>
              )}
            </div>
          </div>
          <Button className="mt-6" fullWidth type="submit">
            Ajouter
          </Button>
        </form>
    </Card>
    </div>
  );
}

export default Notifications;

