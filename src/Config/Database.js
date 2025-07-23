const  mongoose = require("mongoose");

const DataBaseConnection = async () => {
    await mongoose.connect(process.env.DATA_KEY)

}
module.exports =  DataBaseConnection
