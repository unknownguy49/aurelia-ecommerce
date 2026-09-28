import db from "../_lib/firebaseAdmin.js";
import {authenticateRequest} from "../_lib/auth.js";
import {handleCors} from "../_lib/cors.js";
import razorpay from "../_lib/razorpay.js";
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
            items,
            shippingAddress
        }=request.body||{};

        if(
            !items||
            !Array.isArray(items)||
            items.length===0
        ){
            response.status(400).json({
                success:false,
                message:"Order must contain at least one item."
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
            name,
            phone,
            address,
            city,
            state,
            pincode
        }=shippingAddress;

        if(
            !name||
            !phone||
            !address||
            !city||
            !state||
            !pincode
        ){
            response.status(400).json({
                success:false,
                message:"Shipping address is incomplete."
            });

            return;
        }

        let totalAmount=0;

        const orderItems=[];

        for(const item of items){
            if(
                !item.productId||
                !Number.isInteger(item.quantity)||
                item.quantity<=0
            ){
                response.status(400).json({
                    success:false,
                    message:"Invalid order item."
                });

                return;
            }

            const productReference=db
                .collection("products")
                .doc(item.productId);

            const productSnapshot=
                await productReference.get();

            if(!productSnapshot.exists){
                response.status(404).json({
                    success:false,
                    message:
                        `Product ${item.productId} was not found.`
                });

                return;
            }

            const product=productSnapshot.data();

            if(product.active!==true){
                response.status(400).json({
                    success:false,
                    message:
                        `Product ${item.productId} is not available.`
                });

                return;
            }

            if(item.quantity>product.stock){
                response.status(400).json({
                    success:false,
                    message:
                        `Insufficient stock for ${product.name}.`
                });

                return;
            }

            const subtotal=
                product.price*item.quantity;

            totalAmount+=subtotal;

            orderItems.push({
                productId:item.productId,
                quantity:item.quantity,
                price:product.price,
                name:product.name
            });
        }

        if(
            !Number.isFinite(totalAmount)||
            totalAmount<=0
        ){
            response.status(400).json({
                success:false,
                message:"Invalid order total."
            });

            return;
        }

        const razorpayOrder=
            await razorpay.orders.create({
                amount:Math.round(totalAmount*100),
                currency:"INR",
                receipt:`rcpt_${Date.now()}`
            });

        const orderReference=
            db.collection("orders").doc();

        await orderReference.set({
            userId:user.uid,
            items:orderItems,
            totalAmount:totalAmount,
            razorpayOrderId:razorpayOrder.id,
            shippingAddress:{
                name:name,
                phone:phone,
                address:address,
                city:city,
                state:state,
                pincode:pincode
            },
            status:"PENDING",
            paymentStatus:"UNPAID",
            createdAt:FieldValue.serverTimestamp()
        });

        response.status(200).json({
            success:true,
            orderId:orderReference.id,
            razorpayOrderId:razorpayOrder.id,
            totalAmount:totalAmount
        });
    }catch(error){
        console.error(
            "Create order failed:",
            error
        );

        response.status(
            error.statusCode||500
        ).json({
            success:false,
            message:
                error.message||
                "Unable to create order."
        });
    }
}