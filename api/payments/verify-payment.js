import crypto from "crypto";
import db from "../_lib/firebaseAdmin.js";
import {authenticateRequest} from "../_lib/auth.js";
import {handleCors} from "../_lib/cors.js";
import razorpay from "../_lib/razorpay.js";

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
            orderId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature
        }=request.body||{};

        if(
            !orderId||
            !razorpayPaymentId||
            !razorpayOrderId||
            !razorpaySignature
        ){
            response.status(400).json({
                success:false,
                message:"Payment verification data is incomplete."
            });
            return;
        }

        const orderReference=db
            .collection("orders")
            .doc(orderId);

        const orderSnapshot=await orderReference.get();

        if(!orderSnapshot.exists){
            response.status(404).json({
                success:false,
                message:"Order not found."
            });
            return;
        }

        const order=orderSnapshot.data();

        if(order.userId!==user.uid){
            response.status(403).json({
                success:false,
                message:"You do not have access to this order."
            });
            return;
        }

        if(order.razorpayOrderId!==razorpayOrderId){
            response.status(400).json({
                success:false,
                message:"Razorpay order does not match the order."
            });
            return;
        }

        if(order.paymentStatus==="PAID"){
            response.status(200).json({
                success:true,
                verified:true,
                orderId:orderId
            });
            return;
        }

        const signatureBody=
            razorpayOrderId+
            "|"+
            razorpayPaymentId;

        const expectedSignature=crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(signatureBody)
            .digest("hex");

        if(
            !crypto.timingSafeEqual(
                Buffer.from(expectedSignature,"utf8"),
                Buffer.from(razorpaySignature,"utf8")
            )
        ){
            response.status(403).json({
                success:false,
                message:"Payment signature verification failed."
            });
            return;
        }

        const payment=await razorpay.payments.fetch(
            razorpayPaymentId
        );

        if(!payment){
            response.status(400).json({
                success:false,
                message:"Unable to retrieve the Razorpay payment."
            });
            return;
        }

        if(payment.order_id!==order.razorpayOrderId){
            response.status(400).json({
                success:false,
                message:"Payment does not belong to this order."
            });
            return;
        }

        const expectedAmount=Math.round(
            order.totalAmount*100
        );

        if(payment.amount!==expectedAmount){
            response.status(400).json({
                success:false,
                message:"Payment amount does not match the order amount."
            });
            return;
        }

        if(payment.currency!=="INR"){
            response.status(400).json({
                success:false,
                message:"Payment currency does not match the order currency."
            });
            return;
        }

        if(payment.status!=="captured"){
            response.status(400).json({
                success:false,
                message:
                    "Payment has not been captured yet."
            });
            return;
        }

        await db.runTransaction(async transaction=>{
            const currentOrderSnapshot=
                await transaction.get(orderReference);

            if(!currentOrderSnapshot.exists){
                throw new Error("Order not found.");
            }

            const currentOrder=
                currentOrderSnapshot.data();

            if(currentOrder.userId!==user.uid){
                throw new Error(
                    "You do not have access to this order."
                );
            }

            if(currentOrder.paymentStatus==="PAID"){
                return;
            }

            const productReferences=[];
            const productSnapshots=[];

            for(const item of currentOrder.items){
                const productReference=db
                    .collection("products")
                    .doc(item.productId);

                const productSnapshot=
                    await transaction.get(productReference);

                if(!productSnapshot.exists){
                    throw new Error(
                        `Product ${item.productId} was not found.`
                    );
                }

                productReferences.push(
                    productReference
                );

                productSnapshots.push(
                    productSnapshot
                );
            }

            for(let i=0;i<currentOrder.items.length;i++){
                const item=currentOrder.items[i];
                const product=
                    productSnapshots[i].data();

                if(product.stock<item.quantity){
                    throw new Error(
                        `Insufficient stock for ${product.name}.`
                    );
                }
            }

            for(let i=0;i<currentOrder.items.length;i++){
                const item=currentOrder.items[i];
                const product=
                    productSnapshots[i].data();

                transaction.update(
                    productReferences[i],
                    {
                        stock:
                            product.stock-
                            item.quantity
                    }
                );
            }

            transaction.update(
                orderReference,
                {
                    paymentStatus:"PAID",
                    razorpayPaymentId:
                        razorpayPaymentId,
                    razorpaySignature:
                        razorpaySignature
                }
            );
        });

        const cartReference=db
            .collection("carts")
            .doc(user.uid);

        await cartReference.delete();

        response.status(200).json({
            success:true,
            verified:true,
            orderId:orderId
        });
    }catch(error){
        console.error(
            "Payment verification failed:",
            error
        );

        response.status(error.statusCode||500).json({
            success:false,
            message:
                error.message||
                "Unable to verify payment."
        });
    }
}