let express = require('express');
let app = express();
let fs = require('fs');
let bodyParser = require("body-parser")
let nem = require("nem-sdk").default;

var hostname = '127.0.0.1'
var port = '8129'

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

function getAccount(jsonObj, username,password) {
    for (let i = 0; i < jsonObj.accounts.length; i++) {
        console
      let user = jsonObj.accounts[i];
      if (user.NAME === username && user.PASSWORD === password) {
           data = JSON.stringify(user)
          fs.writeFile('user.json', data, 
            (err) => {
                if (err) throw err
            // response.redirect('/')
            console.log('User Logged In')
            })
        console.log(JSON.stringify(user))
        return "User Found";
      }
      else 
      console.log ("no user found")
    }
  }

// PATHS

app.get('/', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./login.html").pipe(response);
    console.log('Login..')
});

app.get('/generate', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./generate/generate.html").pipe(response);
    console.log('Generate..');
});

app.get('/send_confirmation', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./send_confirmation/send_confirmation.html").pipe(response);
    console.log('Send Confirmation..');
});

app.get('/send_grade', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./send_grade/send_grade.html").pipe(response);
    console.log('Send Grade..');
});

app.get('/view_assignments', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./view_assignments/view_assignments.html").pipe(response);
    console.log('View Assignments..')
});

app.get('/view_submissions', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./view_submissions/view_submissions.html").pipe(response);
    console.log('View Submissions..');
});

app.get('/view_grades', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream("./view_grades/view_grades.html").pipe(response);
    console.log('View Grades..');
});

// .js FILES
app.get('/js/generate.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./generate/generate.js").pipe(response);
});

app.get('/js/send_confirmation.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./send_confirmation/send_confirmation.js").pipe(response);
});

app.get('/js/send_grade.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./send_grade/send_grade.js").pipe(response);
});

app.get('/js/view_assignments.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./view_assignments/view_assignments.js").pipe(response);
    console.log('view_assignments.js served')
});

app.get('/js/view_submissions.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./view_submissions/view_submissions.js").pipe(response);
});

app.get('/js/view_grades.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./view_grades/view_grades.js").pipe(response);
});


// .js MODULES
app.get('/js/nem-sdk.js', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    fs.createReadStream("./nem-sdk.js").pipe(response);
});

// JSON FILES
app.get('/json/user.json', (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'});
    fs.createReadStream("./user.json").pipe(response);
    console.log('json served')
})

// POST
app.post('/submit_account', (request, response) => {
    let userType = request.body.radio
    let userName = request.body.userName
    let passWord = request.body.password
    let address = request.body.address
    let privateKey = request.body.privatekey
    let publicKey = request.body.publickey

    let enrolledClasses = 
    {
        "CS189": ["Quiz_1","Lab_Activity_2", "Final_Project"],
        "ELC106": ["Reflection_Paper_1","LT_2", "LT_1"],
        "PH103": ["Reflection_Paper","Final_Paper", "Quiz_1"],
        "MA21": ["Homework_2","LT_4", "Seatwork_3"]
    }

    let accountJSON = {
        TYPE: userType,
        NAME: userName,
        PASSWORD: passWord,
        ENROLLED_CLASSES: enrolledClasses,
        ADDRESS: address,
        PUBLIC_KEY: publicKey,
        PRIVATE_KEY: privateKey,
    }

    fs.readFile('./accounts.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            return
        }
        try {
            const accounts = JSON.parse(jsonString)
            accounts['accounts'].push(accountJSON)
            jsonString = JSON.stringify(accounts, null, 2)
                
            fs.writeFile('accounts.json', jsonString, 
            (err) => {
                if (err) throw err
            response.redirect('/')
            console.log('Data Saved')
            })
            
            
    } catch(err) {
            console.log('Error parsing JSON string:', err)
        }
    })
})

app.post("/enter_account", function(request, response, next) {
    let userName = request.body.username;
    let passWord = request.body.password;
    
    fs.readFile('./accounts.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            return
        }
        try {
            const accounts = JSON.parse(jsonString)
            let user = getAccount(accounts,userName,passWord)
            console.log(user)
            if(user === 'User Found') {
                response.redirect('/view_assignments');
            }
            else {
                console.log("No user found with those credentials. Please try again.")
                response.redirect('/')
            }
            // console.log('Data Saved')
                
    } catch(err) {
            console.log('Error parsing JSON string:', err)
        }
    })
});


app.listen(port, hostname);
console.log('Server is running...')