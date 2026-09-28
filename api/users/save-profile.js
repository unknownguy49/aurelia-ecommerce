import db from "../_lib/firebaseAdmin.js";
import {authenticateRequest} from "../_lib/auth.js";
import {handleCors} from "../_lib/cors.js";
import {FieldValue} from "firebase-admin/firestore";

export default async function handler(request,response){
    if(handleCors(request,response)){
        return;
    }

    if(request.method!=="POST"){
        response.status(405).json({
            success:false,
            message:"Method not allowed."
        });
        return;
    }

    try{
        const user=await authenticateRequest(request);

        const {
            name,
            phone,
            shippingAddress
        }=request.body||{};

        if(
            !name||
            typeof name!=="string"||
            !name.trim()
        ){
            response.status(400).json({
                success:false,
                message:"Name is required."
            });
            return;
        }

        if(
            !phone||
            typeof phone!=="string"||
            !phone.trim()
        ){
            response.status(400).json({
                success:false,
                message:"Phone number is required."
            });
            return;
        }

        if(!shippingAddress){
            response.status(400).json({
                success:false,
                message:"Shipping address is required."
            });
            return;
        }

        const {
            address,
            city,
            state,
            pincode
        }=shippingAddress;

        if(
            !address||
            !city||
            !state||
            !pincode
        ){
            response.status(400).json({
                success:false,
                message:"Complete shipping address is required."
            });
            return;
        }

        const userReference=db
            .collection("users")
            .doc(user.uid);

        await userReference.set(
            {
                name:name.trim(),
                email:user.email||"",
                phone:phone.trim(),
                shippingAddress:{
                    address:address.trim(),
                    city:city.trim(),
                    state:state.trim(),
                    pincode:pincode.trim()
                },
                role:"CUSTOMER",
                updatedAt:FieldValue.serverTimestamp()
            },
            {
                merge:true
            }
        );

        response.status(200).json({
            success:true,
            message:"Customer profile saved successfully."
        });
    }catch(error){
        console.error(
            "Save customer profile failed:",
            error
        );

        response.status(error.statusCode||500).json({
            success:false,
            message:error.message||
                "Unable to save customer profile."
        });
    }
}