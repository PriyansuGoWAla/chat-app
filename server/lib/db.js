import mongoose from "mongoose"

export const connectdb = async()=>{
try {

    mongoose.connection.on('connected',()=>{
        console.log('data-base connected')
    })
    await mongoose.connect(`${process.env.MONGODB_URI}`)
} catch (error) {
    console.log(error);
}
}