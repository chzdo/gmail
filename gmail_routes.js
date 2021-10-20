const express = require("express");
const route = express.Router();
const fs = require("fs")
const o2Auth = require("./gmail");
    const { gmail } = require("./gmail");
const users = require("./model");
const fileupload = require("express-fileupload");
const axios = require("axios")

route.get("/auth", (req, res) => {

    const SCOPES = [
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.metadata"
    ]
    const url  =  o2Auth.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
    })
    
    res.send({
        url
    })

})


route.get("/redirect", async (req, res) => {

    const code = req.query.code;
    try {
        const { tokens } = await o2Auth.getToken(code)     
        o2Auth.setCredentials(tokens);

    
        const user = gmail({
            version: "v1",
            auth: o2Auth
        })
    
        const {data} = await user.users.getProfile({
            userId: "me"
        })

        const userResponse = await users.create({
            tokens,
            email: data.emailAddress
        })


        res.send(userResponse);
    } catch (err) {
        console.log(err)
        res.send(err)
    }



})

route.get("/mailbox", async (req, res) => {

    const email = req.query.email;
    try {
        const [empty, main] = await users.find({ email })
        
      
        o2Auth.setCredentials(main.tokens);


        const user = gmail({
            version: "v1",
            auth: o2Auth
        })
        const file = new Buffer.from(fs.readFileSync("./credentials.json")).toString("base64").replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');;

        const hello = new Buffer.from(fs.readFileSync("./hello.txt")).toString("base64").replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');;
        
        const subject = 'hi2';
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        // const messageParts = [
        //     'From: Justin Beckwith <beckwith@google.com>',
        //     'To: Justin Beckwith <chido.nduaguibe@gmail.com>',
        //     'Content-Type: text/html; charset="UTF-8"',
        //     'MIME-Version: 1.0',
        //     `Subject: ${utf8Subject}`,
        //     '',
        //     'This is a message just to say hello.',
        //     'So... <b>Hello!</b> ',
          
        // ];

        const messageParts = [
            'MIME-Version: 1.0',
            'From: Justin Beckwith <beckwith@google.com>',
            'To: Justin Beckwith <chido.nduaguibe@gmail.com>',
            `Subject: ${utf8Subject}`,
            'Content-Type: multipart/mixed; boundary="yes"',
            '',
            "--yes",
            "Content-Type: multipart/alternative; boundary=yes2",
            '',
            "--yes2",
            "Content-Type: text/html; charset=UTF-8",
            '',
            "<h1>hello<h1>",
            '',
            "--yes2--",
            "--yes",
            "Content-Type: Application/json; name=mypdf.json",
            'Content-Disposition: attachment; filename=mypdf.json',
            "Content-Transfer-Encoding: base64",
            '',
            file,
            '',
            "--yes",
            "Content-Type: text/plain; name=hello.txt",
            'Content-Disposition: attachment; filename=hello.txt',
            "Content-Transfer-Encoding: base64",
            '',
            hello,
            
           "--yes--",
             

        ];
        const message = messageParts.join('\n');

        // The body needs to be base64url encoded.
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
      

        console.log({file})
        const userResponse = await  user.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
         
         })
        res.send(userResponse.data);
    } catch (err) {
        console.log(err)
        res.send(err)
    }



})


route.post("/mailbox2", fileupload({
     debug: true
}) ,async (req, res) => {

    const email = req.query.email;
    try {
        const [empty, main] = await users.find({ email })


      // res.send(main.tokens);

        o2Auth.setCredentials(main.tokens);


        const user = gmail({
            version: "v1",
            auth: o2Auth
        })
      
        let  message = [
            'MIME-Version: 1.0',
            `From:${req.body.from}`,
            `to:${req.body.to}`,        
        ];
        
        req.body.cc && message.push(`to:${req.body.cc}`);
        req.body.bcc && message.push(`to:${req.body.bcc}`);
        
      

        const utf8Subject = `=?utf-8?B?${Buffer.from(req.body.subject).toString('base64')}?=`;
        message = [
            ...message,
            `Subject:${utf8Subject}`,
            `Content-Type: multipart/mixed; boundary="main"`,
            '',
            "--main",
        ];


        if (req.body.body) {

            message = [
                ...message,
                "Content-Type: multipart/alternative; boundary=text",
                '',
                "--text",
                "Content-Type: text/html; charset=UTF-8",
                req.body.body,
                '',
                "--text--"
            ];
        
        }
     
        const file = Array.isArray(req.files.file) ? req.files.file : [req.files.file]
         
        file.forEach((value) => {
            console.log(value)
            const base64File = new Buffer.from(value.data).toString("base64");
            message = [
                ...message,
                "--main",
                `Content-Type: ${value.mimetype} name=${value.name}`,
                `Content-Disposition: attachment; filename=${value.name}`,
                "Content-Transfer-Encoding: base64",
                 '',
                base64File,
                ''
            ];
                  
          })

        message.push("--main--")

   
    
        const messageToSend = message.join('\n');

        // The body needs to be base64url encoded.
        const encodedMessage = Buffer.from(messageToSend)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

      
        
        
        
        
        
        
        
        
          const userResponse = await user.users.messages.send({
            userId: "me",
              requestBody: { raw: encodedMessage },
             
          

        })
        res.send(userResponse);
    } catch (err) {
        console.log(err)
        res.send(err)
    }



})
route.get("/list", async (req, res) => {

    const email = req.query.email;
    try {
        const [empty, main] = await users.find({ email })


        o2Auth.setCredentials(main.tokens);


        const user = gmail({
            version: "v1",
            auth: o2Auth
        })


       

        const userResponse = await user.users.messages.list({
            userId: "me",
           
        })
        res.send(userResponse);
    } catch (err) {
        console.log(err)
        res.send(err)
    }



})
module.exports = route;

