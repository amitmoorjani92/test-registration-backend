const mongoose = require("mongoose");
const connect = mongoose.connect('mongodb+srv://amitmoorjani92:1234@cluster0.xyyau.mongodb.net/');
// const connect = mongoose.connect('mongodb+srv://amitmoorjani92:1234@cluster0.xyyau.mongodb.net/', {
//   tlsAllowInvalidCertificates: true,
// });
// const fs = require('fs');
// const path = require('path');

// const connect = mongoose.connect('mongodb+srv://amitmoorjani92:1234@cluster0.xyyau.mongodb.net/', {
//   tls: true,
//   tlsCAFile: path.resolve(__dirname, 'path/to/ca-certificate.crt'),
// });

connect.then(() => console.log("Mongoose Coonect succesfully")
).catch(err => console.log("Error in Mongodb",err))

const userSchema = mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        // minlength: 6,
        // validate(value) {
        //   if (
        //     !value.match(/\d/) ||
        //     !value.match(/[a-zA-Z]/) ||
        //     !value.match(/[A-Z]/)
        //   ) {
        //     throw new Error(
        //       "Password Must have 1 Uppercase letter, 1 Number and 1 letter"
        //     );
        //   }
        // },
      },
      role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
        // required: true,
      },
      verification: { 
        type: Boolean, 
        default: false 
      },
      emailVerificationToken: {
        type: String,
        required: false,
      }
    },
    {
      timestamps: true,
    }
  );

  const collection = new mongoose.model("users",userSchema);

  module.exports = collection;