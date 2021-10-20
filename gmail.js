const {google}= require('googleapis')
const { GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT, } = process.env
    
const SCOPES = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.metadata"
    ]


module.exports = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT
)


module.exports.gmail = google.gmail


//google.options({
 //   auth: oauthClient 
//})


/**
const drive = google.drive({
    version: 'v2',
    auth
});


const gmail = google.gmail({
    version: 'v1',
    auth
});

const profile =  gmail.users.getProfile({
    userId: "me",
    auth
}).then((value)=> console.log(value))
console.log(profile)
//const url = oauthClient.generateAuthUrl({
//    access_type: "offline",
//    scope:SCOPES
//})

//module.exports = oauthClient;
























/**
    const gamil = google.gmail("v1");

console.log()

const auth = new google.auth.GoogleAuth({
    scopes: [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.metadata',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
})


const authClient =  auth.getClient().then((value)=> console.log(value));

console.log(authClient)

**/
